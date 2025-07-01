# 🏡 Smart Home IoT Dashboard (Microservices Edition)

Sistem ini adalah implementasi **Smart Home berbasis IoT** dengan arsitektur **microservices** menggunakan **ESP32 (Wokwi Simulator)**, **MQTT**, **Node.js (Express)**, dan **MySQL**. Setiap layanan (service) berjalan secara terpisah untuk skalabilitas dan kemudahan pengelolaan.

---

## 🚀 Fitur Utama

- Deteksi gas (MQ2), suhu & kelembapan (DHT22), gerakan (PIR)
- Notifikasi otomatis: kebakaran & keamanan
- Kontrol lampu, kipas, dan smart lock (manual & otomatis)
- Dashboard web real-time (HTML, CSS, JS)
- Komunikasi data via **MQTT**
- Backend terpisah menjadi beberapa service (microservices)

---

## 🧪 Setup ESP32 di Wokwi

1. **Buat Project baru** di [Wokwi](https://wokwi.com/)
2. Pilih **Board: ESP32 Dev Module**
3. Pilih **Framework: Arduino**
4. Upload file `sketch.ino` dan `diagram.json` dari folder `wokwi_files/`
5. Tambahkan **chip custom MQ2** (`mq2.chip.json` & `mq2.chip.c`)
6. Pastikan kredensial MQTT di `sketch.ino` sudah benar
7. Jalankan Project dan pastikan ESP32 terhubung ke MQTT
8. Wokwi anda seharusnya terlihat seperti ini:
   ![wokwi_simulation](wokwi_files/wokwi.png)

---

## 🖥️ Setup Backend (Microservices)

### 1. Jalankan semua service & database dengan Docker Compose

```bash
docker-compose up --build
```

- Ini akan menjalankan seluruh service berikut:
  - **MySQL** (Database)
  - **auth-service** (Autentikasi)
  - **climate-service** (Suhu & kelembapan)
  - **device-service** (Status perangkat)
  - **sensor-service** (Sensor gas, PIR, dll)
  - **alerts-service** (Notifikasi)
  - **control-service** (Kontrol perangkat)
  - **security-service** (Keamanan)
  - **gateway** (API Gateway, port 8080)

---

## 🌐 Setup Frontend (Dashboard)

1. Buka file `front-end/index.html` menggunakan Live Server (VS Code Extension) atau web server statis lain.
2. Pastikan variabel `BASE_URL` di `front-end/script.js` mengarah ke alamat API Gateway, misal:
   ```js
   const BASE_URL = "http://localhost:8080";
   ```
   (Ubah jika port atau host berbeda)
3. Dashboard akan menampilkan data sensor, notifikasi, dan kontrol perangkat secara real-time.

---

## ℹ️ Catatan Tambahan

- Semua konfigurasi environment untuk tiap service ada di folder masing-masing (`.env`).
- Untuk development, pastikan port tidak bentrok dan semua service berjalan dengan benar.
- Project ini untuk keperluan tugas akhir mata kuliah PPLBS.
