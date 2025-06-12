/**
 * Example Java code for Moodle Exam Simulator
 * This demonstrates a simple Student Management System
 */
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class StudentManagementSystem {
    
    public static void main(String[] args) {
        // Create a course and add students
        Course javaProgramming = new Course("CS101", "Introduction to Java Programming");
        
        javaProgramming.addStudent(new Student("1001", "Ali", "Yılmaz", 3.75));
        javaProgramming.addStudent(new Student("1002", "Ayşe", "Kaya", 3.90));
        javaProgramming.addStudent(new Student("1003", "Mehmet", "Demir", 3.45));
        javaProgramming.addStudent(new Student("1004", "Zeynep", "Çelik", 3.85));
        javaProgramming.addStudent(new Student("1005", "Mustafa", "Yıldız", 3.20));
        
        // Display all students
        System.out.println("All students in " + javaProgramming.getCourseName() + ":");
        javaProgramming.displayAllStudents();
        
        // Find a student by ID
        String studentId = "1003";
        Student foundStudent = javaProgramming.findStudentById(studentId);
        
        if (foundStudent != null) {
            System.out.println("\nFound student with ID " + studentId + ":");
            System.out.println(foundStudent);
        } else {
            System.out.println("\nStudent with ID " + studentId + " not found.");
        }
        
        // Sort students by GPA
        System.out.println("\nStudents sorted by GPA (highest to lowest):");
        javaProgramming.sortStudentsByGPA();
        javaProgramming.displayAllStudents();
        
        // Sort students by name
        System.out.println("\nStudents sorted by last name:");
        javaProgramming.sortStudentsByName();
        javaProgramming.displayAllStudents();
        
        // Remove a student
        javaProgramming.removeStudent("1005");
        System.out.println("\nAfter removing student with ID 1005:");
        javaProgramming.displayAllStudents();
    }
}

class Student {
    private String id;
    private String firstName;
    private String lastName;
    private double gpa;
    
    public Student(String id, String firstName, String lastName, double gpa) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.gpa = gpa;
    }
    
    public String getId() {
        return id;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public double getGpa() {
        return gpa;
    }
    
    public void setGpa(double gpa) {
        this.gpa = gpa;
    }
    
    @Override
    public String toString() {
        return String.format("ID: %s, Name: %s %s, GPA: %.2f", 
                            id, firstName, lastName, gpa);
    }
}

class Course {
    private String courseId;
    private String courseName;
    private List<Student> students;
    
    public Course(String courseId, String courseName) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.students = new ArrayList<>();
    }
    
    public String getCourseId() {
        return courseId;
    }
    
    public String getCourseName() {
        return courseName;
    }
    
    public void addStudent(Student student) {
        students.add(student);
        System.out.println("Student " + student.getFirstName() + " " + 
                          student.getLastName() + " added to " + courseName);
    }
    
    public void removeStudent(String studentId) {
        students.removeIf(student -> student.getId().equals(studentId));
    }
    
    public Student findStudentById(String studentId) {
        for (Student student : students) {
            if (student.getId().equals(studentId)) {
                return student;
            }
        }
        return null;
    }
    
    public void sortStudentsByGPA() {
        Collections.sort(students, new Comparator<Student>() {
            @Override
            public int compare(Student s1, Student s2) {
                return Double.compare(s2.getGpa(), s1.getGpa()); // Descending order
            }
        });
    }
    
    public void sortStudentsByName() {
        Collections.sort(students, new Comparator<Student>() {
            @Override
            public int compare(Student s1, Student s2) {
                return s1.getLastName().compareTo(s2.getLastName());
            }
        });
    }
    
    public void displayAllStudents() {
        for (Student student : students) {
            System.out.println(student);
        }
    }
}
