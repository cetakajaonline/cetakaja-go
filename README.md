# Cetak Aja Online - Aplikasi Point of Sale untuk Percetakan Dan Digital Printing

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

![Prisma](https://img.shields.io/badge/Prisma-6.17.0-2D3748?logo=prisma)

![SvelteKit](https://img.shields.io/badge/SvelteKit-2.36+-FF3E00?logo=svelte)

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)

Aplikasi manajemen pesanan dan pembayaran digital printing yang dirancang khusus untuk usaha percetakan. Dilengkapi dengan sistem manajemen pesanan, pembayaran, inventaris, dan laporan keuangan untuk membantu operasional usaha percetakan Anda.

## ✨ Fitur Utama

- ✅ **Manajemen Pesanan** - Buat, lacak, dan kelola pesanan pelanggan secara real-time

- ✅ **Sistem Pembayaran Digital** - Dukungan pembayaran tunai, transfer bank, dan QRIS

- ✅ **Manajemen Produk & Kategori** - Kelola jenis layanan cetak dan kategori produk

- ✅ **Manajemen Inventaris** - Pantau stok bahan cetak dan material

- ✅ **Laporan Keuangan** - Analisis pendapatan dan pengeluaran usaha

- ✅ **Manajemen Karyawan** - Sistem akses berdasarkan peran (admin, staff, customer)

- ✅ **Sistem Notifikasi** - Kirim pemberitahuan status pesanan ke pelanggan

- ✅ **Responsive Design** - Berfungsi optimal di desktop dan mobile

- ✅ **Database PostgreSQL** - Dengan Prisma ORM untuk manajemen data

## 🚀 Quick Start

### Prerequisites

Pastikan Anda telah menginstall:

- **Node.js** 18.0 atau lebih baru

- **pnpm** 8.0 atau lebih baru

- **PostgreSQL** database

### Installation

1. **Clone repository ini:**

```bash

git clone https://github.com/bitscoid/cetakaja-go.git cetakaja-go

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

│ │ │ ├── dashboard/ # Dashboard manajemen

│ │ │ ├── orders/ # Manajemen pesanan

│ │ │ ├── products/ # Manajemen produk cetak

│ │ │ ├── users/ # Manajemen pengguna

│ │ │ ├── settings/ # Pengaturan sistem

│ │ │ └── expenses/ # Manajemen pengeluaran

│ │ ├── api/ # API endpoints

│ │ │ ├── orders/ # Endpoint pesanan

│ │ │ ├── products/ # Endpoint produk

│ │ │ ├── payments/ # Endpoint pembayaran

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

- 🐛 **Report Bugs**: [Create Issue](https://github.com/cetakaja/online-printing-pos/issues)

- 💡 **Request Features**: [Feature Requests](https://github.com/cetakaja/online-printing-pos/issues)

- 💬 **Discussion**: [Join Discussion](https://github.com/cetakaja/online-printing-pos/discussions)

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) - Framework web modern untuk aplikasi percetakan

- [Prisma](https://www.prisma.io/) - ORM database untuk manajemen data percetakan

- [TailwindCSS](https://tailwindcss.com/) - Framework CSS untuk tampilan profesional

- [DaisyUI](https://daisyui.com/) - Komponen UI yang cantik dan fungsional

- [Lucide Icons](https://lucide.dev/) - Ikon-ikon yang indah dan responsif

---

**Dikembangkan dengan ❤️ untuk komunitas usaha percetakan di Indonesia**

**Website**: [https://bits.co.id](https://bits.co.id)

**Email**: admin@bits.co.id

**GitHub**: [https://github.com/bitscoid](https://github.com/bitscoid)

---

**⭐ Jika aplikasi ini membantu usaha percetakan Anda, jangan lupa memberikan star di repository!**
