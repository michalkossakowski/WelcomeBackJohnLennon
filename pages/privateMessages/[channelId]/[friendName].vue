<template>
    <h1 class="title">Private chat with: {{routerFriendName}}</h1>
    <MessagesFeed :channelId="routerChannelId"/>
</template>

<script setup lang="ts">
    import { useRoute } from 'vue-router';

    const route = useRoute();
    const routerChannelId = route.params.channelId.toString();
    const routerFriendName = route.params.friendName.toString();
</script>
  

<style scoped>
    .title {
        font-size: 24px;
        font-weight: bold;
    }
</style>
