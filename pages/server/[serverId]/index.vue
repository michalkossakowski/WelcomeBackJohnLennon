<template>
    <div class="server-view">
        <div class="sidebar">
            <div class="channels">
                <h3>{{ serverName }}</h3>

                <!-- Add Channel Button -->
                <UButton
                    icon="i-heroicons-plus-circle"
                    class="add-button mb-2 w-full"
                    @click="showAddChannel = !showAddChannel"
                >
                    Add Channel
                </UButton>

                <!-- Add Channel Form -->
                <div v-if="showAddChannel" class="new-channel-form mb-2">
                    <div class="flex items-center bg-gray-800 p-2 rounded">
                        <UInput
                            v-model="newChannelName"
                            placeholder="Channel name"
                            class="flex-grow"
                            @keyup.enter="submitNewChannel"
                        />
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
                            :disabled="!newChannelName.trim()"
                            @click="submitNewChannel"
                        />
                    </div>
                </div>

                <ul>
                    <li
                        v-for="channel in channels"
                        :key="channel.id"
                        @click="selectChannel(channel.id)"
                        :class="{ active: currentChannelId === channel.id }"
                    >
                        {{ channel.title }}
                    </li>
                </ul>
            </div>
        </div>

        <div class="content-area">
            <div v-if="!currentChannelId">
                <p class="no-channel-message">Select a channel to get started</p>
            </div>

            <MessagesFeed
                v-if="currentChannelId"
                :key="currentChannelId"
                :channelId="currentChannelId"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { type Channel } from '~/models/channelModel'
import { type Server } from '~/models/serverModel'
import { type UserBasics } from '~/models/userModel';
import MessagesFeed from '~/components/messagesFeed.vue';

interface ChannelsResponse {
    channels: Channel[];
    message?: string;
}

const route = useRoute();
const serverId = route.params.serverId as string;
const channels = ref<Channel[]>([]);
const serverName = ref('Loading...');
const currentChannelId = ref<string | null>(null);

// User state
const user = ref<UserBasics | null>(null);
const isLoading = ref(true);

// New channel state
const showAddChannel = ref(false);
const newChannelName = ref('');

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

const fetchServerDetails = async () => {
    const { data } = await useFetch<Server>(`/api/servers/${serverId}`);
    serverName.value = data.value?.title || "internal pointer varaiabul";
};

const fetchChannels = async () => {
    const { data } = await useFetch<ChannelsResponse>(`/api/channels/${serverId}`);
    channels.value = data.value?.channels || [];
};

const selectChannel = (channelId: string) => {
    currentChannelId.value = channelId;
};

const cancelAdd = () => {
    showAddChannel.value = false;
    newChannelName.value = '';
};

const submitNewChannel = async () => {
    if (!newChannelName.value.trim() || !user.value) return;

    const newChannel = {
        id: crypto.randomUUID(),
        serverId: serverId,
        title: newChannelName.value.trim(),
        creatorId: user.value.id // Now using the actual user ID
    };

    try {
        await useFetch('/api/channels/add', {
            method: 'POST',
            body: newChannel
        });

        await fetchChannels(); // Refresh the channels list
        cancelAdd();
    } catch (error) {
        console.error('Error adding channel:', error);
    }
};

onMounted(async () => {
    await fetchUser();
    await fetchServerDetails();
    await fetchChannels();
});
</script>

<style scoped>
.server-view {
    display: flex;
    height: 100%;
}

.sidebar {
    width: 250px;
    padding-top: 0;
    padding-bottom: 0.375rem;
    background: #111827;
    border-radius: 5px;
    border: 1px solid #1f2937;
}

.channels {
    padding-left: 0.625rem;
    padding-right: 0.625rem;
}

.channels h3 {
    border-bottom: 1px solid #1f2937;
    padding: 0.47rem;
}

.channels li {
    cursor: pointer;
    padding: 8px;
    margin: 0;
    border-radius: 5px;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 500;
}

.channels li:hover {
    background-color: #191e24;
}

.channels li.active {
    background-color: #202936;
    font-weight: bold;
}

.content-area {
    width: 100%;
    margin-left: 20px;
}

.no-channel-message {
    font-size: 18px;
    font-weight: bold;
}

.add-button {
    width: 100%;
    height: 32px;
    margin-bottom: 0.5rem;
}

.new-channel-form {
    margin-bottom: 0.5rem;
}

.action-button {
    width: 32px;
    height: 32px;
}
</style>