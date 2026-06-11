import React from "react";

export default function PerformanceChart({ data }) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="chart-wrap">
      <div className="chart-bars">
        {data.map((d) => (
          <div key={d.label} className="chart-col">
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  height: `${(d.value / (max + 1)) * 100}%`,
                  background: d.color,
                }}
              />
            </div>
            <span className="bar-label">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="chart-y-axis">
        {[10, 8, 6, 4, 2, 0].map((n) => (
          <span key={n} className="y-tick">
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}
