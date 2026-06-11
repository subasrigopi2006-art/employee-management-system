# Employee Management System (EMS)

A full-stack Employee Management System with role-based access.

## Features

- **Admin Login** — Full access to all pages
- **Employee Login** — See only their own profile, salary, and performance
- **Dashboard** — Admin stats + employee personal profile view
- **Employees** — Email ID instead of salary; admin sees all, employee sees own record
- **Salaries** — Editable salary (admin only); employees see their own salary
- **Performance** — Admin can rate employees (1–10 score + comment); employees see their history
- **Attendance** — Mark and track attendance
- **Departments** — Department overview

## Getting Started

### Backend
```bash
cd backend
npm install
node index.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Demo Logins

| Role     | Email                   | Password    |
|----------|-------------------------|-------------|
| Admin    | admin@company.com       | admin123    |
| Employee | alice@company.com       | alice123    |
| Employee | mark@company.com        | mark123     |
| Employee | emily@company.com       | emily123    |
| Employee | michael@company.com     | michael123  |

*(All employees follow pattern: firstname@company.com / firstname123)*

## Changes Made

1. **Salary → Email ID** in Dashboard and Employee list tables
2. **Reports page removed** from sidebar and routing
3. **Employee login** — employees log in with email+password and see only their own data
4. **Salary page** — inline edit button per row (admin only)
5. **Performance page** — ⭐ Rate button opens modal with score slider + comment; history shown on row expand
6. **Backend** — `/api/auth/login`, `PUT /api/employees/:id/salary`, `POST /api/employees/:id/performance`
7. **Employee model** — added `email`, `password`, `role`, `performanceHistory[]`
