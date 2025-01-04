<template>
    <form @submit.prevent="submitForm" >
        <UButtonGroup size="sm" orientation="horizontal">
            <UInput 
            icon="i-heroicons-user-circle"
            v-model="friendCode"
            placeholder="Enter your friend code ..."  
            color="white"
            @keydown.enter.prevent="submitForm"/>
            <UButton icon="i-heroicons-user-plus" type="submit">Add Friend</UButton>
        </UButtonGroup>
    </form>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const toast = useToast()

const props = defineProps<{
  userId: string|undefined; 
}>();

const emit = defineEmits<{
  (event: 'friendAdded', friend: { id: string, username: string, avatar: string }): void;
}>();

const friendCode = ref('');
const errorMessage = ref<string | null>(null);

const submitForm = async () => {
    errorMessage.value = null;

    if (!friendCode.value) {
        toast.add({ title: `Friend code cannot be empty`});
        return;
    }

    try {
        const response = await $fetch('/api/friends/add', {
            method: 'POST',
            body: {
                userId: props.userId,
                friendCode: friendCode.value,
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });
        friendCode.value = '';
        emit('friendAdded',response.friend);
        toast.add({ title: `New Friend Added: ${response.friend.username}`});
    } catch (error) {
        toast.add({ title: `${error?.toString().split('Message:')[1]?.trim() || error}`});
    }
};
</script>

<style scoped>
.friend-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
#inputFriendCode {
    width: 200px;
}
.btn-submit {
    background-color: #4ade80;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    cursor: pointer;
}
.error {
    color: #f87171;
}
.success {
    color: #4ade80;
}
</style>
