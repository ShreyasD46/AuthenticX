import ForceGraph2D from "react-force-graph-2d";
import { useRef, useEffect, useState } from "react";

export default function AttackPathGraph({ data }) {
  const fgRef = useRef();
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  });

  useEffect(() => {
    if (fgRef.current) {
      // Make the graph static by disabling physics after initial layout
      setTimeout(() => {
        fgRef.current.d3Force("center", null);
        fgRef.current.d3Force("charge", null);
        fgRef.current.d3Force("link").strength(0);
      }, 2000);
    }
  }, []);

  const nodeColor = (node) => {
    const colors = {
      1: "#60a5fa", // entry: light blue for Internet (entry)
      2: "#93c5fd", // asset: lighter blue for assets
      3: "#ef4444", // vuln: red for vulnerabilities
      4: "#93c5fd", // asset: lighter blue for database/target (also an asset)
    };
    return colors[node.group] || "#94a3b8"; // default: slate gray
  };

  const linkColor = () => "#dc2626"; // Red arrows for attack path

  const linkCanvasObject = (link, ctx, globalScale) => {
    const MAX_FONT_SIZE = 4;
    const LABEL_NODE_MARGIN = 8;
    const nodeRadius = 8;

    const start = link.source;
    const end = link.target;

    // Calculate the angle of the link
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    // Calculate start and end points accounting for node radius
    const startX = start.x + Math.cos(angle) * nodeRadius;
    const startY = start.y + Math.sin(angle) * nodeRadius;
    const endX = end.x - Math.cos(angle) * nodeRadius;
    const endY = end.y - Math.sin(angle) * nodeRadius;

    // Draw the link line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = linkColor();
    ctx.lineWidth = 3 / globalScale;
    ctx.stroke();

    // Draw the arrow
    const arrowLength = 10 / globalScale;
    const arrowWidth = 6 / globalScale;

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle - Math.PI / 6),
      endY - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle + Math.PI / 6),
      endY - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = linkColor();
    ctx.fill();
  };

  const getGroupName = (group) => {
    const groupNames = {
      1: "Entry Point",
      2: "Asset",
      3: "Vulnerability",
      4: "Asset",
    };
    return groupNames[group] || "Unknown";
  };

  const handleNodeHover = (node, prevNode) => {
    if (node) {
      setTooltip({
        visible: true,
        x: 0, // Will be updated by mouse move
        y: 0,
        node: node,
      });
    } else {
      setTooltip({ visible: false, x: 0, y: 0, node: null });
    }
  };

  const handleNodeClick = (node) => {
    if (fgRef.current && node) {
      // First center on the node
      fgRef.current.centerAt(node.x, node.y, 500);

      // Then zoom in after a short delay
      setTimeout(() => {
        const currentZoom = fgRef.current.zoom();
        const newZoom = Math.min(currentZoom * 1.8, 4);
        fgRef.current.zoom(newZoom, 500);
      }, 200);
    }
  };

  // Handle mouse movement for tooltip positioning
  const handleMouseMove = (event) => {
    if (tooltip.visible && tooltip.node) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltip((prev) => ({
        ...prev,
        x: event.clientX - rect.left + 15,
        y: event.clientY - rect.top - 15,
      }));
    }
  };

  const nodeCanvasObject = (node, ctx, globalScale) => {
    const label = node.label || node.id;
    const fontSize = 12 / globalScale;
    const nodeRadius = 8;

    // Draw circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = nodeColor(node);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 2 / globalScale;
    ctx.stroke();

    // Draw label
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    // Position label to the right of the node
    const labelX = node.x + nodeRadius + 4 / globalScale;
    const labelY = node.y;

    // Render label text with subtle shadow for readability (no box)
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.7)";
    ctx.shadowBlur = 2 / globalScale;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillText(label, labelX, labelY);
    ctx.restore();
  };

  return (
    <div
      className="bg-card p-6 rounded-xl shadow-md border border-gray-700 mt-8 transition-all duration-300 hover:shadow-lg"
      data-testid="attack-graph"
    >
      <h3 className="text-lg font-semibold mb-4 text-white">
        🎯 Attack Path Visualization
      </h3>
      <div
        className="h-96 w-full bg-gray-900 rounded-lg border border-gray-600 relative overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        <ForceGraph2D
          ref={fgRef}
          graphData={data}
          nodeCanvasObject={nodeCanvasObject}
          linkCanvasObject={linkCanvasObject}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI, false);
            ctx.fill();
          }}
          onNodeHover={handleNodeHover}
          onNodeClick={handleNodeClick}
          width={800}
          height={384}
          backgroundColor="#111827"
          enableNodeDrag={false}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          minZoom={0.5}
          maxZoom={4}
        />

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-gray-800 p-3 rounded-lg border border-gray-600">
          <div className="text-xs text-gray-300 mb-2 font-semibold">Legend</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#60a5fa" }}
              ></div>
              <span className="text-gray-300">Entry Point</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#93c5fd" }}
              ></div>
              <span className="text-gray-300">Assets</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#ef4444" }}
              ></div>
              <span className="text-gray-300">Vulnerabilities</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#94a3b8" }}
              ></div>
              <span className="text-gray-300">Default</span>
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip.visible && tooltip.node && (
          <div
            className="absolute z-50 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 shadow-lg pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="text-sm text-white font-semibold">
              {tooltip.node.label || tooltip.node.id}
            </div>
            <div className="text-xs text-gray-300">
              {getGroupName(tooltip.node.group)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
