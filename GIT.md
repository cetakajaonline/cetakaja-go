# Alur Repository & Branching Strategy (2 Branch: main & dev)

## Simple Git Flow

### Branch Utama
- **`main`** - Production-ready code (stable)
- **`dev`** - Integrasi semua fitur dan bug fixes (development)

### Branch Sementara
- **`feature/*`** - Pengerjaan fitur (dihapus setelah merge)
- **`bugfix/*`** - Perbaikan bug (dihapus setelah merge)

## Alur Branching

```
main ──────────────────────────────────────○─────────────────────────────
     \                                   /|\ 
      \                                 / | \ 
dev ───○───────○─────────○─────────○────┘ |  \ 
       / \     /   \     / \       /       |   \
      feat1 ── feat2 ── feat3 ── feat4 ── feat5
```

## Detail Strategi

### 1. Development Flow
- Semua fitur dibuat di branch sementara `feature/nama-fitur`
- Setelah selesai, merge ke `dev` untuk integrasi

### 2. Merging ke Dev
```
git checkout feature/nama-fitur
git pull origin feature/nama-fitur
git checkout dev
git pull origin dev
git merge --no-ff feature/nama-fitur
git push origin dev
git branch -d feature/nama-fitur  # hapus branch lokal
git push origin --delete feature/nama-fitur  # hapus branch remote
```

### 3. Production Deployment
- Setelah fitur di-merge ke `dev`, di-test
- Setelah siap, merge `dev` ke `main`
- Gunakan tag versioning: `v1.0.0`, `v1.1.0`

### 4. Bug Fixes
- Buat `bugfix/nama-bug` dari `dev`
- Setelah selesai, merge ke `dev`
- Jika perlu, merge juga ke `main` (dengan cherry-pick)

## Naming Convention

### Branch Names
```
feature/order-management-enhancement
feature/payment-integration
bugfix/login-issue
```

### Commit Messages
```
feat: add new order status tracking
fix: resolve payment gateway timeout
docs: update API documentation
style: format code according to style guide
refactor: optimize database queries
test: add unit tests for user authentication
chore: update dependencies
```

## Pull Request Process

1. **Sebelum Create PR**:
   - Pastikan branch feature update dari `dev`
   - Jalankan test lokal

2. **PR Flow**:
   - Feature → Dev (untuk semua fitur/barang)
   - Dev → Main (untuk production deployment)

3. **Review Process**:
   - Minimal 1 approval
   - Code review mandatory

## CI/CD Integration

- **dev**: Auto-deploy ke staging environment
- **main**: Auto-deploy ke production environment

## Contoh Workflow

1. **Mulai fitur baru**:
   ```
   git checkout dev
   git pull origin dev
   git checkout -b feature/payment-integration
   ```

2. **Selesai mengerjakan**:
   ```
   git add .
   git commit -m "feat: integrate payment gateway"
   git push origin feature/payment-integration
   ```

3. **Create Pull Request**:
   - Buka GitHub
   - Create PR dari `feature/payment-integration` → `dev`

4. **Setelah di-approve**:
   - Merge ke `dev`
   - Delete feature branch (di GitHub)
   - Update local branch:
   ```
   git checkout dev
   git pull origin dev
   git branch -d feature/payment-integration
   git push origin --delete feature/payment-integration
   ```

5. **Production deployment**:
   - Ketika fitur di `dev` siap production
   - Create PR dari `dev` → `main`
   - Setelah approve, merge ke `main`

## Best Practices

1. **Always pull latest** sebelum membuat feature branch
2. **Hapus feature branch** setelah merge
3. **Jangan push langsung ke main/dev**
4. **Semua perubahan harus melalui PR**
5. **Test secara menyeluruh** sebelum merge ke `main`

Strategi ini sederhana tapi efektif untuk menjaga kualitas code dan memudahkan kolaborasi pengembangan sistem POS cetak.