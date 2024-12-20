<template>
  <div class="servers-container">
      <div class="header-row">
          <h1 class="title">Servers</h1>
          <UButton icon="i-heroicons-plus-circle" class="add-button"/>
      </div>
    <div class="servers-list">
      <UCard
          v-for="server in data"
          :key="server.id"
          class="server-card"
          @click="navigateToServer(server.id)">
        <template #header>
          <div class="header-content">
            <i class="server-icon" />
            <span>{{ server.title }}</span>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
const { data } = await useFetch('/api/servers/get');

const navigateToServer = (serverId: string) => {
  router.push(`/server/${serverId}`);
};

const addServer = () => {

}

</script>

<style scoped>
.servers-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.title {
    font-size: 24px;
    font-weight: bold;
    text-align: left;
    margin-bottom: 0;
}

.add-button {
    width: auto;
    height: 32px;
}

.servers-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.server-card {
  transition: transform 0.3s ease;
  cursor: pointer;
}

.server-card:hover {
  transform: translateY(-3px);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  font-size: 16px;
}

.server-icon {
  width: 24px;
  height: 24px;
  background-color: #ddd;
  border-radius: 50%;
}
</style>