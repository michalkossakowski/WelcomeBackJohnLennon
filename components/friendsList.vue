<template>
    <div
        v-for="u in users"
        :key="u.id"
        class="card"
    >
        <UCard>
        <template #header>
            <b>{{ u.username }}</b>
            <div>
                {{ u.id }}
            </div>
        </template>
        TREŚĆ
        </UCard>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import type { User } from '~/models/userModel'

const user = ref<User | null>(null)
const users = ref<any[]>([]);

const fetchUser = async () => {
try {
    const response = await $fetch('/api/users/get', { method: 'GET' })
    user.value = response.user
    wsUrl.value = `ws://localhost:3001?channelId=${props.channelId}&userId=${user.value?.id}`;
} catch (error) {
    user.value = null
}
}

const fetchUsers = async () => {

try {
    const data = await $fetch(`/api/users/getAll`);
    if (data) {
        users.value = data.map((user: any) => ({
                id: user.id,
                username: user.username
            })
        );
    }
} catch (err) {
    error.value = 'Users fetch error ' + err;
}
};


onMounted(() => {
fetchUser();
fetchUsers();
});

</script>