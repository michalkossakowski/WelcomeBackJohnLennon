<template>
    <div class="servers-container">
        <div v-if="isLoading" class="loaderBox">
            <h1>Loading ...</h1>
            <UProgress class="loader" animation="carousel" />
        </div>

        <template v-else>
            <div class="header-row">
                <h1 class="title">Explore servers</h1>
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
            </div>
            <div class="servers-list">
                <UAlert
                    v-if="filteredServers.length === 0"
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
                >
                <template #header>
                    <div class="header-content">
                        <i class="server-icon" />
                        <div class="server-info">
                            <span class="server-title" :title="server.title">
                                <span class="server-name">{{ server.title }}</span>
                            </span>
                            <span class="server-id">{{ server.id }}</span>
                        </div>
                        <UButton class="join-button" @click="joinServer(server.id)">
                            Join
                        </UButton>
                    </div>
                </template>
                </UCard>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import { type Server } from '~/models/serverModel';
import { type UserBasics } from '~/models/userModel';

const router = useRouter();
const allServers = ref<Server[]>([]);
const myServers = ref<Server[]>([]);
const searchServer = ref<string>('');
const user = ref<UserBasics | null>(null);
const isLoading = ref(true);

const availableServers = computed(() => {
    if (!allServers.value || !myServers.value) return [];

    const myServerIds = new Set(myServers.value.map(server => server.id));
    return allServers.value.filter(server => !myServerIds.has(server.id));
});

const filteredServers = computed(() => {
    if (!searchServer.value) return sortedServers.value;
    return sortedServers.value.filter(server =>
        server.title.toLowerCase().includes(searchServer.value.toLowerCase())
    );
});

const sortedServers = computed(() => {
    return [...availableServers.value].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
});

const alertMessage = computed(() => {
    if (!allServers.value || allServers.value.length === 0) {
        return "There are no servers available at the moment";
    }
    if (availableServers.value.length === 0) {
        return "You have joined all available servers";
    }
    if (filteredServers.value.length === 0 && searchServer.value.trim()) {
        return `There is no server with name: "${searchServer.value.trim()}"`;
    }
    return "";
});

const fetchServers = async () => {
    isLoading.value = true;
    try {
        const { data: allServersData } = await useFetch<Server[]>('/api/servers/get');
        allServers.value = allServersData.value || [];

        if (user.value) {
            const { data: userServersData } = await useFetch<{ servers: Server[] }>(`/api/users/${user.value.id}/servers`);
            myServers.value = userServersData.value?.servers || [];
        }
    } catch (error) {
        console.error('Error fetching servers:', error);
        allServers.value = [];
        myServers.value = [];
    } finally {
        isLoading.value = false;
    }
};

const fetchUser = async () => {
    try {
        const response = await $fetch('/api/users/get', { method: 'GET' });
        user.value = response.user;
        if (user.value) {
            await fetchServers();
        }
    } catch (error) {
        user.value = null;
    } finally {
        isLoading.value = false;
    }
};

const joinServer = async (serverId: string) => {
    if (!user.value) {
        alert(`You must be logged in to join a server.`);
        return;
    }

    const userId = user.value.id;

    try {
        await $fetch('/api/servers/assignUser', {
            method: 'POST',
            body: {
                userId: userId,
                serverId: serverId
            }
        });

        await $fetch('/api/users/assignServer', {
            method: 'POST',
            body: {
                userId: userId,
                serverId: serverId
            }
        });

        router.push(`/server/${serverId}`);
    } catch (error) {
        console.error('Error joining server:', error);
        alert('An error occurred while joining the server.');
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

.loaderBox {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50vh;
    gap: 20px;
}

.loader {
    width: 50%;
    max-width: 300px;
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

.search-input {
    width: 300px;
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

.server-id {
    font-size: 11px;
    opacity: 60%;
}

.join-button {
    align-self: center;
    flex-shrink: 0;
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
    margin-left: 10px;
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
}

.join-button {
    align-self: center;
    flex-shrink: 0;
}
</style>