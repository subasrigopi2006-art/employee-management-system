const Attendance = require("../models/Attendance");
const Employee   = require("../models/Employee");

// ── GET /api/attendance?date=YYYY-MM-DD ────────────────────────────────────────
const getAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "date query param required" });

    // Get all employees
    const employees = await Employee.find().sort({ name: 1 });

    // Get attendance records for that date
    const records = await Attendance.find({ date });
    const recordMap = {};
    records.forEach((r) => { recordMap[r.employeeId.toString()] = r; });

    // Merge: every employee gets an entry (default Present if none recorded)
    const result = employees.map((emp) => {
      const rec = recordMap[emp._id.toString()];
      return rec
        ? rec.toObject()
        : {
            _id: null,
            employeeId: emp._id,
            employeeName: emp.name,
            department: emp.department,
            date,
            status: "Present",
            checkIn: "09:00",
            checkOut: "18:00",
          };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/attendance  (upsert one record) ──────────────────────────────────
const markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, checkIn, checkOut } = req.body;
    if (!employeeId || !date || !status) {
      return res.status(400).json({ error: "employeeId, date, and status are required" });
    }

    const emp = await Employee.findById(employeeId);
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const record = await Attendance.findOneAndUpdate(
      { employeeId, date },
      {
        employeeId,
        employeeName: emp.name,
        department: emp.department,
        date,
        status,
        checkIn:  checkIn  || "",
        checkOut: checkOut || "",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/attendance/bulk  (upsert many at once) ──────────────────────────
const markBulkAttendance = async (req, res) => {
  try {
    const { date, records } = req.body; // records: [{employeeId, status, checkIn, checkOut}]
    if (!date || !Array.isArray(records)) {
      return res.status(400).json({ error: "date and records[] required" });
    }

    const ops = records.map(({ employeeId, employeeName, department, status, checkIn, checkOut }) => ({
      updateOne: {
        filter: { employeeId, date },
        update: { $set: { employeeId, employeeName, department, date, status, checkIn: checkIn || "", checkOut: checkOut || "" } },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);
    res.json({ saved: ops.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/attendance/summary?date=YYYY-MM-DD ────────────────────────────────
const getSummary = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "date required" });

    const total   = await require("../models/Employee").countDocuments();
    const records = await Attendance.find({ date });
    const counts  = { Present: 0, Absent: 0, "Half Day": 0, Leave: 0 };
    records.forEach((r) => { if (counts[r.status] !== undefined) counts[r.status]++; });

    // Employees with no record count as "not yet marked"
    const marked = records.length;
    res.json({ total, marked, ...counts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAttendance, markAttendance, markBulkAttendance, getSummary };
