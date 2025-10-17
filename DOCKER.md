# Docker Configuration Guide

## File Docker Compose

### `docker-compose.yml`
- **Tujuan**: Konfigurasi untuk lingkungan development
- **Fitur**:
  - Membangun image dari Dockerfile
  - Menyertakan layanan PostgreSQL internal
  - Database lokal: `cao` dengan user `postgres`/`postgres`
  - Digunakan untuk pengembangan lokal

### `docker-compose.prod.yml`
- **Tujuan**: Konfigurasi untuk deployment produksi
- **Fitur**:
  - Menggunakan image dari registry: `ghcr.io/${GITHUB_REPOSITORY}:latest`
  - Tidak menyertakan layanan PostgreSQL (mengandalkan database eksternal)
  - Port mapping: `80:3000`
  - Menggunakan environment variables: `DATABASE_URL`, `JWT_SECRET`

### `docker-compose.external-db.yml`
- **Tujuan**: Override konfigurasi untuk menggunakan database eksternal
- **Fitur**:
  - Digunakan bersama `docker-compose.yml` untuk mengganti konfigurasi database
  - Menghapus layanan PostgreSQL internal
  - Menetapkan variabel lingkungan untuk produksi
  - Mengandalkan database eksternal melalui `DATABASE_URL`

## Workflow Deployment

### `.github/workflows/docker.yml`
- **Tujuan**: Build dan push image Docker serta deployment awal
- **Proses**:
  - Membangun image Docker dari kode sumber
  - Menyimpan image ke GitHub Container Registry
  - Membuat file `docker-compose.external-db.yml` secara dinamis
  - Menggabungkan `docker-compose.yml` dengan `docker-compose.external-db.yml`
  - Menjalankan deployment dengan database eksternal
  - **Catatan**: Menggunakan PostgreSQL internal dari `docker-compose.yml` tetapi dengan image yang baru dibuild

### `.github/workflows/deploy.yml`
- **Tujuan**: Deployment produksi ke server target
- **Proses**:
  - Menjalankan migrasi database Prisma
  - Menggunakan kombinasi `docker-compose.yml` dan `docker-compose.external-db.yml`
  - Mengandalkan database eksternal
  - Deployment dilakukan melalui SSH ke server target