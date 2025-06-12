const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Execution directory
const execDir = path.join(__dirname, 'temp');
if (!fs.existsSync(execDir)) {
  fs.mkdirSync(execDir, { recursive: true });
}

// Clean up old files (files older than 1 hour)
function cleanupOldFiles() {
  const files = fs.readdirSync(execDir);
  const now = Date.now();
  
  files.forEach(file => {
    const filePath = path.join(execDir, file);
    const stats = fs.statSync(filePath);
    const fileAge = now - stats.mtimeMs;
    
    // Delete files older than 1 hour (3600000 ms)
    if (fileAge > 3600000) {
      fs.unlinkSync(filePath);
    }
  });
}

// Run cleanup every hour
setInterval(cleanupOldFiles, 3600000);

// Execute code based on language
async function executeCode(code, language, input = '') {
  return new Promise((resolve, reject) => {
    const uniqueId = uuidv4();
    let filePath;
    let command;
    let timeout = 5000; // 5 seconds timeout
    
    try {
      switch (language.toLowerCase()) {
        case 'python':
          filePath = path.join(execDir, `${uniqueId}.py`);
          fs.writeFileSync(filePath, code);
          command = `python ${filePath}`;
          break;
          
        case 'javascript':
        case 'js':
          filePath = path.join(execDir, `${uniqueId}.js`);
          fs.writeFileSync(filePath, code);
          command = `node ${filePath}`;
          break;
          
        case 'java':
          const className = extractClassName(code) || 'Main';
          filePath = path.join(execDir, `${className}.java`);
          fs.writeFileSync(filePath, code);
          command = `cd ${execDir} && javac ${className}.java && java ${className}`;
          timeout = 10000; // Java needs more time
          break;
          
        case 'c':
          filePath = path.join(execDir, `${uniqueId}.c`);
          const outputPath = path.join(execDir, uniqueId);
          fs.writeFileSync(filePath, code);
          command = `gcc ${filePath} -o ${outputPath} && ${outputPath}`;
          break;
          
        case 'cpp':
        case 'c++':
          filePath = path.join(execDir, `${uniqueId}.cpp`);
          const cppOutputPath = path.join(execDir, uniqueId);
          fs.writeFileSync(filePath, code);
          command = `g++ ${filePath} -o ${cppOutputPath} && ${cppOutputPath}`;
          break;
          
        case 'sql':
          filePath = path.join(execDir, `${uniqueId}.sql`);
          fs.writeFileSync(filePath, code);
          command = `sqlite3 :memory: < ${filePath}`;
          break;
          
        default:
          return reject(new Error(`Unsupported language: ${language}`));
      }
      
      // Execute the command
      const startTime = Date.now();
      exec(command, { timeout }, (error, stdout, stderr) => {
        const executionTime = Date.now() - startTime;
        
        if (error) {
          // Check if it's a timeout error
          if (error.killed && error.signal === 'SIGTERM') {
            resolve({
              output: 'Error: Execution timed out',
              executionTime,
              passed: false,
              error: true
            });
          } else {
            resolve({
              output: stderr || error.message,
              executionTime,
              passed: false,
              error: true
            });
          }
        } else {
          resolve({
            output: stdout,
            executionTime,
            passed: true,
            error: false
          });
        }
        
        // Clean up the file
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          
          // Clean up compiled files for C/C++/Java
          if (language === 'c' || language === 'cpp' || language === 'c++') {
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
            }
          }
        } catch (cleanupError) {
          console.error('Error cleaning up files:', cleanupError);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Helper function to extract class name from Java code
function extractClassName(code) {
  const classMatch = code.match(/public\s+class\s+(\w+)/);
  return classMatch ? classMatch[1] : null;
}

// Validate code execution result against expected output
function validateOutput(result, expectedOutput) {
  if (!result.passed || result.error) {
    return false;
  }
  
  // Normalize outputs (trim whitespace, normalize line endings)
  const normalizedOutput = result.output.trim().replace(/\r\n/g, '\n');
  const normalizedExpected = expectedOutput.trim().replace(/\r\n/g, '\n');
  
  return normalizedOutput === normalizedExpected;
}

module.exports = {
  executeCode,
  validateOutput
};
