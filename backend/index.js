 const express   = require("express");
const cors      = require("cors");
const mongoose  = require("mongoose");
require("dotenv").config();

const connectDB                  = require("./config/db");
const employeeRoutes             = require("./routes/employeeRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const Employee                   = require("./models/Employee");

const app = express();

connectDB();

app.use(cors({ origin: "https://agent-6a2ae67bcaf7ad612aaa8682--ems02.netlify.app" }));
app.use(express.json());

// Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/performance", require("./routes/performanceRoutes"));

// Auth & Stats shortcuts
app.post("/api/auth/login", require("./controllers/employeeController").loginEmployee);
app.get("/api/stats",       require("./controllers/employeeController").getStats);

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED = [
  { name: "Magesh",     email: "Magesh@company.com",     department: "HR",        salary: 50000,  performance: "Excellent", password: "Magesh123",     role: "employee" },
  { name: "Dhanasekar", email: "Dhanasekar@company.com", department: "IT",        salary: 75000,  performance: "Good",      password: "Dhanasekar123", role: "employee" },
  { name: "Subasri",    email: "Subasri@company.com",    department: "Finance",   salary: 68000,  performance: "Excellent", password: "Subasri123",    role: "employee" },
  { name: "Saranya",    email: "Saranya@company.com",    department: "Marketing", salary: 80000,  performance: "Good",      password: "Saranya123",    role: "employee" },
  { name: "Bushan",     email: "Bushan@company.com",     department: "IT",        salary: 72000,  performance: "Average",   password: "Bushan123",     role: "employee" },
  { name: "Abinesh",    email: "Abinesh@company.com",    department: "HR",        salary: 55000,  performance: "Good",      password: "Abinesh123",    role: "employee" },
  { name: "Kamesh",     email: "Kamesh@company.com",     department: "Finance",   salary: 63000,  performance: "Excellent", password: "Kamesh123",     role: "employee" },
  { name: "Sarathi",    email: "Sarathi@company.com",    department: "Marketing", salary: 58000,  performance: "Poor",      password: "Sarathi123",    role: "employee" },
  { name: "Jai",        email: "Jai@company.com",        department: "HR",        salary: 100000, performance: "Excellent", password: "Jai123",        role: "admin"    },
];

mongoose.connection.once("open", async () => {
  const count = await Employee.countDocuments();
  if (count === 0) {
    await Employee.insertMany(SEED);
    console.log("🌱 Seeded 9 employees");
    console.log("📧 Employee logins — Email: Name@company.com  |  Password: Name123");
    console.log("📧 Admin login: Jai@company.com / Jai123");
  } else {
    console.log(`ℹ️  DB already has ${count} employees — skipping seed`);
    console.log("   Run: node config/seed.js  to force reseed with new data");
  }
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
