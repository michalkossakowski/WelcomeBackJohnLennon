<template>
    <div class="message-form">
        <!-- Notifications positioned above the form -->
        <div class="absolute bottom-full left-0 right-0 mb-2">
            <NotificationSlider
                :show="!!errorMessage"
                type="error"
                :message="errorMessage || ''"
            />

            <NotificationSlider
                :show="!!fileTypeError"
                type="error"
                :message="fileTypeError || ''"
            />

            <NotificationSlider
                v-if="selectedFile"
                :show="true"
                type="info"
                :message="fileNotificationMessage"
            >
                <template #action>
                    <UButton
                        icon="i-heroicons-x-mark"
                        color="red"
                        variant="ghost"
                        size="xs"
                        @click="clearFile"
                    />
                </template>
            </NotificationSlider>
        </div>

        <form @submit.prevent="submitForm">
            <div class="flex items-center gap-2">
                <UTextarea
                    id="content"
                    v-model="message.content"
                    placeholder="Enter your message content"
                    required
                    class="flex-1"
                    @keydown.enter.prevent="submitForm"
                    :disabled="isError"
                />
                <FileUpload
                    ref="fileUploadRef"
                    @file-selected="handleFileSelected"
                    @file-cleared="handleFileClear"
                    class="flex-shrink-0"
                    :disabled="isError"
                />
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Message } from '~/models/messageModel';
import FileUpload from './FileUpload.vue';
import NotificationSlider from '~/components/notificationSlider.vue';

// API response type
interface ApiResponse {
    message: Message;
    status: number;
}

// error type
interface ApiError {
    status?: number;
    message?: string;
}

const props = defineProps({
    user: {
        type: Object,
        required: true,
    },
    channelId: {
        type: String,
        required: true,
    },
});

const message = ref<Message>(new Message('', '', new Date(), '', '', ''));
const errorMessage = ref<string | null>(null);
const fileTypeError = ref<string | null>(null);
const isError = ref(false);

const emit = defineEmits();

const filePath = ref<string | null>(null);

const fileUploadRef = ref();

const resetError = () => {
    errorMessage.value = null;
    fileTypeError.value = null;
    isError.value = false;
};

const handleChannelError = () => {
    errorMessage.value = "This channel is unavailable. Please try refreshing the page.";
    isError.value = true;
    emit('channelError');
};

const selectedFile = ref<File | null>(null);
const fileNotificationMessage = computed(() => {
    return selectedFile.value ? `Selected: ${selectedFile.value.name}` : '';
});

const isValidFileType = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    return allowedTypes.includes(file.type);
};

const handleFileSelected = (file: File) => {
    if (!isValidFileType(file)) {
        fileTypeError.value = "Invalid file type. Please upload only JPG, PNG, or GIF files.";
        return;
    }

    fileTypeError.value = null;
    selectedFile.value = file;
    filePath.value = URL.createObjectURL(file);
};

const handleFileClear = () => {
    selectedFile.value = null;
    filePath.value = null;
    fileTypeError.value = null;
};

const clearFile = () => {
    if (fileUploadRef.value) {
        fileUploadRef.value.clearFile();
    }
    handleFileClear();
};

const submitForm = async () => {
    try {
        resetError();

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

        const response = await $fetch<ApiResponse>('/api/messages/add', {
            method: 'POST',
            body: JSON.stringify(message.value),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        emit('newMessage', message.value);
        message.value = new Message('', '', new Date(), '', '', '');

    } catch (error) {
        console.error('Message send error:', error);

        const err = error as ApiError;

        if (err.status === 500) {
            handleChannelError();
        } else {
            errorMessage.value = "Failed to send message. Please try again.";
        }
    }
};
</script>

<style scoped>
.message-form {
    position: relative;
}
</style>