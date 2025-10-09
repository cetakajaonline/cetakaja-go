<script lang="ts">
  import { page } from "$app/stores";
  import { setting } from "$lib/stores/setting";

  export let data;
  $: currentPath = $page.url.pathname;

  // Update store ketika setting berubah
  $: if (data?.setting) {
    setting.set(data.setting);
  }

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/users", label: "Users", icon: "👤" },
    { href: "/categories", label: "Categories", icon: "🏷️" },
    { href: "/products", label: "Products", icon: "📦" },
    { href: "/orders", label: "Orders", icon: "📝" },
    { href: "/expenses", label: "Expenses", icon: "💰" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ];

  let showMobileMenu = false;
</script>

<nav
  class="navbar bg-base-100 shadow px-4 backdrop-blur-sm border-b border-base-300/60 relative z-50"
>
  <div class="navbar-start">
    <!-- Mobile Menu Toggle -->
    <button
      class="btn btn-ghost btn-square sm:hidden"
      on:click={() => (showMobileMenu = !showMobileMenu)}
      aria-label="Toggle menu"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>

    <!-- Logo -->
    <a
      href="/dashboard"
      class="btn btn-ghost normal-case text-lg flex items-center gap-2"
    >
      {#if data?.setting?.logo}
        <img src={data?.setting?.logo} alt="Logo" class="h-6 w-auto" />
      {/if}
      <span>{data?.setting?.name || "Nama Aplikasi"}</span>
    </a>
  </div>

  <!-- Desktop Menu -->
  <div class="navbar-center hidden sm:flex">
    <ul class="menu menu-horizontal gap-1 px-1">
      {#each menuItems as item}
        <li>
          <a
            href={item.href}
            class="flex items-center gap-2 px-3 py-2 rounded-md transition"
            class:bg-primary={currentPath === item.href ||
              currentPath.startsWith(item.href + "/")}
            class:text-white={currentPath === item.href ||
              currentPath.startsWith(item.href + "/")}
          >
            <span>{item.icon}</span>
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
  </div>

  <!-- Theme and Auth Buttons -->
  <div class="navbar-end">
    <label class="flex cursor-pointer items-center gap-2 px-6">
      <!-- Light Icon -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <path
          d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
        />
      </svg>

      <!-- Theme toggle -->
      <input type="checkbox" value="dracula" class="toggle theme-controller" />

      <!-- Dark Icon -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </label>

    {#if data.user}
      <a
        href="/logout"
        class="btn btn-outline btn-error btn-sm hidden sm:inline-flex">Logout</a
      >
    {:else}
      <a
        href="/login"
        class="btn btn-outline btn-success btn-sm hidden sm:inline-flex"
        >Login</a
      >
    {/if}
  </div>
</nav>

<!-- Mobile Dropdown Fullscreen -->
{#if showMobileMenu}
  <div
    class="fixed top-0 left-0 w-full h-full bg-base-100 z-40 px-4 py-6 overflow-auto shadow-lg backdrop-blur-md"
  >
    <div class="flex justify-between items-center mb-6">
      <span class="text-lg font-bold">{data?.appName || "Menu"}</span>
      <button
        class="btn btn-sm btn-ghost"
        on:click={() => (showMobileMenu = false)}>✕</button
      >
    </div>
    {#each menuItems as item}
      <div class="flex justify-between items-center p-2">
        <a
          href={item.href}
          on:click={() => (showMobileMenu = false)}
          class="btn btn-block rounded-md transition font-medium"
          class:bg-primary={currentPath === item.href ||
            currentPath.startsWith(item.href + "/")}
          class:text-white={currentPath === item.href ||
            currentPath.startsWith(item.href + "/")}
        >
          <span class="text-xl">{item.icon}</span>
          {item.label}
        </a>
      </div>
    {/each}

    <div class="flex justify-between items-center p-2">
      {#if data.user}
        <a href="/logout" class="btn btn-outline btn-error btn-block">Logout</a>
      {:else}
        <a href="/login" class="btn btn-outline btn-success btn-block">Login</a>
      {/if}
    </div>
  </div>
{/if}

<!-- Page content -->
<main class="w-full min-h-screen bg-base-100 py-2 px-4 relative z-0">
  <div class="w-full">
    <div class="bg-base-100 dark:bg-base-200 rounded-2xl shadow-lg p-1">
      <slot />
    </div>
  </div>
</main>
