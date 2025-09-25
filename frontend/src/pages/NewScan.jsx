import ScanForm from "../features/scans/ScanForm";
import VulnerabilityTable from "../features/scans/VulnerabilityTable";
import SeverityChart from "../features/scans/SeverityChart";
import AttackPathGraph from "../features/scans/AttackPathGraph";
import ScanProgress from "../features/scans/ScanProgress";
import SeverityHeatmap from "../features/scans/SeverityHeatmap";
import { useState } from "react";

export default function NewScan() {
  const [showResults, setShowResults] = useState(false);
  const [scanInProgress, setScanInProgress] = useState(false);

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
    {
      CVE_ID: "CVE-2024-11111",
      CVSS_Score: 8.8,
      Vulnerability: "Remote Code Execution",
      Service: "Node.js 16.14",
      Port: 3000,
      Severity: "High",
      Affected_Asset: "app.examplebank.com",
    },
    {
      CVE_ID: "CVE-2024-22222",
      CVSS_Score: 7.5,
      Vulnerability: "Cross-Site Scripting",
      Service: "React 17.0.2",
      Port: 443,
      Severity: "High",
      Affected_Asset: "web.examplebank.com",
    },
    {
      CVE_ID: "CVE-2023-33333",
      CVSS_Score: 4.3,
      Vulnerability: "Information Disclosure",
      Service: "MySQL 8.0",
      Port: 3306,
      Severity: "Low",
      Affected_Asset: "db.examplebank.com",
    },
    {
      CVE_ID: "CVE-2024-44444",
      CVSS_Score: 6.1,
      Vulnerability: "CSRF Vulnerability",
      Service: "Express.js",
      Port: 3000,
      Severity: "Medium",
      Affected_Asset: "app.examplebank.com",
    },
    {
      CVE_ID: "CVE-2024-55555",
      CVSS_Score: 5.4,
      Vulnerability: "Weak Authentication",
      Service: "OAuth 2.0",
      Port: 443,
      Severity: "Medium",
      Affected_Asset: "api.examplebank.com",
    },
    {
      CVE_ID: "CVE-2023-66666",
      CVSS_Score: 3.7,
      Vulnerability: "Deprecated SSL/TLS",
      Service: "OpenSSL 1.1.1",
      Port: 443,
      Severity: "Low",
      Affected_Asset: "web.examplebank.com",
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
    setScanInProgress(true);
    setShowResults(false); // Hide previous results
  };

  const handleScanFinish = () => {
    setScanInProgress(false);
    setShowResults(true);
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-4 scrollbar-thin">
      {!showResults && (
        <h2 className="text-2xl font-bold mb-6">🔍 Start a New Scan</h2>
      )}

      {!scanInProgress && !showResults && <ScanForm onSubmit={handleScan} />}

      {scanInProgress && <ScanProgress onFinish={handleScanFinish} />}

      {showResults && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Scan Results</h3>
            <button
              onClick={() => {
                setShowResults(false);
                setScanInProgress(false);
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Start New Scan
            </button>
          </div>
          <div className="space-y-6">
            <SeverityHeatmap data={mockResults} />
            <SeverityChart data={mockResults} collapsible={true} />
            <AttackPathGraph data={mockGraph} />
            <VulnerabilityTable data={mockResults} />
          </div>
        </div>
      )}
    </div>
  );
}
