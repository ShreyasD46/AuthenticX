import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
      isActive
        ? "bg-accent text-white shadow-md font-semibold"
        : "text-gray-400 hover:bg-gray-700 hover:text-white"
    }`;

  return (
    <aside className="bg-card w-64 h-screen px-4 py-6 border-r border-gray-800 flex flex-col fixed left-0 top-0 z-40 md:relative md:z-auto overflow-y-auto">
      <h2 className="text-accent text-lg font-bold mb-8 tracking-wide">
        AuthenticX
      </h2>
      <ul className="space-y-3">
        <li>
          <NavLink to="/" className={linkClass}>
            📊 <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/scan" className={linkClass}>
            ➕ <span>New Scan</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/reports" className={linkClass}>
            📄 <span>Reports</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/chatbot" className={linkClass}>
            🤖 <span>Chatbot</span>
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}
