import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useContext, useState } from "react";
import ThemeContext from "../../context/ThemeContext";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SeverityChart({ data, collapsible = false }) {
  const { theme } = useContext(ThemeContext);
  const [isCollapsed, setIsCollapsed] = useState(collapsible);

  // Count severities
  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  data.forEach((v) => {
    counts[v.Severity]++;
  });

  const chartData = {
    labels: ["Critical", "High", "Medium", "Low"],
    datasets: [
      {
        data: [counts.Critical, counts.High, counts.Medium, counts.Low],
        backgroundColor: [
          "rgb(239, 68, 68)", // red
          "rgb(249, 115, 22)", // orange
          "rgb(250, 204, 21)", // yellow
          "rgb(34, 197, 94)", // green
        ],
        borderColor: "#1e293b",
        borderWidth: 2,
        // Soften segment edges a bit
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true, // maintain 1:1 aspect ratio for perfect circle
    cutout: "55%", // doughnut hole for a cleaner, modern look
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true, // use circular points instead of square boxes
          pointStyle: "circle",
          boxWidth: 8,
          boxHeight: 8,
          color: theme === "light" ? "#000000" : "#e5e7eb", // black for light theme, light gray for dark theme
        },
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-700 mt-6"
      data-testid="severity-chart"
    >
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg m-2 max-h-96 overflow-y-auto">
        {collapsible ? (
          <>
            <div
              className="flex items-center justify-between cursor-pointer px-6 h-12"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Severity Distribution
              </h3>
              <svg
                className={`w-5 h-5 text-gray-600 dark:text-gray-400 transform transition-transform ${
                  isCollapsed ? "rotate-0" : "rotate-180"
                }`}
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
            {!isCollapsed && (
              <div className="px-6 pb-6">
                <div className="w-full max-w-sm mx-auto aspect-square">
                  <Doughnut data={chartData} options={options} />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Severity Distribution
            </h3>
            <div className="w-full max-w-sm mx-auto aspect-square">
              <Doughnut data={chartData} options={options} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
