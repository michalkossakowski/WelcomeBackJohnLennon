<template>
    <div class="message-form">
        <form @submit.prevent="submitForm">
            <div class="flex items-center gap-2">
                <UTextarea
                    id="content"
                    v-model="message.content"
                    placeholder="Enter your message content"
                    required
                    class="flex-1"
                    @keydown.enter.prevent="submitForm"
                />
                <FileUpload
                    ref="fileUploadRef"
                    @file-selected="handleFileSelected"
                    class="flex-shrink-0"
                />
            </div>
            <div v-if="filePath" class="mt-2 text-sm text-gray-600">
                File selected: {{ filePath }}
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import { Message } from '~/models/messageModel';
import FileUpload from './FileUpload.vue'

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

const filePath = ref<string | null>(null);

const handleFileSelected = (path: string) => {
    filePath.value = path;
};

const fileUploadRef = ref();

const submitForm = async () => {
    try {
        let uploadedFilePath;
        if (fileUploadRef.value) {
            uploadedFilePath = await fileUploadRef.value.uploadFile();
        }

        message.value = new Message(
            Math.random().toString(36).slice(2, 12),
            props.channelId,
            new Date(),
            props.user.username,
            props.user.id,
            message.value.content,
            uploadedFilePath
        );

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
