import dotenv from "dotenv";
dotenv.config();

import { pool } from "../config/db";
import { createUser } from "../services/auth.service";
import { createClass } from "../services/classes.service";
import type { gradeLevels } from "../validators/classes.schema";
import { createSubject } from "../services/subjects.service";
import { createClassSubject } from "../services/classSubjects.service";
import { createEnrollment } from "../services/enrollments.service";
import { saveAttendance } from "../services/attendance.service";
import { createGrade } from "../services/grades.service";
import { createParentStudentLink } from "../services/parentStudent.service";

const ACADEMIC_YEAR = "2026-2027";
const DEFAULT_PASSWORD = "Password123!";

async function resetDatabase(): Promise<void> {
  await pool.query(
    `TRUNCATE TABLE
       grades, attendance, parent_student, enrollments,
       class_subjects, subjects, classes, parents, students, teachers, users
     RESTART IDENTITY CASCADE`
  );
  console.log("Database cleared.");
}

// ---- Name generators (used to produce many distinct people quickly) ----
const studentFirstNames = [
  "Sara", "Ali", "Nour", "Yousef", "Lina", "Omar", "Rana", "Khaled",
  "Dana", "Hamza",
];
const studentLastNames = ["Youssef", "Hassan", "Mahmoud", "Saleh", "Odeh", "Zayed"];

const teacherFirstNames = [
  "Layla", "Karim", "Huda", "Faris", "Mariam", "Ziad", "Salma", "Adel",
  "Yasmin", "Tariq",
];
const teacherLastNames = ["Ahmad", "Khalil", "Nasser", "Rashid", "Barakat"];

const parentFirstNames = [
  "Mona", "Samir", "Rasha", "Fadi", "Amal", "Bassam", "Iman", "Nabil",
  "Suha", "Waleed", "Reem", "Jamal", "Hana", "Adnan", "Lubna", "Marwan",
  "Fatima", "Rami", "Nadia", "Sami",
];

function buildFullNames(firsts: string[], lasts: string[], count: number): string[] {
  const names: string[] = [];
  for (const last of lasts) {
    for (const first of firsts) {
      names.push(`${first} ${last}`);
      if (names.length === count) return names;
    }
  }
  return names;
}

async function seed(): Promise<void> {
  // ---- Admin ----
  await createUser({
    fullName: "System Admin",
    email: "admin@school.com",
    password: DEFAULT_PASSWORD,
    role: "admin",
  });
  console.log("Admin created.");

  // ---- Subjects (10 core school subjects) ----
  const subjectNames = [
    "Arabic",
    "English",
    "Mathematics",
    "Science",
    "Social Studies",
    "Islamic Education",
    "Physical Education",
    "Art",
    "Music",
    "Computer Science",
  ];
  const subjects = [];
  for (const name of subjectNames) {
    subjects.push(await createSubject({ name }));
  }
  console.log(`${subjects.length} subjects created.`);

  // ---- Teachers (one per subject, teaching it across every class) ----
  const teacherNames = buildFullNames(teacherFirstNames, teacherLastNames, subjects.length);
  const teachers = [];
  for (let i = 0; i < teacherNames.length; i++) {
    const teacher = await createUser({
      fullName: teacherNames[i],
      email: `teacher${i + 1}@school.com`,
      password: DEFAULT_PASSWORD,
      role: "teacher",
    });
    teachers.push(teacher);
  }
  console.log(`${teachers.length} teachers created.`);

  // ---- Classes (Grade 1 through Grade 13, one section each) ----
  const classes = [];
  for (let grade = 1; grade <= 13; grade++) {
    const cls = await createClass({
      name: `Grade ${grade} - A`,
      gradeLevel: String(grade) as (typeof gradeLevels)[number],
      academicYear: ACADEMIC_YEAR,
    });
    classes.push(cls);
  }
  console.log(`${classes.length} classes created.`);

  // ---- Assign every subject's teacher to every class ----
  for (const cls of classes) {
    for (let i = 0; i < subjects.length; i++) {
      await createClassSubject({
        classId: cls.id,
        subjectId: subjects[i].id,
        teacherId: teachers[i].id,
      });
    }
  }
  console.log("Teachers assigned to all classes.");

  // ---- Students (50+), spread evenly across the 13 classes ----
  const STUDENT_COUNT = 52; // 4 students per class across 13 classes
  const studentNames = buildFullNames(studentFirstNames, studentLastNames, STUDENT_COUNT);
  const students = [];
  for (let i = 0; i < STUDENT_COUNT; i++) {
    const student = await createUser({
      fullName: studentNames[i],
      email: `student${i + 1}@school.com`,
      password: DEFAULT_PASSWORD,
      role: "student",
    });
    students.push(student);
  }
  console.log(`${students.length} students created.`);

  // ---- Enroll students round-robin across the 13 classes ----
  for (let i = 0; i < students.length; i++) {
    const cls = classes[i % classes.length];
    await createEnrollment({
      studentId: students[i].id,
      classId: cls.id,
      academicYear: ACADEMIC_YEAR,
    });
  }
  console.log("Students enrolled.");

  // ---- Parents (20), each linked to one student ----
  const parents = [];
  for (let i = 0; i < parentFirstNames.length; i++) {
    const parent = await createUser({
      fullName: `${parentFirstNames[i]} ${studentLastNames[i % studentLastNames.length]}`,
      email: `parent${i + 1}@school.com`,
      password: DEFAULT_PASSWORD,
      role: "parent",
    });
    parents.push(parent);
    await createParentStudentLink({
      parentId: parent.id,
      studentId: students[i].id,
      relationship: i % 2 === 0 ? "mother" : "father",
    });
  }
  console.log(`${parents.length} parents created and linked.`);

  // ---- Sample attendance for today, for the first 3 classes ----
  const today = new Date().toISOString().slice(0, 10);
  for (let c = 0; c < 3; c++) {
    const cls = classes[c];
    const classStudents = students.filter((_, i) => i % classes.length === c);
    await saveAttendance(
      cls.id,
      teachers[0].id,
      today,
      classStudents.map((s, idx) => ({
        studentId: s.id,
        status: idx === 0 ? "late" : "present",
      }))
    );
  }
  console.log("Sample attendance recorded for the first 3 classes.");

  // ---- Sample grades for the first class, Mathematics ----
  const firstClassStudents = students.filter((_, i) => i % classes.length === 0);
  for (const student of firstClassStudents) {
    await createGrade(classes[0].id, subjects[2].id /* Mathematics */, teachers[2].id, {
      studentId: student.id,
      term: "Term 1",
      assessmentType: "Quiz",
      score: 15 + Math.floor(Math.random() * 6), // 15-20
      maxScore: 20,
    });
  }
  console.log("Sample grades entered for Grade 1 - A.");

  console.log("\nSeed complete. Every account uses the same password:");
  console.log(`  Password: ${DEFAULT_PASSWORD}`);
  console.log(`  Admin:    admin@school.com`);
  console.log(`  Teacher:  teacher1@school.com ... teacher${teachers.length}@school.com`);
  console.log(`  Student:  student1@school.com ... student${students.length}@school.com`);
  console.log(`  Parent:   parent1@school.com ... parent${parents.length}@school.com`);
}

async function run(): Promise<void> {
  await resetDatabase();
  await seed();
}

run()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    pool.end();
  });
