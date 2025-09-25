import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ onMenuClick }) {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <nav className="bg-card px-4 py-3 flex justify-between items-center border-b border-gray-800 shadow-sm flex-shrink-0">
      {/* Left: Hamburger Menu & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
          aria-label="Toggle menu"
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <h1 className="text-blue-400 text-xl font-bold tracking-wide hidden sm:block">
          Security Dashboard
        </h1>
      </div>

      {/* Right: Search, Theme Toggle, Profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          {searchExpanded ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none w-48"
                autoFocus
                onBlur={() => setSearchExpanded(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchExpanded(true)}
              className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
              aria-label="Search"
            >
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            aria-label="Profile menu"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">U</span>
            </div>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-gray-800 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-800">
                <p className="text-sm font-medium text-white">User</p>
                <p className="text-xs text-gray-400">user@example.com</p>
              </div>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                Settings
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                Profile
              </a>
              <hr className="border-gray-700 my-1" />
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
