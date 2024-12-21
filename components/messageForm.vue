<template>
    <div class="message-form">
        <form @submit.prevent="submitForm">
            <div class="form-group">
                <UTextarea id="content" v-model="message.content" placeholder="Enter your message content" required
                    @keydown.enter.prevent="submitForm" />
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import { Message } from '../models/messageModel';
import type { User } from '~/models/userModel'

const props = defineProps({
    user: {
        type: Object,
        required: true,
    },
    channelId: {
        type: String,
        required: true,
    },
})

const message = ref<Message>(new Message('', '', new Date(),'' , '', ''));

const emit = defineEmits();

const submitForm = async () => {
    try {
        message.value.id = Math.random().toString(36).slice(2, 12);
        message.value.channelId = props.channelId;
        message.value.publishDate = new Date();
        message.value.author = props.user.username;
        message.value.authorId = props.user.id;

        await $fetch('/api/messages/add', {
            method: 'POST',
            body: JSON.stringify(message.value),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        emit('newMessage', message.value);

        message.value = new Message('', '', new Date(), '', '', '');
    } catch (err) {
        console.error('Message send error: ' + err);
    }
};
</script>

<style scoped>

</style>
