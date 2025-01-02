<template>
    <div class="server-view">
        <div class="sidebar">
            <div class="channels">
                <div class="server-header">
                    <h3>{{ serverName }}</h3>
                    <div class="header-buttons">
                        <UButton
                            v-if="isOwner"
                            icon="i-heroicons-trash"
                            color="red"
                            variant="ghost"
                            class="action-button"
                            @click="openDeleteModal"
                        />
                        <UButton
                            icon="i-heroicons-arrow-right-on-rectangle"
                            color="red"
                            variant="ghost"
                            class="action-button"
                            @click="handleLeaveServer"
                        />
                    </div>
                </div>

                <div class="channel-header flex items-center justify-between mb-2">
                    <h4 class="section-title">Channels</h4>
                    <UButton
                        v-if="isOwner"
                        icon="i-heroicons-plus-circle"
                        class="add-button"
                        @click="showAddChannel = !showAddChannel"
                    />
                </div>


                <div v-if="showAddChannel" class="new-channel-form mb-2">
                    <div class="flex items-center bg-gray-800 p-2 rounded">
                        <UInput
                            v-model="newChannelName"
                            placeholder="Name"
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
                        :class="{ active: currentChannelId === channel.id }"
                        @click="selectChannel(channel.id)"
                        class="channel-item flex justify-between items-center"
                    >
                    <span class="channel-title cursor-pointer">
                        {{ channel.title }}
                    </span>
                        <UButton
                            v-if="isOwner"
                            icon="i-heroicons-trash"
                            color="red"
                            variant="ghost"
                            class="action-button delete-button"
                            @click.stop="openChannelDeleteModal(channel.id)"
                        />
                    </li>
                </ul>

            </div>
        </div>

        <div class="content-area">
            <div v-if="!currentChannelId" class="no-channel-container">
                <p class="no-channel-message">Select a channel to get started!</p>
            </div>

            <MessagesFeed
                v-if="currentChannelId"
                :key="currentChannelId"
                :channelId="currentChannelId"
            />
        </div>

        <div class="sidebar">
            <div class="channels">
                <div class="server-header">
                    <h3> Users </h3>
                </div>

                <ul>
                    <li
                        v-for="user in serverUsers"
                        :key="user.id"
                        class="channel-item flex justify-between items-center"
                    >
                    <span class="channel-title cursor-pointer">
                        {{ user.username }}
                    </span>
                        <UButton
                            v-if="isOwner && user.id !== currentUser?.id"
                            icon="i-heroicons-trash"
                            color="red"
                            variant="ghost"
                            class="action-button delete-button"
                            @click.stop="openUserDeleteModal(user.id)"
                        />
                    </li>
                </ul>

            </div>
        </div>

        <ScreenPopUp
            v-model="showUserDeleteModal"
            title="Remove User"
            description="Are you sure you want to remove this user from the server?"
            show-cancel-button
            cancel-button-text="Cancel"
            action-button-text="Remove User"
            action-button-color="red"
            :loading="isDeletingUser"
            @cancel="showUserDeleteModal = false"
            @action="handleUserDelete"
        />

        <ScreenPopUp
            v-model="showDeleteModal"
            title="Delete Server"
            description="Are you sure you want to delete this server? All channels and messages will be permanently deleted."
            show-cancel-button
            cancel-button-text="Cancel"
            action-button-text="Delete Server"
            action-button-color="red"
            :loading="isDeleting"
            @cancel="showDeleteModal = false"
            @action="handleDeleteServer"
        />

        <ScreenPopUp
            v-model="showJoinModal"
            title="Join Server"
            description="Would you like to join this server?"
            show-cancel-button
            cancel-button-text="Cancel"
            action-button-text="Join Server"
            action-button-color="green"
            :loading="isJoining"
            @cancel="handleJoinCancel"
            @action="handleJoinServer"
        />

        <ScreenPopUp
            v-model="showChannelDeleteModal"
            title="Delete Channel"
            description="Are you sure you want to delete this channel? All messages will be permanently deleted."
            show-cancel-button
            cancel-button-text="Cancel"
            action-button-text="Delete Channel"
            action-button-color="red"
            :loading="isDeletingChannel"
            @cancel="showChannelDeleteModal = false"
            @action="handleChannelDelete"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { type Channel } from '~/models/channelModel'
import { type Server } from '~/models/serverModel'
import { type UserBasics} from '~/models/userModel';
import MessagesFeed from '~/components/messagesFeed.vue';
import ScreenPopUp from '~/components/screenPopUp.vue';

interface ChannelsResponse {
    channels: Channel[];
    message?: string;
}

const route = useRoute();
const router = useRouter();
const serverId = route.params.serverId as string;
const channels = ref<Channel[]>([]);
const serverName = ref('Loading...');
const currentChannelId = ref<string | null>(null);
const serverUsers = ref<UserBasics[]>([]);
const serverOwnerId = ref<string | null>(null);

const showDeleteModal = ref(false);
const showJoinModal = ref(false);
const showChannelDeleteModal = ref(false);

const isDeleting = ref(false);
const isJoining = ref(false);
const isDeletingChannel = ref(false);
const channelToDelete = ref<string | null>(null);

const showUserDeleteModal = ref(false);
const isDeletingUser = ref(false);
const userToDelete = ref<string | null>(null);

const currentUser = ref<UserBasics | null>(null);
const isLoading = ref(true);
const hasJoinedServer = ref(false);

const showAddChannel = ref(false);
const newChannelName = ref('');

const isOwner = computed(() => {
    return currentUser.value?.id === serverOwnerId.value;
});

const fetchUser = async () => {
    try {
        const response = await $fetch('/api/users/get', { method: 'GET' });
        currentUser.value = response.user;
    } catch (error) {
        currentUser.value = null;
    } finally {
        isLoading.value = false;
    }
};

const handleLeaveServer = async () => {
    const userId = currentUser.value?.id;

    isDeletingUser.value = true;
    try {
        await useFetch(`/api/servers/${serverId}/${userId}`, {
            method: 'DELETE'
        });
    } catch (error) {
        console.error('Error removing user:', error);
    } finally {
        router.push('/my-servers');
    }
};

const handleDeleteServer = async () => {
    if (!isOwner.value) return;

    isDeleting.value = true;
    try {
        await useFetch(`/api/servers/${serverId}/delete`, {
            method: 'DELETE'
        });
        router.push('/my-servers');
    } catch (error) {
        console.error('Error deleting server:', error);
    } finally {
        isDeleting.value = false;
        showDeleteModal.value = false;
    }
};

const handleJoinServer = async () => {
    if (!currentUser.value) return;

    isJoining.value = true;
    try {
        const assignUserReq = {
            userId: currentUser.value.id,
            serverId: serverId
        };

        await useFetch('/api/servers/assignUser', {
            method: 'POST',
            body: assignUserReq
        });

        await useFetch('/api/users/assignServer', {
            method: 'POST',
            body: assignUserReq
        });

        showJoinModal.value = false;
        hasJoinedServer.value = true;
        // Load server data only after successful join
        await loadServerData();
    } catch (error) {
        console.error('Error joining server:', error);
    } finally {
        isJoining.value = false;
    }
};

const handleJoinCancel = () => {
    showJoinModal.value = false;
    router.push('/my-servers');
};

const fetchServerDetails = async () => {
    const { data } = await useFetch<Server>(`/api/servers/${serverId}`);
    if (data.value) {
        serverName.value = data.value.title;
        serverOwnerId.value = data.value.creatorId;
    }
};

const openChannelDeleteModal = (channelId: string) => {
    channelToDelete.value = channelId;
    showChannelDeleteModal.value = true;
};

const handleChannelDelete = async () => {
    if (!channelToDelete.value) return;

    isDeletingChannel.value = true;
    try {
        await useFetch(`/api/channels/${channelToDelete.value}/delete`, {
            method: 'DELETE',
        });
        channels.value = channels.value.filter(channel => channel.id !== channelToDelete.value);
        if (currentChannelId.value === channelToDelete.value) {
            currentChannelId.value = null;
        }
    } catch (error) {
        console.error('Error deleting channel:', error);
    } finally {
        isDeletingChannel.value = false;
        showChannelDeleteModal.value = false;
        channelToDelete.value = null;
    }
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
    if (!newChannelName.value.trim() || !currentUser.value) return;

    const newChannel = {
        id: crypto.randomUUID(),
        serverId: serverId,
        title: newChannelName.value.trim(),
        creatorId: currentUser.value.id
    };

    try {
        await useFetch('/api/channels/add', {
            method: 'POST',
            body: newChannel
        });

        await fetchChannels();
        cancelAdd();
    } catch (error) {
        console.error('Error adding channel:', error);
    }
};

const openDeleteModal = () => {
    showDeleteModal.value = true;
};

const deleteChannel = async (channelId: string) => {
    if (!isOwner.value) return;

    try {
        await useFetch(`/api/channels/${channelId}/delete`, {
            method: 'DELETE',
        });
        channels.value = channels.value.filter(channel => channel.id !== channelId);
    } catch (error) {
        console.error('Error deleting channel:', error);
    }
};

const checkServerMembership = async () => {
    try {
        const { data } = await useFetch<{ users: UserBasics[] }>(`/api/servers/${serverId}/usersBasic`);
        serverUsers.value = data.value?.users || [];
        return serverUsers.value.some((u) => String(u.id) === String(currentUser.value?.id));
    } catch (error) {
        console.error('Error checking server membership:', error);
        return false;
    }
};

const loadServerData = async () => {
    try {
        await Promise.all([
            fetchServerDetails(),
            fetchChannels()
        ]);
    } catch (error) {
        console.error('Error loading server data:', error);
    }
};

const initializeServer = async () => {
    await fetchUser();
    const isMember = await checkServerMembership();

    if (isMember) {
        hasJoinedServer.value = true;
        await loadServerData();
    } else {
        showJoinModal.value = true;
    }
    isLoading.value = false;
};

const openUserDeleteModal = (userId: string) => {
    userToDelete.value = userId;
    showUserDeleteModal.value = true;
};

const handleUserDelete = async () => {
    if (!userToDelete.value) return;

    isDeletingUser.value = true;
    try {
        await useFetch(`/api/servers/${serverId}/${userToDelete.value}`, {
            method: 'DELETE'
        });
        serverUsers.value = serverUsers.value.filter(user => user.id !== userToDelete.value);
    } catch (error) {
        console.error('Error removing user:', error);
    } finally {
        isDeletingUser.value = false;
        showUserDeleteModal.value = false;
        userToDelete.value = null;
    }
};

onMounted(async () => {
    await initializeServer();
});
</script>

<style scoped>
.server-view {
    display: flex;
    height: 100%;
}

.sidebar {
    max-width: 170px;
    min-width: 170px;
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

.server-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #1f2937;
    margin-top: 0.47rem;
    margin-bottom: 0.47rem;
}

.server-header h3 {
    margin: 0;
    flex-grow: 1;
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
    margin-right: 20px;
}

.no-channel-message {
    font-size: 18px;
    font-weight: bold;
}

.add-button {
    margin: 0;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
}

.new-channel-form {
    margin-bottom: 0.5rem;
}

.action-button {
    width: 32px;
    height: 32px;
}

.channel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.section-title {
    margin: 0;
    font-size: 1rem;
    font-weight: bold;
}

.content-area {
    position: relative;
}

.no-channel-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
}

.no-channel-message {
    font-size: 1.2rem;
    color: #555;
}

</style>