// prisma/seed.ts
import { PrismaClient, type ProductVariantOption } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log(
    "🌱 Seeding database for printing order management system with new schema...",
  );

  // Clear old data including new tables
  await prisma.notification.deleteMany();
  await prisma.paymentProof.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItemOption.deleteMany();
  await prisma.productVariantOption.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
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
      phone: "081234567890",
      password: adminPassword,
      role: "admin",
      address: "Jakarta, Indonesia",
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "Staff Operasional",
      username: "staff",
      phone: "081234567891",
      password: staffPassword,
      role: "staff",
      address: "Bandung, Indonesia",
    },
  });

  // Create customers
  const customers = [];
  for (let i = 0; i < 10; i++) {
    customers.push(
      await prisma.user.create({
        data: {
          name: `Customer ${i + 1}`,
          username: `customer${i + 1}`,
          phone: `08123456789${i + 2}`,
          password: customerPassword,
          role: "customer",
          address: `Bandung, Indonesia`,
        },
      }),
    );
  }

  console.log(
    `✅ Created ${customers.length + 2} users (1 admin, 1 staff, ${customers.length} customers)`,
  );

  // Create categories
  const printCategory = await prisma.category.create({
    data: {
      name: "Print",
      code: "PRINT",
      description: "Print products",
    },
  });

  const bannerCategory = await prisma.category.create({
    data: {
      name: "Banner",
      code: "BANNER",
      description: "Banner products",
    },
  });

  // Create the Print Art Carton A3+ product
  const printArtCartonA3Plus = await prisma.product.create({
    data: {
      name: "Print Art Carton A3+",
      description: "Print Art Carton with high quality finish",
      baseCode: "ARTCARTA3P",
      photo: "/uploads/products/logo.png",
      categoryId: printCategory.id,
    },
  });

  // Create variant types for Print Art Carton A3+
  const bahanVariant = await prisma.productVariant.create({
    data: {
      productId: printArtCartonA3Plus.id,
      variantName: "Bahan",
    },
  });

  const cetakVariant = await prisma.productVariant.create({
    data: {
      productId: printArtCartonA3Plus.id,
      variantName: "Cetak",
    },
  });

  const laminasiVariant = await prisma.productVariant.create({
    data: {
      productId: printArtCartonA3Plus.id,
      variantName: "Laminasi",
    },
  });

  // Create options for "Bahan" variant type
  await prisma.productVariantOption.create({
    data: {
      variantId: bahanVariant.id,
      optionName: "210",
      price: 3000,
    },
  });

  await prisma.productVariantOption.create({
    data: {
      variantId: bahanVariant.id,
      optionName: "230",
      price: 3500,
    },
  });

  await prisma.productVariantOption.create({
    data: {
      variantId: bahanVariant.id,
      optionName: "260",
      price: 4000,
    },
  });

  // Create options for "Cetak" variant type
  await prisma.productVariantOption.create({
    data: {
      variantId: cetakVariant.id,
      optionName: "1 Sisi",
      price: 0, // Free
    },
  });

  await prisma.productVariantOption.create({
    data: {
      variantId: cetakVariant.id,
      optionName: "2 Sisi",
      price: 1000, // Additional cost
    },
  });

  // Create options for "Laminasi" variant type
  await prisma.productVariantOption.create({
    data: {
      variantId: laminasiVariant.id,
      optionName: "Tanpa Laminasi",
      price: 0, // Free
    },
  });

  await prisma.productVariantOption.create({
    data: {
      variantId: laminasiVariant.id,
      optionName: "Doff",
      price: 1000,
    },
  });

  await prisma.productVariantOption.create({
    data: {
      variantId: laminasiVariant.id,
      optionName: "Glossy",
      price: 1500,
    },
  });

  // Create another example product: Spanduk
  const spandukProduct = await prisma.product.create({
    data: {
      name: "Spanduk",
      description: "Spanduk with high quality print",
      baseCode: "SPANDUK",
      photo: "/uploads/products/logo.png",
      categoryId: bannerCategory.id,
    },
  });

  // Create variant types for Spanduk
  const ukuranVariant = await prisma.productVariant.create({
    data: {
      productId: spandukProduct.id,
      variantName: "Ukuran",
    },
  });

  const finishingVariant = await prisma.productVariant.create({
    data: {
      productId: spandukProduct.id,
      variantName: "Finishing",
    },
  });

  // Create options for "Ukuran" variant type
  await prisma.productVariantOption.create({
    data: {
      variantId: ukuranVariant.id,
      optionName: "3x1 m",
      price: 85000,
    },
  });

  await prisma.productVariantOption.create({
    data: {
      variantId: ukuranVariant.id,
      optionName: "4x1 m",
      price: 100000,
    },
  });

  await prisma.productVariantOption.create({
    data: {
      variantId: ukuranVariant.id,
      optionName: "5x1 m",
      price: 120000,
    },
  });

  // Create options for "Finishing" variant type
  await prisma.productVariantOption.create({
    data: {
      variantId: finishingVariant.id,
      optionName: "Tanpa Gromet",
      price: 0,
    },
  });

  await prisma.productVariantOption.create({
    data: {
      variantId: finishingVariant.id,
      optionName: "Gromet + Tali",
      price: 15000,
    },
  });

  console.log(`✅ Created products with variant types and options`);

  // Create sample orders
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

  for (let i = 0; i < 10; i++) {
    const customer = customers[i % customers.length];
    const product = i % 2 === 0 ? printArtCartonA3Plus : spandukProduct;

    // Create order item
    const qty = Math.floor(Math.random() * 5) + 1; // 1-5 items

    // Calculate total price by selecting random options for each variant type
    // For Print Art Carton A3+ (product with id matching printArtCartonA3Plus.id)
    let bahanOptions: ProductVariantOption[] = [];
    let cetakOptions: ProductVariantOption[] = [];
    let laminasiOptions: ProductVariantOption[] = [];

    if (product.id === printArtCartonA3Plus.id) {
      bahanOptions = await prisma.productVariantOption.findMany({
        where: { variantId: bahanVariant.id },
      });
      cetakOptions = await prisma.productVariantOption.findMany({
        where: { variantId: cetakVariant.id },
      });
      laminasiOptions = await prisma.productVariantOption.findMany({
        where: { variantId: laminasiVariant.id },
      });
    }
    // For Spanduk (product with id matching spandukProduct.id)
    else {
      bahanOptions = await prisma.productVariantOption.findMany({
        where: { variantId: ukuranVariant.id },
      });
      cetakOptions = await prisma.productVariantOption.findMany({
        where: { variantId: finishingVariant.id },
      });
    }

    const selectedBahanOption =
      bahanOptions[Math.floor(Math.random() * bahanOptions.length)];
    const selectedCetakOption =
      cetakOptions[Math.floor(Math.random() * cetakOptions.length)];
    let selectedLaminasiOption = null;
    if (laminasiOptions.length > 0) {
      selectedLaminasiOption =
        laminasiOptions[Math.floor(Math.random() * laminasiOptions.length)];
    }

    const totalOptionPrice =
      selectedBahanOption.price +
      selectedCetakOption.price +
      (selectedLaminasiOption ? selectedLaminasiOption.price : 0);
    const price = totalOptionPrice;
    const subtotal = price * qty;

    // Generate random order data
    const orderStatus =
      orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    const paymentMethod =
      paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const paymentStatus =
      paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
    const shippingMethod =
      shippingMethods[Math.floor(Math.random() * shippingMethods.length)];

    // Randomly assign order creation between admin and staff for variety
    const createdByUser = i % 2 === 0 ? staff : admin;

    // Generate order number
    const orderNumber = `ORD-${String(i + 1).padStart(4, "0")}`;

    // Calculate total amount
    const totalAmount = subtotal;

    // Determine paidAt based on payment status
    const paidAt = paymentStatus === "confirmed" ? new Date() : null;

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
        notes: `Order for ${customer.name}`,
        orderItems: {
          create: [
            {
              productId: product.id,
              qty,
              price,
              subtotal,
              options: {
                create: [
                  {
                    optionId: selectedBahanOption.id,
                    optionName: selectedBahanOption.optionName,
                    price: selectedBahanOption.price,
                  },
                  {
                    optionId: selectedCetakOption.id,
                    optionName: selectedCetakOption.optionName,
                    price: selectedCetakOption.price,
                  },
                  ...(selectedLaminasiOption
                    ? [
                        {
                          optionId: selectedLaminasiOption.id,
                          optionName: selectedLaminasiOption.optionName,
                          price: selectedLaminasiOption.price,
                        },
                      ]
                    : []),
                ],
              },
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

  for (let i = 0; i < 10; i++) {
    await prisma.expense.create({
      data: {
        nominal: Math.floor(Math.random() * 4950000) + 50000, // 50,000 - 5,000,000
        category:
          expenseCategories[
            Math.floor(Math.random() * expenseCategories.length)
          ],
        date: new Date(),
        description: `Expense #${i + 1}`,
        proofFile: "/uploads/expenses/logo.png", // Use existing logo.png file in expenses directory
      },
    });
  }

  console.log("✅ Created sample orders with all statuses");
  console.log("✅ Created sample expenses with proof files");
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
