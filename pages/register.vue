<template>
    <div class="register-container">
      <h2>Register</h2>
      <form @submit.prevent="handleRegister">
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
          <button type="submit">Register</button>
        </div>
      </form>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      <p>Already have an account? <nuxt-link to="/login">Log In</nuxt-link></p>
    </div>
  </template>
  
  <script lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  // Typ odpowiedzi dla rejestracji
  interface RegisterResponse {
    statusCode: number;
    message: string;
  }
  
  export default {
    setup() {
      const username = ref('');
      const password = ref('');
      const errorMessage = ref('');
      const router = useRouter();
  
      const handleRegister = async () => {
        try {
          // Określamy typ odpowiedzi
          const response = await $fetch<RegisterResponse>('/api/auth/register', {
            method: 'POST',
            body: {
              username: username.value,
              password: password.value,
            },
          });
  
          if (response.statusCode === 200) {
            router.push('/login');
          } else {
            errorMessage.value = response.message;
          }
        } catch (error) {
          errorMessage.value = 'Registration failed. Please try again later.';
        }
      };
  
      return {
        username,
        password,
        errorMessage,
        handleRegister,
      };
    },
  };
  </script>
  
  <style scoped>
  .register-container {
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
  