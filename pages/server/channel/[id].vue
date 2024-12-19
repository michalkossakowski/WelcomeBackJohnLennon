<template>
  <div>
    <h1>ChannelId: {{ channelId }}</h1>
    <MessagesFeed :channelId="channelId" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import MessagesFeed from '../../../components/messagesFeed.vue'

const route = useRoute();
const channelId = route.params.id as string;
</script>

<style scoped>

</style>
