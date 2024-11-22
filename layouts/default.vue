<template>
    <div class="full-width-container">
        <h1 class="text-center">Welcome back John Lennon</h1>

        <main class="mt-2 d-flex">
        <nav class="nav flex-column me-4">
            <NuxtLink
            to="/"
            class="btn btn-success mb-2"
            :class="{ active: $route.path === '/' }"
            >
            Home
            </NuxtLink>

            <NuxtLink
            to="/servers"
            class="btn btn-success mb-2"
            :class="{ active: $route.path === '/servers' }"
            >
            Servers
            </NuxtLink>

            <NuxtLink
            to="/channels"
            class="btn btn-success mb-2"
            :class="{ active: $route.path === '/channels' }"
            >
            Channels
            </NuxtLink>

            <NuxtLink
            to="/messages"
            class="btn btn-success"
            :class="{ active: $route.path === '/messages' }"
            >
            Messages
            </NuxtLink>
        </nav>

        <div>
            <NuxtPage />
        </div>

        <div class="custom-container d-flex justify-content-end">
            <div class="to-right">
                <h1>USER</h1>
            </div>
        </div>
            

        </main>
    </div>
</template>

<style scoped>
.to-right {
    position: absolute;
    right: 1vw;
}
</style>