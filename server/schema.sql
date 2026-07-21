-- ============================================
-- School Management System - Database Schema
-- PostgreSQL
-- ============================================

-- ============================================
-- 1. USERS - central table for all users
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. Role-specific detail tables (1-to-1 relationship with users)
-- ============================================
CREATE TABLE teachers (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(100),
    hire_date DATE
);

CREATE TABLE students (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE parents (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(30)
);

-- ============================================
-- 3. Academic years (referenced by classes and enrollments)
-- ============================================
CREATE TABLE academic_years (
    id SERIAL PRIMARY KEY,
    label VARCHAR(20) NOT NULL UNIQUE CHECK (label ~ '^\d{4}-\d{4}$'), -- e.g. "2026-2027"
    is_current BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================
-- 4. Classes and subjects
-- ============================================
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,          -- e.g. "Grade 7 - A"
    grade_level VARCHAR(20) NOT NULL,    -- e.g. "7"
    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    UNIQUE (name, academic_year_id)
);

CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE    -- e.g. "Mathematics"
);

-- ============================================
-- 5. Links teacher, subject, and class together
-- ============================================
CREATE TABLE class_subjects (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES teachers(user_id) ON DELETE CASCADE,
    UNIQUE (class_id, subject_id)  -- one subject taught by one teacher per class
);

-- ============================================
-- 6. Student enrollment per class (historical, by year)
-- ============================================
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    UNIQUE (student_id, academic_year_id)  -- a student is in only one class per year
);

-- ============================================
-- 7. Parent-student relationship (many-to-many)
-- ============================================
CREATE TABLE parent_student (
    parent_id INTEGER NOT NULL REFERENCES parents(user_id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
    relationship VARCHAR(30) NOT NULL,  -- e.g. "father", "mother", "guardian"
    PRIMARY KEY (parent_id, student_id)
);

-- ============================================
-- 8. Attendance
-- ============================================
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    att_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    recorded_by INTEGER REFERENCES teachers(user_id) ON DELETE SET NULL,
    UNIQUE (student_id, class_id, att_date)  -- one attendance record per day
);

-- ============================================
-- 9. Grades
-- ============================================
CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    term VARCHAR(20) NOT NULL,           -- e.g. "Term 1"
    assessment_type VARCHAR(50),         -- e.g. "quiz", "exam", "homework"
    score NUMERIC(5,2) NOT NULL,
    max_score NUMERIC(5,2) NOT NULL DEFAULT 100,
    recorded_by INTEGER REFERENCES teachers(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- 10. Timetable entries: which class_subject (teacher+subject+class)
-- happens on which day and period. Period numbers/times are a fixed
-- list defined in application code, not a database table.
-- ============================================
CREATE TABLE timetable_entries (
    id SERIAL PRIMARY KEY,
    class_subject_id INTEGER NOT NULL REFERENCES class_subjects(id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday')),
    period INTEGER NOT NULL CHECK (period BETWEEN 1 AND 7),
    UNIQUE (class_subject_id, day_of_week, period)
);

CREATE INDEX idx_timetable_class_subject ON timetable_entries(class_subject_id);

-- ============================================
-- Indexes to speed up common queries
-- ============================================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_enrollments_class ON enrollments(class_id);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_class_date ON attendance(class_id, att_date);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_class_subject ON grades(class_id, subject_id);
