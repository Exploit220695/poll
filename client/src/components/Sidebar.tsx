import { Link, useLocation } from "wouter";
import { Shield, BarChart3, Network, AlertTriangle, Bell, FileText, TrendingUp, Brain, Settings, Download } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const menuItems = [
    {
      section: "Main",
      items: [
        { path: "/", icon: BarChart3, label: "Dashboard", active: location === "/" },
        { path: "/traffic", icon: Network, label: "Traffic Monitor" },
        { path: "/anomaly", icon: AlertTriangle, label: "Anomaly Detection" },
        { path: "/alerts", icon: Bell, label: "Alerts" },
      ]
    },
    {
      section: "Analysis", 
      items: [
        { path: "/traffic", icon: FileText, label: "Log Analysis" },
        { path: "/threat-patterns", icon: TrendingUp, label: "Threat Patterns" },
        { path: "/ml-models", icon: Brain, label: "ML Models" },
      ]
    },
    {
      section: "System",
      items: [
        { path: "/config", icon: Settings, label: "Configuration" },
        { path: "/export", icon: Download, label: "Export Data" },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-dark-card border-r border-dark-border flex-shrink-0">
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield className="text-white" size={16} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-dark-text">HoneyGuard</h1>
            <p className="text-xs text-dark-text-secondary">AI Threat Detection</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            <div className="px-6 mb-4">
              <h3 className="text-xs font-semibold text-dark-text-secondary uppercase tracking-wide">
                {section.section}
              </h3>
            </div>
            <ul className="space-y-1 mb-8">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.active || location === item.path;
                
                return (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <div className={`flex items-center px-6 py-3 text-sm rounded-r-lg mr-4 transition-colors cursor-pointer ${
                        isActive 
                          ? "bg-red-600 text-white" 
                          : "text-dark-text-secondary hover:text-white hover:bg-dark-border"
                      }`}>
                        <Icon className="mr-3" size={16} />
                        {item.label}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-green-600 rounded-lg p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">System Status</span>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
          <p className="text-green-100 mt-1">All services online</p>
        </div>
      </div>
    </aside>
  );
}
