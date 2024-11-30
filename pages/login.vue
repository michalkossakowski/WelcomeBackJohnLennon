<template>
  <div class="login-container">
    <h1>Login</h1>
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormGroup label="Username" name="username">
        <UInput v-model="state.username" placeholder="Enter your username" />
      </UFormGroup>

      <UFormGroup label="Password" name="password">
        <UInput v-model="state.password" type="password" placeholder="Enter your password" />
      </UFormGroup>

      <UButton type="submit">Log In</UButton>
    </UForm>

    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

    <UButton to="/register" class="mt-4">Don't have an account? Register</UButton>
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

  const state = reactive({
    username: undefined,
    password: undefined
  })

  const router = useRouter()
  const errorMessage = ref('')

  async function onSubmit(event: FormSubmitEvent<Schema>) {
    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: {
          username: event.data.username,
          password: event.data.password
        }
      })

      if (response.statusCode === 200) {
        router.push('/profile').then(() => {
            window.location.reload();
        });
      } 
      else {
        errorMessage.value = response.message
      }
    } 
    catch (error) {
      errorMessage.value = 'Login failed: '+ error
    }
  }
</script>

<style scoped>
  h1{
    font-size: 32px;
  }

  .login-container {
    max-width: 300px;
    margin: auto auto;
    text-align: center;
  }

  .error {
    color: red;
    margin-top: 10px;
  }
</style>
