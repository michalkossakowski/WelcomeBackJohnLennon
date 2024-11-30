<template>
    <div class="profile-container">
      <h2>User Profile</h2>
      <div v-if="user">
        <p><strong>username:</strong> {{ user.username }}</p>
        <p><strong>ID:</strong> {{ user.id }}</p>
      </div>
      <div v-else>
        <p>Loading...</p>
      </div>
      <button @click="logout">Log Out</button>
    </div>
  </template>
  
  <script lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  
  export default {
    setup() {
      const user = ref<any>(null);
      const router = useRouter();
  
      const fetchUserProfile = async () => {
        try {
          const response = await $fetch('/api/users/profile', {
            method: 'GET',
          });
  
          if (response.statusCode === 200) {
            user.value = response.user;
          } else {
            router.push('/login');
          }
        } catch (error) {
          console.error('Error fetching user profile', error);
          router.push('/login');
        }
      };
  
      const logout = async () => {
        try {
          // Wywołanie endpointu logout na serwerze
          const response = await $fetch('/api/auth/logout', {
            method: 'POST',
          });
  
          if (response.statusCode === 200) {
            // Po wylogowaniu przekierowanie do strony logowania
            router.push('/login');
          } else {
            console.error('Logout failed');
          }
        } catch (error) {
          console.error('Error during logout', error);
        }
      };
  
      onMounted(() => {
        fetchUserProfile();
      });
  
      return {
        user,
        logout,
      };
    },
  };
  </script>
  
  <style scoped>
  .profile-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  button {
    padding: 0.5rem;
    background-color: #f44336;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #e53935;
  }
  </style>
  