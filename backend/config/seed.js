const mongoose = require("mongoose");
const Employee = require("../models/Employee");
require("dotenv").config();

const SEED_DATA = [
  { name: "Magesh",     email: "Magesh@company.com",     department: "HR",        salary: 50000,  performance: "Excellent", password: "Magesh123",     role: "employee" },
  { name: "Dhanasekar", email: "Dhanasekar@company.com", department: "IT",        salary: 75000,  performance: "Good",      password: "Dhanasekar123", role: "employee" },
  { name: "Subasri",    email: "Subasri@company.com",    department: "Finance",   salary: 68000,  performance: "Excellent", password: "Subasri123",    role: "employee" },
  { name: "Saranya",    email: "Saranya@company.com",    department: "Marketing", salary: 80000,  performance: "Good",      password: "Saranya123",    role: "employee" },
  { name: "Bushan",     email: "Bushan@company.com",     department: "IT",        salary: 72000,  performance: "Average",   password: "Bushan123",     role: "employee" },
  { name: "Abinesh",    email: "Abinesh@company.com",    department: "HR",        salary: 55000,  performance: "Good",      password: "Abinesh123",    role: "employee" },
  { name: "Kamesh",     email: "Kamesh@company.com",     department: "Finance",   salary: 63000,  performance: "Excellent", password: "Kamesh123",     role: "employee" },
  { name: "Sarathi",    email: "Sarathi@company.com",    department: "Marketing", salary: 58000,  performance: "Poor",      password: "Sarathi123",    role: "employee" },
  { name: "Jai",        email: "Jai@company.com",        department: "Admin",     salary: 100000, performance: "Excellent", password: "Jai123",        role: "admin"    },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
    await Employee.deleteMany({});
    console.log("🗑️  Cleared existing employees");
    await Employee.insertMany(SEED_DATA);
    console.log("🌱 Seeded", SEED_DATA.length, "employees successfully");
    console.log("\n📋 Login credentials:");
    SEED_DATA.forEach(e => console.log(`   ${e.role === "admin" ? "👑 Admin" : "👤 Emp  "} | ${e.email.padEnd(28)} | ${e.password}`));
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
};

seedDB();
