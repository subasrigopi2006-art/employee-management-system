const express = require("express");
const router  = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getStats,
  loginEmployee,
  addPerformanceReview,
  updateSalary,
} = require("../controllers/employeeController");

// Auth
router.post("/auth/login", loginEmployee);

// Stats
router.get("/stats", getStats);

// Employee CRUD
router.get("/",       getAllEmployees);
router.get("/:id",    getEmployeeById);
router.post("/",      createEmployee);
router.put("/:id",    updateEmployee);
router.delete("/:id", deleteEmployee);

// Performance reviews
router.post("/:id/performance", addPerformanceReview);

// Salary update
router.put("/:id/salary", updateSalary);

module.exports = router;
