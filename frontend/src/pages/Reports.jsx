// src/pages/Reports.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Reports() {
  const navigate = useNavigate();

  // Mock saved reports
  const [reports] = useState([
    {
      id: 1,
      target: "examplebank.com",
      date: "2025-09-26",
      vulnerabilities: 2,
    },
    {
      id: 2,
      target: "shopsecure.io",
      date: "2025-09-20",
      vulnerabilities: 5,
    },
  ]);

  return (
    <div className="px-6 py-4">
      <h2 className="text-3xl font-bold text-white mb-6">📄 Reports</h2>

      <div className="overflow-hidden rounded-xl border border-gray-700 shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800 text-gray-300 text-sm">
              <th className="p-3">Target</th>
              <th className="p-3">Date</th>
              <th className="p-3">Vulnerabilities</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, idx) => (
              <tr
                key={r.id}
                className={`${
                  idx % 2 === 0 ? "bg-background" : "bg-gray-900"
                } hover:bg-gray-800 transition`}
              >
                <td className="p-3">{r.target}</td>
                <td className="p-3">{r.date}</td>
                <td className="p-3">{r.vulnerabilities}</td>
                <td className="p-3">
                  <button
                    className="bg-accent text-white px-3 py-1 rounded hover:bg-blue-500"
                    onClick={() => navigate(`/reports/${r.id}`)}
                  >
                    View Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
