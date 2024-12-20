<template>
    <form @submit.prevent="submitForm">
        <div class="form-group">
            <UTextarea id="content" v-model="friendCode" placeholder="Enter your friend code ..." required
                @keydown.enter.prevent="submitForm" />
        </div>
    </form>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';

const friendCode = ref();

const submitForm = async () => {
    try {
        await $fetch('/api/friends/add', {
            method: 'POST',
            body: JSON.stringify(friendCode.value),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        friendCode.value = "";
    } catch (err) {
        console.error('Friend add error: ' + err);
    }
};

</script>


<style scoped>

</style>