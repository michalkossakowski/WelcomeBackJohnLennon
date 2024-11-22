<template>
  <div class="container mt-4">
    <h1 class="text-center mb-4">Welcome back John Lennon</h1>

    <main class="mt-4 d-flex justify-content-start align-items-start">

      <nav class="nav flex-column me-4">
        <RouterLink
          to="/"
          class="btn btn-success"
          :class="{ active: $route.path === '/' }"
        >
          Home
        </RouterLink>

        <RouterLink
          to="/servers"
          class="btn btn-success"
          :class="{ active: $route.path === '/servers' }"
        >
          Servers
        </RouterLink>

        <RouterLink
          to="/channels"
          class="btn btn-success"
          :class="{ active: $route.path === '/channels' }"
        >
          Channels
        </RouterLink>

        <RouterLink
          to="/messages"
          class="btn btn-success"
          :class="{ active: $route.path === '/messages' }"
        >
          Messages
        </RouterLink>
      </nav>


      <div>

        <RouterView />

        <p>
          <strong>Current route path:</strong> {{ $route.fullPath }}
        </p>

      </div>
    </main>
  </div>
</template>