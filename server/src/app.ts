import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import classesRoutes from "./routes/classes.routes";
import subjectsRoutes from "./routes/subjects.routes";
import classSubjectsRoutes from "./routes/classSubjects.routes";
import teacherRoutes from "./routes/teacher.routes";
import enrollmentsRoutes from "./routes/enrollments.routes";
import studentRoutes from "./routes/student.routes";
import parentStudentRoutes from "./routes/parentStudent.routes";
import parentRoutes from "./routes/parent.routes";
import academicYearsRoutes from "./routes/academicYears.routes";

const app = express();

// global middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev")); // logs every request to the terminal, useful during development

// health check - confirms the server is running
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/class-subjects", classSubjectsRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/parent-students", parentStudentRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/academic-years", academicYearsRoutes);
// more routes will be registered here as we build them:
// app.use("/api/users", usersRoutes);

// error-handling middleware - must be registered last
app.use(errorHandler);

export default app;
