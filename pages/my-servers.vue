<template>
    <div class="servers-container">
        <div class="header-row">
            <h1 class="title">Servers</h1>
            <UButton
                icon="i-heroicons-plus-circle"
                class="add-button"
                @click="showAddServer = !showAddServer">
                Create a server
            </UButton>
        </div>
        <div class="servers-list">
            <UCard v-if="showAddServer" class="server-card add-server-card">
                <template #header>
                    <div class="add-server-content">
                        <i class="server-icon" />
                        <div class="input-group">
                            <span class="input-label">Name:</span>
                            <UInput
                                v-model="newServerName"
                                placeholder="Enter server name"
                                class="name-input"
                                @keyup.enter="submitNewServer"
                            />
                        </div>
                        <div class="action-buttons">
                            <UButton
                                icon="i-heroicons-x-mark"
                                color="gray"
                                variant="ghost"
                                class="action-button"
                                @click="cancelAdd"
                            />
                            <UButton
                                icon="i-heroicons-check"
                                color="green"
                                variant="ghost"
                                class="action-button"
                                :disabled="!newServerName.trim()"
                                @click="submitNewServer"
                            />
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard
                v-for="server in sortedServers"
                :key="server.id"
                class="server-card"
                @click="navigateToServer(server.id)"
            >
                <template #header>
                    <div class="header-content">
                        <i class="server-icon" />
                        <div class="server-info">
                            <span class="server-title">{{ server.title }}</span>
                        </div>
                    </div>
                </template>
            </UCard>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import { type Server } from '~/models/serverModel';
import { type UserBasics } from '~/models/userModel';

const router = useRouter();

const data = ref<{ status: string; message: string; servers: Server[] } | null>(null);
const refresh = ref<(() => Promise<void>) | null>(null);

const user = ref<UserBasics | null>(null);
const isLoading = ref(true);

const showAddServer = ref(false);
const newServerName = ref('');

const sortedServers = computed(() => {
    if (!data.value || !data.value.servers) return [];
    return [...data.value.servers].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
});

const fetchUser = async () => {
    try {
        const response = await $fetch('/api/users/get', { method: 'GET' });
        user.value = response.user;

        if (user.value) {
            const { data: serverData } = await useFetch<{ status: string; message: string; servers: Server[] }>(`/api/users/${user.value.id}/servers`);
            data.value = serverData.value;
        }
    } catch (error) {
        console.error('Error fetching user or servers:', error);
        user.value = null;
    } finally {
        isLoading.value = false;
    }
};

const navigateToServer = (serverId: string) => {
    router.push(`/server/${serverId}`);
};

const cancelAdd = () => {
    showAddServer.value = false;
    newServerName.value = '';
};

const submitNewServer = async () => {
    if (!newServerName.value.trim() || !user.value) return;
    const serverID = crypto.randomUUID();

    const newServer = {
        id: serverID,
        title: newServerName.value.trim(),
        creatorId: user.value.id,
        createdAt: new Date().toISOString()
    };

    const assignUserReq = {
        userId: user.value.id,
        serverId: serverID
    };

    try {
        await useFetch('/api/servers/add', {
            method: 'POST',
            body: newServer
        });

        if (data.value && data.value.servers) {
            data.value.servers.unshift(newServer);
        }
        cancelAdd();
    } catch (error) {
        console.error('Error adding server:', error);
    } finally {
        await useFetch('/api/servers/assignUser', {
            method: 'POST',
            body: assignUserReq
        });
        await useFetch('/api/users/assignServer', {
            method: 'POST',
            body: assignUserReq
        });
    }
};

onMounted(fetchUser);
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

.add-server-card {
    border: 2px dashed #ddd;
    cursor: default;
}

.add-server-card:hover {
    transform: none;
}

.add-server-content {
    display: flex;
    align-items: center;
    gap: 15px;
}

.input-group {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-grow: 1;
}

.input-label {
    font-weight: bold;
    white-space: nowrap;
}

.name-input {
    flex-grow: 1;
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.action-button {
    width: 32px;
    height: 32px;
}

.server-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.server-title {
    font-weight: bold;
    font-size: 16px;
}

.server-date {
    font-size: 12px;
    color: #666;
}
</style>