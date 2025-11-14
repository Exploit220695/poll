import Dashboard from "@/components/Dashboard";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="flex h-screen bg-dark-bg text-dark-text">
      <Sidebar />
      <Dashboard />
    </div>
  );
}
