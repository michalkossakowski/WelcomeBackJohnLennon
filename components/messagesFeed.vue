<template>
  <div>
    <div v-if="loading">
      <NuxtLoadingIndicator />
    </div>

    <div v-else-if="error">
      {{ error }}
    </div>

    <div v-else id="messageBox">
      <div
        v-for="message in messages"
        :key="message.id"
        class="card"
      >
        <UCard>
          <template #header>
            <b>{{ message.author }}</b>

            <div>
                {{ new Date(message.publishDate).toLocaleTimeString() }}
                {{ new Date(message.publishDate).toLocaleDateString() }}
            </div>
          </template>
          {{ message.content }}
        </UCard>
      </div>
    </div>

    <MessageForm/>
  </div>
</template>

<script lang="ts" setup>
    import { ref, onMounted, nextTick, watch } from 'vue';
    import { useWebSocket } from '@vueuse/core';
    import { Message } from '../models/messageModel'; 
    import MessageForm from './messageForm.vue';

    const messages = ref<Message[]>([]);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const wsUrl = 'ws://localhost:3001';
    const { send, data, status } = useWebSocket(wsUrl);

    watch(data, (newMessage) => {
        if (newMessage) {
            const message: Message = JSON.parse(newMessage as string);
            addMessage(message);
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
            const { data } = await useFetch('/api/messages/get');
            if (data.value) {
            messages.value = data.value.map((message: any) =>
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
        const messageBox = document.getElementById('messageBox');
        if (messageBox) {
            messageBox.scrollTop = messageBox.scrollHeight;
        }
    };

    onMounted(() => {
        fetchMessages();
    });
</script>

<style scoped>
    .card {
    margin: 20px 1px;
    }

    #messageBox {
    margin-bottom: 20px;
    max-height: 75vh;
    overflow-y: auto;
    }
</style>
