import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportExporter({ scanResults, target, graphData }) {
  // Count severity distribution
  const getSeverityCounts = () => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    scanResults.forEach((v) => {
      counts[v.Severity] = (counts[v.Severity] || 0) + 1;
    });
    return counts;
  };

  // Export full PDF with table, chart, and attack path
  const exportFullPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Full Vulnerability Report - ${target}`, 14, 20);

    // Summary
    doc.setFontSize(12);
    doc.text(`Total Vulnerabilities: ${scanResults.length}`, 14, 30);

    // Table
    autoTable(doc, {
      startY: 40,
      head: [["CVE_ID", "Severity", "CVSS Score", "Vulnerability", "Service", "Port", "Asset"]],
      body: scanResults.map((v) => [
        v.CVE_ID,
        v.Severity,
        v.CVSS_Score,
        v.Vulnerability,
        v.Service,
        v.Port,
        v.Affected_Asset,
      ]),
      styles: { halign: "left", lineColor: [0, 0, 0], lineWidth: 0.2 },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
      bodyStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
    });

    let nextY = doc.lastAutoTable.finalY + 20;

    // === Severity Chart (Simple Bar Chart) ===
    doc.setFontSize(14);
    doc.text("Severity Distribution", 14, nextY - 8);

    const counts = getSeverityCounts();
    const severities = ["Critical", "High", "Medium", "Low"];
    const colors = {
      Critical: [239, 68, 68],
      High: [249, 115, 22],
      Medium: [250, 204, 21],
      Low: [34, 197, 94],
    };

    const chartX = 14;
    const chartY = nextY;
    const barWidth = 30;
    const maxHeight = 40;
    const maxVal = Math.max(...Object.values(counts), 1);

    severities.forEach((sev, i) => {
      const val = counts[sev];
      const barHeight = (val / maxVal) * maxHeight;
      const x = chartX + i * (barWidth + 10);
      const y = chartY + maxHeight - barHeight;

      // Bar
      doc.setFillColor(...colors[sev]);
      doc.rect(x, y, barWidth, barHeight, "F");

      // Label
      doc.setFontSize(10);
      doc.text(sev, x + barWidth / 2, chartY + maxHeight + 6, { align: "center" });
      doc.text(String(val), x + barWidth / 2, y - 2, { align: "center" });
    });

    nextY = chartY + maxHeight + 30;

    // === Attack Path Diagram ===
    doc.setFontSize(14);
    doc.text("Attack Path Diagram", 14, nextY - 8);

    const nodeX = 30;
    let posY = nextY + 10;

    graphData.nodes.forEach((node, i) => {
      const isVuln = node.group === "vuln";

      // Draw node as box or circle
      if (isVuln) {
        // circle
        doc.setDrawColor(0, 0, 0);
        doc.circle(nodeX, posY, 10);
        doc.text(node.id, nodeX + 15, posY + 3);
      } else {
        // rectangle
        doc.setDrawColor(0, 0, 0);
        doc.rect(nodeX - 15, posY - 8, 30, 16);
        doc.text(node.id, nodeX + 20, posY + 3);
      }

      // Draw arrow to next if exists
      if (i < graphData.nodes.length - 1) {
        const nextY = posY + 30;
        doc.line(nodeX, posY + 12, nodeX, nextY - 12); // vertical line
        doc.line(nodeX - 3, nextY - 12, nodeX, nextY - 6); // arrow left
        doc.line(nodeX + 3, nextY - 12, nodeX, nextY - 6); // arrow right
      }

      posY += 40;
    });

    doc.save(`scan_report_full_${target}.pdf`);
  };

  return (
    <div className="flex gap-4 mt-6">
      <button
        onClick={exportFullPDF}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 transition"
      >
        📑 Export Full PDF (with Chart + Graph)
      </button>
    </div>
  );
}
