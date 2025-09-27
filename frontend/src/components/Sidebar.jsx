import { NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import ThemeContext from "../context/ThemeContext";

// Icon components
const DashboardIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z"
    />
  </svg>
);

const ScanIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
    />
  </svg>
);

const ReportsIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const ChatbotIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

export default function Sidebar({ isOpen, onClose }) {
  useContext(ThemeContext);
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { to: "/services", label: "Dashboard", icon: DashboardIcon },
    { to: "/scan", label: "New Scan", icon: ScanIcon },
    { to: "/reports", label: "Reports", icon: ReportsIcon },
    { to: "/chatbot", label: "Chatbot", icon: ChatbotIcon },
  ];

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const linkClass = ({ isActive }) =>
    `flex items-center ${
      collapsed ? "justify-center" : "gap-3"
    } px-3 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-lg font-medium"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }`;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-card/90 backdrop-blur-sm h-screen border-r border-gray-800 flex flex-col
          fixed left-0 top-0 z-50 transform transition-all duration-300 ease-in-out
          md:relative md:translate-x-0 md:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "w-16" : "w-64"}
          overflow-y-auto
        `}
      >
        {/* Header */}
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          } p-4 mb-4`}
        >
          {!collapsed && (
            <h2 className="text-blue-400 text-xl font-bold tracking-wide">
              DigitalX
            </h2>
          )}

          {/* Collapse/Expand button */}
          <button
            onClick={toggleCollapse}
            className="hidden md:block text-gray-400 hover:text-white p-1 rounded transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {collapsed ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              )}
            </svg>
          </button>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white p-1"
            aria-label="Close sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2 px-3 flex-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                onClick={() => {
                  // Close sidebar on mobile when link is clicked
                  if (window.innerWidth < 768) {
                    onClose();
                  }
                }}
                title={collapsed ? item.label : undefined}
              >
                <IconComponent />
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Section - Bottom Left */}
        <div className="mt-auto p-3 border-t border-gray-800">
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "gap-3"
            } p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer`}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-white">U</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">User</p>
                <p className="text-xs text-gray-400 truncate">
                  user@example.com
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
