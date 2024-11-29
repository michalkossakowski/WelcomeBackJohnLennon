<template>
  <form @submit.prevent="submitForm">
    <div class="form-group">
      <UTextarea
        id="content"
        v-model="message.content"
        placeholder="Enter your message content"
        required
        @keydown.enter.prevent="submitForm"
      />
    </div>

  </form>
</template>

<script setup lang="ts">
  import { ref, defineEmits } from 'vue';
  import { Message } from '../models/Message';

  // Tworzymy pustą wiadomość
  const message = ref<Message>(new Message('', 0, '', '', ''));

  // Definiujemy emit, by wysyłać zdarzenie do komponentu rodzica
  const emit = defineEmits();

  const submitForm = async () => {
    try {
      // Generujemy unikalne id dla wiadomości
      message.value.id = Math.random().toString(36).slice(2, 12);
      message.value.channelId = 1;
      message.value.publishDate = new Date().toString();
      message.value.author = 'Freddie Batoniury';

      // Wysyłamy wiadomość do API
      await useFetch('/api/messages/add', {
        method: 'POST',
        body: JSON.stringify(message.value),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Emitujemy nową wiadomość do komponentu rodzica (MessagesFeed)
      emit('newMessage', message.value);

      // Resetujemy formularz
      message.value = new Message('', 0, '', '', '');
    } catch (err) {
      console.error('Message send error: ' + err);
    }
  };
</script>

<style scoped>
</style>
