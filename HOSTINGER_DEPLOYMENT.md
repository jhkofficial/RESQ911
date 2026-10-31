# Panduan Deployment RESQ.911 di Hostinger

Aplikasi **RESQ.911 — National Disaster Intelligence & Response Platform** telah dioptimalkan secara penuh untuk arsitektur hosting **Hostinger** (baik **Hostinger Web / Cloud Hosting dengan Apache/LiteSpeed** maupun **Hostinger VPS / Node.js**).

---

## 🌟 Opsi 1: Hostinger Shared / Cloud Hosting (Rekomendasi Paling Praktis & Cepat)

Metode ini menggunakan web server bawaan Hostinger (LiteSpeed) untuk menyajikan aplikasi frontend React + Vite berkecepatan tinggi.

### Langkah-langkah:

1. **Jalankan Build Proyek**:
   Di terminal lokal proyek Anda, jalankan perintah:
   ```bash
   npm run build
   ```
   Folder `dist/` akan otomatis terbuat dengan struktur:
   - `index.html`
   - `.htaccess` *(Sudah otomatis tersalin dari folder public/)*
   - `robots.txt`
   - Folder `assets/` (berisi bundle JavaScript dan CSS teroptimasi)

2. **Buka hPanel Hostinger**:
   - Masuk ke akun Hostinger Anda di [hpanel.hostinger.com](https://hpanel.hostinger.com).
   - Pilih menu **Websites** -> Klik **Kelola (Manage)** pada nama domain Anda.
   - Buka **File Manager** (atau **Manajer Berkas**).

3. **Unggah Berkas ke `public_html`**:
   - Masuk ke folder `/public_html` (atau folder subdomain Anda).
   - Pastikan folder `public_html` bersih dari berkas `default.php` bawaan Hostinger.
   - Kompres seluruh **isi** di dalam folder `dist` menjadi format `.zip` (misal: `build.zip`), atau unggah langsung seluruh isi folder `dist/`.
   - Di File Manager Hostinger, klik tombol **Upload** -> Pilih file zip -> Klik kanan pada file zip lalu pilih **Extract**.
   - **PENTING**: Pastikan file `index.html` dan `.htaccess` berada langsung di dalam `public_html/` (bukan bersarang di dalam subfolder `public_html/dist/`).

4. **Selesai!**:
   - Akses nama domain Anda di browser.
   - File `.htaccess` yang telah kami sediakan memastikan:
     - Tidak ada error 404 saat pengguna melakukan refresh halaman atau membuka rute secara langsung (SPA Rewrite).
     - Kompresi Gzip/Deflate aktif otomatis untuk loading super cepat.
     - Cache control otomatis untuk performa maksimal.
     - Relative base path `./` memastikan aplikasi berjalan lancar di root domain maupun subfolder.

---

## 🚀 Opsi 2: Hostinger VPS / Cloud Server (Fullstack Node.js + Express)

Jika Anda ingin menjalankan backend server `server.ts` secara live di Hostinger VPS (misal untuk integrasi Gemini API langsung dari server):

1. **Persiapan di VPS**:
   ```bash
   # Masuk via SSH ke VPS Hostinger Anda
   ssh root@ip_vps_anda

   # Pastikan Node.js v20+ dan PM2 terpasang
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

2. **Clone & Setup Proyek**:
   ```bash
   git clone <URL_REPO_ANDA> /var/www/resq911
   cd /var/www/resq911
   npm install
   cp .env.example .env
   # Edit .env dan masukkan GEMINI_API_KEY Anda
   npm run build
   ```

3. **Jalankan Aplikasi dengan PM2**:
   ```bash
   pm2 start "npx tsx server.ts" --name "resq911-app"
   pm2 save
   pm2 startup
   ```

4. **Konfigurasi Nginx Reverse Proxy (Port 80/443 -> Port 3000)**:
   ```nginx
   server {
       listen 80;
       server_name domainanda.com www.domainanda.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 🔒 Informasi Akun Demo & Personel Komando
Saat mengakses aplikasi setelah dipublikasikan, halaman awal adalah **Login**. Anda dapat masuk menggunakan salah satu dari 6 kredensial personel komando resmi:

1. **Johanes Harindrias Kurniawan** — NIM: `2511600070` (Role: *Admin Nasional*)
2. **Raviez Perdana Putra** — NIM: `2511600021` (Role: *Admin Nasional*)
3. **Rizki Awlia Fadjrin** — NIM: `2511600104` (Role: *Operator Daerah*)
4. **Ilham Nur Ramdani** — NIM: `2511600179` (Role: *Operator Daerah*)
5. **Imdad Gusti** — NIM: `2511600393` (Role: *Petugas Lapangan*)
6. **Andre Oktora** — NIM: `2511600203` (Role: *Viewer Eksekutif*)
