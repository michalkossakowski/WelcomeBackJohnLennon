import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:1981/', 
    headers: {
        'Content-Type': 'application/json', 
    }
});

export default axiosInstance;
