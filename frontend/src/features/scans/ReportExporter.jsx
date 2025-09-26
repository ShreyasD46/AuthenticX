import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

export default function ReportExporter({ scanResults, target, graphData }) {
  // Helper to save a jsPDF instance using the File System Access API when available,
  // otherwise fall back to jsPDF's save which triggers a browser download.
  const savePdfFile = (pdf, filename) => {
    pdf.save(filename);
  };

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

  // === Severity Heatmap PDF (WYSIWYG via DOM capture) ===
  const exportHeatmapPDF = async () => {
    const container = document.getElementById("heatmap-section");
    if (!container) {
      console.error("#heatmap-section not found");
      alert("Heatmap section not found on page.");
      return;
    }

    // Helper: parse oklch(...) strings and convert to rgba CSS string
    const parseOklch = (input) => {
      // Match forms like: oklch(54% 0.12 210 / 0.8) or oklch(54% 0.12 210)
      const re = /oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+%?))?\s*\)/i;
      const m = input.match(re);
      if (!m) return null;
      let L = m[1];
      let C = parseFloat(m[2]);
      let h = parseFloat(m[3]);
      let a = m[4] ? m[4] : null;
      if (L.endsWith('%')) L = parseFloat(L) / 100; else L = parseFloat(L);
      if (a && String(a).endsWith('%')) a = parseFloat(a) / 100; else if (a) a = parseFloat(a);
      return { L, C, h, a };
    };

    const oklchToRgba = ({ L, C, h, a }) => {
      // Convert degrees to radians
      const hr = (h * Math.PI) / 180;
      const a_ = Math.cos(hr) * C;
      const b_ = Math.sin(hr) * C;

      // Oklab to LMS
      const l_ = L + 0.3963377774 * a_ + 0.2158037573 * b_;
      const m_ = L - 0.1055613458 * a_ - 0.0638541728 * b_;
      const s_ = L - 0.0894841775 * a_ - 0.2914855480 * b_;

      const l = l_ * l_ * l_;
      const m = m_ * m_ * m_;
      const s = s_ * s_ * s_;

      let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
      let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      let b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

      const toSRGB = (v) => {
        // clamp
        v = Math.max(0, Math.min(1, v));
        if (v <= 0.0031308) return Math.round(v * 12.92 * 255);
        return Math.round((1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255);
      };

      const R = toSRGB(r);
      const G = toSRGB(g);
      const B = toSRGB(b);
      const A = a == null ? 1 : a;
      return `rgba(${R}, ${G}, ${B}, ${A})`;
    };

    // Replace any oklch color occurrences in computed styles with rgba() inline styles
    const replaceOklchStyles = (root) => {
      const props = [
        'color', 'backgroundColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor', 'boxShadow', 'textDecorationColor', 'columnRuleColor'
      ];
      let replaced = 0;
      const elems = root.querySelectorAll('*');
      // include root itself
      const all = [root, ...Array.from(elems)];
      all.forEach((el) => {
        const cs = window.getComputedStyle(el);
        props.forEach((p) => {
          try {
            const val = cs[p];
            if (val && val.toLowerCase().includes('oklch')) {
              // for boxShadow there may be multiple occurrences; replace all
              const newVal = val.replace(/oklch\([^)]+\)/ig, (match) => {
                const parsed = parseOklch(match);
                if (!parsed) return match;
                return oklchToRgba(parsed);
              });
              // set as inline style property in JS style camelCase
              try { el.style[p] = newVal; } catch { el.style.setProperty(p, newVal); }
              replaced++;
            }
          } catch {
            // ignore
          }
        });
      });
      return replaced;
    };

    // If the heatmap is in a collapsed container, expand it temporarily
    const collapsible = container.querySelector(".transition-all");
    let previousMaxHeight = null;
    if (collapsible) {
      previousMaxHeight = collapsible.style.maxHeight;
      collapsible.style.maxHeight = "none";
      collapsible.style.opacity = "1";
      collapsible.style.overflow = "visible";
    }

    try {
      console.log("Preparing to capture heatmap");

      // Wait for webfonts to finish loading (improves fidelity)
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // Try to set crossOrigin on images inside the container to reduce tainting issues.
      const imgs = container.querySelectorAll("img");
      imgs.forEach((img) => img.setAttribute("crossorigin", "anonymous"));

      const opts = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        backgroundColor: null,
        foreignObjectRendering: true,
      };

  console.log("html2canvas options:", opts);
  const replacedCount = replaceOklchStyles(container);
  console.log(`Replaced ${replacedCount} oklch color occurrences before capture`);

  // Capture original canvases as data URLs so cloned DOM shows their visual content
  const originalCanvases = Array.from(container.querySelectorAll('canvas'));
  const canvasDataUrls = await Promise.all(
    originalCanvases.map(async (c) => {
      try {
        return c.toDataURL('image/png');
      } catch {
        return null;
      }
    })
  );

  // Create a cloned, fully-visible copy of the container to avoid capture issues
  const clone = container.cloneNode(true);
  // Inline size from original
  const rect = container.getBoundingClientRect();
  clone.style.position = 'fixed';
  clone.style.top = '10px';
  clone.style.left = '10px';
  clone.style.width = rect.width + 'px';
  clone.style.height = 'auto';
  clone.style.zIndex = '2147483647';
  clone.style.background = window.getComputedStyle(container).backgroundColor || '#ffffff';
  clone.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
  // remove ids to avoid duplication issues
  clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
  // Replace canvases in clone with images using the captured data URLs
  const cloneCanvases = Array.from(clone.querySelectorAll('canvas'));
  cloneCanvases.forEach((cc, i) => {
    const dataUrl = canvasDataUrls[i];
    if (dataUrl) {
      const img = document.createElement('img');
      img.src = dataUrl;
      // try to preserve size
      img.style.width = cc.style.width || cc.width + 'px';
      img.style.height = cc.style.height || cc.height + 'px';
      img.width = cc.width;
      img.height = cc.height;
      cc.parentNode && cc.parentNode.replaceChild(img, cc);
    }
  });

  document.body.appendChild(clone);

  console.log('Capturing clone:', clone, 'width:', rect.width, 'height:', rect.height);
  const canvas = await html2canvas(clone, opts);
  // remove clone after capture
  document.body.removeChild(clone);
  console.log('Canvas size:', canvas.width, 'x', canvas.height);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // convert canvas px to mm based on pdf width
      const pxToMm = pdfWidth / canvas.width;
      const imgHeightMm = canvas.height * pxToMm;

      let heightLeft = imgHeightMm;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeightMm);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeightMm;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeightMm);
        heightLeft -= pdfHeight;
      }

    await savePdfFile(pdf, `SeverityHeatmap_${target}.pdf`);
    } catch (err) {
      console.error("Failed to export heatmap:", err);
  // user sees console error
    } finally {
      if (collapsible) {
        collapsible.style.maxHeight = previousMaxHeight || "";
        collapsible.style.opacity = "";
        collapsible.style.overflow = "";
      }
    }
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

  savePdfFile(doc, `AttackPathGraph_${target}.pdf`);
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

    // 3. Severity Heatmap (programmatic grid per-asset x severity)
    doc.setFontSize(14);
    doc.text("Severity Heatmap", 14, posY - 8);

    // Build asset x severity counts
    const assets = Array.from(new Set(scanResults.map((v) => v.Affected_Asset || v.Asset || 'Unknown')));
    const heatmapCounts = {};
    assets.forEach((a) => {
      heatmapCounts[a] = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    });
    scanResults.forEach((v) => {
      const asset = v.Affected_Asset || v.Asset || 'Unknown';
      const sev = v.Severity || 'Low';
      if (!heatmapCounts[asset]) heatmapCounts[asset] = { Critical: 0, High: 0, Medium: 0, Low: 0 };
      heatmapCounts[asset][sev] = (heatmapCounts[asset][sev] || 0) + 1;
    });

    // Layout grid
    const gridX = 20;
    let gridY = posY;
    const cellW = 22; // mm
    const cellH = 10; // mm
    const labelW = 50; // asset label column width
    const severitiesCols = ["Critical", "High", "Medium", "Low"];

    // Header row
    doc.setFontSize(10);
    doc.text('Asset', gridX + 2, gridY + 7);
    severitiesCols.forEach((s, i) => {
      const x = gridX + labelW + i * cellW + cellW / 2;
      doc.text(s, x, gridY + 7, { align: 'center' });
    });

    gridY += 8;

    // Draw a compact legend to the right of the grid header
    const legendX = gridX + labelW + severitiesCols.length * cellW + 8;
    let legendY = gridY - 6;
    doc.setFontSize(10);
    doc.text('Legend', legendX, legendY + 6);
    const sw = 8, sh = 6; // swatch size
    severitiesCols.forEach((s, i) => {
      const ly = legendY + 8 + i * 12;
      const col = colors[s] || [200, 200, 200];
      doc.setFillColor(...col);
      doc.rect(legendX, ly, sw, sh, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.text(s, legendX + sw + 4, ly + sh - 1);
    });
    // intensity note
    doc.setFontSize(8);
    const noteY = legendY + 8 + severitiesCols.length * 12;
    doc.text('Intensity = relative count for that asset (darker = more findings)', legendX, noteY + 4, { maxWidth: 60 });

    // Draw rows; paginate if exceeding page height
    const pdfHeight = doc.internal.pageSize.getHeight();
    for (let ri = 0; ri < assets.length; ri++) {
      const asset = assets[ri];
      if (gridY + cellH + 20 > pdfHeight) {
        doc.addPage();
        gridY = 20;
      }

      // asset label
      doc.setFillColor(245, 245, 245);
      doc.rect(gridX, gridY, labelW, cellH, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text(String(asset).slice(0, 30), gridX + 2, gridY + cellH / 2 + 3);

      // severity cells
      severitiesCols.forEach((s, ci) => {
        const count = heatmapCounts[asset][s] || 0;
        // color mapping (same as chart colors) with alpha-like intensity
        const base = { Critical: [239, 68, 68], High: [249, 115, 22], Medium: [250, 204, 21], Low: [34, 197, 94] };
        const [r, g, b] = base[s];
        // intensity from 0 to 1 based on relative count (avoid division by 0)
        const maxCount = Math.max(...assets.map(a => Math.max(...Object.values(heatmapCounts[a]))), 1);
        const intensity = Math.min(1, count / maxCount);
        // blend with white for lighter color when intensity low
        const blend = (c) => Math.round(255 - (255 - c) * intensity);
        const fillR = blend(r), fillG = blend(g), fillB = blend(b);

        const x = gridX + labelW + ci * cellW;
        doc.setFillColor(fillR, fillG, fillB);
        doc.rect(x, gridY, cellW, cellH, 'F');

        doc.setTextColor(0, 0, 0);
        doc.text(String(count), x + cellW / 2, gridY + cellH / 2 + 3, { align: 'center' });
      });

      gridY += cellH + 4;
    }

  // add extra vertical spacing so the heatmap and attack-path sections don't appear crowded
  posY = gridY + 30;

    // 4. Attack Path Graph
    doc.setFontSize(14);
    doc.text("Attack Path Graph", 14, posY - 8);

    const nodeX = 40;
    const nodeHeight = 40;
    const bottomMargin = 20;
    const pdfHeightTotal = doc.internal.pageSize.getHeight();

    for (let i = 0; i < graphData.nodes.length; i++) {
      const node = graphData.nodes[i];

      // If not enough space for this node, create a new page and reprint heading
      if (posY + nodeHeight > pdfHeightTotal - bottomMargin) {
        doc.addPage();
        // re-draw section title on new page
        doc.setFontSize(14);
        doc.text("Attack Path Graph (cont.)", 14, 20);
        posY = 40; // reset to sensible y on new page
      }

      if (node.group === "vuln") {
        doc.circle(nodeX, posY, 10);
      } else {
        doc.rect(nodeX - 15, posY - 8, 30, 16);
      }
      doc.text(node.id, nodeX + 25, posY + 3);

      if (i < graphData.nodes.length - 1) {
        const nextY = posY + 40;
        // If the arrow would cross the page boundary, draw it partially after pagination instead
        if (posY + nodeHeight > pdfHeightTotal - bottomMargin) {
          // nothing, next loop will add page
        } else {
          doc.line(nodeX, posY + 12, nodeX, nextY - 12);
          doc.line(nodeX - 3, nextY - 12, nodeX, nextY - 6);
          doc.line(nodeX + 3, nextY - 12, nodeX, nextY - 6);
        }
      }

      posY += nodeHeight;
    }

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
      <button onClick={exportHeatmapPDF} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-500">
        🔥 Export SeverityHeatmap PDF
      </button>
      <button onClick={exportFullPDF} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500">

        📑 Export Full Report PDF
      </button>
    </div>
  );
}
