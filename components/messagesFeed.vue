<template>
    <div class="messages-feed-containter">
        <div v-if="loading">
            <NuxtLoadingIndicator />
        </div>

        <div v-else-if="error">
            {{ error }}
        </div>

        <div v-else id="messages-box">
            <div v-for="message in messages" :key="message.id" class="card">
                <UCard>
                    <template #header>
                        <b class="username">{{ message.author }}</b>
                        <span class="time">
                            {{ new Date(message.publishDate).toLocaleDateString() }}
                             
                            {{ new Date(message.publishDate).toLocaleTimeString() }}
                        </span>
                    </template>
                    <div class="message-content">    
                        {{ message.content }}
                    </div>
                </UCard>
            </div>
        </div>

        <MessageForm :username="user?.username" :channelId="channelId" />

    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useWebSocket } from '@vueuse/core';
import { Message } from '../models/messageModel';
import MessageForm from './messageForm.vue';
import type { User } from '~/models/userModel'

const props = defineProps({
    channelId: {
        type: String,
        required: true,
    },
})

const messages = ref<Message[]>([]);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

const wsUrl = ref<string | undefined>(undefined);
const { data, close: closeWebSocket } = useWebSocket(wsUrl, { immediate: false });

const user = ref<User | null>(null)

const fetchUser = async () => {
    try {
        const response = await $fetch('/api/users/get', { method: 'GET' })
        user.value = response.user
        wsUrl.value = `ws://localhost:3001?channelId=${props.channelId}&userId=${user.value?.id}`;
        //wsUrl.value = `https://<adrestunelu>?channelId=${props.channelId}&userId=${user.value?.id}`;
    } catch (error) {
        user.value = null
    }
}

watch(data, (newMessage) => {
    if (newMessage) {
        const message: Message = JSON.parse(newMessage as string);
        if(message.channelId === props.channelId){
            addMessage(message);
        }
    }
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
        const data : Message[] = await $fetch(`/api/messages/${props.channelId}`, { method: 'GET' });
        if (data) {
            messages.value = data.map((message: Message) =>
                new Message(
                    message.id,
                    message.channelId,
                    message.publishDate,
                    message.author,
                    message.content
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
}

.username {
    font-size: 22px;
    color: #4ade80;
    margin-right: 10px;
}


.message-feed-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}
#messages-box {
    max-height: 80vh;
    min-height: 80vh;
    overflow-y: auto;
}

</style>
