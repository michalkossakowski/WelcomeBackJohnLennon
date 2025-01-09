<template>
    <UModal v-model="isOpen" >
        <UCard>
            <template #header>
                <div class="modal-header">
                    <h3 class="modal-title">{{ title }}</h3>
                </div>
            </template>
            <div class="modal-content">
                <slot>
                    {{ description }}
                </slot>
            </div>
            <template #footer>
                <div class="modal-footer">
                    <UButton
                        v-if="showCancelButton"
                        color="gray"
                        variant="ghost"
                        @click="handleCancel"
                    >
                        {{ cancelButtonText }}
                    </UButton>
                    <UButton
                        :color="actionButtonColor"
                        variant="solid"
                        :loading="loading"
                        @click="handleAction"
                    >
                        {{ actionButtonText }}
                    </UButton>
                </div>
            </template>
        </UCard>
    </UModal>
</template>

<script setup lang="ts">

const props = defineProps<{
    modelValue: boolean
    title: string
    description?: string
    showCancelButton?: boolean
    cancelButtonText?: string
    actionButtonText: string
    actionButtonColor?: any
    loading?: boolean
}>();

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'cancel': []
    'action': []
}>();

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const handleCancel = () => {
    emit('cancel');
    isOpen.value = false;
};

const handleAction = () => {
    emit('action');
};
</script>

<style scoped>
.modal-header {
    padding-bottom: 16px;
}

.modal-title {
    font-size: 20px;
    font-weight: bold;
    margin: 0;
}

.modal-content {
    padding: 16px 0;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 16px;
}
</style>