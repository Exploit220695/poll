```markdown
# Traffic — Cara menjalankan di VS Code

Panduan singkat menjalankan dan konfigurasi fitur (termasuk tools toggle / kolom):

Persyaratan
- Node.js >= 18
- npm
- VS Code

Langkah singkat
1. Clone dan masuk folder:
   git clone https://github.com/Dhimazz28/Traffic.git
   cd Traffic

2. Install dependencies:
   npm ci

3. Jalankan development server (cross-platform):
   npm run dev

4. Buka http://localhost:5000

Fitur konfigurasi tools & kolom
- Endpoint konfigurasi: GET /api/config  (mengembalikan konfigurasi saat ini)
- Update konfigurasi: PATCH /api/config dengan JSON body yang hanya berisi properti yang ingin diubah, mis.:
  {
    "tools": { "exportEnabled": true, "alertsEnabled": false },
    "toolsColumns": { "timestamp": true, "sourceIp": false }
  }

Contoh tombol Export di UI
- Tombol memanggil endpoint `/api/export/logs?format=csv` lalu memproses response sebagai blob untuk mendownload file.

Troubleshooting
- Jika export tidak mengunduh: cek response headers `Content-Disposition` di Network tab (harus berisi filename).
- Jika fitur tools tidak muncul: cek GET /api/config untuk memastikan `tools.*` di-enable.
```
