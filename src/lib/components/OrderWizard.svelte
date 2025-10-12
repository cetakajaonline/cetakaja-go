<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { loginUser, registerPublicUser } from "$lib/services/userClient";
  import { getPublicSettings } from "$lib/services/settingClient";
  import SearchSelect from "$lib/components/ui/SearchSelect.svelte";
  import type { User, Product, ProductVariant, OrderItem } from "$lib/types";

  // Define our own public product functions
  async function getAllPublicProducts(): Promise<Product[]> {
    const res = await fetch("/api/public/products");
    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }
    return res.json() as Promise<Product[]>;
  }

  // State management
  let loading = $state(false);
  let phone = $state("");
  let isExistingCustomer = $state(false);
  let showPasswordForm = $state(false); // Show password form for existing customers
  let customerPassword = $state("");
  let errorMessage = $state("");
  let successMessage = $state("");

  // Customer info after login/register
  let customer = $state<User | null>(null);

  // Editable customer details
  let isEditingCustomer = $state(false);
  let editedCustomer = $state({
    name: "",
    phone: "",
    address: "",
  });

  // Products and order data
  let products = $state<Product[]>([]);
  let settings = $state<any>(null);

  let orderData = $state({
    shippingMethod: "delivery" as "pickup" | "delivery",
    paymentMethod: "transfer" as "transfer" | "qris" | "cash",
    notes: "",
    orderItems: [] as OrderItem[],
  });

  // New item form
  let newItem = $state({
    productId: 0,
    variantId: undefined as number | undefined,
    qty: 1,
    price: 0,
    subtotal: 0,
    notes: "",
  });

  // Product variants for selected product
  let productVariants = $state<ProductVariant[]>([]);

  // Payment modal state
  let showPaymentModal = $state(false);
  let orderDetails = $state<any>(null);
  let paymentProofFile = $state<File | null>(null);
  let paymentProofPreview = $state<string | null>(null);

  // Current step in the wizard
  let currentStep = $state(0); // 0: login, 1: customer details, 2: products, 3: shipping/payment, 4: payment instructions (with upload), 5: success

  // Initialize on mount
  onMount(async () => {
    if (browser) {
      try {
        const [productsResponse, settingsResponse] = await Promise.all([
          getAllPublicProducts(),
          getPublicSettings(),
        ]);

        products = productsResponse || [];

        if (settingsResponse.success) {
          settings = settingsResponse.data;
        }
      } catch (error) {
        console.error("Error loading data:", error);
        errorMessage = "Gagal memuat data produk";
      }
    }
  });

  // Validate phone number
  function validatePhone(phone: string): boolean {
    return /^08\d+$/.test(phone) && phone.length >= 10 && phone.length <= 15;
  }

  // Handle phone submission
  async function handlePhoneSubmit() {
    if (!validatePhone(phone)) {
      errorMessage =
        "Nomor whatsapp harus diawali dengan 08 dan hanya berisi angka";
      return;
    }

    loading = true;
    errorMessage = "";

    try {
      // Check if customer exists by attempting login with phone as password
      const loginResponse = await loginUser({
        username: phone,
        password: phone,
      });

      if (loginResponse.success) {
        // Customer exists - show password form instead of auto-login
        showPasswordForm = true;
        errorMessage = "";
        successMessage = "Akun ditemukan. Silakan masukkan password Anda.";
      } else {
        // Customer doesn't exist, register new customer using public endpoint
        const registerResponse = await registerPublicUser({
          name: phone, // Use phone number as name
          username: phone,
          phone: phone,
          password: phone,
        });

        if (registerResponse.success) {
          // After registration, login the new user
          const loginAfterRegister = await loginUser({
            username: phone,
            password: phone,
          });

          if (loginAfterRegister.success) {
            isExistingCustomer = true;
            customerPassword = phone;
            customer = loginAfterRegister.data?.user || null;

            // If login response doesn't contain complete customer data (like address),
            // fetch the complete profile from the API
            if (customer && customer.id) {
              try {
                const profileResponse = await fetch(
                  `/api/users/${customer.id}`
                );
                if (profileResponse.ok) {
                  const profileData = await profileResponse.json();
                  customer = { ...customer, ...profileData };
                }
              } catch (profileError) {
                console.error("Error fetching customer profile:", profileError);
                // If profile fetch fails, continue with the data from login
              }
            }

            // Update customer details
            editedCustomer.name = customer?.name || phone;
            editedCustomer.phone = customer?.phone || phone;
            editedCustomer.address = customer?.address || "";

            successMessage =
              "Akun berhasil dibuat. Silakan lanjutkan proses pemesanan.";

            // Move to next step
            currentStep = 1;
          } else {
            throw new Error("Gagal login setelah registrasi");
          }
        } else {
          throw new Error(registerResponse.message || "Gagal mendaftar akun");
        }
      }
    } catch (error: any) {
      console.error("Error handling phone:", error);
      errorMessage =
        error.message || "Terjadi kesalahan saat memproses nomor whatsapp";
    } finally {
      loading = false;
    }
  }

  // Handle password submission for existing customers
  async function handlePasswordSubmit() {
    if (!validatePhone(phone)) {
      errorMessage = "Nomor whatsapp tidak valid";
      return;
    }

    if (!customerPassword.trim()) {
      errorMessage = "Password harus diisi";
      return;
    }

    loading = true;
    errorMessage = "";

    try {
      // Try to login with phone and entered password
      const loginResponse = await loginUser({
        username: phone,
        password: customerPassword,
      });

      if (loginResponse.success) {
        isExistingCustomer = true;
        showPasswordForm = false; // Hide password form
        customer = loginResponse.data?.user || null;

        // If login response doesn't contain complete customer data (like address),
        // fetch the complete profile from the API
        if (customer && customer.id) {
          try {
            const profileResponse = await fetch(`/api/users/${customer.id}`);
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              customer = { ...customer, ...profileData };
            }
          } catch (profileError) {
            console.error("Error fetching customer profile:", profileError);
            // If profile fetch fails, continue with the data from login
          }
        }

        // Update customer details
        editedCustomer.name = customer?.name || phone;
        editedCustomer.phone = customer?.phone || phone;
        editedCustomer.address = customer?.address || "";

        successMessage = "Login berhasil. Silakan lanjutkan proses pemesanan.";

        // Move to next step
        currentStep = 1;
      } else {
        throw new Error("Password salah. Silakan coba lagi.");
      }
    } catch (error: any) {
      console.error("Error logging in:", error);
      errorMessage = error.message || "Login gagal. Silakan coba lagi.";
    } finally {
      loading = false;
    }
  }

  // Update product variants when selected product changes
  $effect(() => {
    if (newItem.productId) {
      const product = products.find((p) => p.id === newItem.productId);
      if (product) {
        productVariants = product.variants || [];

        // If there are no variants or only one variant, auto-select it
        if (productVariants.length === 1) {
          newItem.variantId = productVariants[0].id;
        } else if (productVariants.length === 0) {
          // If no variants, do not set a base product price since Product doesn't have a price property
          // Products are expected to have variants with prices, not a direct price
          newItem.price = 0;
        }
      } else {
        productVariants = [];
        newItem.price = 0;
      }
    } else {
      productVariants = [];
      newItem.variantId = undefined;
      newItem.price = 0;
    }
  });

  // Update price when variant changes
  $effect(() => {
    if (newItem.variantId) {
      const variant = productVariants.find((v) => v.id === newItem.variantId);
      if (variant) {
        newItem.price = variant.price;
        newItem.subtotal = newItem.qty * variant.price;
      }
    } else if (newItem.productId) {
      // If no variant selected but product is selected, check if variants exist
      // If no variants exist for this product, use base price from product
      const product = products.find((p) => p.id === newItem.productId);
      if (product && productVariants.length === 0) {
        // Products don't have a direct price property; they have variants
        // If there are no variants, we cannot determine a price, so set to 0
        newItem.price = 0;
        newItem.subtotal = 0;
      } else {
        newItem.price = 0;
        newItem.subtotal = 0;
      }
    }
  });

  // Update subtotal when qty changes
  $effect(() => {
    if (newItem.qty > 0 && newItem.price > 0) {
      newItem.subtotal = newItem.qty * newItem.price;
    } else if (newItem.qty > 0 && newItem.price === 0 && newItem.productId) {
      // If quantity is set but price is 0, try to get the product price
      const product = products.find((p) => p.id === newItem.productId);
      if (product && productVariants.length === 0) {
        // Products don't have a direct price property; they have variants
        // If there are no variants, we cannot determine a price
        newItem.price = 0;
        newItem.subtotal = 0;
      } else {
        newItem.subtotal = 0;
      }
    } else {
      newItem.subtotal = 0;
    }
  });

  // Add item to order
  function addItem() {
    if (newItem.productId === 0) {
      errorMessage = "Silakan pilih produk terlebih dahulu";
      return;
    }

    if (newItem.qty <= 0) {
      errorMessage = "Jumlah harus lebih dari 0";
      return;
    }

    // Validate if variant is required
    const product = products.find((p) => p.id === newItem.productId);
    if (product && product.variants.length > 0 && !newItem.variantId) {
      errorMessage = "Silakan pilih varian produk terlebih dahulu";
      return;
    }

    // Check if the same product and variant already exists in the order
    const existingItemIndex = orderData.orderItems.findIndex(
      (item) =>
        item.productId === newItem.productId &&
        item.variantId === (newItem.variantId || null)
    );

    if (existingItemIndex !== -1) {
      // If item already exists, update the quantity and notes
      const existingItem = orderData.orderItems[existingItemIndex];
      const updatedQty = existingItem.qty + newItem.qty;
      const updatedSubtotal = updatedQty * existingItem.price;

      // Create updated item
      const updatedItem = {
        ...existingItem,
        qty: updatedQty,
        subtotal: updatedSubtotal,
        notes: newItem.notes || existingItem.notes, // Use new notes if provided, otherwise keep existing
      };

      // Replace the existing item with the updated one
      orderData.orderItems = [
        ...orderData.orderItems.slice(0, existingItemIndex),
        updatedItem,
        ...orderData.orderItems.slice(existingItemIndex + 1),
      ];
    } else {
      // If item doesn't exist, create a new order item
      const orderItem: OrderItem = {
        id: Date.now(), // temporary ID
        productId: newItem.productId,
        variantId: newItem.variantId || null,
        qty: newItem.qty,
        price: newItem.price,
        subtotal: newItem.subtotal,
        notes: newItem.notes || null,
        product: {
          id: product!.id,
          name: product!.name,
        },
        variant: newItem.variantId
          ? product!.variants.find((v) => v.id === newItem.variantId) || null
          : null,
      };

      orderData.orderItems = [...orderData.orderItems, orderItem];
    }

    // Reset form
    newItem = {
      productId: 0,
      variantId: undefined,
      qty: 1,
      price: 0,
      subtotal: 0,
      notes: "",
    };

    errorMessage = "";
  }

  // Remove item from order
  function removeItem(index: number) {
    orderData.orderItems.splice(index, 1);
    orderData.orderItems = [...orderData.orderItems]; // Trigger reactive update
  }

  // Calculate total
  function calculateTotal(): number {
    return orderData.orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  // Handle order submission
  async function handleSubmitOrder() {
    if (!customer) {
      errorMessage = "Silakan masukkan nomor whatsapp terlebih dahulu";
      return;
    }

    if (orderData.orderItems.length === 0) {
      errorMessage = "Silakan tambahkan setidaknya satu item ke pesanan";
      return;
    }

    loading = true;
    errorMessage = "";

    try {
      // Update customer details if changed
      if (
        (customer && editedCustomer.name !== customer.name) ||
        editedCustomer.address !== customer.address
      ) {
        const updatedCustomer = {
          name: editedCustomer.name,
          phone: editedCustomer.phone, // Phone can't be changed in this context
          address: editedCustomer.address,
        };

        const res = await fetch(`/api/users/${customer.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedCustomer),
        });

        if (res.ok) {
          customer = { ...customer, ...updatedCustomer };
        }
      }

      // Create order with adjusted orderItems format (convert variantId from null to undefined)
      const orderItemsForApi = orderData.orderItems.map((item) => ({
        ...item,
        variantId: item.variantId || undefined, // Convert null to undefined
      }));

      // Use public order creation API by phone number - no authentication required
      const formData = new FormData();
      formData.append("phone", customer.phone); // Use customer's phone to identify them
      formData.append("status", "pending");
      formData.append("shippingMethod", orderData.shippingMethod);
      formData.append("paymentMethod", orderData.paymentMethod);
      formData.append("totalAmount", calculateTotal().toString());
      if (orderData.notes) {
        formData.append("notes", orderData.notes);
      }
      formData.append("orderItems", JSON.stringify(orderItemsForApi));

      const res = await fetch("/api/public/orders", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const order = await res.json();

      if (order) {
        // Store order details and show payment modal
        orderDetails = {
          ...order,
          user: customer,
          orderItems: orderData.orderItems,
          totalAmount: calculateTotal(),
        };

        // Move to payment instructions step
        currentStep = 4;
      } else {
        throw new Error("Gagal membuat pesanan");
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      errorMessage = error.message || "Terjadi kesalahan saat membuat pesanan";
    } finally {
      loading = false;
    }
  }

  // Handle payment proof file selection
  function handlePaymentProofChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      paymentProofFile = file;

      // Create preview for image files
      if (file.type.startsWith("image/")) {
        paymentProofPreview = URL.createObjectURL(file);
      } else {
        paymentProofPreview = null; // PDF files don't have previews
      }
    }
  }

  // Handle payment proof upload
  async function handlePaymentProofUpload() {
    if (!orderDetails || !paymentProofFile) {
      errorMessage = "Silakan pilih file bukti pembayaran terlebih dahulu";
      return;
    }

    loading = true;
    errorMessage = "";

    try {
      // First, get the payment record associated with this order
      const paymentResponse = await fetch(
        `/api/orders/${orderDetails.id}/payment`
      );

      let paymentId;
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        paymentId = paymentData.id;
      } else {
        throw new Error(
          "Gagal mengakses catatan pembayaran. Silakan coba kembali ke halaman pesanan untuk mengunggah bukti pembayaran."
        );
      }

      // Now upload the payment proof to the specific payment
      const formData = new FormData();
      formData.append("file", paymentProofFile);
      formData.append("paymentId", paymentId.toString());

      const res = await fetch("/api/payment-proofs", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        // If unauthorized, provide a user-friendly error
        if (res.status === 403) {
          throw new Error(
            "Anda tidak diizinkan mengunggah bukti pembayaran. Silakan coba kembali ke halaman pesanan."
          );
        }
        throw new Error(
          errorData.message || "Gagal mengunggah bukti pembayaran"
        );
      }

      // On success, go to confirmation step
      currentStep = 5;
    } catch (error: any) {
      console.error("Error uploading payment proof:", error);
      errorMessage =
        error.message || "Terjadi kesalahan saat mengunggah bukti pembayaran";
    } finally {
      loading = false;
    }
  }

  // Prepare options for SearchSelect
  let productOptions = $derived(
    products.map((product) => ({
      value: product.id,
      label: product.name,
    }))
  );

  // Payment options that depend on shipping method
  let paymentOptions = $derived(
    orderData.shippingMethod === "pickup"
      ? [
          { value: "transfer", label: "Transfer" },
          { value: "qris", label: "QRIS" },
          { value: "cash", label: "Tunai" },
        ]
      : [
          { value: "transfer", label: "Transfer" },
          { value: "qris", label: "QRIS" },
        ]
  );

  // Helper function to format currency
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  // Calculate amount to pay based on shipping method
  function getAmountToPay(): number {
    return calculateTotal();
  }

  // Update customer details and save to server
  async function updateCustomerDetails() {
    if (!customer || !isEditingCustomer) return;

    // Update the local edited customer details
    const updatedData = {
      name: editedCustomer.name,
      phone: editedCustomer.phone, // Phone can't be changed in this context
      address: editedCustomer.address,
    };

    try {
      // Update customer info in database using PATCH request
      const res = await fetch(`/api/users/${customer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        // Update the customer state with new values
        customer = {
          ...customer,
          name: updatedData.name,
          phone: updatedData.phone,
          address: updatedData.address,
        };

        // Update the edited customer state
        editedCustomer.name = updatedData.name;
        editedCustomer.phone = updatedData.phone;
        editedCustomer.address = updatedData.address;
      } else {
        const errorData = await res.json();
        console.error("Failed to update customer details:", errorData);
      }
    } catch (error) {
      console.error("Error updating customer details:", error);
    }
  }

  // Navigation functions
  function goToStep(step: number) {
    // When going to step 1 (customer details), ensure editedCustomer is in sync with customer data
    if (step === 1 && customer) {
      editedCustomer.name = customer.name || editedCustomer.name;
      editedCustomer.phone = customer.phone || editedCustomer.phone;
      editedCustomer.address = customer.address || editedCustomer.address;
    }
    currentStep = step;
  }

  function nextStep() {
    if (currentStep < 5) currentStep++; // Updated max step from 6 to 5
  }

  function prevStep() {
    // When going back to step 1 (customer details), ensure editedCustomer is in sync with customer data
    if (currentStep === 1 && customer) {
      editedCustomer.name = customer.name || editedCustomer.name;
      editedCustomer.phone = customer.phone || editedCustomer.phone;
      editedCustomer.address = customer.address || editedCustomer.address;
    }
    if (currentStep > 0) currentStep--;
  }
</script>

<div class="min-h-screen bg-white">
  <div class="container mx-auto px-4 py-8">
    <!-- Step indicator -->
    <div class="mb-8">
      <div class="flex items-center justify-between relative">
        {#each [0, 1, 2, 3, 4, 5] as step, i}
          <!-- Removed step 5 -->
          <div class="flex flex-col items-center z-10">
            <div
              class={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= step
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {i + 1}
            </div>
            <div
              class={`mt-2 text-sm font-medium ${
                currentStep >= step ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {step === 0
                ? "Login"
                : step === 1
                  ? "Profil"
                  : step === 2
                    ? "Produk"
                    : step === 3
                      ? "Pengiriman"
                      : step === 4
                        ? "Pembayaran"
                        : "Selesai"}
            </div>
          </div>
          {#if i < 5}
            <!-- Updated from 6 to 5 -->
            <div
              class={`absolute top-5 left-1/2 w-full h-1 -translate-x-1/2 ${
                currentStep > step ? "bg-blue-600" : "bg-gray-300"
              }`}
              style="width: calc(100% / 5); left: calc({(i * 100) / 5}% + 10%)"
            ></div>
          {/if}
        {/each}
      </div>
    </div>

    <div
      class="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 border border-gray-300"
    >
      <!-- Step 0: Login/Phone Input -->
      {#if currentStep === 0}
        <div class="text-center">
          <!-- Logo, App Name and Description -->
          <div class="mb-6">
            {#if settings?.logo}
              <img
                src={settings.logo}
                alt="Logo"
                class="mx-auto h-16 w-auto object-contain mb-4"
              />
            {:else}
              <div
                class="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4"
              >
                <span class="text-gray-500 text-xs">Logo</span>
              </div>
            {/if}

            <h1 class="text-2xl font-bold text-gray-900">
              {settings?.name || "Cetak Aja Online"}
            </h1>

            <p class="text-gray-600 mt-2">
              Hai... Yuk mulai pesan cetakanmu 📦
            </p>
          </div>

          {#if showPasswordForm}
            <!-- Password Form for Existing Customers -->
            <div
              class="bg-white rounded-xl shadow-md p-6 border border-gray-300"
            >
              {#if errorMessage}
                <div class="alert alert-error mt-4 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="stroke-current shrink-0 h-6 w-6 text-red-800"
                    fill="none"
                    viewBox="0 0 24 24"
                    ><path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    /></svg
                  >
                  <span class="text-red-800">{errorMessage}</span>
                </div>
              {/if}

              {#if successMessage}
                <div class="alert alert-success mt-4 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="stroke-current shrink-0 h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    ><path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    /></svg
                  >
                  <span class="text-white">{successMessage}</span>
                </div>
              {/if}
              <div class="mx-auto py-1"></div>
              <div class="form-control w-full">
                <input
                  id="password-input"
                  type="password"
                  class="input input-bordered w-full border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 bg-white text-black"
                  placeholder="Masukkan password"
                  bind:value={customerPassword}
                  disabled={loading}
                />
                <label for="password-input" class="label">
                  <span class="label-text-alt text-gray-500 italic"
                    ><span class="text-red-600"> *</span> Password default adalah
                    nomor whatsapp Anda</span
                  >
                </label>
              </div>

              <div class="flex gap-3 mt-4">
                <button
                  class="btn btn-secondary flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-lg shadow-md transition duration-200"
                  onclick={() => {
                    showPasswordForm = false;
                    successMessage = "";
                    errorMessage = "";
                  }}
                  disabled={loading}
                >
                  Kembali
                </button>
                <button
                  class="btn btn-primary flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg shadow-md transition duration-200"
                  onclick={handlePasswordSubmit}
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Login"}
                </button>
              </div>
            </div>
          {:else}
            <div
              class="bg-white rounded-xl shadow-md p-6 border border-gray-300"
            >
              <p class="text-gray-600 mb-4">
                Masukkan nomor WhatsApp kamu biar kita bisa kirim update pesanan
                nanti.<br /> Tenang, nggak bakal dispam kok 😉
              </p>

              <div class="form-control w-full">
                <input
                  id="phone-input"
                  type="tel"
                  class="input input-bordered w-full border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 bg-white text-black"
                  placeholder="081234567890"
                  bind:value={phone}
                  disabled={loading}
                />
                <label for="phone-input" class="label">
                  <span class="label-text-alt text-gray-500 italic"
                    ><span class="text-red-600"> *</span> Nomor harus diawali dengan
                    08 dan hanya angka tanpa spasi</span
                  >
                </label>
              </div>

              {#if errorMessage}
                <div class="alert alert-error mt-4 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="stroke-current shrink-0 h-6 w-6 text-red-800"
                    fill="none"
                    viewBox="0 0 24 24"
                    ><path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    /></svg
                  >
                  <span class="text-red-800">{errorMessage}</span>
                </div>
              {/if}

              {#if successMessage}
                <div class="alert alert-success mt-4 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="stroke-current shrink-0 h-6 w-6 text-green-800"
                    fill="none"
                    viewBox="0 0 24 24"
                    ><path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    /></svg
                  >
                  <span class="text-green-800">{successMessage}</span>
                </div>
              {/if}

              <button
                class="btn btn-primary w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg shadow-md transition duration-200"
                onclick={handlePhoneSubmit}
                disabled={loading}
              >
                {loading ? "Memproses..." : "Lanjutkan"}
              </button>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Step 1: Customer details -->
      {#if currentStep === 1}
        <div>
          <h2 class="text-2xl font-bold mb-6 text-center text-gray-900">
            Siapa nih yang pesan ? 😄
          </h2>

          <div
            class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4"
          >
            <div class="form-control w-full">
              <label for="customerName" class="label">
                <span class="label-text text-gray-700">Nama</span>
              </label>
              <input
                id="customerName"
                type="text"
                class="input input-bordered w-full border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 bg-white text-black"
                bind:value={editedCustomer.name}
              />
            </div>

            <div class="form-control w-full">
              <label for="customerPhone" class="label">
                <span class="label-text text-gray-700">No WhatsApp</span>
              </label>
              <input
                id="customerPhone"
                type="tel"
                class="input input-bordered w-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-black disabled:bg-white disabled:text-black disabled:border-gray-300"
                bind:value={editedCustomer.phone}
                disabled
              />
            </div>

            <div class="form-control w-full">
              <label for="customerAddress" class="label">
                <span class="label-text text-gray-700">Alamat</span>
              </label>
              <textarea
                id="customerAddress"
                class="textarea textarea-bordered w-full border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 bg-white text-black"
                bind:value={editedCustomer.address}
                placeholder="Masukkan alamat pengiriman"
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="flex justify-between">
            <button
              class="btn btn-secondary bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg shadow transition duration-200"
              onclick={() => {
                prevStep();
                // Sync editedCustomer with customer data when going back
                if (customer) {
                  editedCustomer.name = customer.name || editedCustomer.name;
                  editedCustomer.phone = customer.phone || editedCustomer.phone;
                  editedCustomer.address =
                    customer.address || editedCustomer.address;
                }
              }}
            >
              Kembali
            </button>
            <button
              class="btn btn-success bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg shadow transition duration-200"
              onclick={() => {
                goto("/orders");
              }}
            >
              Cek Pesanan Saya
            </button>
            <button
              class="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow transition duration-200"
              onclick={async () => {
                if (customer) {
                  // Update customer details on the server
                  const updatedData = {
                    name: editedCustomer.name,
                    phone: editedCustomer.phone, // Phone can't be changed in this context
                    address: editedCustomer.address,
                  };

                  try {
                    const res = await fetch(`/api/users/${customer.id}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(updatedData),
                    });

                    if (res.ok) {
                      // Update the customer state with new values
                      customer = {
                        ...customer,
                        name: updatedData.name,
                        phone: updatedData.phone,
                        address: updatedData.address,
                      };

                      // Update the edited customer state to match
                      editedCustomer.name = updatedData.name;
                      editedCustomer.phone = updatedData.phone;
                      editedCustomer.address = updatedData.address;
                    }
                  } catch (error) {
                    console.error("Error updating customer details:", error);
                    // Continue to next step even if update fails, but log the error
                  }
                }
                // Move to next step after attempting update
                currentStep = 2;
              }}
            >
              Lanjutkan
            </button>
          </div>
        </div>
      {/if}

      <!-- Step 2: Product selection -->
      {#if currentStep === 2}
        <div>
          <h2 class="text-2xl font-bold mb-6 text-center text-gray-900">
            Kamu mau cetak apa hari ini ? 🖨️
          </h2>

          <div class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div class="form-control w-full mb-4 homepage-search-select">
              <SearchSelect
                id="newItemProduct"
                bind:value={newItem.productId}
                options={productOptions}
                placeholder="Cari produk..."
                autocomplete="off"
              />
            </div>

            {#if newItem.productId}
              <div class="form-control w-full mb-4">
                <select
                  id="newItemVariant"
                  class="select select-bordered w-full border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 bg-white text-black"
                  bind:value={newItem.variantId}
                  disabled={productVariants.length === 0}
                >
                  {#if productVariants.length > 0}
                    <option value="">Pilih Varian</option>
                    {#each productVariants as variant}
                      <option value={variant.id}
                        >{variant.variantName} - {formatCurrency(
                          variant.price
                        )}</option
                      >
                    {/each}
                  {:else}
                    <option value="">Tidak ada varian</option>
                  {/if}
                </select>
              </div>

              <div class="form-control w-full mb-4">
                <input
                  id="newItemQty"
                  type="number"
                  min="1"
                  class="input input-bordered w-full border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 bg-white text-black"
                  placeholder="Mau berapa pcs ?"
                  bind:value={newItem.qty}
                />
              </div>

              <div class="form-control w-full mb-4">
                <label for="newItemNotes" class="label">
                  <span
                    class="label-text text-gray-700 italic text-md px-1 py-1"
                    >Kirim link file desain kamu (Google Drive, Canva, dll).<br
                    />Kalau belum ada, tulis aja "minta bantu desain" nanti kita
                    chat kamu dulu.</span
                  >
                </label>
                <input
                  id="newItemNotes"
                  type="text"
                  class="input input-bordered w-full border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 bg-white text-black"
                  placeholder="https://drive.google.com/... atau link lainnya"
                  bind:value={newItem.notes}
                />
              </div>

              {#if newItem.productId && ((productVariants.length > 0 && newItem.variantId) || productVariants.length === 0)}
                <div class="overflow-x-auto mb-4">
                  <table class="table table-zebra">
                    <thead>
                      <tr class="bg-gray-100">
                        <th class="text-gray-900 font-semibold">Produk</th>
                        <th class="text-gray-900 font-semibold">Varian</th>
                        <th class="text-gray-900 font-semibold">Link Desain</th>
                        <th class="text-gray-900 font-semibold">Jumlah</th>
                        <th class="text-gray-900 font-semibold">Harga</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="hover:bg-gray-50">
                        <td class="text-gray-800"
                          >{products.find((p) => p.id === newItem.productId)
                            ?.name}</td
                        >
                        <td class="text-gray-800"
                          >{newItem.variantId
                            ? productVariants.find(
                                (v) => v.id === newItem.variantId
                              )?.variantName || "-"
                            : "-"}</td
                        >
                        <td class="text-gray-800">{newItem.notes || "-"}</td>
                        <td class="text-gray-800">{newItem.qty}</td>
                        <td class="text-gray-800"
                          >{formatCurrency(newItem.price)}</td
                        >
                      </tr>
                    </tbody>
                  </table>
                </div>
              {/if}

              <button
                class="btn btn-primary w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 rounded-lg shadow transition duration-200"
                onclick={addItem}
                disabled={!newItem.productId ||
                  newItem.qty <= 0 ||
                  (productVariants.length > 0 && !newItem.variantId)}
              >
                Tambah ke Pesanan
              </button>
            {/if}
          </div>

          <!-- Display added items -->
          {#if orderData.orderItems.length > 0}
            <div class="mb-6">
              <h2 class="text-2xl font-bold mb-2 text-center text-gray-900">
                Cek dulu, jangan sampai salah ya 😄
              </h2>
              <p class="text-md mb-2 text-center text-gray-900 italic">
                Berikut ringkasan pesananmu sebelum lanjut ke pembayaran.
                Pastikan semua data dan jumlahnya sudah sesuai. Kalau ada yang
                mau diubah atau mau tambah pesanan, tinggal tambahkan lagi
                pesanan diatas.
              </p>
              <div class="overflow-x-auto">
                <table class="table table-bordered">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="text-gray-900 font-semibold">Produk</th>
                      <th class="text-gray-900 font-semibold">Varian</th>
                      <th class="text-gray-900 font-semibold">Link Desain</th>
                      <th class="text-gray-900 font-semibold">Jumlah</th>
                      <th class="text-gray-900 font-semibold">Harga</th>
                      <th class="text-gray-900 font-semibold">Subtotal</th>
                      <th class="text-gray-900 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each orderData.orderItems as item, index}
                      <tr class="hover:bg-gray-50">
                        <td class="text-gray-800">{item.product.name}</td>
                        <td class="text-gray-800"
                          >{item.variant?.variantName || "-"}</td
                        >
                        <td class="text-gray-800">
                          {#if item.notes}
                            <a
                              href={item.notes}
                              target="_blank"
                              class="text-blue-600 hover:underline break-all"
                            >
                              Lihat Desain
                            </a>
                          {:else}
                            -
                          {/if}
                        </td>
                        <td class="text-gray-800">{item.qty}</td>
                        <td class="text-gray-800"
                          >{formatCurrency(item.price)}</td
                        >
                        <td class="text-gray-800"
                          >{formatCurrency(item.subtotal)}</td
                        >
                        <td>
                          <button
                            class="btn btn-error btn-sm bg-red-600 hover:bg-red-700 text-white"
                            onclick={() => removeItem(index)}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    {/each}
                    <tr class="font-bold bg-gray-100">
                      <td colspan="5" class="text-right text-gray-900"
                        >Total:</td
                      >
                      <td class="text-gray-900"
                        >{formatCurrency(calculateTotal())}</td
                      >
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          {/if}

          <div class="flex justify-between">
            <button
              class="btn btn-secondary bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg shadow transition duration-200"
              onclick={() => {
                prevStep();
                // Sync editedCustomer with customer data when going back
                if (customer) {
                  editedCustomer.name = customer.name || editedCustomer.name;
                  editedCustomer.phone = customer.phone || editedCustomer.phone;
                  editedCustomer.address =
                    customer.address || editedCustomer.address;
                }
              }}
            >
              Kembali
            </button>
            <button
              class="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow transition duration-200"
              onclick={() => (currentStep = 3)}
              disabled={orderData.orderItems.length === 0}
            >
              Lanjutkan
            </button>
          </div>
        </div>
      {/if}

      <!-- Step 3: Shipping and payment -->
      {#if currentStep === 3}
        <div>
          <h2 class="text-2xl font-bold mb-6 text-center text-gray-900">
            Mau dikirim atau ambil sendiri ? 🚚
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="form-control w-full">
              <label for="shippingMethod" class="label">
                <span class="label-text text-gray-700">Metode Pengiriman</span>
              </label>
              <select
                id="shippingMethod"
                class="select select-bordered w-full border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 bg-white text-black"
                bind:value={orderData.shippingMethod}
              >
                <option value="pickup">Pickup (Ambil Sendiri)</option>
                <option value="delivery">Delivery (Dikirim)</option>
              </select>
            </div>

            <div class="form-control w-full">
              <label for="paymentMethod" class="label">
                <span class="label-text text-gray-700">Metode Pembayaran</span>
              </label>
              <select
                id="paymentMethod"
                class="select select-bordered w-full border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 bg-white text-black"
                bind:value={orderData.paymentMethod}
              >
                {#each paymentOptions as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
            </div>

            <div class="form-control w-full md:col-span-2">
              <label for="orderNotes" class="label">
                <span class="label-text text-gray-700">Catatan (Opsional)</span>
              </label>
              <textarea
                id="orderNotes"
                class="textarea textarea-bordered w-full border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 bg-white text-black"
                bind:value={orderData.notes}
                placeholder="Isi catatan jika ada yang perlu disampaikan ke kita yah..."
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="flex justify-between">
            <button
              class="btn btn-secondary bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg shadow transition duration-200"
              onclick={() => {
                prevStep();
                // Sync editedCustomer with customer data when going back
                if (customer) {
                  editedCustomer.name = customer.name || editedCustomer.name;
                  editedCustomer.phone = customer.phone || editedCustomer.phone;
                  editedCustomer.address =
                    customer.address || editedCustomer.address;
                }
              }}
            >
              Kembali
            </button>
            <button
              class="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow transition duration-200"
              onclick={handleSubmitOrder}
              disabled={loading || orderData.orderItems.length === 0}
            >
              {loading ? "Memproses..." : "Lanjutkan"}
            </button>
          </div>
        </div>
      {/if}

      <!-- Step 4: Payment instructions -->
      {#if currentStep === 4}
        <div>
          <h2 class="text-2xl font-bold mb-6 text-center text-gray-900">
            Saatnya bayar dulu 💸
          </h2>

          {#if orderData.paymentMethod === "cash"}
            <!-- Cash Payment Instructions -->
            <div
              class="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
            >
              <h2 class="text-lg font-semibold mb-2 text-gray-900">
                Bayar langsung ketika barang diambil, gampang banget 😎
              </h2>
              <p class="text-gray-800">
                Kamu bisa bayar tunai sejumlah <span
                  class="font-bold text-green-600"
                  >{formatCurrency(getAmountToPay())}</span
                >
                ketika mengambil hasil cetakanmu nanti. Cukup tunjukkan
                <span class="font-bold text-blue-600"
                  >ID Pesanan : {orderDetails?.orderNumber}</span
                > ke kita biar prosesnya lebih cepat.
              </p>
            </div>
          {:else if orderData.paymentMethod === "qris"}
            <!-- QRIS Payment Instructions -->
            <div
              class="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
            >
              <h2 class="text-lg font-semibold mb-2 text-gray-900">
                Bayar cepat pakai QRIS 🚀
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="p-3 bg-white rounded-lg border border-gray-300">
                  <p class="text-sm text-gray-600">ID Pesanan</p>
                  <p class="font-bold text-lg text-blue-600">
                    {orderDetails?.orderNumber}
                  </p>
                </div>
                <div class="p-3 bg-white rounded-lg border border-gray-300">
                  <p class="text-sm text-gray-600">Jumlah Pembayaran</p>
                  <p class="font-bold text-lg text-green-600">
                    {formatCurrency(getAmountToPay())}
                  </p>
                </div>
              </div>
              <p class="text-gray-800 text-center mb-4">
                Scan kode QR di bawah ini pakai aplikasi bank atau e-wallet
                kesayanganmu (Gopay, DANA, ShopeePay, OVO, dll).
              </p>
            </div>

            <div class="mb-6 flex flex-col items-center">
              {#if settings?.qrisImage}
                <img
                  src={settings.qrisImage}
                  alt="QRIS Pembayaran"
                  class="w-128 h-128 object-contain rounded-lg"
                />
              {:else}
                <div
                  class="w-64 h-64 flex items-center justify-center bg-gray-100 border-4 border-gray-300 rounded-lg"
                >
                  <span class="text-gray-500">QRIS belum diatur</span>
                </div>
              {/if}
              <p class="mt-4 text-center font-semibold text-lg text-gray-900">
                {formatCurrency(getAmountToPay())}
              </p>
              <p class="text-gray-800 italic text-sm mt-2 text-center">
                Setelah pembayaran berhasil, jangan lupa upload bukti screenshot
                pembayaran biar langsung kami proses 🙌
              </p>
            </div>

            <!-- Upload Bukti Pembayaran Section for QRIS -->
            <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div class="mb-4">
                <label
                  class="label font-medium py-2 text-gray-700"
                  for="paymentProofInput">Upload Bukti Pembayaran</label
                >
                <input
                  id="paymentProofInput"
                  type="file"
                  accept="image/*,.pdf"
                  onchange={handlePaymentProofChange}
                  class="file-input file-input-bordered w-full border-gray-300 focus:border-blue-600 bg-white text-black"
                />

                {#if paymentProofPreview}
                  <div class="mt-4">
                    {#if paymentProofFile?.type.startsWith("image/")}
                      <img
                        src={paymentProofPreview}
                        alt="Preview Bukti Pembayaran"
                        class="max-w-full h-64 object-contain border rounded border-gray-300"
                      />
                    {:else}
                      <div
                        class="p-4 bg-gray-100 rounded border border-gray-300"
                      >
                        <span class="text-gray-800"
                          >File : {paymentProofFile?.name}</span
                        >
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>

              {#if errorMessage}
                <div class="alert alert-error mb-4 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="stroke-current shrink-0 h-6 w-6 text-red-800"
                    fill="none"
                    viewBox="0 0 24 24"
                    ><path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    /></svg
                  >
                  <span class="text-red-800">{errorMessage}</span>
                </div>
              {/if}

              <div class="flex justify-end">
                <button
                  class="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow transition duration-200"
                  onclick={handlePaymentProofUpload}
                  disabled={loading || !paymentProofFile}
                >
                  {loading ? "Mengunggah..." : "Unggah Bukti Pembayaran"}
                </button>
              </div>
            </div>
          {:else if orderData.paymentMethod === "transfer"}
            <!-- Bank Transfer Instructions -->
            <div
              class="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
            >
              <h2 class="text-lg font-semibold mb-2 text-gray-900 text-center">
                Transfer dulu, nanti langsung kita proses 💪
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="p-3 bg-white rounded-lg border border-gray-300">
                  <p class="text-sm text-gray-600">ID Pesanan</p>
                  <p class="font-bold text-lg text-blue-600">
                    {orderDetails?.orderNumber}
                  </p>
                </div>
                <div class="p-3 bg-white rounded-lg border border-gray-300">
                  <p class="text-sm text-gray-600">Jumlah Pembayaran</p>
                  <p class="font-bold text-lg text-green-600">
                    {formatCurrency(getAmountToPay())}
                  </p>
                </div>
              </div>
              <div class="p-4 bg-white rounded-lg border border-gray-300">
                <h3 class="font-semibold text-gray-700 mb-3 text-center">
                  Informasi Pembayaran
                </h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-600">Bank</p>
                    <p class="font-bold text-lg text-gray-900">
                      {settings?.bankName || "Bank Belum Diatur"}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Kode Bank</p>
                    <p class="font-bold text-lg text-gray-900">
                      {settings?.bankCode || "Kode Belum Diatur"}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Nomor Rekening</p>
                    <p class="font-bold text-lg text-gray-900">
                      {settings?.bankAccountNumber || "Nomor Belum Diatur"}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Atas Nama</p>
                    <p class="font-bold text-lg text-gray-900">
                      {settings?.bankAccountName || "Atas Nama Belum Diatur"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Upload Bukti Pembayaran Section for Transfer -->
            <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div class="mb-4">
                <label
                  class="label font-medium py-2 text-gray-700"
                  for="paymentProofInput">Upload Bukti Pembayaran</label
                >
                <input
                  id="paymentProofInput"
                  type="file"
                  accept="image/*,.pdf"
                  onchange={handlePaymentProofChange}
                  class="file-input file-input-bordered w-full border-gray-300 focus:border-blue-600 bg-white text-black"
                />

                {#if paymentProofPreview}
                  <div class="mt-4">
                    {#if paymentProofFile?.type.startsWith("image/")}
                      <img
                        src={paymentProofPreview}
                        alt="Preview Bukti Pembayaran"
                        class="max-w-full h-64 object-contain border rounded border-gray-300"
                      />
                    {:else}
                      <div
                        class="p-4 bg-gray-100 rounded border border-gray-300"
                      >
                        <span class="text-gray-800"
                          >File : {paymentProofFile?.name}</span
                        >
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>

              {#if errorMessage}
                <div class="alert alert-error mb-4 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="stroke-current shrink-0 h-6 w-6 text-red-800"
                    fill="none"
                    viewBox="0 0 24 24"
                    ><path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    /></svg
                  >
                  <span class="text-red-800">{errorMessage}</span>
                </div>
              {/if}

              <div class="flex justify-end">
                <button
                  class="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow transition duration-200"
                  onclick={handlePaymentProofUpload}
                  disabled={loading || !paymentProofFile}
                >
                  {loading ? "Mengunggah..." : "Unggah Bukti Pembayaran"}
                </button>
              </div>
            </div>
          {/if}

          <div class="flex justify-between">
            <button
              class="btn btn-secondary bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg shadow transition duration-200"
              onclick={() => {
                prevStep();
                // Sync editedCustomer with customer data when going back
                if (customer) {
                  editedCustomer.name = customer.name || editedCustomer.name;
                  editedCustomer.phone = customer.phone || editedCustomer.phone;
                  editedCustomer.address =
                    customer.address || editedCustomer.address;
                }
              }}
            >
              Kembali
            </button>
            <button
              class="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow transition duration-200"
              onclick={() => (currentStep = 5)}
            >
              Lanjutkan
            </button>
          </div>
        </div>
      {/if}

      <!-- Step 5: Success message -->
      {#if currentStep === 5}
        <div class="text-center py-12">
          <div class="mb-8">
            <svg
              class="w-24 h-24 text-green-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>

          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Terima kasih! 🙏
          </h2>
          <div class="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p class="text-gray-800 mb-2">
              Kami sedang memverifikasi pembayaranmu. Begitu dikonfirmasi, kamu
              bisa langsung pantau progres pesanan dengan <span
                class="font-bold text-blue-600"
                >ID Pesanan : {orderDetails?.orderNumber}</span
              >
              di halaman "Lacak Pesanan".
            </p>
          </div>

          <button
            class="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow transition duration-200 text-lg"
            onclick={() => goto("/orders")}
          >
            Lacak Pesanan
          </button>
        </div>
      {/if}
    </div>
  </div>

  <style>
    /* Specific styling for SearchSelect on homepage to override DaisyUI defaults */
    .homepage-search-select input {
      background-color: white !important;
      color: black !important;
    }

    /* Style the dropdown options */
    .homepage-search-select .bg-base-100 {
      background-color: white !important;
    }

    /* Style the text in dropdown options */
    .homepage-search-select .text-base-content {
      color: black !important;
    }

    /* Style hover state for options */
    .homepage-search-select .hover\:bg-base-200:hover {
      background-color: #f3f4f6 !important; /* gray-100 equivalent */
    }

    /* Style focused option */
    .homepage-search-select .bg-base-300 {
      background-color: #e5e7eb !important; /* gray-200 equivalent */
    }
  </style>
</div>
