<template>
    <div class="servers-container">
        <div class="header-row">
            <h1 class="title">Servers</h1>
            <div class="right-section">
                <UInput
                    icon="i-heroicons-magnifying-glass-20-solid"
                    size="sm"
                    color="white"
                    :trailing="false"
                    v-model="searchServer"
                    type="text"
                    placeholder="Search by server name ..."
                    class="search-input"
                />
                <UButton
                    icon="i-heroicons-plus-circle"
                    class="add-button"
                    @click="showAddServer = !showAddServer">
                    Create a server
                </UButton>
            </div>
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

            <UAlert
                v-if="showAlert"
                icon="i-heroicons-face-frown"
                color="primary"
                variant="solid"
                title="We are very sorry"
                :description="alertMessage"
            />

            <UCard
                v-for="server in filteredServers"
                :key="server.id"
                class="server-card"
                @click="navigateToServer(server.id)"
            >
                <template #header>
                    <div class="header-content">
                        <i class="server-icon" />
                        <div class="server-info">
                        <span class="server-title" :title="server.title">
                            <span class="server-name">{{ server.title }}</span>
                        </span>
                        </div>
                        <UButton
                            v-if="isOwner(server)"
                            icon="i-heroicons-trash"
                            color="red"
                            variant="ghost"
                            class="delete-button"
                            @click.stop="openDeleteModal(server)"
                        />
                    </div>
                </template>
            </UCard>
        </div>

        <ScreenPopUp
            v-model="showDeleteModal"
            title="Delete Server"
            :description="deleteDescription"
            show-cancel-button
            cancel-button-text="Cancel"
            action-button-text="Delete Server"
            action-button-color="red"
            :loading="isDeleting"
            @cancel="showDeleteModal = false"
            @action="deleteServer"
        >
            <p>{{ deleteDescription }}</p>
            <p class="server-name">Server: {{ serverToDelete?.title }}</p>
        </ScreenPopUp>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import { type Server } from '~/models/serverModel';
import { type UserBasics } from '~/models/userModel';
import ScreenPopUp from '~/components/screenPopUp.vue';

const router = useRouter();

const data = ref<{ status: string; message: string; servers: Server[] } | null>(null);
const searchServer = ref('');

const user = ref<UserBasics | null>(null);
const isLoading = ref(true);
const isDeleting = ref(false);

const showAddServer = ref(false);
const showDeleteModal = ref(false);
const newServerName = ref('');
const serverToDelete = ref<Server | null>(null);
const deleteDescription = "Are you sure you want to delete this server? Everything associated with it will be deleted forever.";

const filteredServers = computed(() => {
    if (!searchServer.value) return sortedServers.value;
    return sortedServers.value.filter(server =>
        server.title.toLowerCase().includes(searchServer.value.toLowerCase())
    );
});

const alertMessage = computed(() => {
    if (!data.value?.servers || data.value.servers.length === 0) {
        return "You don't have any servers yet. Create one to get started!";
    }
    if (filteredServers.value.length === 0 && searchServer.value.trim()) {
        return `There is no server with name: "${searchServer.value.trim()}"`;
    }
    return "";
});

const sortedServers = computed(() => {
    if (!data.value || !data.value.servers) return [];
    return [...data.value.servers].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
});

const showAlert = computed(() => {
    if (isLoading.value) return false;
    return filteredServers.value.length === 0;
});

const isOwner = (server: Server) => {
    return user.value && server.creatorId === user.value.id;
};

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

const openDeleteModal = (server: Server) => {
    serverToDelete.value = server;
    showDeleteModal.value = true;
};

const deleteServer = async () => {
    if (!serverToDelete.value) return;

    isDeleting.value = true;
    try {
        await useFetch(`/api/servers/${serverToDelete.value.id}/delete`, {
            method: 'DELETE'
        });

        // Remove the server from the local data
        if (data.value && data.value.servers) {
            data.value.servers = data.value.servers.filter(
                server => server.id !== serverToDelete.value?.id
            );
        }

        showDeleteModal.value = false;
        serverToDelete.value = null;
    } catch (error) {
        console.error('Error deleting server:', error);
    } finally {
        isDeleting.value = false;
    }
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

.right-section {
    display: flex;
    gap: 16px;
    align-items: center;
}

.search-input {
    width: 300px;
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
    min-height: 80px;
    width: 100%;
}

.server-card:hover {
    transform: translateY(-3px);
}

.header-content {
    display: flex;
    align-items: center;
    width: 100%;
    height: 40px;
}

.server-icon {
    width: 24px;
    height: 24px;
    background-color: #ddd;
    border-radius: 50%;
    flex-shrink: 0;
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
    flex-grow: 1;
    margin-left: 10px;
}

.server-title {
    font-weight: bold;
    font-size: 16px;
}

.server-date {
    font-size: 12px;
    color: #666;
}

/* New styles for delete functionality */
.delete-button {
    width: 32px;
    height: 32px;
    margin-left: auto;
}

.modal-header {
    padding-bottom: 16px;
}

.modal-title {
    font-size: 20px;
    font-weight: bold;
    margin: 0;
}

.modal-content {
    padding: 16px 0;
}

.server-name {
    margin-top: 8px;
    font-weight: bold;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 16px;
}

.header-content {
    display: flex;
    align-items: center;
    width: 100%;
    height: 40px;
    gap: 10px;
}

.server-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex-grow: 1;
    min-width: 0;
}

.server-title {
    font-weight: bold;
    font-size: 16px;
    min-width: 0;
}

.server-name {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 10px;
}

.delete-button {
    width: 32px;
    height: 32px;
    margin-left: auto;
    flex-shrink: 0;
}
</style>