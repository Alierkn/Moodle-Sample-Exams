#!/usr/bin/env python3
"""
Test Runner for MoodleExamSimulator

This script runs all tests for the MoodleExamSimulator system and generates
a comprehensive test report. It includes unit tests, integration tests,
and performance tests.
"""

import os
import sys
import time
import argparse
import subprocess
import json
from datetime import datetime
from pathlib import Path

def setup_test_environment():
    """Set up the test environment with necessary variables."""
    test_env = os.environ.copy()
    
    # Set test-specific environment variables
    test_env.update({
        'TESTING': 'true',
        'LOG_LEVEL': 'INFO',
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'CACHE_TTL': '300',
        'MAX_RETRIES': '3',
        'RETRY_DELAY': '100',
        'MAX_DELAY': '5000',
        'POOL_SIZE': '5',
        'MAX_OVERFLOW': '10',
        'POOL_TIMEOUT': '30',
        'POOL_RECYCLE': '1800',
        'MONGO_HOST': 'localhost',
        'MONGO_PORT': '27017',
        'NEO4J_HOST': 'localhost',
        'NEO4J_PORT': '7687',
        'NEO4J_USER': 'neo4j',
        'NEO4J_PASSWORD': 'password',
        'MYSQL_HOST': 'localhost',
        'MYSQL_PORT': '3306',
        'MYSQL_USER': 'test',
        'MYSQL_PASSWORD': 'test',
        'MYSQL_DATABASE': 'test'
    })
    
    return test_env

def run_unit_tests(test_env, output_dir, verbose=False):
    """Run unit tests using pytest."""
    print("Running unit tests...")
    
    # Create command
    cmd = [
        "python", "-m", "pytest",
        "tests/test_db_manager.py",
        "tests/test_health_api.py",
        "tests/test_retry_manager.py",
        "-v" if verbose else "-q",
        f"--junitxml={output_dir}/unit_tests.xml",
        "--cov=.",
        f"--cov-report=xml:{output_dir}/coverage.xml",
        f"--cov-report=html:{output_dir}/coverage_html"
    ]
    
    # Run the tests
    start_time = time.time()
    result = subprocess.run(cmd, env=test_env, capture_output=True, text=True)
    duration = time.time() - start_time
    
    # Save output
    with open(f"{output_dir}/unit_tests_output.txt", "w") as f:
        f.write(result.stdout)
        if result.stderr:
            f.write("\n\nERRORS:\n")
            f.write(result.stderr)
    
    return {
        "success": result.returncode == 0,
        "duration": duration,
        "output_file": f"{output_dir}/unit_tests_output.txt",
        "returncode": result.returncode
    }

def run_performance_tests(test_env, output_dir, verbose=False):
    """Run performance tests."""
    print("Running performance tests...")
    
    # Create command
    cmd = [
        "python", "-m", "pytest",
        "tests/performance/test_performance.py",
        "-v" if verbose else "-q",
        f"--junitxml={output_dir}/performance_tests.xml"
    ]
    
    # Run the tests
    start_time = time.time()
    result = subprocess.run(cmd, env=test_env, capture_output=True, text=True)
    duration = time.time() - start_time
    
    # Save output
    with open(f"{output_dir}/performance_tests_output.txt", "w") as f:
        f.write(result.stdout)
        if result.stderr:
            f.write("\n\nERRORS:\n")
            f.write(result.stderr)
    
    return {
        "success": result.returncode == 0,
        "duration": duration,
        "output_file": f"{output_dir}/performance_tests_output.txt",
        "returncode": result.returncode
    }

def run_linting(output_dir):
    """Run code linting with flake8."""
    print("Running code linting...")
    
    # Create command
    cmd = [
        "flake8",
        "--max-line-length=100",
        "--exclude=venv,__pycache__,.git,*.pyc",
        "."
    ]
    
    # Run the linting
    start_time = time.time()
    result = subprocess.run(cmd, capture_output=True, text=True)
    duration = time.time() - start_time
    
    # Save output
    with open(f"{output_dir}/linting_output.txt", "w") as f:
        if result.stdout:
            f.write(result.stdout)
        else:
            f.write("No linting issues found.")
        if result.stderr:
            f.write("\n\nERRORS:\n")
            f.write(result.stderr)
    
    return {
        "success": result.returncode == 0,
        "duration": duration,
        "output_file": f"{output_dir}/linting_output.txt",
        "returncode": result.returncode
    }

def generate_report(results, output_dir):
    """Generate a comprehensive test report."""
    print("Generating test report...")
    
    # Create report data
    report = {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "unit_tests": results["unit_tests"]["success"],
            "performance_tests": results["performance_tests"]["success"],
            "linting": results["linting"]["success"],
            "overall_success": all(r["success"] for r in results.values())
        },
        "details": results
    }
    
    # Save report as JSON
    with open(f"{output_dir}/test_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    # Generate HTML report
    html_report = f"""<!DOCTYPE html>
<html>
<head>
    <title>MoodleExamSimulator Test Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1, h2 {{ color: #333; }}
        .success {{ color: green; }}
        .failure {{ color: red; }}
        .section {{ margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; }}
        table {{ border-collapse: collapse; width: 100%; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #f2f2f2; }}
    </style>
</head>
<body>
    <h1>MoodleExamSimulator Test Report</h1>
    <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    
    <div class="section">
        <h2>Summary</h2>
        <p>Overall Status: <span class="{'success' if report['summary']['overall_success'] else 'failure'}">
            {'PASSED' if report['summary']['overall_success'] else 'FAILED'}
        </span></p>
        <table>
            <tr>
                <th>Test Type</th>
                <th>Status</th>
                <th>Duration (s)</th>
            </tr>
            <tr>
                <td>Unit Tests</td>
                <td class="{'success' if results['unit_tests']['success'] else 'failure'}">
                    {'PASSED' if results['unit_tests']['success'] else 'FAILED'}
                </td>
                <td>{results['unit_tests']['duration']:.2f}</td>
            </tr>
            <tr>
                <td>Performance Tests</td>
                <td class="{'success' if results['performance_tests']['success'] else 'failure'}">
                    {'PASSED' if results['performance_tests']['success'] else 'FAILED'}
                </td>
                <td>{results['performance_tests']['duration']:.2f}</td>
            </tr>
            <tr>
                <td>Linting</td>
                <td class="{'success' if results['linting']['success'] else 'failure'}">
                    {'PASSED' if results['linting']['success'] else 'FAILED'}
                </td>
                <td>{results['linting']['duration']:.2f}</td>
            </tr>
        </table>
    </div>
    
    <div class="section">
        <h2>Details</h2>
        <p>See the output files for detailed test results:</p>
        <ul>
            <li><a href="unit_tests_output.txt">Unit Tests Output</a></li>
            <li><a href="performance_tests_output.txt">Performance Tests Output</a></li>
            <li><a href="linting_output.txt">Linting Output</a></li>
            <li><a href="coverage_html/index.html">Coverage Report</a></li>
        </ul>
    </div>
</body>
</html>
    """
    
    # Save HTML report
    with open(f"{output_dir}/test_report.html", "w") as f:
        f.write(html_report)
    
    print(f"Test report generated at {output_dir}/test_report.html")
    
    return report

def main():
    """Main function to run tests and generate report."""
    parser = argparse.ArgumentParser(description="Run tests for MoodleExamSimulator")
    parser.add_argument("--output-dir", default="test_results", help="Directory to store test results")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose output")
    parser.add_argument("--skip-unit", action="store_true", help="Skip unit tests")
    parser.add_argument("--skip-performance", action="store_true", help="Skip performance tests")
    parser.add_argument("--skip-linting", action="store_true", help="Skip linting")
    args = parser.parse_args()
    
    # Create output directory
    output_dir = args.output_dir
    os.makedirs(output_dir, exist_ok=True)
    
    # Set up test environment
    test_env = setup_test_environment()
    
    # Initialize results
    results = {}
    
    # Run tests
    if not args.skip_unit:
        results["unit_tests"] = run_unit_tests(test_env, output_dir, args.verbose)
    else:
        print("Skipping unit tests...")
        results["unit_tests"] = {"success": True, "duration": 0, "skipped": True}
    
    if not args.skip_performance:
        results["performance_tests"] = run_performance_tests(test_env, output_dir, args.verbose)
    else:
        print("Skipping performance tests...")
        results["performance_tests"] = {"success": True, "duration": 0, "skipped": True}
    
    if not args.skip_linting:
        results["linting"] = run_linting(output_dir)
    else:
        print("Skipping linting...")
        results["linting"] = {"success": True, "duration": 0, "skipped": True}
    
    # Generate report
    report = generate_report(results, output_dir)
    
    # Print summary
    print("\nTest Summary:")
    print(f"Unit Tests: {'SKIPPED' if args.skip_unit else 'PASSED' if results['unit_tests']['success'] else 'FAILED'}")
    print(f"Performance Tests: {'SKIPPED' if args.skip_performance else 'PASSED' if results['performance_tests']['success'] else 'FAILED'}")
    print(f"Linting: {'SKIPPED' if args.skip_linting else 'PASSED' if results['linting']['success'] else 'FAILED'}")
    print(f"Overall: {'PASSED' if report['summary']['overall_success'] else 'FAILED'}")
    
    # Return exit code
    return 0 if report["summary"]["overall_success"] else 1

if __name__ == "__main__":
    sys.exit(main())
