const Employee   = require("../models/Employee");
const Attendance = require("../models/Attendance");

// ── GET /api/performance  ─────────────────────────────────────────────────────
// Calculates performance score for each employee based on:
//   1. Attendance rate  (40 pts)
//   2. Punctuality      (20 pts) - checkIn <= 09:15
//   3. Hours worked     (20 pts)
//   4. Manual reviews   (20 pts)
const getPerformanceScores = async (req, res) => {
  try {
    const employees = await Employee.find().select("-password").sort({ name: 1 });

    // Last 30 days date range
    const today = new Date();
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }

    // Fetch all attendance records for last 30 days
    const allRecords = await Attendance.find({ date: { $in: dates } });

    const result = employees.map((emp) => {
      const empRecords = allRecords.filter(
        (r) => String(r.employeeId) === String(emp._id)
      );

      // ── 1. Attendance Rate (40 pts) ──────────────────────────
      const totalDays = dates.length;
      const presentDays  = empRecords.filter((r) => r.status === "Present").length;
      const halfDays     = empRecords.filter((r) => r.status === "Half Day").length;
      const absentDays   = empRecords.filter((r) => r.status === "Absent").length;
      const leaveDays    = empRecords.filter((r) => r.status === "Leave").length;

      const attendanceEffective = presentDays + halfDays * 0.5;
      const nonLeave = totalDays - leaveDays;
      const attendanceRate = nonLeave > 0 ? (attendanceEffective / nonLeave) * 100 : 100;
      const attendanceScore = Math.min(40, (attendanceRate / 100) * 40);

      // ── 2. Punctuality (20 pts) ──────────────────────────────
      const presentRecords = empRecords.filter(
        (r) => (r.status === "Present" || r.status === "Half Day") && r.checkIn
      );
      let onTimeCount = 0;
      presentRecords.forEach((r) => {
        if (r.checkIn) {
          const [h, m] = r.checkIn.split(":").map(Number);
          if (h < 9 || (h === 9 && m <= 15)) onTimeCount++;
        }
      });
      const punctualityRate = presentRecords.length > 0
        ? (onTimeCount / presentRecords.length) * 100 : 100;
      const punctualityScore = (punctualityRate / 100) * 20;

      // ── 3. Hours Worked (20 pts) ─────────────────────────────
      let totalMinutes = 0;
      let hoursRecords = 0;
      presentRecords.forEach((r) => {
        if (r.checkIn && r.checkOut) {
          const [ih, im] = r.checkIn.split(":").map(Number);
          const [oh, om] = r.checkOut.split(":").map(Number);
          const diff = oh * 60 + om - (ih * 60 + im);
          if (diff > 0) { totalMinutes += diff; hoursRecords++; }
        }
      });
      const avgHours = hoursRecords > 0 ? totalMinutes / hoursRecords / 60 : 8;
      // Target: 8 hrs = full 20pts; max bonus at 9+ hrs
      const hoursScore = Math.min(20, (Math.min(avgHours, 9) / 9) * 20);

      // ── 4. Review Score (20 pts) ─────────────────────────────
      const SCORE_MAP = { Excellent: 20, Good: 15, Average: 10, Poor: 5 };
      let reviewScore = SCORE_MAP[emp.performance] || 10;
      if (emp.performanceHistory?.length > 0) {
        const recent = emp.performanceHistory.slice(-3);
        const avg = recent.reduce((s, r) => s + (r.score || 5), 0) / recent.length;
        reviewScore = (avg / 10) * 20;
      }

      const totalScore = Math.round(attendanceScore + punctualityScore + hoursScore + reviewScore);

      // Derive rating from score
      let calculatedRating;
      if (totalScore >= 85)      calculatedRating = "Excellent";
      else if (totalScore >= 65) calculatedRating = "Good";
      else if (totalScore >= 45) calculatedRating = "Average";
      else                       calculatedRating = "Poor";

      return {
        ...emp.toObject(),
        calculatedScore: totalScore,
        calculatedRating,
        breakdown: {
          attendanceScore:   Math.round(attendanceScore),
          punctualityScore:  Math.round(punctualityScore),
          hoursScore:        Math.round(hoursScore),
          reviewScore:       Math.round(reviewScore),
          attendanceRate:    Math.round(attendanceRate),
          punctualityRate:   Math.round(punctualityRate),
          avgHoursPerDay:    Math.round(avgHours * 10) / 10,
          presentDays,
          halfDays,
          absentDays,
          leaveDays,
          totalDaysTracked:  totalDays,
        },
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/employees/:id/performance  (existing, kept in employeeController)

module.exports = { getPerformanceScores };
