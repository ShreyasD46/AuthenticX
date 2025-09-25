import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="bg-card px-6 py-3 flex justify-between items-center border-b border-gray-800 shadow-sm flex-shrink-0">
      <h1 className="text-accent text-xl font-bold tracking-wide">
        AuthenticX Dashboard
      </h1>
      <ThemeToggle />
    </nav>
  );
}
