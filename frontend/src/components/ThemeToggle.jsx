import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.toggle("dark");

    const newIsDark = html.classList.contains("dark");
    setIsDark(newIsDark);

    // Save choice to localStorage
    if (newIsDark) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  };

  // On page load, apply saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const html = document.documentElement;

    if (savedTheme === "dark") {
      html.classList.add("dark");
      setIsDark(true);
    } else if (savedTheme === "light") {
      html.classList.remove("dark");
      setIsDark(false);
    } else {
      // Default to dark if no preference is saved
      html.classList.add("dark");
      setIsDark(true);
      localStorage.setItem("theme", "dark");
    }
  }, []);

  return (
    <button
      onClick={toggleTheme}
      className="bg-accent hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span className="text-lg">{isDark ? "☀️" : "🌙"}</span>
      <span className="text-sm font-medium">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
