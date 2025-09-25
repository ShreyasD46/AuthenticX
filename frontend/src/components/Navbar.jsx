export default function Navbar() {
  return (
    <nav className="bg-card px-6 py-3 flex justify-between items-center border-b border-gray-800 shadow-sm">
      <h1 className="text-accent text-xl font-bold tracking-wide">
        AuthenticX Dashboard
      </h1>
      <button
        onClick={() => document.documentElement.classList.toggle("dark")}
        className="bg-accent hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow transition-colors"
      >
        Toggle Theme
      </button>
    </nav>
  );
}
