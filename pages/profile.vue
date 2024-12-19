<template>
    <div class="profile-container">
        <h1>User Profile</h1>
        <div v-if="user" class="space-y-4">
            <div>
                <strong>ID:</strong> {{ user.id }}
            </div>
            <div>
                <strong>Username:</strong> {{ user.username }}
            </div>
            <div>
                <strong>Password:</strong> {{ user.password }}
            </div>
        </div>
        <div v-else>
            <p>Loading...</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '~/models/userModel'

const user = ref<User>()
const router = useRouter()

const fetchUser = async () => {
    try {
        const response = await $fetch('/api/users/get', {
            method: 'GET'
        })

        if (response.statusCode === 200) {
            user.value = response.user
        } else {
            router.push('/login')
        }
    } catch (error) {
        console.error('Error fetching user', error)
        router.push('/login')
    }
}

const logout = async () => {
    window.location.reload();
    try {
        const response = await $fetch('/api/auth/logout', {
            method: 'POST'
        })
        if (response.statusCode === 200) {
            console.error('Logout succesfull')
        }
        else {
            console.error('Logout failed')
        }
    }
    catch (error) {
        console.error('Error during logout', error)
    }
}

onMounted(() => {
    fetchUser()
})
</script>

<style scoped>
h1 {
    font-size: 32px;
    margin-bottom: 1rem;
}

.profile-container {

    margin: 10px;
}
</style>
