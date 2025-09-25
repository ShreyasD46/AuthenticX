import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportExporter({ scanResults, target, graphData }) {
  // === Vulnerability Table PDF ===
  const exportTablePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Vulnerability Table - ${target}`, 14, 20);

    autoTable(doc, {
      startY: 30,
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

    doc.save(`VulnerabilityTable_${target}.pdf`);
  };

  // === Severity Chart PDF ===
  const exportChartPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Severity Distribution - ${target}`, 14, 20);

    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    scanResults.forEach((v) => (counts[v.Severity] = (counts[v.Severity] || 0) + 1));

    const severities = ["Critical", "High", "Medium", "Low"];
    const colors = {
      Critical: [239, 68, 68],
      High: [249, 115, 22],
      Medium: [250, 204, 21],
      Low: [34, 197, 94],
    };

    const chartX = 20, chartY = 40;
    const barWidth = 30, maxHeight = 50;
    const maxVal = Math.max(...Object.values(counts), 1);

    severities.forEach((sev, i) => {
      const val = counts[sev];
      const barHeight = (val / maxVal) * maxHeight;
      const x = chartX + i * (barWidth + 15);
      const y = chartY + maxHeight - barHeight;

      doc.setFillColor(...colors[sev]);
      doc.rect(x, y, barWidth, barHeight, "F");

      doc.text(sev, x + barWidth / 2, chartY + maxHeight + 10, { align: "center" });
      doc.text(String(val), x + barWidth / 2, y - 2, { align: "center" });
    });

    doc.save(`SeverityChart_${target}.pdf`);
  };

  // === Attack Path Graph PDF ===
// === Attack Path Graph PDF ===
const exportGraphPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Attack Path Graph - ${target}`, 14, 20);

  let posY = 50;
  const nodeX = 40;

  graphData.nodes.forEach((node, i) => {
    if (node.group === "vuln") {
      doc.setFillColor(239, 68, 68); // red
      doc.circle(nodeX, posY, 10, "F"); // filled circle
    } else if (node.group === "asset") {
      doc.setFillColor(59, 130, 246); // blue
      doc.rect(nodeX - 15, posY - 8, 30, 16, "F"); // filled rectangle
    } else if (node.group === "entry") {
      doc.setFillColor(34, 197, 94); // green
      doc.rect(nodeX - 15, posY - 8, 30, 16, "F"); // filled rectangle
    } else {
      doc.setFillColor(148, 163, 184); // gray (default)
      doc.rect(nodeX - 15, posY - 8, 30, 16, "F");
    }

    // Draw node label
    doc.setTextColor(0, 0, 0);
    doc.text(node.id, nodeX + 25, posY + 3);

    // Draw arrow to next node
    if (i < graphData.nodes.length - 1) {
      const nextY = posY + 40;
      doc.line(nodeX, posY + 12, nodeX, nextY - 12);
      doc.line(nodeX - 3, nextY - 12, nodeX, nextY - 6);
      doc.line(nodeX + 3, nextY - 12, nodeX, nextY - 6);
    }

    posY += 40;
  });

  doc.save(`AttackPathGraph_${target}.pdf`);
};


  // === Full Combined Report PDF ===
  const exportFullPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Full Report - ${target}`, 14, 20);

    doc.setFontSize(12);
    doc.text(`Total Vulnerabilities: ${scanResults.length}`, 14, 30);

    // 1. Table
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

    // 2. Severity Chart
    doc.setFontSize(14);
    doc.text("Severity Distribution", 14, nextY - 8);

    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    scanResults.forEach((v) => (counts[v.Severity] = (counts[v.Severity] || 0) + 1));
    const severities = ["Critical", "High", "Medium", "Low"];
    const colors = {
      Critical: [239, 68, 68],
      High: [249, 115, 22],
      Medium: [250, 204, 21],
      Low: [34, 197, 94],
    };

    const chartX = 20, chartY = nextY;
    const barWidth = 30, maxHeight = 50;
    const maxVal = Math.max(...Object.values(counts), 1);

    severities.forEach((sev, i) => {
      const val = counts[sev];
      const barHeight = (val / maxVal) * maxHeight;
      const x = chartX + i * (barWidth + 15);
      const y = chartY + maxHeight - barHeight;

      doc.setFillColor(...colors[sev]);
      doc.rect(x, y, barWidth, barHeight, "F");
      doc.text(sev, x + barWidth / 2, chartY + maxHeight + 10, { align: "center" });
      doc.text(String(val), x + barWidth / 2, y - 2, { align: "center" });
    });

    let posY = chartY + maxHeight + 30;

    // 3. Attack Path Graph
    doc.setFontSize(14);
    doc.text("Attack Path Graph", 14, posY - 8);

    const nodeX = 40;
    graphData.nodes.forEach((node, i) => {
      if (node.group === "vuln") {
        doc.circle(nodeX, posY, 10);
      } else {
        doc.rect(nodeX - 15, posY - 8, 30, 16);
      }
      doc.text(node.id, nodeX + 25, posY + 3);

      if (i < graphData.nodes.length - 1) {
        const nextY = posY + 40;
        doc.line(nodeX, posY + 12, nodeX, nextY - 12);
        doc.line(nodeX - 3, nextY - 12, nodeX, nextY - 6);
        doc.line(nodeX + 3, nextY - 12, nodeX, nextY - 6);
      }

      posY += 40;
    });

    doc.save(`FullReport_${target}.pdf`);
  };

  return (
    <div className="flex flex-wrap gap-4 mt-6">
      <button onClick={exportTablePDF} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-500">
        📊 Export VulnerabilityTable PDF
      </button>
      <button onClick={exportGraphPDF} className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-500">
        🕸 Export AttackPathGraph PDF
      </button>
      <button onClick={exportChartPDF} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-500">
        📈 Export SeverityChart PDF
      </button>
      <button onClick={exportFullPDF} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500">
        📑 Export Full Report PDF
      </button>
    </div>
  );
}
