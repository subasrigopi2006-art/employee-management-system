const Employee = require("../models/Employee");

// ── GET /api/employees ─────────────────────────────────────────────────────────
const getAllEmployees = async (req, res) => {
  try {
    const { search } = req.query;
    const query = search
      ? {
          $or: [
            { name:       { $regex: search, $options: "i" } },
            { department: { $regex: search, $options: "i" } },
            { email:      { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const employees = await Employee.find(query).select("-password").sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/employees/:id ─────────────────────────────────────────────────────
const getEmployeeById = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id).select("-password");
    if (!emp) return res.status(404).json({ error: "Employee not found" });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/employees ────────────────────────────────────────────────────────
const createEmployee = async (req, res) => {
  try {
    const emp = new Employee(req.body);
    await emp.save();
    const result = emp.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── PUT /api/employees/:id ─────────────────────────────────────────────────────
const updateEmployee = async (req, res) => {
  try {
    if (req.body.name) {
      req.body.avatar = req.body.name
        .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    }
    const emp = await Employee.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    ).select("-password");
    if (!emp) return res.status(404).json({ error: "Employee not found" });
    res.json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── DELETE /api/employees/:id ──────────────────────────────────────────────────
const deleteEmployee = async (req, res) => {
  try {
    const emp = await Employee.findByIdAndDelete(req.params.id);
    if (!emp) return res.status(404).json({ error: "Employee not found" });
    res.json({ message: "Employee deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/stats ─────────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const employees = await Employee.find();
    const total     = employees.length;
    const avgSalary = total > 0
      ? Math.round(employees.reduce((s, e) => s + e.salary, 0) / total) : 0;
    const topPerformer = employees.find((e) => e.performance === "Excellent") || employees[0] || null;
    const perfCounts   = employees.reduce((acc, e) => {
      acc[e.performance] = (acc[e.performance] || 0) + 1;
      return acc;
    }, {});
    res.json({ total, avgSalary, topPerformer, perfCounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/auth/login ───────────────────────────────────────────────────────
const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    // Case-insensitive email match
    const emp = await Employee.findOne({
      email: { $regex: `^${email.trim()}$`, $options: "i" }
    });

    if (!emp || emp.password !== password.trim())
      return res.status(401).json({ error: "Invalid email or password" });

    const result = emp.toObject();
    delete result.password;
    res.json({ message: "Login successful", user: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/employees/:id/performance ───────────────────────────────────────
const addPerformanceReview = async (req, res) => {
  try {
    const { rating, score, comment, reviewedBy } = req.body;
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ error: "Employee not found" });
    emp.performanceHistory.push({ rating, score, comment, reviewedBy: reviewedBy || "Admin" });
    emp.performance = rating;
    await emp.save();
    const result = emp.toObject();
    delete result.password;
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── PUT /api/employees/:id/salary ─────────────────────────────────────────────
const updateSalary = async (req, res) => {
  try {
    const { salary } = req.body;
    if (salary === undefined || salary < 0)
      return res.status(400).json({ error: "Valid salary required" });
    const emp = await Employee.findByIdAndUpdate(
      req.params.id, { salary: Number(salary) }, { new: true, runValidators: true }
    ).select("-password");
    if (!emp) return res.status(404).json({ error: "Employee not found" });
    res.json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getAllEmployees, getEmployeeById, createEmployee,
  updateEmployee,  deleteEmployee,  getStats,
  loginEmployee,   addPerformanceReview, updateSalary,
};
