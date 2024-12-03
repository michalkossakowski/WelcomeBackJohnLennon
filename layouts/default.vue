<template>
    <div class="full-width-container">
        <header class="text-center">
            <h1>Welcome back John Lennon</h1>
        </header>

        <main class="main-container">
            <div class="sidebar" v-if="user">
                <UVerticalNavigation :links="links"/>
            </div>
            <div class="content">
                <NuxtPage />
            </div>
        </main>

        <footer>
            @2024 Made by Weryk Kosak and Krzyś special thanks to Billie Eilish
        </footer>
    </div>
</template>

    
<script setup lang="ts">
    import avatarImage from './public/assets/avatar.jpg';
    import { ref, computed, onMounted } from 'vue'
    import type { User } from '~/models/userModel'
    import { useRouter } from 'vue-router'

    const router = useRouter()
    const user = ref<User | null>(null)

    const fetchUser = async () => {
        try {
            const response = await $fetch('/api/users/get', { method: 'GET' })
            nextTick(() => {
                if(!user.value){
                    router.push('/login');
                }
            })
            user.value = response.user
        } catch (error) {
            user.value = null
        }
    }

    onMounted(() => {
        fetchUser()
    })

    const links = computed(() => {
            return [
                [
                    {
                        label: user.value?.username || "Guest",
                        avatar: { src: avatarImage },
                        to: '/profile'
                    }
                ],
                [
                    { label: 'Home', icon: 'i-heroicons-home', to: '/' },
                    { label: 'Servers', icon: 'i-heroicons-server', to: '/servers' },
                    { label: 'Channels', icon: 'i-heroicons-user-group', to: '/channels' },
                    { label: 'Messages', icon: 'i-heroicons-envelope', to: '/messages' },
                    { label: 'Video', icon: 'i-heroicons-video-camera', to: '/video' },
                ]
            ];
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

    .content{
        padding: 10px;
        width: 100%;
        
    }

    footer {
        padding: 10px;
        text-align: center;
    }
</style>    