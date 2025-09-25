export default function SeverityBadge({ severity }) {
  const colors = {
    Critical: "bg-critical text-white",
    High: "bg-high text-white",
    Medium: "bg-medium text-black",
    Low: "bg-low text-black",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-bold ${colors[severity]}`}
    >
      {severity}
    </span>
  );
}
