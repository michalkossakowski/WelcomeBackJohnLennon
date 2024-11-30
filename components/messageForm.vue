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
  import { Message } from '../models/message';
  import type { User } from '~/models/user'

  const user = ref<User | null>(null)
      
  const fetchUser = async () => {
      try {
          const response = await $fetch('/api/users/get', { method: 'GET' })
          user.value = response.user
      } catch (error) {
          user.value = null
      }
  }

  onMounted(() => {
    fetchUser()
  })

  const message = ref<Message>(new Message('', 0, '', '', ''));

  const emit = defineEmits();

  const submitForm = async () => {
    try {

      message.value.id = Math.random().toString(36).slice(2, 12);
      message.value.channelId = 1;
      message.value.publishDate = new Date().toString();
      if(user.value){
        message.value.author = user.value?.username || "unknown";
      }
      else{
        throw("Author not recognized")
      }


      await useFetch('/api/messages/add', {
        method: 'POST',
        body: JSON.stringify(message.value),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      emit('newMessage', message.value);

      message.value = new Message('', 0, '', '', '');
    } catch (err) {
      console.error('Message send error: ' + err);
    }
  };
</script>

<style scoped>

</style>
