<template>
    <div class="full-width-container">
        <header class="text-center">
            <h1>Welcome back John Lennon Communication App</h1>
        </header>

        <div v-if="isLoading" class="loaderBox">
            <h1>Loading ...</h1>
            <UProgress  class="loader" animation="carousel" />
        </div>
        
        <main v-else-if="user" class="main-container">
            <div class="sidebar">
                    <UVerticalNavigation :links="links" />
                    <UButton class="logoutButton" @click="logout">Log Out</UButton>
            </div>
            <div class="content">
                <NuxtPage />
            </div>
        </main>

        <div v-else>
            <Login/>
        </div>

        <footer>
            @2024 Made by Weryk and Kosak special thanks to Billie Eilish
        </footer>

        <UNotifications />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import avatarImage from './public/assets/avatar.jpg';
import type { User } from '~/models/userModel';

const router = useRouter();
const user = ref<User | null>(null);
const toast = useToast()
const isLoading = ref(true);

const fetchUser = async () => {
    try {
        const response = await $fetch('/api/users/get', { method: 'GET' });
        user.value = response.user;
        if (!user.value) {
            return;
        }
    } catch (error) {
        user.value = null;
    } finally {
        isLoading.value = false; // Set isLoading to false once the request completes
    }
};

const setupWebSocket = () => {
    const socket = new WebSocket('ws://localhost:3001');
    //const socket = new WebSocket('https://<adrestunelu>/');
    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        toast.add({ title: `New Message: ${message.content}`,description: `Channel: ${message.channelId}`});
    };
};

const links = computed(() => {
    return [
        [
            {
                label: user.value?.username || 'Guest',
                avatar: { src: avatarImage },
                to: '/profile',
            },
        ],
        [
            { label: 'Home', icon: 'i-heroicons-home', to: '/' },
            { label: 'Servers', icon: 'i-heroicons-server', to: '/servers' },
            { label: 'Messages', icon: 'i-heroicons-envelope', to: '/messages' },
            { label: 'Messages2', icon: 'i-heroicons-envelope', to: '/messages2' },
            { label: 'Video', icon: 'i-heroicons-video-camera', to: '/video' },
            { label: 'Friends', icon: 'i-heroicons-user-group', to: '/friends' },
        ],
    ];
});

const logout = async () => {
    isLoading.value = true;
    try {
        const response = await $fetch('/api/auth/logout', {
            method: 'POST'
        })
        if (response.statusCode === 200) {
            window.location.reload();
        }
        else {
            console.error('Logout failed')
        }
    }
    catch (error) {
        console.error('Error during logout', error)
    }
}

onMounted(() => {
    fetchUser();
    setupWebSocket();
});
</script>

<style scoped>
.full-width-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

header {
    background-color: #1f2937;
    padding: 5px;
    font-size: 20px;
    text-align: center;
}

.main-container {
    display: flex;
    flex: 1;
}

.logoutButton{
    margin: 5px;
    text-align: center;
}
.sidebar {
    max-width: 200px;
    min-width: 200px;
    padding: 5px;
    height: 0;
    position: sticky;
    top: 0;
    text-align: center;
}

.content {
    flex-grow: 1; 
    padding: 5px 20px;
    overflow-y: auto;
}

.loaderBox {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: center;
    align-items: center;
}

.loader{
    width: 200px;
    text-align: center;
    justify-content: center;
    align-items: center;
}

footer {
    padding: 10px;
    text-align: center;
    margin-top: auto;
    margin-bottom: 10px;
}
</style>
