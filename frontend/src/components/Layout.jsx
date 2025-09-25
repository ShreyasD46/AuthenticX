import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-background text-gray-200">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 p-8 bg-background">
          <div className="bg-card rounded-xl p-6 shadow-md border border-gray-800">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
