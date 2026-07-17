# Future School — School Management System

A full-stack school management system with four roles: Admin, Teacher, Student, and Parent.

## Structure

- `client/` — React + Vite + TypeScript frontend
- `server/` — Node.js + Express + TypeScript backend, PostgreSQL database

## Local development

**Backend** (see `server/.env.example` for required variables):
```bash
cd server
npm install
npm run dev
```

**Frontend** (see `client/.env.example` for required variables):
```bash
cd client
npm install
npm run dev
```

## Database setup

Run `server/schema.sql` against a PostgreSQL database to create the tables, then optionally run:
```bash
cd server
npm run db:reset-and-seed
```
to populate it with sample data (⚠️ this clears all existing data first).
