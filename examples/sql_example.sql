-- Example SQL code for Moodle Exam Simulator
-- This demonstrates a university database schema with sample queries

-- Create database
CREATE DATABASE IF NOT EXISTS university_db;
USE university_db;

-- Create tables
CREATE TABLE IF NOT EXISTS departments (
    department_id INT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    building VARCHAR(50),
    budget DECIMAL(12, 2)
);

CREATE TABLE IF NOT EXISTS professors (
    professor_id INT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    department_id INT,
    hire_date DATE,
    salary DECIMAL(10, 2),
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

CREATE TABLE IF NOT EXISTS courses (
    course_id VARCHAR(10) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    department_id INT,
    credits INT,
    professor_id INT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (professor_id) REFERENCES professors(professor_id)
);

CREATE TABLE IF NOT EXISTS students (
    student_id INT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    date_of_birth DATE,
    major_department_id INT,
    admission_date DATE,
    FOREIGN KEY (major_department_id) REFERENCES departments(department_id)
);

CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    course_id VARCHAR(10),
    semester VARCHAR(20),
    year INT,
    grade CHAR(2),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    UNIQUE (student_id, course_id, semester, year)
);

-- Insert sample data
-- Departments
INSERT INTO departments VALUES 
(1, 'Computer Science', 'Science Building', 1500000.00),
(2, 'Mathematics', 'Science Building', 1200000.00),
(3, 'Physics', 'Science Building', 1300000.00),
(4, 'Engineering', 'Engineering Building', 2000000.00),
(5, 'Business', 'Business Building', 1800000.00);

-- Professors
INSERT INTO professors VALUES 
(101, 'Ali', 'Yılmaz', 1, '2010-09-01', 95000.00),
(102, 'Ayşe', 'Kaya', 1, '2012-09-01', 90000.00),
(103, 'Mehmet', 'Demir', 2, '2008-09-01', 92000.00),
(104, 'Zeynep', 'Çelik', 3, '2015-09-01', 88000.00),
(105, 'Mustafa', 'Yıldız', 4, '2011-09-01', 96000.00),
(106, 'Fatma', 'Şahin', 5, '2014-09-01', 93000.00);

-- Courses
INSERT INTO courses VALUES 
('CS101', 'Introduction to Computer Science', 1, 3, 101),
('CS202', 'Data Structures and Algorithms', 1, 4, 102),
('MATH101', 'Calculus I', 2, 4, 103),
('PHYS101', 'Physics I', 3, 4, 104),
('ENG101', 'Introduction to Engineering', 4, 3, 105),
('BUS101', 'Introduction to Business', 5, 3, 106),
('CS301', 'Database Systems', 1, 4, 101),
('CS401', 'Artificial Intelligence', 1, 4, 102);

-- Students
INSERT INTO students VALUES 
(1001, 'Ahmet', 'Özdemir', 'ahmet.ozdemir@example.com', '2000-05-15', 1, '2020-09-01'),
(1002, 'Elif', 'Yılmaz', 'elif.yilmaz@example.com', '2001-03-22', 1, '2020-09-01'),
(1003, 'Emre', 'Kara', 'emre.kara@example.com', '2000-11-10', 2, '2020-09-01'),
(1004, 'Selin', 'Demir', 'selin.demir@example.com', '2001-07-05', 3, '2021-09-01'),
(1005, 'Burak', 'Şahin', 'burak.sahin@example.com', '2000-09-18', 4, '2021-09-01'),
(1006, 'Deniz', 'Aydın', 'deniz.aydin@example.com', '2001-01-30', 5, '2021-09-01'),
(1007, 'Ceren', 'Yıldız', 'ceren.yildiz@example.com', '2000-12-12', 1, '2022-09-01'),
(1008, 'Mert', 'Çelik', 'mert.celik@example.com', '2001-08-25', 2, '2022-09-01');

-- Enrollments
INSERT INTO enrollments (student_id, course_id, semester, year, grade) VALUES 
(1001, 'CS101', 'Fall', 2020, 'A'),
(1001, 'MATH101', 'Fall', 2020, 'B+'),
(1001, 'CS202', 'Spring', 2021, 'A-'),
(1002, 'CS101', 'Fall', 2020, 'A'),
(1002, 'MATH101', 'Fall', 2020, 'A-'),
(1002, 'CS202', 'Spring', 2021, 'B+'),
(1003, 'MATH101', 'Fall', 2020, 'A+'),
(1003, 'PHYS101', 'Fall', 2020, 'A'),
(1004, 'PHYS101', 'Fall', 2021, 'B'),
(1004, 'MATH101', 'Fall', 2021, 'B+'),
(1005, 'ENG101', 'Fall', 2021, 'A-'),
(1005, 'PHYS101', 'Fall', 2021, 'B+'),
(1006, 'BUS101', 'Fall', 2021, 'A'),
(1007, 'CS101', 'Fall', 2022, 'B+'),
(1008, 'MATH101', 'Fall', 2022, 'A-');

-- Example queries

-- 1. List all students with their majors
SELECT s.student_id, s.first_name, s.last_name, d.department_name AS major
FROM students s
JOIN departments d ON s.major_department_id = d.department_id
ORDER BY s.last_name, s.first_name;

-- 2. Find the average grade for each course (converting letter grades to numeric)
SELECT c.course_id, c.title, 
    AVG(CASE 
        WHEN e.grade = 'A+' THEN 4.3
        WHEN e.grade = 'A' THEN 4.0
        WHEN e.grade = 'A-' THEN 3.7
        WHEN e.grade = 'B+' THEN 3.3
        WHEN e.grade = 'B' THEN 3.0
        WHEN e.grade = 'B-' THEN 2.7
        WHEN e.grade = 'C+' THEN 2.3
        WHEN e.grade = 'C' THEN 2.0
        WHEN e.grade = 'C-' THEN 1.7
        WHEN e.grade = 'D+' THEN 1.3
        WHEN e.grade = 'D' THEN 1.0
        WHEN e.grade = 'F' THEN 0.0
        ELSE NULL
    END) AS avg_grade
FROM courses c
JOIN enrollments e ON c.course_id = e.course_id
GROUP BY c.course_id, c.title
ORDER BY avg_grade DESC;

-- 3. Find professors who teach multiple courses
SELECT p.professor_id, p.first_name, p.last_name, COUNT(c.course_id) AS course_count
FROM professors p
JOIN courses c ON p.professor_id = c.professor_id
GROUP BY p.professor_id, p.first_name, p.last_name
HAVING COUNT(c.course_id) > 1
ORDER BY course_count DESC;

-- 4. Find students who are taking courses in their major department
SELECT s.student_id, s.first_name, s.last_name, c.course_id, c.title
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
JOIN courses c ON e.course_id = c.course_id
WHERE s.major_department_id = c.department_id
ORDER BY s.last_name, s.first_name;

-- 5. Calculate the total credits each student is taking
SELECT s.student_id, s.first_name, s.last_name, SUM(c.credits) AS total_credits
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
JOIN courses c ON e.course_id = c.course_id
WHERE e.semester = 'Fall' AND e.year = 2021
GROUP BY s.student_id, s.first_name, s.last_name
ORDER BY total_credits DESC;

-- 6. Find departments with the highest average professor salary
SELECT d.department_id, d.department_name, AVG(p.salary) AS avg_salary
FROM departments d
JOIN professors p ON d.department_id = p.department_id
GROUP BY d.department_id, d.department_name
ORDER BY avg_salary DESC;

-- 7. Find students who have taken all CS courses
SELECT s.student_id, s.first_name, s.last_name
FROM students s
WHERE NOT EXISTS (
    SELECT c.course_id
    FROM courses c
    WHERE c.department_id = 1 -- Computer Science department
    AND NOT EXISTS (
        SELECT 1
        FROM enrollments e
        WHERE e.student_id = s.student_id
        AND e.course_id = c.course_id
    )
);

-- 8. Find the most popular courses (highest enrollment)
SELECT c.course_id, c.title, COUNT(e.student_id) AS enrollment_count
FROM courses c
JOIN enrollments e ON c.course_id = e.course_id
GROUP BY c.course_id, c.title
ORDER BY enrollment_count DESC
LIMIT 5;

-- 9. Calculate GPA for each student
SELECT s.student_id, s.first_name, s.last_name,
    SUM(
        CASE 
            WHEN e.grade = 'A+' THEN 4.3 * c.credits
            WHEN e.grade = 'A' THEN 4.0 * c.credits
            WHEN e.grade = 'A-' THEN 3.7 * c.credits
            WHEN e.grade = 'B+' THEN 3.3 * c.credits
            WHEN e.grade = 'B' THEN 3.0 * c.credits
            WHEN e.grade = 'B-' THEN 2.7 * c.credits
            WHEN e.grade = 'C+' THEN 2.3 * c.credits
            WHEN e.grade = 'C' THEN 2.0 * c.credits
            WHEN e.grade = 'C-' THEN 1.7 * c.credits
            WHEN e.grade = 'D+' THEN 1.3 * c.credits
            WHEN e.grade = 'D' THEN 1.0 * c.credits
            WHEN e.grade = 'F' THEN 0.0 * c.credits
            ELSE 0
        END
    ) / SUM(c.credits) AS gpa
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
JOIN courses c ON e.course_id = c.course_id
GROUP BY s.student_id, s.first_name, s.last_name
ORDER BY gpa DESC;

-- 10. Find courses without any enrollments
SELECT c.course_id, c.title
FROM courses c
LEFT JOIN enrollments e ON c.course_id = e.course_id
WHERE e.enrollment_id IS NULL;
