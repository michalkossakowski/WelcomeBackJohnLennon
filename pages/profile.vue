<template>
    <div class="profile-container">
        <h1 class="title">My Profile</h1>
        <div v-if="user" class="space-y-4 info">
            <div class="avatar-container" @click="selectAvatar">
                <img class="avatar"
                :src="user.avatar"
                alt="Avatar"
                />
                <div class="overlay">
                    <UIcon class="icon w-5 h-5" name="i-heroicons-pencil"/>
                </div>
                <input type="file" ref="fileInput" accept="image/*" @change="handleFileChange($event)" style="display: none;" />
            </div>
            <div>
                <div>
                    <strong>Friend Code:</strong> {{ user.id }}
                </div>
                <div>
                    <strong>Username:</strong> {{ user.username }}
                </div>
                <div>
                    <strong>Password:</strong> {{ user.password }}
                </div>
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
const fileInput = ref<HTMLInputElement | null>(null)

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

const selectAvatar = () => {
    fileInput.value?.click()
}
const handleFileChange = async (event: Event) => {
    if (!user.value) return
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    let filePath;
    if (file) {
        try {
            const formData = new FormData()
            formData.append('avatar', file)

            const response = await fetch('/api/uploadAvatar', {
                method: 'POST',
                body: formData
            })

            if (response.ok) {
                const data = await response.json()
                filePath = data.filePath
                if (filePath) {
                    const response = await $fetch(`/api/users/changeAvatar`, {
                        method: 'PUT',
                        body: JSON.stringify({ filePath: filePath, userId: user.value.id })
                    })
                    router.push('/profile').then(() => {
                        window.location.reload()
                    })
                }
            } else {
                console.error('Failed to upload avatar')
            }
        } catch (error) {
            console.error('Error uploading avatar:', error)
        }
    }
}

onMounted(() => {
    fetchUser()
})
</script>

<style scoped>
.title {
    font-size: 32px;
    font-weight: bold;
    text-align: left;
    margin-bottom: 20px;
}

.info{
    font-size: 24px;
    text-align: left;
    display: flex;
    flex-direction: row;
}
.avatar-container {
    position: relative;
    width: 160px;
    height: 160px;
    margin-right: 50px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
}
.avatar{
    width: 160px;
    height: 160px;
    margin-right: 50px;
    border-radius: 50%;
    object-fit: cover;
}
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
}

.overlay .icon {
    font-size: 32px;
    color: white;
}

.avatar-container:hover .overlay {
    opacity: 1;
}
</style>
