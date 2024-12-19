<template>
    <div class="auth-container">
        <h1>{{ isLogin ? 'Login' : 'Register' }}</h1>
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
            <UFormGroup label="Username" name="username">
                <UInput v-model="state.username" placeholder="Enter your username" />
            </UFormGroup>

            <UFormGroup label="Password" name="password">
                <UInput v-model="state.password" type="password" placeholder="Enter your password" />
            </UFormGroup>

            <UButton type="submit">{{ isLogin ? 'Log In' : 'Register' }}</UButton>
        </UForm>

        <UButton @click="toggleMode" class="mt-4">
            {{ isLogin ? "Don't have an account? Register" : 'Already have an account? Log In' }}
        </UButton>
        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    </div>
</template>

<script setup lang="ts">
import { object, string, type InferType } from 'yup'
import type { FormSubmitEvent } from '#ui/types'
import { useRouter } from 'vue-router'

const schema = object({
    username: string().required('Username is required'),
    password: string().required('Password is required')
})

type Schema = InferType<typeof schema>

const isLogin = ref(true)

const state = reactive({
    username: undefined,
    password: undefined
})

const router = useRouter()
const errorMessage = ref<string | null>(null);

async function onSubmit(event: FormSubmitEvent<Schema>) {
    try {
        const url = isLogin.value ? '/api/auth/login' : '/api/auth/register'
        const response = await $fetch(url, {
            method: 'POST',
            body: {
                username: event.data.username,
                password: event.data.password
            }
        })

        if (response.statusCode === 200) {
            if (isLogin.value) {
                router.push('/').then(() => {
                    window.location.reload()
                })
            } else {
                router.push('/login')
            }
        } else {
            errorMessage.value = response.message
        }
    } catch (error) {
        errorMessage.value = (isLogin.value ? 'Login' : 'Registration') + ' failed: ' + error
    }
}


function toggleMode() {
    isLogin.value = !isLogin.value
    errorMessage.value = null;
    state.username = undefined
    state.password = undefined
}
</script>

<style scoped>
h1 {
    font-size: 32px;
}

.auth-container {
    max-width: 300px;
    margin: auto;
    text-align: center;
}

.error {
    color: red;
    margin-top: 10px;
}
</style>
