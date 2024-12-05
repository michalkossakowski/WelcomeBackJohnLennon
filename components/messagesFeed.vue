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

    <MessageForm :username="user?.username" :channelId="channelId"/>
    
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
    const {data} = useWebSocket(wsUrl, { immediate: false });

    const user = ref<User | null>(null)
      
      const fetchUser = async () => {
          try {
              const response = await $fetch('/api/users/get', { method: 'GET' })
              user.value = response.user
              wsUrl.value = `ws://localhost:3001?channelId=${props.channelId}&userId=${user.value?.id}`;
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
            const data  = await $fetch(`/api/messages/${props.channelId}`);
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
        const messageBox = document.getElementById('messageBox');
        if (messageBox) {
            messageBox.scrollTop = messageBox.scrollHeight;
        }
    };

    onMounted(() => {
        fetchUser();
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
