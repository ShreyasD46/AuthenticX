// src/pages/Reports.jsx
import { useState } from "react";
import VulnerabilityTable from "../features/scans/VulnerabilityTable";
import SeverityChart from "../features/scans/SeverityChart";
import AttackPathGraph from "../features/scans/AttackPathGraph";
import ReportExporter from "../features/scans/ReportExporter";

export default function Reports() {
  // Mock vulnerability scan results (replace later with backend fetch)
  const [reportData] = useState([
    {
      CVE_ID: "CVE-2024-12345",
      CVSS_Score: 9.1,
      Vulnerability: "SQL Injection in login form",
      Service: "Apache 2.4.49",
      Port: 443,
      Severity: "Critical",
      Affected_Asset: "web.examplebank.com",
    },
    {
      CVE_ID: "CVE-2023-56789",
      CVSS_Score: 6.5,
      Vulnerability: "Directory Traversal",
      Service: "Nginx 1.20",
      Port: 80,
      Severity: "Medium",
      Affected_Asset: "api.examplebank.com",
    },
  ]);

  // Mock graph data
 const mockGraph = {
  nodes: [
    { id: "Internet", group: 1 },  // entry
    { id: "web.examplebank.com", group: 2 }, // asset
    { id: "SQL Injection", group: 3 },       // vuln
    { id: "Database", group: 2 },            // asset
  ],
  links: [
    { source: "Internet", target: "web.examplebank.com" },
    { source: "web.examplebank.com", target: "SQL Injection" },
    { source: "SQL Injection", target: "Database" },
  ],
};


  const target = "examplebank.com";

  return (
    <div className="h-full overflow-y-auto px-6 py-4 scrollbar-thin">
      {/* Page Heading */}
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
        📄 Reports
      </h2>

      {/* Full Report Section */}
      <div id="report-section" className="space-y-8">
        {/* Summary Card */}
        <div className="bg-card p-6 rounded-xl shadow-md border border-gray-700">
          <h3 className="text-xl font-semibold text-accent mb-2">
            Scan Report for <span className="text-white">{target}</span>
          </h3>
          <p className="text-gray-400">
            Found{" "}
            <span className="text-critical font-bold">{reportData.length} vulnerabilities</span>{" "}
            during this scan.
          </p>
        </div>

        {/* Vulnerability Table */}
        <div id="table-section">
          <VulnerabilityTable data={reportData} />
        </div>

        {/* Severity Chart */}
        <div id="chart-section">
          <SeverityChart data={reportData} />
        </div>

        {/* Attack Path Graph */}
        <div id="graph-section">
          <AttackPathGraph data={mockGraph} />
        </div>
      </div>

      {/* Export Buttons */}
      <ReportExporter scanResults={reportData} target={target} graphData={mockGraph} />
    </div>
  );
}
