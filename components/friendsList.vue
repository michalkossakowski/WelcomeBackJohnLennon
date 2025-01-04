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
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import type { User, UserBasics } from '~/models/userModel'
import { useRouter } from 'vue-router';
import { Message } from '~/models/messageModel';

const router = useRouter();
const user = ref<User | undefined>(undefined)
const friends = ref<UserBasics[]>([]);
const searchFriend = ref<string>('');
const isLoading = ref(true);
const selectedFriend = ref<UserBasics | null>(null);

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
        console.log(response);
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
        console.log(response);
        if (response.status === 'error') {
            console.error('Error with starting call:', response.message);
            return;
        }
        router.push(`/videoChat/${user.value?.id}/${friend.id}`);
        //router.push(`/video/${response.data.value}`);
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
</style>