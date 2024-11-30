<template>
    <div class="login-container">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <div>
          <label for="username">username</label>
          <input
            type="string"
            id="username"
            v-model="username"
            placeholder="Enter your username"
            required
          />
        </div>
        <div>
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            required
          />
        </div>
        <div>
          <button type="submit">Log In</button>
        </div>
      </form>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      <p>Don't have an account? <nuxt-link to="/register">Register</nuxt-link></p>
    </div>
  </template>
  
  <script lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  // Typ odpowiedzi dla logowania
  interface LoginResponse {
    statusCode: number;
    message: string;
  }
  
  export default {
    setup() {
      const username = ref('');
      const password = ref('');
      const errorMessage = ref('');
      const router = useRouter();
  
      const handleLogin = async () => {
        try {
          // Określamy typ odpowiedzi
          const response = await $fetch<LoginResponse>('/api/auth/login', {
            method: 'POST',
            body: {
              username: username.value,
              password: password.value,
            },
          });
  
          if (response.statusCode === 200) {
            router.push('/profile');
          } else {
            errorMessage.value = response.message;
          }
        } catch (error) {
          errorMessage.value = 'Login failed. Please try again later.';
        }
      };
  
      return {
        username,
        password,
        errorMessage,
        handleLogin,
      };
    },
  };
  </script>
  
  <style scoped>
  .login-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  form div {
    margin-bottom: 1rem;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
  }
  
  button {
    width: 100%;
    padding: 0.5rem;
    background-color: #4caf50;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  .error {
    color: red;
    font-size: 0.9rem;
  }
  </style>
  