// prisma/seed.ts
import { fakerID_ID as faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database for printing order management system...");

  // Clear old data
  await prisma.notification.deleteMany();
  await prisma.paymentProof.deleteMany();
  await prisma.payment.deleteMany();
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
      name: "Cetak Aja Online",
      description:
        "Aplikasi Point of Sale untuk Percetakan Dan Digital Printing",
      logo: "/uploads/logo.png",
      bankName: "Seabank",
      bankCode: "535",
      bankAccountNumber: "1234567890",
      bankAccountName: "Yuliana",
      qrisImage: "/uploads/qris/QRIS.jpeg",
    },
  });

  // Hash passwords
  const adminPassword = await bcrypt.hash("admin123", 10);
  const staffPassword = await bcrypt.hash("staff123", 10);
  const customerPassword = await bcrypt.hash("customer123", 10);

  // Create Admin and Staff with addresses
  const admin = await prisma.user.create({
    data: {
      name: "Administrator",
      username: "admin",
      phone: `08${Math.floor(100000000 + Math.random() * 900000000)}`, // Generates 08 followed by 9 digits
      password: adminPassword,
      role: "admin",
      address: faker.location.streetAddress(),
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "Staff Operasional",
      username: "staff",
      phone: `08${Math.floor(100000000 + Math.random() * 900000000)}`, // Generates 08 followed by 9 digits
      password: staffPassword,
      role: "staff",
      address: faker.location.streetAddress(),
    },
  });

  // Create customers using faker
  const customers = [];
  for (let i = 0; i < 30; i++) {
    customers.push(
      await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          username: `${faker.person.firstName().toLowerCase()}_${i}`,
          phone: `08${Math.floor(100000000 + Math.random() * 900000000)}`, // Generates 08 followed by 9 digits
          password: customerPassword,
          role: "customer",
          address: faker.location.streetAddress(),
        },
      }),
    );
  }

  console.log(
    `✅ Created ${customers.length + 2} users (1 admin, 1 staff, ${customers.length} customers)`,
  );

  // Create categories for printing products
  const categories = [
    {
      name: "Desain Grafis",
      code: "DSN",
      description: "Berbagai layanan desain grafis untuk kebutuhan bisnis",
    },
    {
      name: "Cetak Offset",
      code: "CTK",
      description: "Cetak produksi massal dengan kualitas tinggi",
    },
    {
      name: "Cetak Digital",
      code: "DIG",
      description: "Cetak digital dengan berbagai jenis kertas",
    },
    {
      name: "Cetak Large Format",
      code: "LFG",
      description: "Print besar seperti banner, x-banner, dll",
    },
    {
      name: "Binding & Finishing",
      code: "BND",
      description: "Layanan penjilidan dan finishing",
    },
  ];

  const createdCategories = [];
  for (const category of categories) {
    createdCategories.push(
      await prisma.category.create({
        data: category,
      }),
    );
  }

  console.log(`✅ Created ${createdCategories.length} categories`);

  // Create printing products with variants
  const printingProducts = [
    {
      name: "Kartu Nama",
      baseCode: "KTN",
      description: "Kartu nama premium dengan berbagai finishing",
      categoryId: createdCategories.find((c) => c.name === "Cetak Offset")!.id,
      photo: "/uploads/products/logo.png",
    },
    {
      name: "Flyer",
      baseCode: "FLY",
      description: "Flyer promosi dengan berbagai ukuran dan finishing",
      categoryId: createdCategories.find((c) => c.name === "Cetak Offset")!.id,
      photo: "/uploads/products/logo.png",
    },
    {
      name: "Brosur",
      baseCode: "BRS",
      description: "Brosur dengan berbagai jumlah halaman",
      categoryId: createdCategories.find((c) => c.name === "Cetak Offset")!.id,
      photo: "/uploads/products/logo.png",
    },
    {
      name: "Katalog Produk",
      baseCode: "KTG",
      description: "Katalog produk dengan kualitas cetak tinggi",
      categoryId: createdCategories.find((c) => c.name === "Cetak Offset")!.id,
      photo: "/uploads/products/logo.png",
    },
    {
      name: "Spanduk",
      baseCode: "SPD",
      description: "Spanduk untuk promosi outdoor dan indoor",
      categoryId: createdCategories.find(
        (c) => c.name === "Cetak Large Format",
      )!.id,
      photo: "/uploads/products/logo.png",
    },
    {
      name: "Banner",
      baseCode: "BNR",
      description: "Banner untuk berbagai keperluan promosi",
      categoryId: createdCategories.find(
        (c) => c.name === "Cetak Large Format",
      )!.id,
      photo: "/uploads/products/logo.png",
    },
    {
      name: "X-Banner",
      baseCode: "XBN",
      description: "X-banner portable untuk pameran dan promosi",
      categoryId: createdCategories.find(
        (c) => c.name === "Cetak Large Format",
      )!.id,
      photo: "/uploads/products/logo.png",
    },
    {
      name: "Stiker",
      baseCode: "STK",
      description: "Stiker berbagai ukuran dan finishing",
      categoryId: createdCategories.find((c) => c.name === "Cetak Digital")!.id,
      photo: "/uploads/products/logo.png",
    },
    {
      name: "Kalender",
      baseCode: "KLM",
      description: "Kalender meja dan dinding untuk tahun baru",
      categoryId: createdCategories.find((c) => c.name === "Cetak Offset")!.id,
      photo: "/uploads/products/logo.png",
    },
    {
      name: "Buku",
      baseCode: "BKK",
      description: "Jasa cetak dan penjilidan buku",
      categoryId: createdCategories.find(
        (c) => c.name === "Binding & Finishing",
      )!.id,
      photo: "/uploads/products/logo.png",
    },
  ];

  const createdProducts = [];
  for (const product of printingProducts) {
    const variants = [
      {
        variantName: "A4",
        price: 50000,
      },
      {
        variantName: "A3",
        price: 75000,
      },
      {
        variantName: "A2",
        price: 120000,
      },
      {
        variantName: "Custom",
        price: 150000,
      },
    ];

    const createdProduct = await prisma.product.create({
      data: {
        ...product,
        variants: {
          create: variants,
        },
      },
      include: { variants: true },
    });

    createdProducts.push(createdProduct);
  }

  console.log(`✅ Created ${createdProducts.length} products with variants`);

  // Create sample orders with all status combinations
  const orderStatuses: Array<
    "pending" | "processing" | "finished" | "canceled"
  > = ["pending", "processing", "finished", "canceled"];

  const paymentMethods: Array<"transfer" | "qris" | "cash"> = [
    "transfer",
    "qris",
    "cash",
  ];

  const paymentStatuses: Array<
    "pending" | "confirmed" | "failed" | "refunded"
  > = ["pending", "confirmed", "failed", "refunded"];

  const shippingMethods: Array<"pickup" | "delivery"> = ["pickup", "delivery"];

  for (let i = 0; i < 50; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const product = faker.helpers.arrayElement(createdProducts);
    const variant: { id: number; variantName: string; price: number } =
      faker.helpers.arrayElement(product.variants);

    // Create order item
    const qty = faker.number.int({ min: 1, max: 10 });
    const price = variant.price;
    const subtotal = price * qty;

    // Generate random order data
    const orderStatus = faker.helpers.arrayElement(orderStatuses);
    const paymentMethod = faker.helpers.arrayElement(paymentMethods);
    const paymentStatus = faker.helpers.arrayElement(paymentStatuses);
    const shippingMethod = faker.helpers.arrayElement(shippingMethods);

    // Randomly assign order creation between admin and staff for variety
    const createdByUser = i % 2 === 0 ? staff : admin;

    // Generate order number
    const orderNumber = `ORD-${String(i + 1).padStart(4, "0")}`;

    // Calculate total amount
    const totalAmount = subtotal;

    // Determine paidAt based on payment status
    const paidAt =
      paymentStatus === "confirmed"
        ? new Date(faker.date.recent({ days: 30 }))
        : null;

    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        createdById: createdByUser.id,
        orderNumber,
        status: orderStatus,
        shippingMethod,
        paymentMethod,
        paymentStatus,
        totalAmount,
        notes: faker.lorem.sentence(),
        orderItems: {
          create: [
            {
              productId: product.id,
              variantId: variant.id,
              qty,
              price,
              subtotal,
            },
          ],
        },
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: customer.id,
        createdById: createdByUser.id,
        method: paymentMethod,
        amount: totalAmount,
        status: paymentStatus,
        transactionRef: `TXN-${String(i + 1).padStart(6, "0")}`,
        paidAt,
        proofs: {
          create: {
            fileName: "payment_proof.jpg",
            filePath: "/uploads/payments/logo.png",
            fileType: "image/png",
          },
        },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: customer.id,
        orderId: order.id,
        toNumber: customer.phone,
        message: `Pesanan ${orderNumber} (${orderStatus}) dengan pembayaran ${paymentStatus}`,
        status: "sent",
      },
    });
  }

  // Create sample expenses with proof files
  const expenseCategories: Array<
    "operasional" | "marketing" | "gaji" | "lainnya"
  > = ["operasional", "marketing", "gaji", "lainnya"];

  for (let i = 0; i < 20; i++) {
    await prisma.expense.create({
      data: {
        nominal: faker.number.int({ min: 50000, max: 5000000 }),
        category: faker.helpers.arrayElement(expenseCategories),
        date: new Date(faker.date.recent({ days: 60 })),
        description: faker.lorem.sentence(),
        proofFile: "/uploads/expenses/logo.png", // Use existing logo.png file in expenses directory
      },
    });
  }

  console.log("✅ Created 50 sample orders with all statuses");
  console.log("✅ Created 20 sample expenses with proof files");
  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect().then(() => {});
  });
