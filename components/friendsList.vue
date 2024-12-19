<template>
    <div class="friends-container">
        <h1 class="title">Friends</h1>

        <div class="search-container">
            <UInput icon="i-heroicons-magnifying-glass-20-solid" size="sm" color="white" :trailing="false"
                v-model="searchFriend" type="text" placeholder="Search by username..." class="search-input" />
        </div>

        <UAlert v-if="filteredFriends.length == 0"
            icon="i-heroicons-face-frown"
            color="primary"
            variant="solid"
            title="We are very sorry"
            :description='`There is no friend with name: "${searchFriend}"`'
        />
        <div class="friends-list">
            <UCard v-for="friend in filteredFriends" :key="friend.id" class="friend-card">
                <template #header>
                    <div class="header-content">
                        <div class="iconName">
                            <UIcon name="i-heroicons-user"/>
                            {{ friend.username }}
                        </div>

                        <div class="buttons">
                            <button @click="console.log(`Message Ja: ${user?.id} Ziomo: ${friend.id}`)">
                                <UIcon class="icon w-5 h-5" name="i-heroicons-chat-bubble-left-right"/>
                            </button>
                            <button  @click="console.log(`Video Ja: ${user?.id} Ziomo: ${friend.id}`)">
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

const user = ref<User | undefined>(undefined)
const friends = ref<UserBasics[]>([]);
const searchFriend = ref<string>('');

const fetchUser = async () => {
    try {
        const response = await $fetch('/api/users/get', { method: 'GET' })
        user.value = response.user
    } catch (error) {
        user.value = undefined
    }
}

const fetchFriends = async () => {
    try {
        const response = await $fetch(`/api/users/getFriends`, { method: 'GET' });
        friends.value = response.friends.map((user: UserBasics) => ({
            id: user.id,
            username: user.username,
        }));
    } catch (err) {
        console.error('Friends fetch error:', err);
    }
};

const filteredFriends = computed(() => {
    if (!searchFriend.value) return friends.value;
    return friends.value.filter(friend =>
        friend.username.toLowerCase().includes(searchFriend.value.toLowerCase())
    );
});

onMounted(() => {
    fetchUser();
    fetchFriends();
});
</script>


<style scoped>
.friends-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
}

.title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
}

.search-input {
    margin: 30px 50px;
}

.friends-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
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

.header-content {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: bold;
    font-size: 16px;
    justify-content: space-between;
}

.friend-icon {
    width: 24px;
    height: 24px;
    background-color: #ddd;
    border-radius: 50%;
}

.icon{
    transition: transform 0.3s ease;
    margin-left: 10px;
}
.icon:hover{
    color:#4ade80;
    transform: translateY(-3px);
}
</style>