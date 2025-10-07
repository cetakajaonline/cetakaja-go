// prisma/seed.ts
import { PrismaClient, Role, OrderStatus, ShippingMethod, PaymentMethod, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database (full status sample)...');

  // Bersihkan data lama
  await prisma.notification.deleteMany();
  await prisma.paymentProof.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.upload.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  // Setting
  await prisma.setting.create({
    data: {
      name: 'Sistem Pemesanan Cabang Pusat',
      description: 'Aplikasi manajemen order dan pembayaran',
      logo: '/uploads/logo.png',
    },
  });

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  // Users
  await prisma.user.create({
    data: {
      name: 'Admin Utama',
      username: 'admin',
      phone: '0811111111',
      password: adminPassword,
      role: Role.admin,
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'Staff Operasional',
      username: 'staff1',
      phone: '0822222222',
      password: staffPassword,
      role: Role.staff,
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Riza Putr',
      username: 'riza',
      phone: '0833333333',
      password: customerPassword,
      role: Role.customer,
      address: 'Jl. Melati No. 45, Bandung',
    },
  });

  // Categories
  const catFood = await prisma.category.create({
    data: {
      name: 'Makanan',
      code: 'FOOD',
      description: 'Aneka makanan lezat',
    },
  });

  const catDrink = await prisma.category.create({
    data: {
      name: 'Minuman',
      code: 'DRINK',
      description: 'Aneka minuman segar dan panas',
    },
  });

  // Products
  const productNasi = await prisma.product.create({
    data: {
      categoryId: catFood.id,
      name: 'Nasi Goreng Spesial',
      baseCode: 'NSG01',
      description: 'Nasi goreng dengan ayam, telur, dan sosis.',
      variants: {
        create: [
          { variantName: 'Regular', price: 25000 },
          { variantName: 'Jumbo', price: 35000 },
        ],
      },
    },
    include: { variants: true },
  });

  const productKopi = await prisma.product.create({
    data: {
      categoryId: catDrink.id,
      name: 'Kopi Hitam',
      baseCode: 'KPH01',
      description: 'Kopi robusta murni tanpa gula.',
      variants: {
        create: [
          { variantName: 'Panas', price: 10000 },
          { variantName: 'Dingin', price: 12000 },
        ],
      },
    },
    include: { variants: true },
  });

  // Helper untuk membuat order+payment
  async function createOrderWithPayment(
    index: number,
    orderStatus: OrderStatus,
    paymentStatus: PaymentStatus
  ) {
    const total = 47000;
    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        createdById: staff.id,
        orderNumber: `ORD-000${index}`,
        status: orderStatus,
        shippingMethod: ShippingMethod.delivery,
        shippingAddress: customer.address,
        paymentMethod: PaymentMethod.transfer,
        paymentStatus,
        totalAmount: total,
        orderItems: {
          create: [
            {
              productId: productNasi.id,
              variantId: productNasi.variants[0].id,
              qty: 1,
              price: 25000,
              subtotal: 25000,
            },
            {
              productId: productKopi.id,
              variantId: productKopi.variants[1].id,
              qty: 1,
              price: 12000,
              subtotal: 12000,
            },
          ],
        },
        uploads: {
          create: {
            fileName: `order_${index}_alamat.jpg`,
            filePath: `/uploads/orders/order_${index}_alamat.jpg`,
            fileType: 'image/jpeg',
          },
        },
      },
    });

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: customer.id,
        createdById: staff.id,
        method: PaymentMethod.transfer,
        amount: total,
        status: paymentStatus,
        transactionRef: `TF-000${index}`,
        paidAt: paymentStatus === PaymentStatus.confirmed ? new Date() : null,
        proofs: {
          create: {
            fileName: `bukti_transfer_${index}.jpg`,
            filePath: `/uploads/payments/bukti_transfer_${index}.jpg`,
            fileType: 'image/jpeg',
          },
        },
      },
    });

    await prisma.notification.create({
      data: {
        userId: customer.id,
        orderId: order.id,
        toNumber: customer.phone,
        message: `Pesanan ${order.orderNumber} (${orderStatus}) dengan pembayaran ${paymentStatus}`,
        status: 'sent',
      },
    });

    return { order, payment };
  }

  // Buat 4 order berbeda status
  await createOrderWithPayment(1, OrderStatus.pending, PaymentStatus.pending);
  await createOrderWithPayment(2, OrderStatus.processing, PaymentStatus.confirmed);
  await createOrderWithPayment(3, OrderStatus.finished, PaymentStatus.refunded);
  await createOrderWithPayment(4, OrderStatus.canceled, PaymentStatus.failed);

  console.log('✅ Seeding selesai: Semua status sudah terisi');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect().then(() => {});
  });
