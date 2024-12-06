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
            <UCard v-for="friend in filteredFriends" :key="friend.id" class="friend-card"
                @click="console.log(`Ja: ${user?.id} Ziomo: ${friend.id}`)">
                <template #header>
                    <div class="header-content">
                        <i class="friend-icon"></i>
                        <span>{{ friend.username }}</span>
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
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.friend-card {
    transition: transform 0.3s ease;
    cursor: pointer;
}

.friend-card:hover {
    transform: translateY(-3px);
}

.header-content {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: bold;
    font-size: 16px;
}

.friend-icon {
    width: 24px;
    height: 24px;
    background-color: #ddd;
    border-radius: 50%;
}
</style>