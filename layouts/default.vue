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
    <ScreenPopUp
            v-model="showCallModal"
            prevent-close
            title="Calling"
            :description="callModalDescription"
            show-cancel-button
            cancel-button-text="Decline"
            action-button-text="Answer"
            action-button-color="green"
            @cancel="DeclineCall(callModalDescription)"
            @action="AnswerCall(callModalDescription)"
        >
            <p>{{ callModalDescription }}</p>
    </ScreenPopUp>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import avatarImage from './public/assets/avatar.jpg';
import type { User, UserBasics } from '~/models/userModel';

const router = useRouter();
const user = ref<User | null>(null);
const toast = useToast()
const isLoading = ref(true);
const config = useRuntimeConfig();

const showCallModal = ref(false); 
const callModalDescription = ref(''); 

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
        isLoading.value = false;
        if(user.value){
            setupWebSocket();
        }
    }
};

const setupWebSocket = () => {
    const socket = new WebSocket(`${config.public.wsUrl}?userId=${user.value?.id}`);
    socket.onmessage = (event) => {
        const {title,message} = JSON.parse(event.data);
        if(title === 'Incoming call'){
            callModalDescription.value = message;
            showCallModal.value = true;
        }else if(title === 'Call response'){
            toast.add({ title: title, description: message});
            console.log(message)
            if(message === 'declined')
            {
                console.log('Call declined');
                router.push('/');
            }
        }else{
            toast.add({ title: title, description: message});
        }
        
    };
};

const AnswerCall = async (friendID: string) => {
    console.log(`Video Ja: ${user.value?.id} Ziomo: ${friendID}`);
    await $fetch('/api/video/response', {
        method: 'POST',
        body: JSON.stringify({
            from: user.value?.id,
            to: friendID,
            response: 'accept'
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(response => {
        console.log(response);
        if (response.status === 'error') {
            console.error('Error with starting call:', response.message);
            return;
        }
        showCallModal.value = false;
        router.push(`/videoChat/${friendID}/${user.value?.id}`);
    }).catch(err => {
        console.error('Error with starting call:', err);
    });
};
const DeclineCall = async (friendID: string) => {
    console.log(`Video Ja: ${user.value?.id} Ziomo: ${friendID}`);
    await $fetch('/api/video/response', {
        method: 'POST',
        body: JSON.stringify({
            from: user.value?.id,
            to: friendID,
            response: 'declined'
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(response => {
        console.log(response);
        if (response.status === 'error') {
            console.error('Error with starting call:', response.message);
            return;
        }
        showCallModal.value = false;
    }).catch(err => {
        console.error('Error with starting call:', err);
    });
};

const links = computed(() => {
    return [
        [
            {
                label: user.value?.username || 'Guest',
                avatar: { src: user.value?.avatar },
                to: '/profile',
            },
        ],
        [
            { label: 'Home', icon: 'i-heroicons-home', to: '/' },
            { label: 'My Servers', icon: 'i-heroicons-server', to: '/my-servers' },
            { label: 'Explore Servers', icon: 'i-heroicons-server-stack', to: '/servers' },
            { label: 'Friends', icon: 'i-heroicons-user-group', to: '/friends' },
            { label: 'Private Messages', icon: 'i-heroicons-envelope', to: '/chats' },
            { label: 'Help', icon: 'i-heroicons-question-mark-circle', to: '/help' },
            { label: 'Video', icon: 'i-heroicons-video-camera', to: '/video' },
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
    max-width: 170px;
    min-width: 170px;
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
