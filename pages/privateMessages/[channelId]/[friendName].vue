<template>
    <div v-if="user && routerChannelId.includes(user.id.toString())">
      <h1 class="title">Private chat with: {{ routerFriendName }}</h1>
      <MessagesFeed :channelId="routerChannelId" />
    </div>
    <div v-else class="alertBox">
        <UAlert 
            icon="i-heroicons-face-frown"
            color="primary"
            variant="solid"
            title="You dont have access to this chat"
            description="You are not a memeber of this chat so you cannot access this site sorry"
        />
    </div>
  </template>
  
  <script setup lang="ts">
    import { useRoute } from 'vue-router';
    import { ref, onMounted } from 'vue';
    import type { User } from '~/models/userModel';
    
    const route = useRoute();
    const routerChannelId = route.params.channelId.toString();
    const routerFriendName = route.params.friendName.toString();
    
    const user = ref<User | null>(null);
  
    const fetchUser = async () => {
      try {
        const response = await $fetch('/api/users/get', { method: 'GET' });
        user.value = response.user;
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
  
    onMounted(() => {
      fetchUser();
    });
  </script>
  
  <style scoped>
    .title {
      font-size: 24px;
      font-weight: bold;
    }
    .alertBox{
        margin: 20px;
    }
  </style>
  