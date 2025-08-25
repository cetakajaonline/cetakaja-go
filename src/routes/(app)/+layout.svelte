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
	  { href: "/items", label: "Items", icon: "📦" },
	  { href: "/users", label: "Users", icon: "👤" },
	  { href: "/token", label: "API Keys", icon: "🔑" },
	  { href: "/settings", label: "Settings", icon: "⚙️" },
	];
  
	function isActive(path: string) {
	  return currentPath === path || currentPath.startsWith(path + "/");
	}
</script>

<svelte:head>
	<title>{data?.setting?.name || "App"}</title>
	<meta name="description" content={data?.setting?.description || "Aplikasi"} />
</svelte:head>

<!-- NAVBAR -->
<nav class="navbar bg-base-100 shadow px-4 backdrop-blur-sm border-b border-base-300/60">
	<div class="navbar-start">
		<!-- Mobile Dropdown -->
		<div class="dropdown sm:hidden">
			<button type="button" class="btn btn-ghost btn-square" aria-label="Menu">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
					viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>
			<ul class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
				{#each menuItems as item}
					<li>
						<a href={item.href} class:selected={isActive(item.href)}>
							<span>{item.icon}</span>{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Logo -->
		<a href="/" class="btn btn-ghost normal-case text-lg flex items-center gap-2">
			{#if data?.setting?.logo}
				<img src={data.setting.logo} alt="Logo" class="h-6 w-auto" />
			{/if}
			<span>{data?.setting?.name || "Nama Aplikasi"}</span>
		</a>
	</div>

	<!-- Desktop Menu -->
	<div class="navbar-center hidden sm:flex">
		<ul class="menu menu-horizontal gap-1 px-1">
			{#each menuItems as item}
				<li>
					<a href={item.href}
						class="flex items-center gap-2 px-3 py-2 rounded-md transition"
						class:bg-primary={isActive(item.href)}
						class:text-white={isActive(item.href)}>
						<span>{item.icon}</span>{item.label}
					</a>
				</li>
			{/each}
		</ul>
	</div>

	<!-- Right Side -->
	<div class="navbar-end">
		<!-- Theme switch -->
		<label class="flex cursor-pointer gap-2 px-6">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
				fill="none" stroke="currentColor" stroke-width="2"
				stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="5" />
				<path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
			</svg>
			<input type="checkbox" value="dracula" class="toggle theme-controller" aria-label="Toggle dark mode" />
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
				fill="none" stroke="currentColor" stroke-width="2"
				stroke-linecap="round" stroke-linejoin="round">
				<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
			</svg>
		</label>

		<!-- Auth -->
		{#if data.user}
			<a href="/logout" class="btn btn-outline btn-sm hidden sm:inline-flex">
				Logout
			</a>
		{:else}
			<a href="/login" class="btn btn-outline btn-sm hidden sm:inline-flex">
				Login
			</a>
		{/if}

		<!-- Mobile auth icon -->
		<a href={data.user ? "/logout" : "/login"} 
			class="btn btn-ghost btn-sm sm:hidden" 
			aria-label={data.user ? "Logout" : "Login"}>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
				viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
					d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5" />
			</svg>
		</a>
	</div>
</nav>

<!-- MAIN CONTENT -->
<main class="w-full min-h-screen bg-base-100 py-2 px-4">
	<div class="w-full">
		<div class="bg-base-100 dark:bg-base-200 rounded-2xl shadow-lg p-1">
			<slot />
		</div>
	</div>
</main>
