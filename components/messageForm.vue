<template>
  <h2>Add Message:</h2>
  <form @submit.prevent="submitForm">
    <div class="form-group">
      <label for="content">Content:</label>
      <textarea id="content" class="form-control" v-model="message.content" required></textarea>
      <button type="submit" class="btn btn-primary">Send</button>
    </div>
   
        
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

    <label for="author">Author:</label>
    <br />
    <input type="text" id="author" v-model="message.author" required />
    <br />
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

<style scoped>
  form{
    width: 20vw;
  }
</style>