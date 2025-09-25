export default function Dashboard() {
  return (
    <div className="h-full overflow-y-auto px-6 py-4 scrollbar-thin">
      <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-2">
        Welcome Analyst 👋
      </h2>
      <p className="text-gray-400 text-lg">
        Start a scan from the sidebar, or explore reports and vulnerabilities.
      </p>
    </div>
  );
}
