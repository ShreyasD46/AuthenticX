import { useState, useEffect } from "react";
import SeverityChart from "../features/scans/SeverityChart";

export default function Dashboard() {
  const [selectedScan, setSelectedScan] = useState(null);
  const [searchTarget, setSearchTarget] = useState("");
  const [minSeverity, setMinSeverity] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const pageSize = 5;

  // Simulate loading
  useEffect(() => {
    setTimeout(() => setLoading(false), 700);
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTarget, minSeverity]);

  const summary = { critical: 3, high: 6, medium: 12, low: 7 };

  // Mock scanner status data
  const scannerStatus = [
    { name: "Nmap", status: "online" },
    { name: "Nuclei", status: "online" },
    { name: "OpenVAS", status: "degraded" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      case "degraded":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "online":
        return "Online";
      case "offline":
        return "Offline";
      case "degraded":
        return "Degraded";
      default:
        return "Unknown";
    }
  };

  const mockResults = [
    { Severity: "Critical" },
    { Severity: "Critical" },
    { Severity: "Critical" },
    { Severity: "High" },
    { Severity: "High" },
    { Severity: "High" },
    { Severity: "High" },
    { Severity: "High" },
    { Severity: "High" },
    { Severity: "Medium" },
    { Severity: "Medium" },
    { Severity: "Medium" },
    { Severity: "Medium" },
    { Severity: "Medium" },
    { Severity: "Medium" },
    { Severity: "Medium" },
    { Severity: "Medium" },
    { Severity: "Medium" },
    { Severity: "Medium" },
    { Severity: "Medium" },
    { Severity: "Medium" },
    { Severity: "Medium" },
    { Severity: "Low" },
    { Severity: "Low" },
    { Severity: "Low" },
    { Severity: "Low" },
    { Severity: "Low" },
    { Severity: "Low" },
    { Severity: "Low" },
  ];

  // Helper function to create sparkline SVG
  const createSparkline = (data, width = 60, height = 20) => {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1; // Avoid division by zero
    const padding = 2; // Add padding to prevent clipping

    const points = data
      .map((value, index) => {
        const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
        const y =
          padding +
          (height - 2 * padding) -
          ((value - min) / range) * (height - 2 * padding);
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg
        width={width}
        height={height}
        className="inline-block"
        aria-label="Severity trend sparkline"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Background gradient area under the line */}
        <defs>
          <linearGradient
            id={`gradient-${Math.random().toString(36).substr(2, 9)}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Fill area under the curve */}
        <polygon
          points={`${padding},${height - padding} ${points} ${
            width - padding
          },${height - padding}`}
          fill="url(#gradient)"
          opacity="0.6"
        />

        {/* Main trend line */}
        <polyline
          points={points}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* Highlight dots for data points */}
        {data.map((value, index) => {
          const x =
            padding + (index / (data.length - 1)) * (width - 2 * padding);
          const y =
            padding +
            (height - 2 * padding) -
            ((value - min) / range) * (height - 2 * padding);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill="#6366f1"
              stroke="#1e293b"
              strokeWidth="1"
              opacity="0.8"
            />
          );
        })}
      </svg>
    );
  };

  const recentScans = [
    {
      id: 1,
      target: "web.examplebank.com",
      date: "2025-09-25",
      critical: 2,
      high: 4,
      medium: 8,
      low: 3,
      trend: [15, 18, 12, 17, 14, 19, 17], // Mock severity trend data
    },
    {
      id: 2,
      target: "api.examplebank.com",
      date: "2025-09-24",
      critical: 1,
      high: 2,
      medium: 4,
      low: 4,
      trend: [8, 12, 10, 8, 11, 9, 11], // Mock severity trend data
    },
    {
      id: 3,
      target: "admin.examplebank.com",
      date: "2025-09-23",
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      trend: [3, 2, 1, 2, 1, 0, 0], // Mock severity trend data
    },
  ];

  // Helper function to get severity level for filtering
  const getSeverityLevel = (scan) => {
    if (scan.critical > 0) return 4; // Critical
    if (scan.high > 0) return 3; // High
    if (scan.medium > 0) return 2; // Medium
    if (scan.low > 0) return 1; // Low
    return 0; // None
  };

  const getSeverityThreshold = (severity) => {
    switch (severity) {
      case "Critical":
        return 4;
      case "High":
        return 3;
      case "Medium":
        return 2;
      case "Low":
        return 1;
      default:
        return 0;
    }
  };

  // Filter scans based on search and severity
  const filteredScans = recentScans.filter((scan) => {
    const matchesSearch = scan.target
      .toLowerCase()
      .includes(searchTarget.toLowerCase());
    const meetsSeverity =
      minSeverity === "All" ||
      getSeverityLevel(scan) >= getSeverityThreshold(minSeverity);
    return matchesSearch && meetsSeverity;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredScans.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedScans = filteredScans.slice(startIndex, endIndex);

  const clearFilters = () => {
    setSearchTarget("");
    setMinSeverity("All");
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle keyboard navigation for scan rows
  const handleScanKeyDown = (event, scan) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedScan(scan);
    }
  };

  // Skeleton components
  const SkeletonCard = () => (
    <div className="bg-card p-4 rounded-lg shadow-md border border-gray-700">
      <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
      <div className="h-8 bg-gray-600 rounded animate-pulse w-16"></div>
    </div>
  );

  const SkeletonScanRow = () => (
    <div className="flex justify-between items-center p-4">
      <div>
        <div className="h-5 bg-gray-700 rounded animate-pulse mb-2 w-40"></div>
        <div className="h-4 bg-gray-600 rounded animate-pulse w-24"></div>
      </div>
      <div className="flex gap-4">
        <div className="h-4 bg-gray-700 rounded animate-pulse w-8"></div>
        <div className="h-4 bg-gray-700 rounded animate-pulse w-8"></div>
        <div className="h-4 bg-gray-700 rounded animate-pulse w-8"></div>
        <div className="h-4 bg-gray-700 rounded animate-pulse w-8"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-full overflow-y-auto px-6 py-4 scrollbar-thin">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-700 rounded animate-pulse w-64"></div>
            <div className="h-10 bg-gray-700 rounded-lg animate-pulse w-40"></div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="flex gap-3">
            <div className="h-9 bg-gray-700 rounded animate-pulse w-32"></div>
            <div className="h-9 bg-gray-700 rounded animate-pulse w-40"></div>
          </div>

          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          {/* Charts and Scans Skeleton - Side by side on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Severity Chart Skeleton */}
            <div className="bg-card p-6 rounded-lg shadow-md border border-gray-700">
              <div className="h-6 bg-gray-700 rounded animate-pulse mb-4 w-48"></div>
              <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Recent Scans Section Skeleton */}
            <div className="space-y-4">
              {/* Toolbar Skeleton */}
              <div className="bg-card p-4 rounded-lg shadow-md border border-gray-700">
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="h-10 bg-gray-700 rounded animate-pulse flex-1"></div>
                  <div className="h-10 bg-gray-700 rounded animate-pulse w-32"></div>
                  <div className="h-10 bg-gray-700 rounded animate-pulse w-16"></div>
                </div>
              </div>

              {/* Recent Scans Skeleton */}
              <div className="bg-card p-6 rounded-lg shadow-md border border-gray-700">
                <div className="h-6 bg-gray-700 rounded animate-pulse mb-4 w-32"></div>
                <div className="divide-y divide-gray-700">
                  <SkeletonScanRow />
                  <SkeletonScanRow />
                  <SkeletonScanRow />
                  <SkeletonScanRow />
                  <SkeletonScanRow />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-4 scrollbar-thin">
      <div className="space-y-8">
        {/* Header with Scanner Status and Start New Scan button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold">📊 Dashboard Overview</h2>

            {/* Scanner Status Widget */}
            <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-lg border border-gray-700 shadow-sm">
              <span className="text-sm text-gray-400 font-medium">
                Scanners:
              </span>
              <div className="flex items-center gap-3">
                {scannerStatus.map((scanner) => (
                  <div
                    key={scanner.name}
                    className="flex items-center gap-1.5 group relative"
                    title={`${scanner.name}: ${getStatusText(scanner.status)}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        scanner.status
                      )} animate-pulse`}
                    ></div>
                    <span className="text-xs text-gray-300 font-medium">
                      {scanner.name}
                    </span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {getStatusText(scanner.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => console.log("navigate to /scan")}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-all flex items-center gap-2"
          >
            ➕ Start New Scan
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => console.log("Run Quick Scan")}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors"
          >
            ⚡ Run Quick Scan
          </button>
          <button
            onClick={() => console.log("Upload Scan Result")}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors"
          >
            📤 Upload Scan Result
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Critical Severity Card */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-600 hover:scale-105 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-900 rounded-lg">
                <svg
                  className="w-6 h-6 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Critical</p>
                <p className="text-2xl font-bold text-red-400">
                  {summary.critical}
                </p>
              </div>
            </div>
          </div>

          {/* High Severity Card */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-600 hover:scale-105 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-900 rounded-lg">
                <svg
                  className="w-6 h-6 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">High</p>
                <p className="text-2xl font-bold text-orange-400">
                  {summary.high}
                </p>
              </div>
            </div>
          </div>

          {/* Medium Severity Card */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-600 hover:scale-105 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-900 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Medium</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {summary.medium}
                </p>
              </div>
            </div>
          </div>

          {/* Low Severity Card */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-600 hover:scale-105 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-900 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Low</p>
                <p className="text-2xl font-bold text-green-400">
                  {summary.low}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Scans Section - Side by side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Severity Chart */}
          <div className="bg-card p-6 rounded-lg shadow-md border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Severity Breakdown</h3>
            <SeverityChart data={mockResults} />
          </div>

          {/* Recent Scans Section */}
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="bg-card p-4 rounded-lg shadow-md border border-gray-700">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <input
                  type="text"
                  placeholder="Search target..."
                  value={searchTarget}
                  onChange={(e) => setSearchTarget(e.target.value)}
                  aria-label="Search scan targets"
                  className="px-3 py-2 rounded bg-gray-900 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-accent flex-1 min-w-0 w-full sm:w-auto"
                />
                <select
                  value={minSeverity}
                  onChange={(e) => setMinSeverity(e.target.value)}
                  aria-label="Filter by minimum severity level"
                  className="px-3 py-2 rounded bg-gray-900 border border-gray-600 text-white focus:outline-none focus:border-accent whitespace-nowrap w-full sm:w-auto"
                >
                  <option value="All">All Severities</option>
                  <option value="Critical">Critical+</option>
                  <option value="High">High+</option>
                  <option value="Medium">Medium+</option>
                  <option value="Low">Low+</option>
                </select>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors whitespace-nowrap w-full sm:w-auto"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Recent Scans</h3>
              <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                {paginatedScans.length > 0 ? (
                  paginatedScans.map((scan, index) => (
                    <div key={scan.id}>
                      <div
                        className="p-4 hover:bg-gray-600/30 hover:scale-[1.02] rounded-lg cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent shadow-sm hover:shadow-md"
                        onClick={() => setSelectedScan(scan)}
                        onKeyDown={(e) => handleScanKeyDown(e, scan)}
                        role="button"
                        tabIndex="0"
                        aria-label={`View details for scan of ${scan.target} on ${scan.date}. Critical: ${scan.critical}, High: ${scan.high}, Medium: ${scan.medium}, Low: ${scan.low}`}
                      >
                        {/* Header with target and date */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-accent">
                              {scan.target}
                            </p>
                            <p className="text-gray-400 text-sm">{scan.date}</p>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span
                              className="text-red-400 font-medium"
                              aria-label={`${scan.critical} critical vulnerabilities`}
                            >
                              C: {scan.critical}
                            </span>
                            <span
                              className="text-orange-400 font-medium"
                              aria-label={`${scan.high} high severity vulnerabilities`}
                            >
                              H: {scan.high}
                            </span>
                            <span
                              className="text-yellow-300 font-medium"
                              aria-label={`${scan.medium} medium severity vulnerabilities`}
                            >
                              M: {scan.medium}
                            </span>
                            <span
                              className="text-green-300 font-medium"
                              aria-label={`${scan.low} low severity vulnerabilities`}
                            >
                              L: {scan.low}
                            </span>
                          </div>
                        </div>

                        {/* Sparkline with label */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500 font-medium">
                            Trend:
                          </span>
                          <div className="bg-gray-900/50 rounded px-2 py-1 border border-gray-700/50">
                            {createSparkline(scan.trend, 80, 24)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <p>No scans match your filters</p>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {filteredScans.length > 0 && totalPages > 1 && (
                <nav
                  role="navigation"
                  aria-label="Pagination navigation"
                  className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700"
                >
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    aria-label={`Go to previous page (currently on page ${currentPage} of ${totalPages})`}
                    className={`px-4 py-2 rounded transition-colors ${
                      currentPage === 1
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    }`}
                  >
                    Prev
                  </button>

                  <span
                    className="text-gray-400"
                    aria-live="polite"
                    aria-label={`Currently viewing page ${currentPage} of ${totalPages} total pages`}
                  >
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    aria-label={`Go to next page (currently on page ${currentPage} of ${totalPages})`}
                    className={`px-4 py-2 rounded transition-colors ${
                      currentPage === totalPages
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    }`}
                  >
                    Next
                  </button>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedScan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-xl border border-gray-700 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Scan Details</h3>
              <button
                onClick={() => setSelectedScan(null)}
                className="text-gray-400 hover:text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Target</p>
                <p className="font-bold text-accent text-lg">
                  {selectedScan.target}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Date</p>
                <p className="text-white">{selectedScan.date}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">
                  Vulnerability Counts
                </p>
                <table className="w-full">
                  <tbody className="space-y-2">
                    <tr>
                      <td className="text-critical font-medium">Critical</td>
                      <td className="text-right font-bold">
                        {selectedScan.critical}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-yellow-400 font-medium">High</td>
                      <td className="text-right font-bold">
                        {selectedScan.high}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-yellow-600 font-medium">Medium</td>
                      <td className="text-right font-bold">
                        {selectedScan.medium}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-green-400 font-medium">Low</td>
                      <td className="text-right font-bold">
                        {selectedScan.low}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedScan(null)}
                className="bg-accent hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
