<template>
    <div>
        <h2>Messages Feed:</h2>
    
        <div v-if="loading">
            Loading ...
        </div>
    
        <div v-else-if="error">{{ error }}</div>
    
        <div v-else class="messageBox">
            <div v-for="message in messages" :key="message.id" class="card">
                <div class="card-body">
                    <h5 class="card-title">{{message.author}}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">{{new Date(message.publishDate).toLocaleDateString()}}</h6>
                    <p class="card-text">{{message.content}}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { ref, onMounted } from 'vue';
    import axiosInstance from '../axiosInstance';
    
    export default {
        setup() {
            const messages = ref([]);
            const loading = ref(false);
            const error = ref(null);
        
            const fetchMessages = async () => {
                loading.value = true;
                error.value = null;
                try {
                    const response = await axiosInstance.get('/messages');
                    messages.value = response.data;
                } 
                catch (err) {
                    error.value = 'Fetch error: ' + err.message;
                } 
                finally {
                    loading.value = false;
                }
            };
        
            onMounted(() => {
                fetchMessages();
            });

            return {
                messages,
                loading,
                error
            };
        }
    };
</script>
    
<style scoped>
    
    .card{
        margin: 1vh 0vh;
    }
    
    .messageBox{
        max-height: 70vh;
        overflow-y: auto;
        padding-right: 1vw;
        width: 60vw;
    }

</style>