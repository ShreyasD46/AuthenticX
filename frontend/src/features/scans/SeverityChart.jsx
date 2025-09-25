import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SeverityChart({ data }) {
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
    maintainAspectRatio: false, // we'll control the canvas size via container
    cutout: "55%", // doughnut hole for a cleaner, modern look
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true, // use circular points instead of square boxes
          pointStyle: "circle",
          boxWidth: 8,
          boxHeight: 8,
          color: "#e5e7eb", // legend label color (tailwind gray-200)
        },
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div
      className="bg-card p-4 rounded-xl shadow-md border border-gray-700 mt-6"
      data-testid="severity-chart"
    >
      <h3 className="text-lg font-semibold mb-4">Severity Distribution</h3>
      {/* Square container ensures the doughnut renders as a perfect circle */}
      <div className="mx-auto" style={{ width: 320, height: 320 }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}
