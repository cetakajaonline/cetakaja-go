# Integrasi Notifikasi WhatsApp dengan n8n dan EvolutionAPI

## Gambaran Umum

Sistem ini memungkinkan pengiriman notifikasi otomatis ke pelanggan melalui WhatsApp berdasarkan perubahan status order dan pembayaran. Notifikasi disimpan di tabel `Notification` dengan status `pending`, lalu dapat diambil oleh n8n untuk diproses melalui EvolutionAPI.

## Alur Kerja

1. Saat order dibuat atau statusnya berubah, sistem membuat entri di tabel `Notification`
2. n8n secara berkala mengambil notifikasi dengan status `pending` dari endpoint `/api/notifications`
3. n8n mengirim pesan WhatsApp melalui EvolutionAPI
4. Setelah dikirim, n8n memperbarui status notifikasi ke `sent` atau `failed` melalui endpoint PUT

## Endpoint API

### GET /api/notifications

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

### PUT /api/notifications

Memperbarui status notifikasi setelah diproses

**Request Body:**

```json
{
  "notificationId": 1,
  "status": "sent" // atau "failed"
}
```

## Konfigurasi n8n

### 1. HTTP Request Node - Ambil Notifikasi

- Method: GET
- URL: `{{ $vars.baseURL }}/api/notifications`
- Response Format: JSON

### 2. Split Out Node

Untuk memproses setiap notifikasi secara individual

### 3. HTTP Request Node - Kirim ke EvolutionAPI

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

### 4. HTTP Request Node - Update Status

- Method: PUT
- URL: `{{ $vars.baseURL }}/api/notifications`
- Body (JSON):

```json
{
  "notificationId": {{$json.id}},
  "status": "sent"
}
```

## Status Notifikasi

- `pending`: Notifikasi siap dikirim
- `sent`: Notifikasi telah berhasil dikirim
- `failed`: Gagal mengirim notifikasi

## Contoh Notifikasi Berdasarkan Status

### Order Status

- `pending`: "Halo [nama], pesanan Anda dengan nomor [nomor_order] telah diterima dan sedang diproses."
- `processing`: "Halo [nama], pesanan Anda dengan nomor [nomor_order] sedang dalam proses pengemasan."
- `finished`: "Halo [nama], pesanan Anda dengan nomor [nomor_order] telah selesai. Terima kasih telah berbelanja!"
- `canceled`: "Halo [nama], pesanan Anda dengan nomor [nomor_order] telah dibatalkan."

### Payment Status

- `pending`: "Halo [nama], pembayaran untuk pesanan [nomor_order] sedang menunggu konfirmasi."
- `confirmed`: "Halo [nama], pembayaran untuk pesanan [nomor_order] telah dikonfirmasi. Pesanan Anda akan segera diproses."
- `failed`: "Halo [nama], pembayaran untuk pesanan [nomor_order] gagal. Silakan hubungi kami untuk bantuan."
- `refunded`: "Halo [nama], pembayaran untuk pesanan [nomor_order] telah dikembalikan."

## Tips Implementasi

1. Pastikan nomor telepon dalam format internasional (misal: 6281234567890)
2. Gunakan rate limiting untuk menghindari spam
3. Tambahkan retry logic untuk notifikasi yang gagal
4. Buat logging untuk memantau proses pengiriman
