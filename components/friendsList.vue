<template>
    <div class="friends-container">
        <div class="header flex justify-between items-center mb-4">
            <h1 class="title">Friends</h1>
            <AddFriend :userId="user?.id" @friendAdded="handleFriendAdded" />
        </div>
        <div class="search-container">
            <UInput icon="i-heroicons-magnifying-glass-20-solid" size="sm" color="white" :trailing="false"
                v-model="searchFriend" type="text" placeholder="Search by username ..." class="search-input" />
        </div>
        <div v-if="isLoading" class="loaderBox">
            <h1>Loading ...</h1>
            <UProgress  class="loader" animation="carousel" />
        </div>
        <div v-else class="friends-list">
            <UAlert v-if="filteredFriends.length == 0"
                icon="i-heroicons-face-frown"
                color="primary"
                variant="solid"
                title="We are very sorry"
                :description='alertMessage'
            />
            <UCard v-for="friend in filteredFriends" :key="friend.id" class="friend-card">
                <template #header>
                    <div class="header-content">
                        <UAvatar :src="friend.avatar" class="friend-icon" size="sm"/>                       

                        <div class="username" :title="friend.username">{{ friend.username }}</div>
                        <div class="buttons">
                            <button @click="openChatWith(friend)">
                                <UIcon class="icon w-5 h-5" name="i-heroicons-chat-bubble-left-right"/>
                            </button>
                            <button  @click="startCall(friend)">
                                <UIcon class="icon w-5 h-5" name="i-heroicons-video-camera"/>
                            </button>
                        </div>

                    </div>
                </template>
            </UCard>
        </div>
    </div>
    <ScreenPopUp 
            v-model="showCallModal"
            prevent-close
            title="Calling" 
            :description="'calling'"
            action-button-text="Cancel"
            action-button-color="red"
            @action="CancelCall(caleeId)"
            class="center-content"
        >
            <div class="content-wrapper">
                <img :src="callModalImage" alt="avatar" class="avatar">
                <p class="call-description">Calling: <b class="user-name">{{ callModalDescription }}</b></p>
            </div>
    </ScreenPopUp>
    <audio ref="callingSound" id="ringtone" src="/assets/calling.mp3" loop allow="autoplay"></audio>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import type { User, UserBasics } from '~/models/userModel'
import { useRouter } from 'vue-router';
import { Message } from '~/models/messageModel';

const showCallModal = ref(false);
const router = useRouter();
const user = ref<User | undefined>(undefined)
const friends = ref<UserBasics[]>([]);
const searchFriend = ref<string>('');
const isLoading = ref(true);
const selectedFriend = ref<UserBasics | null>(null);
const caleeId = ref<string>('');
const toast = useToast();
const callingSound = ref<HTMLAudioElement | null>(null);

const callModalImage = ref('');
const callModalDescription = ref('');

const fetchUser = async () => {
    try {
        const response = await $fetch('/api/users/get', { method: 'GET' })
        user.value = response.user
    } catch (error) {
        user.value = undefined
    }finally{
        fetchFriends();
    }
}

const fetchFriends = async () => {
    try {
        const response  = await $fetch(`/api/friends/${user.value?.id}`, { method: 'GET' });
        if ('friends' in response) {
            friends.value = response.friends.map((user: UserBasics) => ({
                id: user.id,
                username: user.username,
                avatar: user.avatar,
            })
        )}
    } catch (err) {
        console.error('Friends fetch error:', err);
    }finally{
        isLoading.value = false;
    }
};

const filteredFriends = computed(() => {
    if (!searchFriend.value) return friends.value;
    return friends.value.filter(friend =>
        friend.username.toLowerCase().includes(searchFriend.value.toLowerCase())
    );
});

const alertMessage = computed(() => {
    if (friends.value.length === 0) {
        return "You don't have any friends, use your friends codes to add them";
    }
    if (filteredFriends.value.length === 0 && searchFriend.value.trim()) {
        return `There is no friend with name: "${searchFriend.value.trim()}"`;
    }
    return "";
});


const handleFriendAdded = (newFriend: UserBasics) => {
    friends.value.push(newFriend);
};


const openChatWith = async (friend: UserBasics) => {

    try {
        await useFetch('/api/chats/get', {
            method: 'POST',
            body: {
                userId: user.value?.id,
                friendId: friend.id,
            }
        }).then(response => {
            router.push(`/privateMessages/${response.data.value}/${friend.username}`);
        })
    } catch (error) {
        console.error('Error with creating chat channel:', error);
    }
};
const startCall = async (friend: UserBasics) => {
    console.log(`Video Ja: ${user.value?.id} Ziomo: ${friend.id}`);
    
    await $fetch('/api/video/call', {
        method: 'POST',
        body: JSON.stringify({
            callerId: user.value?.id,
            calleeId: friend.id,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(response => {
        if (response.status === 'error') {
            if(response.message === 'User is offline'){
                toast.add({ title: 'Call declined', description: 'User is offline'});
                return;
            }else if(response.message === 'User is in call'){
                toast.add({ title: 'Call declined', description: 'User is in a call already'});
                return;
            
            }else{
                console.error('Error with starting call:', response.message);
            }
            
            return;
        }
        showCallModal.value = true;
        caleeId.value = friend.id;
        callModalImage.value = friend.avatar;
        callModalDescription.value = friend.username;
        callingSound.value?.play();
        //router.push(`/videoChat/${user.value?.id}/${friend.id}`);
        //router.push(`/video/${response.data.value}`);
    }).catch(err => {
        console.error('Error with starting call:', err);
    });
};
const CancelCall = async (caleeId: string) => {
    if(callingSound.value){
        callingSound.value.pause();
        callingSound.value.currentTime = 0;
    }
    await $fetch('/api/video/cancel', {
        method: 'POST',
        body: JSON.stringify({
            callerId: user.value?.id,
            calleeId: caleeId,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(response => {
        if (response.status === 'error') {
            console.error('Error with starting call:', response.message);
            return;
        }
        showCallModal.value = false;
    }).catch(err => {
        console.error('Error with starting call:', err);
    });
};
onMounted(() => {
    fetchUser();
});
</script>


<style scoped>

.title {
    font-size: 32px;
    font-weight: bold;
}

.search-input {
    margin: auto  auto  20px auto;
}

.friends-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: bold;
    font-size: 16px;
    width: 100%;
}


.friend-card {
    transition: transform 0.3s ease;
}

.friend-card:hover {
    transform: translateY(-3px);
}

@media (min-width: 600px) {
    .friends-container {
        max-width: 100%;
    }
}

.friend-icon {
    background-color: #ddd;
}

.icon{
    transition: transform 0.3s ease;
    margin-left: 10px;
}
.icon:hover{
    color:#4ade80;
    transform: translateY(-3px);
}
.username{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: auto; /* Adjust the width as needed */
    text-align: left;
}
.buttons{
    margin-left: auto;
    display: flex;
    gap: 5px;
}
.icon-call{
    width: 200px;
    height: 200px;
}
.content-wrapper{
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
}
.avatar{
    width: 160px;
    height: 160px;
    margin-right: 50px;
    border-radius: 50%;
}
.call-description {
    font-size: 24px;
}
.user-name {
    color: #4ade80;
}
</style>