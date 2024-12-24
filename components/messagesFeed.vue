<template>
    <div class="messages-feed-containter">
        <div v-if="loading">
            <NuxtLoadingIndicator />
        </div>

        <div v-else-if="error">
            {{ error }}
        </div>
        <div v-else >
            <div class="search-container">
                <UInput icon="i-heroicons-magnifying-glass-20-solid" size="sm" color="white" :trailing="false"
                        v-model="searchMessage" type="text" placeholder="Search for message ..." class="search-input" />
            </div>
            <div id="messages-box">
                <UAlert v-if="filteredMessages.length == 0"
                        icon="i-heroicons-face-frown"
                        color="primary"
                        variant="solid"
                        title="No messages found"
                        :description='alertMessage'
                />
                <div v-for="message in filteredMessages" :key="message.id" class="card">
                    <UCard>
                        <template #header>
                            <b class="username">{{ message.author }}</b>
                            <span class="time">
                                {{ new Date(message.publishDate).toLocaleDateString() }}
                                {{ new Date(message.publishDate).toLocaleTimeString() }}
                            </span>
                        </template>
                        <div class="message-content">
                            <p>{{ message.content }}</p>
                            <img v-if="message.filePath"
                                 :src="message.filePath"
                                 :alt="'Image shared by ' + message.author"
                                 class="mt-2 max-w-sm rounded-lg shadow-md"
                                 @load="scrollToNewest"
                                 />
                        </div>
                    </UCard>
                </div>
            </div>
            <div class="messageForm">
                <MessageForm :user="user" :channelId="channelId" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useWebSocket } from '@vueuse/core';
import { Message } from '../models/messageModel';
import MessageForm from './messageForm.vue';
import type { User } from '~/models/userModel'
const config = useRuntimeConfig();

const props = defineProps({
    channelId: {
        type: String,
        required: true,
    },
})

const messages = ref<Message[]>([]);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);
const searchMessage = ref<string>('');
const wsUrl = ref<string | undefined>(undefined);
const { data, close: closeWebSocket } = useWebSocket(wsUrl, { immediate: false });

const user = ref<User | null>(null)

const fetchUser = async () => {
    try {
        const response = await $fetch('/api/users/get', { method: 'GET' })
        user.value = response.user
        wsUrl.value = `${config.public.wsUrl}?channelId=${props.channelId}&userId=${user.value?.id}`;
    } catch (error) {
        user.value = null
    }
}

watch(data, (newMessage) => {
    if (newMessage) {
        const message: Message = JSON.parse(newMessage as string);
        addMessage(message);
    }
});

const filteredMessages = computed(() => {
    if (!searchMessage.value) return messages.value;
    return messages.value.filter(message =>
        message.content.toLowerCase().includes(searchMessage.value.toLowerCase())
    );
});

const alertMessage = computed(() => {
    if (messages.value.length === 0) {
        return "This chat is empty, be the first to send a message!";
    }
    if (filteredMessages.value.length === 0 && searchMessage.value.trim()) {
        return `There is no messages with: "${searchMessage.value.trim()}" inside`;
    }
    return "";
});


const addMessage = (newMessage: Message) => {
    messages.value.push(newMessage);
    nextTick(() => {
        scrollToNewest();
    });
};

const fetchMessages = async () => {
    loading.value = true;
    error.value = null;

    try {
        const data = await $fetch<Message[]>(`/api/messages/${props?.channelId}`);
        if (data) {
            messages.value = data.map((message: Message) =>
                new Message(
                    message.id,
                    message.channelId,
                    message.publishDate,
                    message.author,
                    message.authorId,
                    message.content,
                    message.filePath
                )
            );
        }
    } catch (err) {
        error.value = 'Błąd pobierania wiadomości: ' + err;
    } finally {
        loading.value = false;
        nextTick(() => {
            scrollToNewest();
        });
    }
};


const scrollToNewest = () => {
    const messageBox = document.getElementById('messages-box');
    if (messageBox) {
        messageBox.scrollTop = messageBox.scrollHeight;
    }
};

onMounted(() => {
    fetchUser();
    fetchMessages();
});

onUnmounted(() => {
  closeWebSocket();
});

</script>

<style scoped>

.time {
    color: grey;
}
.card {
    margin: 20px 1px;
}

.message-content{
    word-wrap: break-word;
    max-width: 70vw;
}

.username {
    font-size: 22px;
    color: #4ade80;
    margin-right: 10px;
}

#messages-box {
    max-height: 75vh;
    min-height: 75vh;
    overflow-y: auto;
    padding-right: 20px;
}

.messageForm{
    margin-top: 1vh;
}
.search-container{
    margin-top: 1vh;
    margin-bottom: 1vh;
}
</style>
