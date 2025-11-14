import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Shield, 
  Globe, 
  Brain, 
  Bell, 
  Database,
  Save,
  RotateCcw,
  Info
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";

export default function ConfigPage() {
  const { toast } = useToast();
  
  // Simulasi state konfigurasi
  const [config, setConfig] = useState({
    targetDomain: "tniad.mil.id",
    targetDescription: "Sistem Honeypot untuk Website Komando Tentara Nasional Indonesia - Angkatan Darat",
    honeypotType: "web",
    
    // Monitoring settings
    monitoring: {
      enabled: true,
      realTimeUpdates: true,
      alertThreshold: 0.7,
      maxLogsRetention: 50000,
      exportFormat: "csv"
    },

    // Detection settings
    detection: {
      mlModelsEnabled: true,
      anomalyThreshold: 0.6,
      autoBlockThreats: false,
      sensitiveEndpoints: [
        "/admin", "/login", "/auth", "/dashboard", "/api",
        "/berita/admin", "/struktur-organisasi/internal", 
        "/data-personel", "/operasi/rahasia", "/sistem-informasi"
      ]
    },

    // TNI AD specific settings
    tniadSettings: {
      mimicRealSite: true,
      customPages: [
        "/", "/beranda", "/profil", "/berita", "/pengumuman",
        "/struktur-organisasi", "/satuan", "/layanan", "/kontak",
        "/data-personel", "/sistem-informasi", "/operasi"
      ],
      indonesianContent: true,
      militaryTerminology: true
    },

    // Alert settings
    alerts: {
      emailNotifications: false,
      webhookUrl: "",
      discordWebhook: "",
      telegramBotToken: "",
      telegramChatId: ""
    }
  });

  const handleSave = () => {
    // Simulasi penyimpanan konfigurasi
    toast({
      title: "Konfigurasi Tersimpan",
      description: "Pengaturan honeypot berhasil diperbarui untuk " + config.targetDomain,
    });
  };

  const handleReset = () => {
    // Reset ke default
    toast({
      title: "Konfigurasi Direset",
      description: "Pengaturan dikembalikan ke nilai default",
      variant: "destructive"
    });
  };

  const updateConfig = (section: string, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [key]: value
      }
    }));
  };

  const updateMainConfig = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
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
                <Settings className="mr-2" size={24} />
                Konfigurasi Sistem Honeypot
              </h2>
              <p className="text-dark-text-secondary text-sm">
                Pengaturan target, monitoring, dan deteksi ancaman
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={handleReset} variant="outline" className="border-dark-border">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="mr-2 h-4 w-4" />
                Simpan Konfigurasi
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 h-full overflow-auto space-y-6">
          {/* Target Configuration */}
          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Konfigurasi Target Honeypot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetDomain">Domain Target</Label>
                  <Input
                    id="targetDomain"
                    value={config.targetDomain}
                    onChange={(e) => updateMainConfig('targetDomain', e.target.value)}
                    className="bg-dark-bg border-dark-border text-dark-text"
                  />
                </div>
                <div>
                  <Label htmlFor="honeypotType">Jenis Honeypot</Label>
                  <select
                    id="honeypotType"
                    value={config.honeypotType}
                    onChange={(e) => updateMainConfig('honeypotType', e.target.value)}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text"
                  >
                    <option value="web">Web Application</option>
                    <option value="ftp">FTP Server</option>
                    <option value="ssh">SSH Server</option>
                    <option value="database">Database</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="targetDescription">Deskripsi Target</Label>
                <Input
                  id="targetDescription"
                  value={config.targetDescription}
                  onChange={(e) => updateMainConfig('targetDescription', e.target.value)}
                  className="bg-dark-bg border-dark-border text-dark-text"
                />
              </div>
            </CardContent>
          </Card>

          {/* TNI AD Specific Settings */}
          <Card className="bg-dark-card border-dark-border border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Pengaturan Khusus TNI AD
                <Badge className="ml-2 bg-green-600">Spesifik Indonesia</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mimicRealSite">Meniru Website Asli</Label>
                  <Switch
                    id="mimicRealSite"
                    checked={config.tniadSettings.mimicRealSite}
                    onCheckedChange={(checked) => updateConfig('tniadSettings', 'mimicRealSite', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="indonesianContent">Konten Bahasa Indonesia</Label>
                  <Switch
                    id="indonesianContent"
                    checked={config.tniadSettings.indonesianContent}
                    onCheckedChange={(checked) => updateConfig('tniadSettings', 'indonesianContent', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="militaryTerminology">Terminologi Militer</Label>
                  <Switch
                    id="militaryTerminology"
                    checked={config.tniadSettings.militaryTerminology}
                    onCheckedChange={(checked) => updateConfig('tniadSettings', 'militaryTerminology', checked)}
                  />
                </div>
              </div>
              
              <div>
                <Label>Halaman Custom (dipisahkan koma)</Label>
                <Input
                  value={config.tniadSettings.customPages.join(', ')}
                  onChange={(e) => updateConfig('tniadSettings', 'customPages', e.target.value.split(', '))}
                  className="bg-dark-bg border-dark-border text-dark-text"
                  placeholder="/beranda, /berita, /struktur-organisasi"
                />
              </div>
            </CardContent>
          </Card>

          {/* Monitoring Configuration */}
          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                Konfigurasi Monitoring & ML
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="monitoringEnabled">Aktifkan Monitoring</Label>
                  <Switch
                    id="monitoringEnabled"
                    checked={config.monitoring.enabled}
                    onCheckedChange={(checked) => updateConfig('monitoring', 'enabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="realTimeUpdates">Update Real-time</Label>
                  <Switch
                    id="realTimeUpdates"
                    checked={config.monitoring.realTimeUpdates}
                    onCheckedChange={(checked) => updateConfig('monitoring', 'realTimeUpdates', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mlModelsEnabled">Model Machine Learning</Label>
                  <Switch
                    id="mlModelsEnabled"
                    checked={config.detection.mlModelsEnabled}
                    onCheckedChange={(checked) => updateConfig('detection', 'mlModelsEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoBlockThreats">Auto-Block Ancaman</Label>
                  <Switch
                    id="autoBlockThreats"
                    checked={config.detection.autoBlockThreats}
                    onCheckedChange={(checked) => updateConfig('detection', 'autoBlockThreats', checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alertThreshold">Threshold Alert (0-1)</Label>
                  <Input
                    id="alertThreshold"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.monitoring.alertThreshold}
                    onChange={(e) => updateConfig('monitoring', 'alertThreshold', parseFloat(e.target.value))}
                    className="bg-dark-bg border-dark-border text-dark-text"
                  />
                </div>
                <div>
                  <Label htmlFor="anomalyThreshold">Threshold Anomali (0-1)</Label>
                  <Input
                    id="anomalyThreshold"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.detection.anomalyThreshold}
                    onChange={(e) => updateConfig('detection', 'anomalyThreshold', parseFloat(e.target.value))}
                    className="bg-dark-bg border-dark-border text-dark-text"
                  />
                </div>
              </div>

              <div>
                <Label>Endpoint Sensitif (dipisahkan koma)</Label>
                <Input
                  value={config.detection.sensitiveEndpoints.join(', ')}
                  onChange={(e) => updateConfig('detection', 'sensitiveEndpoints', e.target.value.split(', '))}
                  className="bg-dark-bg border-dark-border text-dark-text"
                  placeholder="/admin, /login, /auth, /data-personel"
                />
              </div>
            </CardContent>
          </Card>

          {/* Alert Configuration */}
          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Konfigurasi Notifikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <Label htmlFor="emailNotifications">Notifikasi Email</Label>
                <Switch
                  id="emailNotifications"
                  checked={config.alerts.emailNotifications}
                  onCheckedChange={(checked) => updateConfig('alerts', 'emailNotifications', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    value={config.alerts.webhookUrl}
                    onChange={(e) => updateConfig('alerts', 'webhookUrl', e.target.value)}
                    className="bg-dark-bg border-dark-border text-dark-text"
                    placeholder="https://hooks.slack.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="discordWebhook">Discord Webhook</Label>
                  <Input
                    id="discordWebhook"
                    value={config.alerts.discordWebhook}
                    onChange={(e) => updateConfig('alerts', 'discordWebhook', e.target.value)}
                    className="bg-dark-bg border-dark-border text-dark-text"
                    placeholder="https://discord.com/api/webhooks/..."
                  />
                </div>
                <div>
                  <Label htmlFor="telegramBotToken">Telegram Bot Token</Label>
                  <Input
                    id="telegramBotToken"
                    value={config.alerts.telegramBotToken}
                    onChange={(e) => updateConfig('alerts', 'telegramBotToken', e.target.value)}
                    className="bg-dark-bg border-dark-border text-dark-text"
                    placeholder="123456:ABC-DEF1234..."
                  />
                </div>
                <div>
                  <Label htmlFor="telegramChatId">Telegram Chat ID</Label>
                  <Input
                    id="telegramChatId"
                    value={config.alerts.telegramChatId}
                    onChange={(e) => updateConfig('alerts', 'telegramChatId', e.target.value)}
                    className="bg-dark-bg border-dark-border text-dark-text"
                    placeholder="-1001234567890"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Panel */}
          <Card className="bg-blue-900/20 border-blue-800 border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-500 mb-1">Informasi Penting</h4>
                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>• Konfigurasi ini dirancang khusus untuk monitoring tniad.mil.id</li>
                    <li>• Auto-block direkomendasikan untuk dimatikan pada fase analisis</li>
                    <li>• Threshold anomali 0.6 memberikan balance antara sensitivitas dan false positive</li>
                    <li>• Pastikan endpoint sensitif sesuai dengan struktur website TNI AD</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}