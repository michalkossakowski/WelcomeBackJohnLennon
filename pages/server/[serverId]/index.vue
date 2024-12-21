<template>
    <div class="server-view">
        <div class="sidebar">
            <div class="channels">
                <h3>{{ serverName }}</h3>
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
import { Channel } from '~/models/channelModel'
import { Server } from '~/models/serverModel'
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

const fetchServerDetails = async () => {
    const { data } = useFetch<Server>(`/api/servers/${serverId}`);
    serverName.value = data.value?.title || "internal pointer varaiabul";
};

const fetchChannels = async () => {
    const { data } = await useFetch<ChannelsResponse>(`/api/channels/${serverId}`);
    channels.value = data.value?.channels || [];
};

const selectChannel = (channelId: string) => {
    currentChannelId.value = channelId;
};

const createNewChannel = () => {
    // Placeholder for creating a channel
};

onMounted(fetchServerDetails);
onMounted(fetchChannels);
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
</style>
