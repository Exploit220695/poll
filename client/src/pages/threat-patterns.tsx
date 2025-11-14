import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import { 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Eye, 
  BarChart3, 
  Filter,
  Download,
  RefreshCw,
  Target,
  Zap,
  Brain
} from "lucide-react";
import { formatDistanceToNowWIB, formatWIBDateTime } from "../utils/timezone";

interface ThreatPattern {
  id: string;
  name: string;
  category: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  frequency: number;
  lastSeen: string;
  description: string;
  indicators: string[];
  mitigation: string;
  confidence: number;
  source: string;
}

export default function ThreatPatternsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  // Mock data untuk threat patterns (dalam implementasi nyata akan dari API)
  const { data: patterns = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/threat-patterns', selectedCategory, selectedSeverity],
    queryFn: () => generateThreatPatterns(),
    refetchInterval: 30000, // Refresh setiap 30 detik
  });

  const { data: analytics = {} } = useQuery({
    queryKey: ['/api/threat-analytics'],
    queryFn: () => generateThreatAnalytics(),
    refetchInterval: 10000,
  });

  function generateThreatPatterns(): ThreatPattern[] {
    const categories = ['Web Attack', 'Network Scan', 'Brute Force', 'Malware', 'Data Exfiltration'];
    const severities: ('Critical' | 'High' | 'Medium' | 'Low')[] = ['Critical', 'High', 'Medium', 'Low'];
    
    const patterns: ThreatPattern[] = [
      {
        id: 'tp-001',
        name: 'SQL Injection via Union-Based',
        category: 'Web Attack',
        severity: 'Critical',
        frequency: 156,
        lastSeen: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        description: 'Advanced SQL injection menggunakan UNION SELECT untuk ekstraksi data',
        indicators: ['UNION SELECT', 'ORDER BY', 'GROUP BY', 'information_schema'],
        mitigation: 'Implementasi prepared statements dan input validation',
        confidence: 0.95,
        source: 'tniad.mil.id'
      },
      {
        id: 'tp-002',
        name: 'XSS Polyglot Attack',
        category: 'Web Attack',
        severity: 'High',
        frequency: 89,
        lastSeen: new Date(Date.now() - Math.random() * 7200000).toISOString(),
        description: 'Cross-site scripting dengan multiple payload vectors',
        indicators: ['<script>', 'javascript:', 'onload=', 'onerror='],
        mitigation: 'Content Security Policy dan output encoding',
        confidence: 0.88,
        source: 'tniad.mil.id'
      },
      {
        id: 'tp-003',
        name: 'Command Injection via PHP',
        category: 'Web Attack',
        severity: 'Critical',
        frequency: 67,
        lastSeen: new Date(Date.now() - Math.random() * 1800000).toISOString(),
        description: 'Eksekusi command sistem melalui PHP vulnerabilities',
        indicators: ['system()', 'exec()', 'shell_exec()', 'passthru()'],
        mitigation: 'Disable dangerous functions dan input sanitization',
        confidence: 0.92,
        source: 'tniad.mil.id'
      },
      {
        id: 'tp-004',
        name: 'Directory Traversal Attack',
        category: 'Web Attack',
        severity: 'High',
        frequency: 134,
        lastSeen: new Date(Date.now() - Math.random() * 900000).toISOString(),
        description: 'Akses file sistem melalui path traversal',
        indicators: ['../../../', '..\\\\..\\\\', '%2e%2e%2f', 'etc/passwd'],
        mitigation: 'Path validation dan chroot jail',
        confidence: 0.85,
        source: 'tniad.mil.id'
      },
      {
        id: 'tp-005',
        name: 'Brute Force SSH Login',
        category: 'Brute Force',
        severity: 'Medium',
        frequency: 245,
        lastSeen: new Date(Date.now() - Math.random() * 600000).toISOString(),
        description: 'Serangan brute force pada SSH service',
        indicators: ['Failed password', 'Invalid user', 'Connection closed'],
        mitigation: 'Fail2ban dan key-based authentication',
        confidence: 0.78,
        source: 'tniad.mil.id'
      },
      {
        id: 'tp-006',
        name: 'Port Scanning Activity',
        category: 'Network Scan',
        severity: 'Low',
        frequency: 89,
        lastSeen: new Date(Date.now() - Math.random() * 300000).toISOString(),
        description: 'Systematic port scanning untuk reconnaissance',
        indicators: ['TCP SYN flood', 'Multiple port attempts', 'Nmap signatures'],
        mitigation: 'IDS/IPS dan port knocking',
        confidence: 0.82,
        source: 'tniad.mil.id'
      }
    ];

    // Filter berdasarkan kategori dan severity
    return patterns.filter(pattern => {
      const categoryMatch = selectedCategory === 'ALL' || pattern.category === selectedCategory;
      const severityMatch = selectedSeverity === 'ALL' || pattern.severity === selectedSeverity;
      return categoryMatch && severityMatch;
    });
  }

  function generateThreatAnalytics() {
    return {
      totalPatterns: 156,
      activeThreats: 23,
      criticalPatterns: 8,
      trendsUp: 12,
      trendsDown: 4,
      topCategories: [
        { name: 'Web Attack', count: 89, percentage: 57 },
        { name: 'Brute Force', count: 34, percentage: 22 },
        { name: 'Network Scan', count: 23, percentage: 15 },
        { name: 'Malware', count: 10, percentage: 6 }
      ]
    };
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-purple-600 text-white';
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Web Attack': return <Target className="w-4 h-4" />;
      case 'Network Scan': return <Eye className="w-4 h-4" />;
      case 'Brute Force': return <Shield className="w-4 h-4" />;
      case 'Malware': return <AlertTriangle className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg text-dark-text">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-dark-card border-b border-dark-border p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-dark-text flex items-center">
                <Brain className="mr-2" size={24} />
                Pola Ancaman Cyber - TNIAD
              </h2>
              <p className="text-dark-text-secondary text-sm">
                Analisis pola serangan dan indikator ancaman untuk tniad.mil.id
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => refetch()}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" className="border-dark-border">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 h-full overflow-auto">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-dark-text-secondary text-sm">Total Pola</p>
                    <p className="text-2xl font-bold text-dark-text">{analytics.totalPatterns}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-dark-text-secondary text-sm">Ancaman Aktif</p>
                    <p className="text-2xl font-bold text-red-500">{analytics.activeThreats}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-dark-text-secondary text-sm">Critical</p>
                    <p className="text-2xl font-bold text-purple-500">{analytics.criticalPatterns}</p>
                  </div>
                  <Shield className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-dark-text-secondary text-sm">Trend Naik</p>
                    <p className="text-2xl font-bold text-green-500">{analytics.trendsUp}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-dark-card border-dark-border mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Filter className="mr-2" size={20} />
                Filter Pola Ancaman
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm text-dark-text-secondary mb-1">Kategori</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text"
                  >
                    <option value="ALL">Semua Kategori</option>
                    <option value="Web Attack">Web Attack</option>
                    <option value="Network Scan">Network Scan</option>
                    <option value="Brute Force">Brute Force</option>
                    <option value="Malware">Malware</option>
                    <option value="Data Exfiltration">Data Exfiltration</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-dark-text-secondary mb-1">Tingkat Ancaman</label>
                  <select
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                    className="px-4 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text"
                  >
                    <option value="ALL">Semua Tingkat</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Threat Patterns List */}
          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle className="text-lg">
                Daftar Pola Ancaman ({patterns.length} pola)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="mx-auto h-8 w-8 text-dark-text-secondary animate-spin mb-4" />
                  <p className="text-dark-text-secondary">Memuat pola ancaman...</p>
                </div>
              ) : patterns.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="mx-auto h-12 w-12 text-dark-text-secondary mb-4" />
                  <p className="text-dark-text-secondary">Tidak ada pola ancaman yang sesuai filter</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patterns.map((pattern, index) => (
                    <div
                      key={`pattern-${pattern.id}-${index}`}
                      className="p-4 rounded-lg border border-dark-border bg-dark-bg hover:bg-dark-card transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            {getCategoryIcon(pattern.category)}
                          </div>
                          <div>
                            <h4 className="text-dark-text font-medium">{pattern.name}</h4>
                            <p className="text-dark-text-secondary text-sm">{pattern.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(pattern.severity)}>
                            {pattern.severity}
                          </Badge>
                          <Badge className="bg-dark-border text-dark-text">
                            {pattern.category}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-dark-text-secondary mb-1">Frekuensi</p>
                          <p className="text-dark-text font-medium">{pattern.frequency} deteksi</p>
                        </div>
                        <div>
                          <p className="text-xs text-dark-text-secondary mb-1">Confidence</p>
                          <p className="text-dark-text font-medium">{(pattern.confidence * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-dark-text-secondary mb-1">Terakhir Terdeteksi</p>
                          <p className="text-dark-text font-medium" title={formatWIBDateTime(pattern.lastSeen)}>
                            {formatDistanceToNowWIB(pattern.lastSeen)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-dark-text-secondary mb-2">Indikator:</p>
                        <div className="flex flex-wrap gap-1">
                          {pattern.indicators.map((indicator, idx) => (
                            <Badge key={idx} className="bg-red-900/20 text-red-400 border border-red-800 text-xs">
                              {indicator}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-dark-text-secondary mb-1">Mitigasi:</p>
                        <p className="text-dark-text text-sm">{pattern.mitigation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}