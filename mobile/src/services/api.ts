import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator, localhost for iOS/Web
const BASE_URL = Platform.select({
    android: 'http://10.0.2.2:5200/api', // Verify port from launchSettings.json
    ios: 'http://localhost:5200/api',
    default: 'http://localhost:5200/api',
});

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add Token
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('user_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Handle Errors
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            await SecureStore.deleteItemAsync('user_token');
            // You might want to trigger a navigation to login here
            // or emit an event that the app listens to
        }
        return Promise.reject(error);
    }
);

export default api;
