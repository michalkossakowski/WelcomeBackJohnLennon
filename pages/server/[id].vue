<template>
  <div class="channels-container">
    <h1 class="title">Channels</h1>
    <div v-if="channels && channels.length > 0" class="channels-list">
      <UCard
          v-for="channel in channels"
          :key="channel.id"
          class="channel-card"
          @click="navigateToChannel(channel.id)"
      >
        <template #header>
          <div class="header-content">
            <span>{{ channel.title }}</span>
          </div>
        </template>
      </UCard>
    </div>
    <div v-else class="no-channels">
      <p>No channels available for this server.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

type Channel = {
  id: string;
  serverId: string;
  title: string;
};

const route = useRoute();
const router = useRouter();
const serverId = route.params.id as string;
const channels = ref<Channel[]>([]);

const { data } = await useFetch<{ channels: Channel[] }>(`/api/channels/${serverId}`);
channels.value = data.value?.channels || [];

const navigateToChannel = (channelId: string) => {
  router.push(`/server/channel/${channelId}`);
};
</script>

<style scoped>
.channels-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.channels-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.channel-card {
  transition: transform 0.3s ease;
  cursor: pointer;
}

.channel-card:hover {
  transform: translateY(-3px);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  font-size: 16px;
}

.no-channels {
  text-align: center;
  color: #666;
}
</style>
