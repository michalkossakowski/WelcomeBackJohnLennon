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
            @2024 Made by Weryk, Krzyś and Kosak special thanks to Billie Eilish
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
            cancel-button-color="red"
            action-button-text="Answer"
            action-button-color="green"
            @cancel="DeclineCall(callerID)"
            @action="AnswerCall(callerID)"
            class="center-content"
        >
            <div class="content-wrapper">
                <img :src="callModalImage" alt="avatar" class="avatar">
                <p class="call-description"><b class="user-name">{{ callModalDescription }}</b> is calling you</p>
            </div>
    </ScreenPopUp>
    <audio ref="ringtone" id="ringtone" src="/assets/ringtone.mp3" loop allow="autoplay"></audio>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { User } from '~/models/userModel';

const router = useRouter();
const user = ref<User | null>(null);
const toast = useToast()
const isLoading = ref(true);
const config = useRuntimeConfig();

const showCallModal = ref(false); 
const callerID = ref('');
const callModalDescription = ref(''); 
const callModalImage = ref('');
const ringtone = ref<HTMLAudioElement | null>(null);


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

const setupWebSocket = async () => {
    const socket = new WebSocket(`${config.public.wsUrl}?userId=${user.value?.id}`);

    socket.onmessage = async (event) => {
        const {title,message,from} = JSON.parse(event.data);
        if(title === 'Incoming call'){
            await getUserBasic(message).then((userBasic) => {
                if(userBasic){
                    callerID.value = userBasic.id;
                    callModalDescription.value = `${userBasic.username}`;
                    callModalImage.value = userBasic.avatar;
                    showCallModal.value = true;
                    ringtone.value?.play();
                    
                }
            });
            
        }else if(title === 'Cancel call' ){
            toast.add({ title: 'Call request ended', description: 'The call request has ended' });
            showCallModal.value = false;
            if(ringtone.value){
                ringtone.value.pause();
                ringtone.value.currentTime = 0;
            }
        }
        else if(title === 'Call response'){
            toast.add({ title: title, description: message});
            console.log(message)
            if(message === 'declined')
            {
                console.log('Call declined');
                router.push('/');
            }
            if(message === 'accept' && from)
            {
                console.log('Call accepted');
                router.push(`/videoChat/${user.value?.id}/${from}`);
            }
        }else{
            toast.add({ 
                title: title, 
                description: message,
                actions: [{
                    to: from,
                    label: 'Go to message',  
                }],
            });
        }
        
    };
};

const AnswerCall = async (friendID: string) => {
    if(ringtone.value){
        ringtone.value.pause();
        ringtone.value.currentTime = 0;
    }
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
    }).then(async response => {
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
    if(ringtone.value){
        ringtone.value.pause();
        ringtone.value.currentTime = 0;
    }
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
const getUserBasic = async (userId: string) => {
    try {
        const response = await $fetch(`/api/users/${userId}/getUserBasic`, { method: 'GET' });
        if ('status' in response && response.status === 'success') {
            return response.userBasic;
        }        
    } catch (error) {
        return null;
    }
};
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
.avatar{
    width: 160px;
    height: 160px;
    margin-right: 50px;
    border-radius: 50%;
}
.center-content {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.content-wrapper {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
}
.call-description {
    font-size: 24px;
}
.user-name {
    color: #4ade80;
}
</style>
