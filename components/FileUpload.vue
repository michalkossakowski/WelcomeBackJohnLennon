<template>
    <div class="file-upload">
        <UButton icon="i-heroicons-photo" size="sm" @click="openFileInput" />
        <input
            type="file"
            ref="fileInput"
            class="hidden"
            accept="image/*"
            @change="handleFileChange"
        />
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['file-selected', 'file-cleared']);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);

const openFileInput = () => {
    fileInput.value?.click();
};

const handleFileChange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files?.length) return;

    selectedFile.value = target.files[0];
    emit('file-selected', selectedFile.value);
};

const uploadFile = async (): Promise<string | undefined> => {
    if (!selectedFile.value) return undefined;

    const formData = new FormData();
    formData.append('file', selectedFile.value);

    const response = await $fetch('/api/upload', {
        method: 'POST',
        body: formData
    });

    clearFile();
    return response.filePath;
};

const clearFile = () => {
    selectedFile.value = null;
    if (fileInput.value) {
        fileInput.value.value = '';
    }
    emit('file-cleared');
};

defineExpose({ uploadFile, clearFile });
</script>