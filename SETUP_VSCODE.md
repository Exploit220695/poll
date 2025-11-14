# Panduan Setup Honeypot System di Visual Studio Code

## Deskripsi Program
Sistem Honeypot AI untuk deteksi ancaman cyber pada website tniad.mil.id dengan fitur:
- Monitoring lalu lintas real-time
- Deteksi anomali menggunakan Machine Learning
- Analisis serangan SQL Injection, XSS, Brute Force
- Dashboard monitoring interaktif
- Export data dan laporan keamanan

## Persyaratan Sistem

### Software yang Dibutuhkan:
1. **Visual Studio Code** (terbaru)
2. **Node.js** v18 atau v20
3. **Git** untuk version control
4. **PostgreSQL** (opsional, menggunakan in-memory storage secara default)

### Extensions VS Code yang Direkomendasikan:
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Prettier - Code formatter
- GitLens — Git supercharged

## Langkah-langkah Setup

### 1. Clone atau Download Project
```bash
# Jika menggunakan Git
git clone <repository-url>
cd honeypot-system

# Atau extract file zip project
```

### 2. Buka Project di VS Code
```bash
# Dari terminal
code .

# Atau: File > Open Folder > Pilih folder project
```

### 3. Install Dependencies
```bash
# Install semua package yang dibutuhkan
npm install
```

### 4. Konfigurasi Target Honeypot (Khusus tniad.mil.id)

#### 4.1 Edit Konfigurasi di `server/config/honeypot.config.ts`:
```typescript
export const defaultTniadConfig: HoneypotConfig = {
  targetDomain: "tniad.mil.id",
  targetDescription: "Sistem Honeypot untuk Website Komando TNI AD",
  
  // Sesuaikan endpoint sensitif
  detection: {
    sensitiveEndpoints: [
      "/admin", "/login", "/auth", "/dashboard", "/api",
      "/berita/admin", "/struktur-organisasi/internal", 
      "/data-personel", "/operasi/rahasia", "/sistem-informasi"
    ]
  },
  
  // Halaman yang akan dimirror
  tniadSettings: {
    customPages: [
      "/", "/beranda", "/profil", "/berita", "/pengumuman",
      "/struktur-organisasi", "/satuan", "/layanan", "/kontak",
      "/data-personel", "/sistem-informasi", "/operasi"
    ]
  }
};
```

#### 4.2 Sesuaikan Pattern Serangan di `server/services/trafficCapture.ts`:
```typescript
// Tambahkan pattern khusus untuk target militer
private attackPatterns = {
  sqlInjection: [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(personel.*\bOR\b.*1=1)/i,  // Khusus data personel
    /(struktur.*\bDROP\b)/i      // Khusus struktur organisasi
  ],
  // Pattern lainnya...
};
```

### 5. Setup Environment Variables (Opsional)
Buat file `.env` di root project:
```env
# Database (opsional, default menggunakan in-memory)
DATABASE_URL=postgresql://user:password@localhost:5432/honeypot

# Notifikasi (opsional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHAT_ID=-1001234567890

# Target Configuration
HONEYPOT_TARGET=tniad.mil.id
HONEYPOT_DESCRIPTION="TNI AD Website Honeypot"
```

### 6. Menjalankan Program

#### 6.1 Mode Development (Recommended):
```bash
# Jalankan dalam mode development dengan hot reload
npm run dev
```

#### 6.2 Mode Production:
```bash
# Build project terlebih dahulu
npm run build

# Jalankan production server
npm start
```

### 7. Akses Dashboard
Setelah program berjalan, buka browser dan akses:
- **Development**: http://localhost:5000
- **Production**: http://localhost:3000

## Fitur yang Tersedia

### 1. Dashboard Utama (`/`)
- Overview statistik keamanan
- Real-time traffic monitoring
- ML model status
- Recent alerts dan anomali

### 2. Traffic Monitor (`/traffic`)
- **Fungsi**: Monitor lalu lintas real-time
- **Fitur**: Filter berdasarkan IP, method, threat level
- **Export**: Data dalam format CSV/JSON

### 3. Anomaly Detection (`/anomaly`)
- **Fungsi**: Deteksi perilaku abnormal menggunakan AI
- **Algorithm**: Random Forest, Isolation Forest, LSTM
- **Threshold**: Dapat disesuaikan (default: 0.6)

### 4. Alert Management (`/alerts`)
- **Fungsi**: Manajemen peringatan keamanan
- **Klasifikasi**: Critical, High, Medium, Low
- **Action**: Resolve alerts, filter berdasarkan severity

### 5. Configuration (`/config`)
- **Fungsi**: Pengaturan sistem honeypot
- **Target**: Konfigurasi khusus untuk tniad.mil.id
- **ML Settings**: Threshold, endpoints sensitif
- **Notifications**: Discord, Telegram, Email

### 6. Export Data (`/export`)
- **Format**: CSV, JSON, XML
- **Data**: Traffic logs, alerts, analytics
- **Scheduling**: Manual atau otomatis

## Kustomisasi untuk Target Lain

### Mengubah Target dari tniad.mil.id ke Domain Lain:

1. **Edit Konfigurasi Target**:
```typescript
// server/config/honeypot.config.ts
export const customConfig: HoneypotConfig = {
  targetDomain: "target-baru.com",
  targetDescription: "Deskripsi target baru",
  
  tniadSettings: {
    customPages: [
      "/login", "/admin", "/dashboard"  // Sesuaikan dengan target
    ]
  }
};
```

2. **Update Attack Patterns**:
```typescript
// server/services/trafficCapture.ts
private attackPatterns = {
  sqlInjection: [
    // Tambahkan pattern spesifik untuk target baru
    /(target_specific_pattern)/i
  ]
};
```

3. **Sesuaikan UI**:
```typescript
// client/src/components/Sidebar.tsx
// Update nama aplikasi dan deskripsi
```

## Debug dan Troubleshooting

### 1. Cek Terminal Output
```bash
# Lihat logs real-time
npm run dev

# Error umum:
# - Port 5000 already in use: Ganti port di vite.config.ts
# - Module not found: Run npm install
# - TypeScript errors: Check file types
```

### 2. Browser Console
- Buka Developer Tools (F12)
- Cek Console untuk JavaScript errors
- Cek Network tab untuk API call failures

### 3. Common Issues:

#### WebSocket Connection Failed:
```typescript
// Pastikan WebSocket server berjalan di routes.ts
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
```

#### Database Connection Error:
```typescript
// Gunakan in-memory storage jika PostgreSQL bermasalah
// Edit server/storage.ts, pastikan menggunakan MemStorage
```

#### Port Conflict:
```bash
# Ganti port di package.json atau vite.config.ts
"dev": "vite --port 3001"  # Ganti ke port lain
```

## Monitoring dan Maintenance

### 1. Log Files
- **Application Logs**: Terminal output
- **Traffic Logs**: Database atau exported files
- **Error Logs**: Browser console

### 2. Performance Monitoring
- Monitor memory usage untuk in-memory storage
- Watch for WebSocket connection drops
- Check ML model accuracy over time

### 3. Security Updates
- Regularly update dependencies: `npm audit fix`
- Update attack patterns berdasarkan threat intelligence
- Review dan update sensitive endpoints

## Tips Penggunaan

1. **Mulai dengan Threshold Rendah**: Set anomaly threshold ke 0.4-0.5 untuk pembelajaran awal
2. **Monitor False Positives**: Review alerts yang salah klasifikasi
3. **Export Data Berkala**: Backup traffic logs untuk analisis offline
4. **Update Pattern Serangan**: Tambahkan pattern baru berdasarkan temuan
5. **Sesuaikan dengan Target**: Customization endpoint dan terminology sesuai organisasi target

## Support dan Documentation

- **Code Documentation**: Inline comments di setiap file
- **API Documentation**: Available di `/api` endpoints  
- **Component Documentation**: React components dengan TypeScript types
- **Configuration Schema**: Zod validation di `honeypot.config.ts`

---

**Note**: Sistem ini dirancang untuk penelitian keamanan dan analisis ancaman. Pastikan penggunaan sesuai dengan legal dan etika keamanan siber.