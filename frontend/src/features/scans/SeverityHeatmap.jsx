import { useMemo, useState } from "react";

export default function SeverityHeatmap({ data }) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Process data to create heatmap structure
  const heatmapData = useMemo(() => {
    // Extract unique assets
    const assets = [...new Set(data.map((item) => item.Affected_Asset))];
    const severities = ["Critical", "High", "Medium", "Low"];

    // Create matrix
    const matrix = assets.map((asset) => {
      const row = { asset };
      severities.forEach((severity) => {
        const count = data.filter(
          (item) => item.Affected_Asset === asset && item.Severity === severity
        ).length;
        row[severity] = count;
      });

      // Calculate total for this asset
      row.total = severities.reduce((sum, sev) => sum + row[sev], 0);

      return row;
    });

    // Calculate max count for color scaling
    const maxCount = Math.max(
      ...matrix.flatMap((row) => severities.map((sev) => row[sev]))
    );

    return { matrix, maxCount, assets, severities };
  }, [data]);

  // Get color intensity based on count
  const getColorIntensity = (count, severity) => {
    if (count === 0) return "bg-gray-700 text-gray-300 border border-gray-600";

    const intensity = Math.min(count / Math.max(heatmapData.maxCount, 1), 1);

    // Define color scales for each severity
    const colorScales = {
      Critical: [
        "bg-red-900/30 text-red-300",
        "bg-red-800/50 text-red-200",
        "bg-red-700/70 text-red-100",
        "bg-red-600/90 text-white",
      ],
      High: [
        "bg-orange-900/30 text-orange-300",
        "bg-orange-800/50 text-orange-200",
        "bg-orange-700/70 text-orange-100",
        "bg-orange-600/90 text-white",
      ],
      Medium: [
        "bg-yellow-900/30 text-yellow-300",
        "bg-yellow-800/50 text-yellow-200",
        "bg-yellow-700/70 text-yellow-100",
        "bg-yellow-600/90 text-white",
      ],
      Low: [
        "bg-green-900/30 text-green-300",
        "bg-green-800/50 text-green-200",
        "bg-green-700/70 text-green-100",
        "bg-green-600/90 text-white",
      ],
    };

    // Select color based on intensity (0-3 scale)
    const colorIndex = Math.min(Math.floor(intensity * 4), 3);
    return colorScales[severity][colorIndex];
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "Critical":
        return (
          <svg
            className="w-4 h-4"
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
        );
      case "High":
        return (
          <svg
            className="w-4 h-4"
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
        );
      case "Medium":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "Low":
        return (
          <svg
            className="w-4 h-4"
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
        );
      default:
        return null;
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg m-2">
          <div
            className="flex items-center justify-between cursor-pointer px-6 h-12"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Asset Severity Heatmap
            </h3>
            <div
              className={`transform transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              <svg
                className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <div
            className={`transition-all duration-300 ${
              isExpanded
                ? "max-h-32 opacity-100 px-6 pt-4 pb-6 overflow-y-auto"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="text-center text-gray-400 py-8">
              No vulnerability data available
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-700 mt-6">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg m-2">
        <div
          className="flex items-center justify-between cursor-pointer px-6 h-12"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Asset Severity Heatmap
          </h3>
          <div
            className={`transform transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            <svg
              className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Collapsible content */}
        <div
          className={`transition-all duration-300 ${
            isExpanded
              ? "max-h-96 opacity-100 px-6 pt-4 pb-6 overflow-y-auto"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          {/* Desktop/Tablet View - Horizontal Layout */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-full">
              {/* Header Row */}
              <div className="grid grid-cols-6 gap-2 mb-2">
                <div className="p-3 text-sm font-medium text-gray-300 bg-gray-800 rounded">
                  Asset
                </div>
                {heatmapData.severities.map((severity) => (
                  <div
                    key={severity}
                    className="p-3 text-sm font-medium text-gray-300 bg-gray-800 rounded flex items-center justify-center gap-2"
                  >
                    {getSeverityIcon(severity)}
                    <span>{severity}</span>
                  </div>
                ))}
                <div className="p-3 text-sm font-medium text-gray-300 bg-gray-800 rounded text-center">
                  Total
                </div>
              </div>

              {/* Data Rows */}
              {heatmapData.matrix.map((row, index) => (
                <div key={row.asset} className="grid grid-cols-6 gap-2 mb-2">
                  {/* Asset Name */}
                  <div
                    className="p-3 text-sm font-medium text-gray-200 bg-gray-800 rounded truncate"
                    title={row.asset}
                  >
                    {row.asset}
                  </div>

                  {/* Severity Columns */}
                  {heatmapData.severities.map((severity) => (
                    <div
                      key={severity}
                      className={`p-3 rounded text-center font-bold text-sm transition-all hover:scale-105 cursor-pointer ${getColorIntensity(
                        row[severity],
                        severity
                      )}`}
                      title={`${row.asset}: ${row[severity]} ${severity} vulnerabilities`}
                    >
                      {row[severity]}
                    </div>
                  ))}

                  {/* Total Column */}
                  <div className="p-3 text-sm font-bold text-center bg-slate-600 text-slate-100 rounded">
                    {row.total}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile View - Vertical Layout */}
          <div className="md:hidden space-y-4">
            {heatmapData.matrix.map((row, index) => (
              <div key={row.asset} className="bg-gray-800 p-4 rounded-lg">
                {/* Asset Header */}
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
                  <h4
                    className="text-sm font-medium text-gray-200 truncate"
                    title={row.asset}
                  >
                    {row.asset}
                  </h4>
                  <span className="text-xs text-gray-400 font-medium">
                    Total: {row.total}
                  </span>
                </div>

                {/* Severity Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {heatmapData.severities.map((severity) => (
                    <div
                      key={severity}
                      className={`p-3 rounded text-center transition-all hover:scale-105 ${getColorIntensity(
                        row[severity],
                        severity
                      )}`}
                    >
                      <div className="flex items-center justify-center gap-2 mb-1">
                        {getSeverityIcon(severity)}
                        <span className="text-xs font-medium">{severity}</span>
                      </div>
                      <div className="text-lg font-bold">{row[severity]}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Legend</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-700 border border-gray-600 rounded"></div>
                <span className="text-gray-400">No vulnerabilities</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-700 rounded"></div>
                <span className="text-gray-400">Low count</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-700 rounded"></div>
                <span className="text-gray-400">Medium count</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-700 rounded"></div>
                <span className="text-gray-400">High count</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
