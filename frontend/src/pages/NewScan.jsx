import ScanForm from "../features/scans/ScanForm";
import ReportExporter from "../features/reports/ReportExporter";
import VulnerabilityTable from "../features/scans/VulnerabilityTable";
import SeverityChart from "../features/scans/SeverityChart";
import AttackPathGraph from "../features/scans/AttackPathGraph";
import { useState } from "react";

export default function NewScan() {
  const [showResults, setShowResults] = useState(false);

  const mockResults = [
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
  ];

  const mockGraph = {
    nodes: [
      { id: "Internet", label: "Internet", group: 1 }, // Entry point
      { id: "web.examplebank.com", label: "web.examplebank.com", group: 2 }, // Asset
      { id: "SQL Injection", label: "SQL Injection", group: 3 }, // Vulnerability
      { id: "Database", label: "Database", group: 4 }, // Asset
    ],
    links: [
      { source: "Internet", target: "web.examplebank.com" },
      { source: "web.examplebank.com", target: "SQL Injection" },
      { source: "SQL Injection", target: "Database" },
    ],
  };

  const handleScan = (data) => {
    console.log("Scan started:", data);
    // Later → Fetch real results
    setShowResults(true);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🔍 Start a New Scan</h2>
      <ScanForm onSubmit={handleScan} />

      {showResults && (
        <>
          <h3 className="text-xl font-semibold mt-8 mb-4">Results</h3>
          <VulnerabilityTable data={mockResults} />
          <SeverityChart data={mockResults} />
          <AttackPathGraph data={mockGraph} />
          <ReportExporter
            scanResults={mockResults}
            target="web.examplebank.com"
          />
        </>
      )}
    </div>
  );
}
