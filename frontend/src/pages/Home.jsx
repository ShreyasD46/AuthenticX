import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen text-white">
      <header className="px-8 py-6 flex items-center justify-between bg-transparent">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded flex items-center justify-center font-bold">AX</div>
          <div className="text-xl font-bold">AuthenticX</div>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/" className="text-sm text-gray-300 hover:text-white">Home</Link>
          <Link to="/services" className="text-sm text-gray-300 hover:text-white">Services</Link>
          <a className="text-sm text-gray-300 hover:text-white">Contact</a>
          <button className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-400 rounded-full text-sm font-medium">Get Free Quotes</button>
        </nav>
      </header>

      <main className="px-8 py-16">
        <div className="max-w-7xl mx-auto flex gap-8">
          {/* Main content column */}
          <div className="flex-1">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">Automated scans, clear priorities, and export-ready security reports</h1>
                <p className="text-gray-300 max-w-xl mb-6">AuthenticX helps security teams discover vulnerabilities, map realistic attack paths, and deliver concise reports that developers and stakeholders can act on.</p>
                <div className="flex gap-4">
                  <Link to="/scan" className="px-6 py-3 bg-blue-600 rounded-md font-medium inline-block">Start a Scan</Link>
                  <Link to="/reports" className="px-6 py-3 border border-gray-600 rounded-md text-gray-200 inline-block">View Reports</Link>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-80 h-56 bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl shadow-lg flex items-center justify-center text-gray-300">Dashboard preview</div>
              </div>
            </section>

            <section className="mt-20 text-center">
              <h2 className="text-3xl font-bold mb-6">Manage Security Services</h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-8">Run computing, managed security services are network security services that have been outsourced to a service provider.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <div className="p-6 rounded-xl bg-card border border-gray-700">
                    <div className="text-2xl font-semibold mb-2">📊 Real-time Risk Dashboard</div>
                    <p className="text-gray-400 text-sm">Continuously monitor your assets with live dashboards that combine vulnerabilities, severity trends, and attack paths to prioritize remediation effectively.</p>
                  </div>
                  <div className="p-6 rounded-xl bg-card border border-gray-700">
                    <div className="text-2xl font-semibold mb-2">Automated Vulnerability Scanning</div>
                    <p className="text-gray-400 text-sm">Run scheduled and on-demand scans across your assets to find real vulnerabilities, not noise.</p>
                  </div>
                  <div className="p-6 rounded-xl bg-card border border-gray-700">
                    <div className="text-2xl font-semibold mb-2">Interactive Attack-Path Analysis</div>
                    <p className="text-gray-400 text-sm">Visualize how an attacker can chain findings to reach critical systems and prioritize mitigations.</p>
                  </div>
                  <div className="p-6 rounded-xl bg-card border border-gray-700">
                    <div className="text-2xl font-semibold mb-2">Shareable Reports & Heatmaps</div>
                    <p className="text-gray-400 text-sm">Export WYSIWYG PDF reports, heatmaps, and CSVs that developers and auditors can use immediately.</p>
                  </div>
                </div>
            </section>
          </div>

          {/* Right sidebar with the quick-access cards */}
          <aside className="w-80 hidden lg:block sticky top-20 self-start">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Link to="/services" className="block p-4 rounded-lg bg-card border border-gray-700 hover:scale-[1.02] transform transition text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">D</div>
                    <div>
                      <div className="text-sm font-semibold">Dashboard</div>
                      <div className="text-xs text-gray-400">Overview of recent scans</div>
                    </div>
                  </div>
                </Link>

                <Link to="/scan" className="block p-4 rounded-lg bg-card border border-gray-700 hover:scale-[1.02] transform transition text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-teal-500 flex items-center justify-center text-white font-bold">S</div>
                    <div>
                      <div className="text-sm font-semibold">New Scan</div>
                      <div className="text-xs text-gray-400">Create and run a new scan</div>
                    </div>
                  </div>
                </Link>

                <Link to="/reports" className="block p-4 rounded-lg bg-card border border-gray-700 hover:scale-[1.02] transform transition text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-500 flex items-center justify-center text-white font-bold">R</div>
                    <div>
                      <div className="text-sm font-semibold">Reports</div>
                      <div className="text-xs text-gray-400">View exportable reports</div>
                    </div>
                  </div>
                </Link>

                <Link to="/chatbot" className="block p-4 rounded-lg bg-card border border-gray-700 hover:scale-[1.02] transform transition text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold">C</div>
                    <div>
                      <div className="text-sm font-semibold">Chatbot</div>
                      <div className="text-xs text-gray-400">Ask about findings and remediation</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
