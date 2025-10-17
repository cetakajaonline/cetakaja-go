# Cetak Aja Online - Aplikasi Point of Sale untuk Percetakan Dan Digital Printing

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/github/license/cetakajaonline/cetakaja-go?color=blue&style=flat)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=fff&style=flat)
![SvelteKit](https://img.shields.io/badge/SvelteKit-2.46.5-FF3E00?logo=svelte&logoColor=fff&style=flat)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=fff&style=flat)
![Prisma](https://img.shields.io/badge/Prisma-6.17.1-2D3748?logo=prisma&logoColor=fff&style=flat)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?logo=postgresql&logoColor=fff&style=flat)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1.14-06B6D4?logo=tailwindcss&logoColor=fff&style=flat)
![DaisyUI](https://img.shields.io/badge/DaisyUI-5.3.0-1AD9A2?logo=tailwindcss&logoColor=fff&style=flat)
![pnpm](https://img.shields.io/badge/pnpm-^8.0-orange?logo=pnpm&logoColor=fff&style=flat)
![Docker](https://img.shields.io/badge/Docker-✓-2496ED?logo=docker&logoColor=fff&style=flat)

![Security Workflow](https://img.shields.io/github/actions/workflow/status/cetakajaonline/cetakaja-go/security.yml?label=Security&logo=githubactions&logoColor=fff&style=flat)
![Testing Workflow](https://img.shields.io/github/actions/workflow/status/cetakajaonline/cetakaja-go/testing.yml?label=Testing&logo=githubactions&logoColor=fff&style=flat)
![Docker Workflow](https://img.shields.io/github/actions/workflow/status/cetakajaonline/cetakaja-go/docker.yml?label=Docker&logo=githubactions&logoColor=fff&style=flat)
![Release Workflow](https://img.shields.io/github/actions/workflow/status/cetakajaonline/cetakaja-go/release.yml?label=Release&logo=githubactions&logoColor=fff&style=flat)
![Deploy Workflow](https://img.shields.io/github/actions/workflow/status/cetakajaonline/cetakaja-go/deploy.yml?label=Deploy&logo=githubactions&logoColor=fff&style=flat)

Aplikasi manajemen pesanan dan pembayaran digital printing yang dirancang khusus untuk usaha percetakan. Dilengkapi dengan sistem manajemen pesanan, pembayaran, inventaris, dan laporan keuangan untuk membantu operasional usaha percetakan Anda.

## ✨ Fitur Utama

- ✅ **Manajemen Pesanan** - Buat, lacak, dan kelola pesanan pelanggan secara real-time

- ✅ **Sistem Pembayaran Digital** - Dukungan pembayaran tunai, transfer bank, dan QRIS

- ✅ **Manajemen Produk & Kategori** - Kelola jenis layanan cetak dan kategori produk

- ✅ **Manajemen Inventaris** - Pantau stok bahan cetak dan material

- ✅ **Laporan Keuangan** - Analisis pendapatan dan pengeluaran usaha

- ✅ **Manajemen Karyawan** - Sistem akses berdasarkan peran (admin, staff, customer)

- ✅ **Sistem Notifikasi WhatsApp Otomatis** - Kirim pemberitahuan status pesanan ke pelanggan

- ✅ **Upload Bukti Pembayaran** - Dukungan unggah bukti pembayaran transfer dan QRIS

- ✅ **Manajemen Pengeluaran Usaha** - Catat biaya operasional dan pengeluaran lainnya

- ✅ **Fitur Laporan Lengkap** - Laporan harian, mingguan, bulanan, tahunan, serta laporan khusus

- ✅ **Responsive Design** - Berfungsi optimal di desktop dan mobile

- ✅ **Database PostgreSQL** - Dengan Prisma ORM untuk manajemen data

## 📢 Integrasi Notifikasi WhatsApp

Sistem ini memungkinkan pengiriman notifikasi otomatis ke pelanggan melalui WhatsApp berdasarkan perubahan status order dan pembayaran.

### Alur Kerja Notifikasi

1. Saat order dibuat atau statusnya berubah, sistem membuat entri di tabel `Notification`
2. n8n secara berkala mengambil notifikasi dengan status `pending` dari endpoint `/api/notifications`
3. n8n mengirim pesan WhatsApp melalui EvolutionAPI
4. Setelah dikirim, n8n memperbarui status notifikasi ke `sent` atau `failed` melalui endpoint PUT

### Endpoint API Notifikasi

#### GET /api/notifications

Mengambil semua notifikasi dengan status `pending`

**Response:**

```json
[
  {
    "id": 1,
    "userId": 5,
    "orderId": 10,
    "toNumber": "6281234567890",
    "message": "Halo John, pesanan Anda dengan nomor ORD-231009-0001 telah diterima dan sedang diproses.",
    "status": "pending",
    "sentAt": null,
    "createdAt": "2023-10-09T10:00:00.000Z",
    "user": {
      "id": 5,
      "name": "John Doe",
      "phone": "6281234567890"
    },
    "order": {
      "id": 10,
      "orderNumber": "ORD-231009-0001",
      "status": "pending",
      "totalAmount": 150000,
      "paymentStatus": "pending"
    }
  }
]
```

#### PUT /api/notifications

Memperbarui status notifikasi setelah diproses

**Request Body:**

```json
{
  "notificationId": 1,
  "status": "sent" // atau "failed"
}
```

### Contoh Notifikasi Berdasarkan Status

#### Order Status

- `pending`: "Halo [nama], pesanan Anda dengan nomor [nomor_order] telah diterima dan sedang diproses."
- `processing`: "Halo [nama], pesanan Anda dengan nomor [nomor_order] sedang dalam proses pengemasan."
- `finished`: "Halo [nama], pesanan Anda dengan nomor [nomor_order] telah selesai. Terima kasih telah berbelanja!"
- `canceled`: "Halo [nama], pesanan Anda dengan nomor [nomor_order] telah dibatalkan."

#### Payment Status

- `pending`: "Halo [nama], pembayaran untuk pesanan [nomor_order] sedang menunggu konfirmasi."
- `confirmed`: "Halo [nama], pembayaran untuk pesanan [nomor_order] telah dikonfirmasi. Pesanan Anda akan segera diproses."
- `failed`: "Halo [nama], pembayaran untuk pesanan [nomor_order] gagal. Silakan hubungi kami untuk bantuan."
- `refunded`: "Halo [nama], pembayaran untuk pesanan [nomor_order] telah dikembalikan."

### Konfigurasi n8n

1. **HTTP Request Node - Ambil Notifikasi**
   - Method: GET
   - URL: `{{ $vars.baseURL }}/api/notifications`
   - Response Format: JSON

2. **Split Out Node** - Untuk memproses setiap notifikasi secara individual

3. **HTTP Request Node - Kirim ke EvolutionAPI**
   - Method: POST
   - URL: `http://your-evolution-api:8080/message/sendText/{{ $vars.instanceName }}`
   - Body (JSON):

   ```json
   {
     "number": "{{$json.toNumber}}",
     "options": {
       "delay": 1200,
       "presence": "composing"
     },
     "text": {
       "message": "{{$json.message}}"
     }
   }
   ```

4. **HTTP Request Node - Update Status**
   - Method: PUT
   - URL: `{{ $vars.baseURL }}/api/notifications`
   - Body (JSON):
   ```json
   {
     "notificationId": {{$json.id}},
     "status": "sent"
   }
   ```

### Status Notifikasi

- `pending`: Notifikasi siap dikirim
- `sent`: Notifikasi telah berhasil dikirim
- `failed`: Gagal mengirim notifikasi

## 🚀 Quick Start

### Prerequisites

Pastikan Anda telah menginstall:

- **Node.js** 18.0 atau lebih baru

- **pnpm** 8.0 atau lebih baru

- **PostgreSQL** database

### Installation

1. **Clone repository ini:**

```bash

git clone https://github.com/cetakajaonline/cetakaja-go.git cetakaja-go

cd cetakaja-go

```

2. **Install dependencies:**

```bash

pnpm install

```

3. **Setup environment variables:**

```bash

cp .env.example .env

```

Edit file `.env` dan sesuaikan dengan konfigurasi database Anda:

```env

# Database Configuration (PostgreSQL)

DATABASE_URL="postgresql://username:password@localhost:5432/cetakaja_pos"

# JWT Secret Key (Ganti dengan secret yang kuat)

JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Optional: App Configuration

APP_NAME="Cetak Aja Online"

APP_URL="http://localhost:5173"

```

4. **Setup database dan jalankan aplikasi:**

```bash

# Setup database, jalankan migrations, dan seed data

pnpm bits

# Jalankan development server

pnpm dev

```

Buka [http://localhost:5173](http://localhost:5173) di browser Anda untuk mengakses aplikasi POS cetak.

## 📁 Project Structure

```

cetakaja-pos/

├── src/

│ ├── lib/

│ │ ├── components/ # Komponen UI untuk manajemen pesanan, pembayaran, dll

│ │ ├── layouts/ # Layout utama aplikasi

│ │ ├── services/ # Layanan client untuk manajemen data

│ │ ├── server/ # Fungsi server untuk manajemen bisnis

│ │ │ ├── productService.ts # Layanan produk cetak

│ │ │ ├── orderService.ts # Layanan manajemen pesanan

│ │ │ ├── paymentService.ts # Layanan pembayaran

│ │ │ ├── settingService.ts # Layanan konfigurasi sistem

│ │ │ └── prisma.ts # Konfigurasi Prisma client

│ │ ├── stores/ # Store Svelte untuk state management

│ │ ├── types/ # Definisi tipe TypeScript

│ │ └── validations/ # Schema validasi Zod

│ ├── routes/

│ │ ├── (app)/ # Halaman utama aplikasi POS

│ │ │ ├── categories/ # Manajemen kategori produk

│ │ │ ├── dashboard/ # Dashboard manajemen

│ │ │ ├── expenses/ # Manajemen pengeluaran

│ │ │ ├── orders/ # Manajemen pesanan

│ │ │ ├── products/ # Manajemen produk cetak

│ │ │ ├── reports/ # Laporan keuangan dan bisnis

│ │ │ ├── settings/ # Pengaturan sistem

│ │ │ └── users/ # Manajemen pengguna

│ │ ├── api/ # API endpoints

│ │ │ ├── auth/ # Endpoint otentikasi

│ │ │ ├── categories/ # Endpoint kategori

│ │ │ ├── expenses/ # Endpoint pengeluaran

│ │ │ ├── notifications/ # Endpoint notifikasi WhatsApp

│ │ │ ├── orders/ # Endpoint pesanan

│ │ │ ├── payment-proofs/ # Endpoint bukti pembayaran

│ │ │ ├── payments/ # Endpoint pembayaran

│ │ │ ├── products/ # Endpoint produk

│ │ │ ├── reports/ # Endpoint laporan

│ │ │ └── settings/ # Endpoint konfigurasi

│ │ ├── login/ # Halaman login

│ │ └── register/ # Halaman registrasi

│ ├── static/ # File statis (logo, favicon, dll)

│ └── app.html # Template HTML utama

├── prisma/

│ ├── schema.prisma # Skema database percetakan

│ └── seed.ts # Data awal sistem

└── package.json # Dependencies dan script

```

## 🗄️ Database Management

### Database Setup

```bash

# Setup awal database percetakan (migration + seeding)

pnpm bits

# atau step-by-step:

pnpm prisma generate # Generate Prisma client

pnpm prisma migrate dev --name init # Create initial migration

pnpm seed # Run seed data dengan contoh produk cetak

```

### Migration Workflow

```bash

# Setelah mengubah schema.prisma, buat migration:

pnpm prisma migrate dev --name description_of_changes

# Contoh:

pnpm prisma migrate dev --name add_printing_product

```

### Database Operations

```bash

# Membuka Prisma Studio (database GUI)

pnpm prisma studio

# Generate Prisma Client

pnpm prisma generate

# Reset database (hati-hati, semua data pesanan akan hilang!)

pnpm db:reset

```

## 🔐 Sistem Otentikasi

Aplikasi ini dilengkapi sistem otentikasi berbasis JWT untuk manajemen akses pengguna percetakan:

### Rute Otentikasi

- `/login` - Halaman login untuk admin/staff/pelanggan

- `/api/auth/login` - API endpoint untuk login

- `/api/auth/logout` - API endpoint untuk logout

### Manajemen Akses Berdasarkan Peran

- **Admin** - Akses penuh ke semua fitur sistem

- **Staff** - Akses ke manajemen pesanan, produk, dan pelanggan

- **Customer** - Akses ke riwayat pesanan dan pembayaran

### API Otentikasi

```typescript
// Contoh API endpoint yang dilindungi

export const POST: RequestHandler = async ({ request, cookies }) => {
  const token = cookies.get("token");

  if (!token) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Process request dengan data pengguna

    return json({ success: true, data: decoded });
  } catch (error) {
    return json({ error: "Invalid token" }, { status: 401 });
  }
};
```

## 🤝 Contributing

Kontribusi sangat dipersilakan! Berikut cara untuk berkontribusi:

1. **Fork project ini**

2. **Buat feature branch:**

```bash

git checkout -b feature/amazing-feature

```

3. **Commit changes Anda:**

```bash

git commit -m 'Add some amazing feature'

```

4. **Push ke branch:**

```bash

git push origin feature/amazing-feature

```

5. **Buka Pull Request**

### Development Guidelines

- Ikuti coding style yang sudah ada

- Tambahkan tests untuk fitur baru

- Update documentation sesuai kebutuhan

- Gunakan conventional commit messages

## 📝 License

Distributed under the MIT License. See `LICENSE` file untuk detail lengkap.

## 🆓 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

- 📖 **Documentation**: Check wiki pages

- 🐛 **Report Bugs**: [Create Issue](https://github.com/cetakajaonline/cetakaja-go/issues)

- 💡 **Request Features**: [Feature Requests](https://github.com/cetakajaonline/cetakaja-go/issues)

- 💬 **Discussion**: [Join Discussion](https://github.com/cetakajaonline/cetakaja-go/discussions)

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) - Framework web modern untuk aplikasi percetakan

- [Prisma](https://www.prisma.io/) - ORM database untuk manajemen data percetakan

- [TailwindCSS](https://tailwindcss.com/) - Framework CSS untuk tampilan profesional

- [DaisyUI](https://daisyui.com/) - Komponen UI yang cantik dan fungsional

---

**Dikembangkan dengan ❤️ untuk komunitas usaha percetakan di Indonesia**

**Website**: [https://bits.co.id](https://bits.co.id)

**Email**: admin@bits.co.id

**GitHub**: [https://github.com/cetakajaonline](https://github.com/cetakajaonline)

---

**⭐ Jika aplikasi ini membantu usaha percetakan Anda, jangan lupa memberikan star di repository!**

## 🐳 Docker Setup

This project includes Docker configuration for easy deployment and development.

### Files Included

- `Dockerfile`: Multi-stage build configuration for the SvelteKit application
- `docker-compose.yml`: Service orchestration including the app and PostgreSQL database

### How to Run

#### Prerequisites

- Docker and Docker Compose installed on your system

#### Running the Application

1. Make sure you have the required environment variables in place
2. Run the following command to start the services:

```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000`

#### Running in Detached Mode

```bash
docker-compose up -d --build
```

#### Stopping the Services

```bash
docker-compose down
```

#### Building Only the Images

```bash
docker-compose build
```

### Services

- `app`: The SvelteKit application running on port 3000
- `postgres`: PostgreSQL database on port 5432 with persistent data storage

### Environment Variables

The following environment variables are configured in the docker-compose.yml:
- `DATABASE_URL`: Points to the PostgreSQL service
- `JWT_SECRET`: Secret key for JWT token generation
- `NODE_ENV`: Set to production for optimized performance

### Volumes

- `postgres_data`: Persistent volume for PostgreSQL data storage
- `.env` file mapping for configuration

### Notes

- The Dockerfile uses a multi-stage build to optimize the final image size
- Only production dependencies are installed in the final image
- The application is built using `pnpm run build` during the build process
- Prisma migrations will need to be run separately if needed after deployment
