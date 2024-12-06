<template>
    <div class="full-width-container">
        <header class="text-center">
            <h1>Welcome back {{ user?.username }}</h1>
        </header>

        <main class="main-container">
            <div class="sidebar" v-if="user">
                <UVerticalNavigation :links="links" />
            </div>
            <div class="content">
                <NuxtPage />
            </div>
        </main>

        <footer>
            @2024 Made by Weryk Kosak and Krzyś special thanks to Billie Eilish
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
const newMessage = ref<{ content: string, channelId: string } | null>(null); // stan dla powiadomień o wiadomościach
const toast = useToast()


const fetchUser = async () => {
    try {
        const response = await $fetch('/api/users/get', { method: 'GET' });
        user.value = response.user;
        if (!user.value) {
            router.push('/login');
        }
    } catch (error) {
        user.value = null;
    }
};

const setupWebSocket = () => {
    const socket = new WebSocket('ws://localhost:3001');

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        newMessage.value = {
            content: message.content,
            channelId: message.channelId,
        };
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

let lastMessageContent: string | null = null; 

watchEffect(() => {
    if (newMessage.value && newMessage.value.content !== lastMessageContent) {
        toast.clear();  
        toast.add({ title: `New Message: ${newMessage.value.content}` });
        lastMessageContent = newMessage.value.content;
    }
});

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

.sidebar {
    width: 200px;
    padding: 5px;
    height: 5%;
    position: sticky;
    top: 0;
}

.content {
    padding: 10px;
    width: 100%;
}

footer {
    padding: 10px;
    text-align: center;
}
</style>
