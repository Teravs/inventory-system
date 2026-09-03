# 🚀 Panduan Lengkap Hosting Aplikasi CHA Asset (Inventory System)

Dokumen ini berisi panduan langkah demi langkah cara melakukan hosting/deployment aplikasi **CHA Asset** dari awal hingga berjalan online dan dapat diakses publik atau di jaringan internal kantor.

---

## 📑 Daftar Isi
1. [Struktur Aplikasi & Persyaratan](#-struktur-aplikasi--persyaratan)
2. [Metode 1: Hosting di VPS Linux (Rekomendasi Utama untuk Kantor / Production)](#-metode-1-hosting-di-vps-linux-rekomendasi-terbaik)
   - [Langkah 1: Setup Server (Node.js, MySQL, PM2, Nginx)](#langkah-1-persiapan-server-ubuntu-2204--2404)
   - [Langkah 2: Setup Database MySQL](#langkah-2-setup-database-mysql)
   - [Langkah 3: Deploy Backend & Database Migration](#langkah-3-deploy-backend--database-migration)
   - [Langkah 4: Deploy Frontend](#langkah-4-deploy-frontend)
   - [Langkah 5: Konfigurasi Nginx & Domain](#langkah-5-konfigurasi-nginx-web-server)
   - [Langkah 6: Pasang SSL HTTPS Gratis (Let's Encrypt)](#langkah-6-pasang-ssl-https-gratis-certbot)
3. [Metode 2: Hosting Cloud Gratis / PaaS (Vercel + Render / Railway)](#-metode-2-hosting-cloud-gratis-paas)
4. [Metode 3: Server Lokal Kantor / Intranet (On-Premise)](#-metode-3-server-lokal-kantor-on-premise--intranet)
5. [Perintah Penting & Maintenance Rutin](#-perintah-penting--maintenance-rutin)
6. [Troubleshooting & Solusi Error Umum](#-troubleshooting--solusi-error-umum)

---

## 🏗 Struktur Aplikasi & Persyaratan

Aplikasi **CHA Asset** terdiri dari 2 bagian:
* **Backend**: Node.js + Express + TypeScript + Prisma ORM (Port default: `3000`)
* **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS (Static Web App)
* **Database**: MySQL 8.0+ atau MariaDB 10.5+

---

## 🌐 Metode 1: Hosting di VPS Linux (Rekomendasi Terbaik)
> Cocok untuk VPS seperti DigitalOcean, AWS EC2, IDCloudHost, Niagahoster, Biznet Gio, DomaiNesia, Linode, dll. (OS: **Ubuntu 22.04 / 24.04 LTS**).

### Langkah 1: Persiapan Server (Ubuntu 22.04 / 24.04)
Login ke VPS via SSH melalui terminal:
```bash
ssh root@IP_SERVER_ANDA
```

Update package server:
```bash
sudo apt update && sudo apt upgrade -y
```

Install **Node.js v20 LTS**, **Git**, **Nginx**, dan **PM2**:
```bash
# 1. Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# 2. Install PM2 (Process Manager agar backend berjalan 24/7 di background)
sudo npm install -g pm2
```

---

### Langkah 2: Setup Database MySQL
Install MySQL Server:
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

Login ke MySQL dan buat database serta user baru:
```bash
sudo mysql -u root -p
```
Jalankan perintah SQL berikut:
```sql
CREATE DATABASE inventory_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Ganti 'password_rahasia_anda' dengan password yang kuat
CREATE USER 'inventory_user'@'localhost' IDENTIFIED BY 'password_rahasia_anda';
GRANT ALL PRIVILEGES ON inventory_system.* TO 'inventory_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### Langkah 3: Deploy Backend & Database Migration

1. Masuk ke folder web server:
```bash
cd /var/www
sudo git clone https://github.com/teravs/inventory-sistem.git
cd inventory-sistem/backend
```

2. Buat file environment `.env`:
```bash
nano .env
```
Isi dengan konfigurasi server Anda:
```env
PORT=3000
NODE_ENV=production
DATABASE_URL="mysql://inventory_user:password_rahasia_anda@localhost:3306/inventory_system"
FRONTEND_URL="https://asset.domainkantor.com"
AUTH_SECRET="buat_string_acak_panjang_dan_rahasia_disini_12345"
```
*(Tekan `Ctrl + O`, lalu `Enter`, lalu `Ctrl + X` untuk menyimpan)*

3. Install dependencies, generate database schema, dan build backend:
```bash
npm install
npx prisma generate
npx prisma db push
npm run build
```

4. Jalankan Seeding Akun Awal Super Admin (Opsional):
```bash
npm run prisma:seed
```
*(Akun default: Username `superadmin`, Password `AdminDev123!`. Segera ganti password setelah login!)*

5. Jalankan Backend dengan PM2:
```bash
pm2 start dist/server.js --name "cha-asset-backend"
pm2 save
pm2 startup
```

---

### Langkah 4: Deploy Frontend

1. Pindah ke folder frontend:
```bash
cd /var/www/inventory-sistem/frontend
```

2. Buat file `.env`:
```bash
nano .env
```
Isi dengan alamat endpoint API backend Anda:
```env
VITE_API_URL="https://asset.domainkantor.com/api"
```

3. Install dependencies & Build project menjadi file statis:
```bash
npm install
npm run build
```
*(Hasil build akan berada di folder `/var/www/inventory-sistem/frontend/dist`)*

---

### Langkah 5: Konfigurasi Nginx (Web Server)

Buat file konfigurasi Nginx baru:
```bash
sudo nano /etc/nginx/sites-available/cha-asset
```

Isi dengan template konfigurasi berikut (Ganti `asset.domainkantor.com` dengan domain Anda atau IP Server):
```nginx
server {
    listen 80;
    server_name asset.domainkantor.com;

    # Frontend (Single Page Application)
    location / {
        root /var/www/inventory-sistem/frontend/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Reverse Proxy ke Backend Node.js API
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifkan konfigurasi Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/cha-asset /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Langkah 6: Pasang SSL HTTPS Gratis (Certbot)
Agar koneksi aman (HTTPS) dan fitur scanner kamera QR di smartphone berjalan dengan lancar:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d asset.domainkantor.com
```
Ikuti instruksi di layar, pilih opsi redirect otomatis ke HTTPS. **Selesai!** Aplikasi sudah dapat diakses via `https://asset.domainkantor.com`.

---

## ☁️ Metode 2: Hosting Cloud Gratis / PaaS
Jika tidak ingin mengelola server VPS sendiri, Anda dapat menggunakan kombinasi layanan cloud gratis / murah:

| Komponen | Rekomendasi Provider |
| :--- | :--- |
| **Database MySQL** | [Aiven.io](https://aiven.io) (Free Tier MySQL) / [Railway.app](https://railway.app) / [Clever Cloud](https://clever-cloud.com) |
| **Backend API** | [Render.com](https://render.com) (Web Service) / [Railway.app](https://railway.app) |
| **Frontend Web** | [Vercel.com](https://vercel.com) / [Netlify.com](https://netlify.com) |

### Langkah Singkat:
1. **Database**: Buat database MySQL di Aiven/Railway, lalu salin `DATABASE_URL` (contoh: `mysql://avnadmin:xxx@mysql-xxx.aivencloud.com:port/defaultdb?ssl-mode=REQUIRED`).
2. **Backend di Render/Railway**:
   - Hubungkan repository GitHub.
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate && npx prisma db push && npm run build`
   - Start Command: `node dist/server.js`
   - Masukkan Environment Variables: `DATABASE_URL`, `FRONTEND_URL`, `AUTH_SECRET`, `NODE_ENV=production`.
3. **Frontend di Vercel**:
   - Hubungkan repository GitHub.
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Masukkan Environment Variable: `VITE_API_URL=https://nama-backend-anda.onrender.com/api`

---

## 🏢 Metode 3: Server Lokal Kantor (On-Premise / Intranet)
Jika aplikasi hanya ingin diakses oleh karyawan yang terhubung ke Wi-Fi / LAN kantor tanpa internet publik:

1. Siapkan 1 PC / Server kantor dengan IP Statis (Contoh: `192.168.1.100`).
2. Pastikan port `80` (Nginx) atau port `3000` & `5173` diizinkan melalui Windows Firewall / Linux UFW:
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 3000/tcp
   ```
3. Set `.env` frontend:
   ```env
   VITE_API_URL="http://192.168.1.100:3000/api"
   ```
4. Karyawan kantor dapat membuka browser di HP atau laptop dengan mengetik alamat: `http://192.168.1.100`.

---

## 🛠 Perintah Penting & Maintenance Rutin

### Cara Update Kode Aplikasi (Saat Ada Perubahan / Fitur Baru)
```bash
cd /var/www/inventory-sistem
git pull origin main

# Update & Build Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart cha-asset-backend

# Update & Build Frontend
cd ../frontend
npm install
npm run build

echo "Aplikasi berhasil diupdate!"
```

### Mengelola Backend dengan PM2
```bash
pm2 status                    # Cek status backend (Online / Offline)
pm2 logs cha-asset-backend    # Cek log aktivitas & error backend secara realtime
pm2 restart cha-asset-backend # Restart server backend
pm2 stop cha-asset-backend    # Stop server backend
```

### Backup Database Rutin (MySQL Dump)
```bash
mysqldump -u inventory_user -p inventory_system > backup_inventory_$(date +%F).sql
```

---

## ❓ Troubleshooting & Solusi Error Umum

### 1. Kamera Scanner QR Tidak Mau Terbuka di HP
* **Penyebab**: Browser modern (Chrome/Safari) mewajibkan koneksi **HTTPS** untuk memberikan izin akses hardware kamera.
* **Solusi**: Pastikan domain sudah menggunakan SSL HTTPS (`https://`) dengan Certbot seperti pada Langkah 6.

### 2. Error CORS atau Gagal Login (*Network Error*)
* **Penyebab**: `FRONTEND_URL` di `.env` backend tidak cocok dengan alamat URL yang dibuka di browser.
* **Solusi**: Buka `backend/.env`, pastikan `FRONTEND_URL="https://nama-domain-anda.com"` sama persis dengan URL frontend. Lalu restart backend: `pm2 restart cha-asset-backend`.

### 3. Halaman 404 Saat Halaman di-Refresh (*SPA Routing*)
* **Penyebab**: Nginx belum diatur untuk mengarahkan rute SPA ke `index.html`.
* **Solusi**: Pastikan baris `try_files $uri $uri/ /index.html;` sudah ada di blok `location /` file konfigurasi Nginx.

### 4. Database Connection Error / ECONNREFUSED
* **Penyebab**: Service MySQL belum berjalan atau kredensial database salah.
* **Solusi**: Cek status MySQL: `sudo systemctl status mysql`. Jika mati, jalankan dengan `sudo systemctl start mysql`.

