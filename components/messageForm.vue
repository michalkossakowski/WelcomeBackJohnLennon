<template>
  <h2>Add Message:</h2>
  <form @submit.prevent="submitForm">
    <label for="id">ID:</label>
    <br />
    <input type="text" id="id" v-model="message.id" required />
    <br />

    <label for="channelId">Channel ID:</label>
    <br />
    <input type="text" id="channelId" v-model="message.channelId" required />
    <br />

    <label for="publishDate">Publish Date:</label>
    <br />
    <input type="date" id="publishDate" v-model="message.publishDate" required />
    <br />

    <label for="author">Autor:</label>
    <br />
    <input type="text" id="author" v-model="message.author" required />
    <br />

    <label for="content">Treść:</label>
    <br />
    <textarea id="content" v-model="message.content" required></textarea>
    <br />

    <button type="submit">Dodaj Wiadomość</button>
  </form>
</template>

<script>
import { ref } from 'vue';
import axiosInstance from '../axiosInstance';

export default {
  setup() {

    const message = ref({
      id: '',
      channelId: '',
      publishDate: '',
      author: '',
      content: ''
    });

    const submitForm = async () => {
      try {
        await axiosInstance.post('/messages', message.value);

        message.value = {
          id: '',
          channelId: '',
          publishDate: '',
          author: '',
          content: ''
        };
      } 
      catch (err) {
        console.error('Message sent error: ' + err);
      }
    };

    return {
      message,
      submitForm
    };
  }
};
</script>