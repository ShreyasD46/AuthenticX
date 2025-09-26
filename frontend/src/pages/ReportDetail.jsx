// src/pages/ReportDetail.jsx
import { useParams } from "react-router-dom";
import VulnerabilityTable from "../features/scans/VulnerabilityTable";
import SeverityChart from "../features/scans/SeverityChart";
import SeverityHeatmap from "../features/scans/SeverityHeatmap";
import AttackPathGraph from "../features/scans/AttackPathGraph";
import ReportExporter from "../features/scans/ReportExporter";

export default function ReportDetail() {
  const { id } = useParams();

  // Later: fetch by ID. For now, mock based on id.
  const target = id === "1" ? "examplebank.com" : "shopsecure.io";

  const mockResults =
    id === "1"
      ? [
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
        ]
      : [
          {
            CVE_ID: "CVE-2023-87654",
            CVSS_Score: 7.8,
            Vulnerability: "Cross-Site Scripting (XSS)",
            Service: "Node.js Express",
            Port: 443,
            Severity: "High",
            Affected_Asset: "shopsecure.io",
          },
        ];

  // Build an attack path graph derived from the mockResults so each report has its own graph
  const mockGraph = (() => {
    const nodes = [];
    const links = [];

    // Entry node
    nodes.push({ id: "Internet", group: "entry", label: "Internet" });

    // Asset node (the target)
    nodes.push({ id: target, group: "asset", label: "Web Server" });

    // Add vulnerability nodes from mockResults
    mockResults.forEach((v) => {
      const nodeId = v.CVE_ID || v.Vulnerability || `${v.Affected_Asset}-vuln`;
      const label = v.Vulnerability || v.CVE_ID || "Vulnerability";
      // avoid duplicates
      if (!nodes.find((n) => n.id === nodeId)) {
        nodes.push({ id: nodeId, group: "vuln", label });
      }
      // link asset -> vuln
      links.push({ source: target, target: nodeId });
      // link vuln -> Database (example final target)
      links.push({ source: nodeId, target: "Database" });
    });

    // Database node
    nodes.push({ id: "Database", group: "asset", label: "Database Server" });

    // link Internet -> asset
    links.unshift({ source: "Internet", target: target });

    return { nodes, links };
  })();

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      <h2 className="text-3xl font-bold text-white mb-6">📄 Report Detail</h2>

      <div id="report-section" className="space-y-8">
        {/* Summary */}
        <div className="bg-card p-6 rounded-xl shadow-md border border-gray-700">
          <h3 className="text-xl font-semibold text-accent mb-2">
            Scan Report for <span className="text-white">{target}</span>
          </h3>
          <p className="text-gray-400">
            Found{" "}
            <span className="text-critical font-bold">
              {mockResults.length} vulnerabilities
            </span>{" "}
            during this scan.
          </p>
        </div>

        {/* Vulnerability Table */}
        <div id="table-section">
          <VulnerabilityTable data={mockResults} />
        </div>

        {/* Severity Chart */}
        <div id="chart-section">
          <SeverityChart data={mockResults} />
        </div>

        {/* ✅ Severity Heatmap */}
        <div id="heatmap-section">
          <SeverityHeatmap data={mockResults} />
        </div>

        {/* Attack Path Graph */}
        <div id="graph-section">
          <AttackPathGraph data={mockGraph} />
        </div>
      </div>

      {/* Export Buttons */}
      <ReportExporter
        scanResults={mockResults}
        target={target}
        graphData={mockGraph}
      />
    </div>
  );
}
