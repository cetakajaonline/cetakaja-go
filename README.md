# BITS Starter Kit - SvelteKit Prisma PostgreSQL JWT Tailwind DaisyUI

![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

![Prisma](https://img.shields.io/badge/Prisma-6.14.0-2D3748?logo=prisma)

![SvelteKit](https://img.shields.io/badge/SvelteKit-2.0+-FF3E00?logo=svelte)

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)

Starter kit lengkap untuk membangun aplikasi web modern dengan SvelteKit dan teknologi terbaru. Dilengkapi dengan authentication system, database management, dan responsive UI components.

## ✨ Fitur Utama

- ✅ **SvelteKit 5** dengan TypeScript support

- ✅ **TailwindCSS 4** dengan DaisyUI components

- ✅ **Prisma ORM** dengan support PostgreSQL & SQLite

- ✅ **JWT Authentication** dengan secure cookie storage

- ✅ **Responsive Design** dengan navigation sidebar

- ✅ **Form Validation** menggunakan Zod schema

- ✅ **Database Seeding** dengan sample data

- ✅ **Production Ready** configuration

- ✅ **API Routes** untuk backend endpoints

- ✅ **Role-based Access** (jika diperlukan)

## 🚀 Quick Start

### Prerequisites

Pastikan Anda telah menginstall:

- **Node.js** 18.0 atau lebih baru

- **pnpm** 8.0 atau lebih baru

- **PostgreSQL** atau SQLite database

### Installation

1. **Clone repository ini:**

```bash

git clone https://gitlab.com/bantenitsolutions/sveltekit-prisma-postgres-jwt-tailwind-daisyui.git my-app

cd my-app

```

2. **Install dependencies:**

```bash

pnpm install

```

3. **Setup environment variables:**

```bash

cp .env.example .env

```

Edit file `.env` dan sesuaikan dengan konfigurasi Anda:

```env

# Database Configuration (Pilih salah satu)

# PostgreSQL

DATABASE_URL="postgresql://username:password@localhost:5432/mydatabase"

# SQLite (Untuk development)

DATABASE_URL="file:./dev.db"

# JWT Secret Key (Ganti dengan secret yang kuat)

JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Optional: App Configuration

APP_NAME="My SvelteKit App"

APP_URL="http://localhost:5173"

```

4. **Setup database dan jalankan aplikasi:**

```bash

# Setup database, jalankan migrations, dan seed data

pnpm bits

# Jalankan development server

pnpm dev

```

Buka [http://localhost:5173](http://localhost:5173) di browser Anda untuk melihat aplikasi.

## 📁 Project Structure

```

sveltekit-prisma-postgres-jwt-tailwind-daisyui/

├── src/

│ ├── lib/

│ │ ├── components/ # Reusable Svelte components

│ │ ├── utils/ # Utility functions

│ │ │ ├── auth.ts # Authentication utilities

│ │ │ └── api.ts # API client utilities

│ │ └── types/ # TypeScript type definitions

│ ├── routes/

│ │ ├── api/ # API endpoints

│ │ │ ├── auth/ # Authentication endpoints

│ │ │ └── users/ # User management endpoints

│ │ ├── login/ # Login page

│ │ ├── register/ # Registration page

│ │ └── +page.svelte # Main page

│ ├── app.html # HTML template

│ └── app.css # Global styles

├── prisma/

│ ├── schema.prisma # Database schema definition

│ └── seed.ts # Database seed data

├── static/ # Static assets

├── tests/ # Test files

└── package.json # Dependencies and scripts

```

## 🛠️ Available Scripts

### Development Scripts

| Command | Description |

|---------|-------------|

| `pnpm dev` | Menjalankan development server |

| `pnpm build` | Build aplikasi untuk production |

| `pnpm preview` | Preview production build secara lokal |

| `pnpm lint` | Menjalankan ESLint untuk code linting |

| `pnpm format` | Format code dengan Prettier |

| `pnpm check` | Menjalankan type checking |

### Database Scripts

| Command | Description |

|---------|-------------|

| `pnpm bits` | Full setup: install + database migration + seed |

| `pnpm bits:reset` | Reset database + fresh setup |

| `pnpm bits:prod` | Production deployment setup |

| `pnpm db:reset` | Reset database saja |

| `pnpm seed` | Menjalankan seed data |

| `pnpm prisma studio` | Membuka Prisma Studio GUI |

### Migration Scripts

| Command | Description |

|---------|-------------|

| `pnpm migrate:dev` | Membuat migration baru |

| `pnpm migrate:deploy` | Deploy migration ke production |

| `pnpm migrate:status` | Melihat status migration |

## 🗄️ Database Management

### Database Setup

```bash

# Setup awal database (migration + seeding)

pnpm bits

# atau step-by-step:

pnpm prisma generate # Generate Prisma client

pnpm prisma migrate dev --name init # Create initial migration

pnpm seed # Run seed data

```

### Migration Workflow

```bash

# Setelah mengubah schema.prisma, buat migration:

pnpm prisma migrate dev --name description_of_changes

# Contoh:

pnpm prisma migrate dev --name add_user_profile

```

### Database Operations

```bash

# Membuka Prisma Studio (database GUI)

pnpm prisma studio

# Generate Prisma Client

pnpm prisma generate

# Reset database (hati-hati, data akan hilang!)

pnpm db:reset

```

## 🔐 Authentication System

Starter kit ini sudah termasuk lengkap JWT-based authentication system:

### Authentication Routes

- `/login` - Halaman login

- `/register` - Halaman registrasi

- `/api/auth/login` - API endpoint untuk login

- `/api/auth/register` - API endpoint untuk registrasi

- `/api/auth/logout` - API endpoint untuk logout

### Protecting Routes

```svelte

</p><p class="slate-paragraph"> import { redirect } from &#x27;$lib/utils/auth&#x27;;</p><p class="slate-paragraph"> </p><p class="slate-paragraph"> // Redirect jika user tidak authenticated</p><p class="slate-paragraph"> redirect(false);</p><p class="slate-paragraph"> </p><p class="slate-paragraph"> // atau gunakan di load function</p><p class="slate-paragraph"> export const load = async ({ parent }) => {</p><p class="slate-paragraph"> const { user } = await parent();</p><p class="slate-paragraph"> if (!user) {</p><p class="slate-paragraph"> redirect(302, &#x27;/login&#x27;);</p><p class="slate-paragraph"> }</p><p class="slate-paragraph"> </p><p class="slate-paragraph"> return { user };</p><p class="slate-paragraph"> };</p><p class="slate-paragraph">

Protected Content
=================

Welcome, authenticated user!

```

### API Authentication

```typescript
// Contoh protected API endpoint

export const POST: RequestHandler = async ({ request, cookies }) => {
  const token = cookies.get("token");

  if (!token) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Process request dengan user data

    return json({ success: true, data: decoded });
  } catch (error) {
    return json({ error: "Invalid token" }, { status: 401 });
  }
};
```

## 🎨 Customization & Styling

### Menambah Components

1. Buat component baru di `src/lib/components/`:

```svelte

</p><p class="slate-paragraph"> export let name: string;</p><p class="slate-paragraph">

Hello, {name}!
--------------

```

2. Gunakan component di pages:

```svelte

</p><p class="slate-paragraph"> import MyComponent from &#x27;$lib/components/MyComponent.svelte&#x27;;</p><p class="slate-paragraph">

This is a custom component

```

### Customizing Styles

- Edit `src/app.css` untuk global styles

- Gunakan Tailwind classes untuk component styling

- Customize DaisyUI theme di `tailwind.config.js`

```javascript
// tailwind.config.js

import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      colors: {
        primary: "#your-custom-color",
      },
    },
  },

  plugins: [daisyui],

  daisyui: {
    themes: ["light", "dark", "corporate"], // Pilih themes yang diinginkan
  },
};
```

## 📦 Deployment

### Deployment ke Vercel

1. **Push code ke Git repository**

2. **Connect ke Vercel:**

- Login ke [Vercel](https://vercel.com)

- Import project dari Git repository

- Configure environment variables di Vercel dashboard

3. **Environment variables untuk Vercel:**

```env

DATABASE_URL="your-production-database-url"

JWT_SECRET="your-production-jwt-secret"

```

### Self-hosted Deployment dengan Node.js Adapter

1. **Build aplikasi:**

```bash

pnpm build

```

2. **Jalankan production server:**

```bash

pnpm preview

```

3. **Atau deploy dengan PM2:**

```bash

# Install PM2 globally

npm install -g pm2

# Start application dengan PM2

pm2 start build/index.js --name "my-sveltekit-app"

```

### Docker Deployment

```dockerfile

# Dockerfile

FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "preview"]

```

## 🧪 Testing

### Menjalankan Tests

```bash

# Menjalankan unit tests

pnpm test

# Menjalankan tests dengan watch mode

pnpm test:watch

# Menjalankan coverage tests

pnpm test:coverage

```

### Menambah Tests

Buat test files di `tests/` directory:

```typescript
// tests/auth.test.ts

import { describe, it, expect } from "vitest";

import { login } from "../src/lib/utils/auth";

describe("Authentication", () => {
  it("should validate login credentials", async () => {
    const result = await login("test@example.com", "password");

    expect(result.success).toBe(true);
  });
});
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

- 🐛 **Report Bugs**: [Create Issue](https://gitlab.com/bantenitsolutions/sveltekit-prisma-postgres-jwt-tailwind-daisyui/issues)

- 💡 **Request Features**: [Feature Requests](https://gitlab.com/bantenitsolutions/sveltekit-prisma-postgres-jwt-tailwind-daisyui/issues)

- 💬 **Discussion**: [Join Discussion](https://gitlab.com/bantenitsolutions/sveltekit-prisma-postgres-jwt-tailwind-daisyui/-/discussions)

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) - The web framework

- [Prisma](https://www.prisma.io/) - Database ORM

- [TailwindCSS](https://tailwindcss.com/) - CSS framework

- [DaisyUI](https://daisyui.com/) - UI components

- [Lucide Icons](https://lucide.dev/) - Beautiful icons

---

**Dikembangkan dengan ❤️ oleh [Banten IT Solutions](https://gitlab.com/bantenitsolutions)**

**Website**: [https://bits.co.id](https://bits.co.id)

**Email**: admin@bits.co.id

**GitLab**: [https://gitlab.com/bantenitsolutions](https://gitlab.com/bantenitsolutions)

---

**⭐ Jika project ini membantu Anda, jangan lupa untuk memberikan star di repository!**
