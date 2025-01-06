<template>
    <div class="servers-container">
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
                            <span class="server-title">{{ server.title }}</span>
                            <span class="server-id">{{ server.id }}</span>
                        </div>
                        <UButton class="join-button" @click="joinServer(server.id)">
                            Join
                        </UButton>
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
const { data } = await useFetch<Server[]>('/api/servers/get');
const searchServer = ref<string>('');
const user = ref<UserBasics | null>(null);
const isLoading = ref(true);

const filteredServers = computed(() => {
    if (!data.value) return [];
    if (!searchServer.value) return sortedServers.value;
    return sortedServers.value.filter(server =>
        server.title.toLowerCase().includes(searchServer.value.toLowerCase())
    );
});

const sortedServers = computed(() => {
    if (!data.value) return [];
    return [...data.value].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
});

const alertMessage = computed(() => {
    if (!data.value || data.value.length === 0) {
        return "There are no servers available at the moment";
    }
    if (filteredServers.value.length === 0 && searchServer.value.trim()) {
        return `There is no server with name: "${searchServer.value.trim()}"`;
    }
    return "";
});

const fetchUser = async () => {
    try {
        const response = await $fetch('/api/users/get', { method: 'GET' });
        user.value = response.user;
        if (!user.value) {
            return;
        }
    } catch (error) {
        user.value = null;
    } finally {
        isLoading.value = false;
    }
};

const joinServer = async (serverId: string) => {
    if (!user.value) {
        alert(`You must be logged in to join a server. ${user.value}`);
        return;
    }

    const userId = user.value.id;

    try {
        const response = await $fetch<{ status: string; message: string; }>('http://localhost:3000/api/servers/assignUser', {
            method: 'POST',
            body: JSON.stringify({
                userId: userId,
                serverId: serverId
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 'success') {

        } else {
            alert(`Failed to join the server.`);
        }
    } catch (error) {
        console.error('Error joining server:', error);
        alert('An error occurred while joining the server.');
    }

    try {
        const response = await $fetch<{ status: string; message: string; }>('http://localhost:3000/api/users/assignServer', {
            method: 'POST',
            body: JSON.stringify({
                userId: userId,
                serverId: serverId
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 'success') {
            router.push(`/server/${serverId}`);
        } else {
            console.error('Failed to assign the server to the user.');
        }
    } catch (error) {
        console.error('Error assigning server to user:', error);
    }
};

onMounted(fetchUser);
</script>

<style scoped>

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.title {
    font-size: 32px;
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
</style>