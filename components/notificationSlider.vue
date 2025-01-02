<template>
    <div
        :class="['notification-container', notificationStyle]"
        :style="{
            transform: show ? 'translateY(0)' : 'translateY(-16px)',
            opacity: show ? '1' : '0'
        }"
    >
        <div class="notification-content">
            <span>{{ message }}</span>
            <slot name="action"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
    show: {
        type: Boolean,
        required: true
    },
    type: {
        type: String,
        default: 'info',
        validator: (value: string) => ['error', 'info'].includes(value)
    },
    message: {
        type: String,
        required: true
    }
});

const notificationStyle = computed(() => (props.type === 'error' ? 'error-style' : 'info-style'));
</script>

<style scoped>
.notification-container {
    transition: all 300ms ease-in-out;
    margin-bottom: 0.5rem;
    width: calc(100% - 37px);
}

.notification-content {
    font-size: 0.875rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid #1f2937;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #202936;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}

.error-style {
    color: #f87171; /* Equivalent to text-red-400 */
}

.info-style {
    color: #d1d5db; /* Equivalent to text-gray-300 */
}
</style>
