import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

const getBaseUrl = () => {
    // If we have a hostUri (Expo Go / Development), use that IP
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
        const ip = hostUri.split(':')[0];
        // Ensure this port matches your backend server
        return `http://${ip}:5200/api`;
    }

    // Fallback for scenarios where hostUri isn't available (e.g. standalone builds vs localhost)
    return Platform.select({
        android: 'http://10.0.2.2:5200/api',
        ios: 'http://localhost:5200/api',
        default: 'http://localhost:5200/api',
    });
};

const BASE_URL = getBaseUrl();

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add Token
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        console.error('API Context - Failed to get token:', e);
    }
    return config;
});

// Response Interceptor: Handle Errors
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            console.warn('API Context - 401 Unauthorized detected.');
            await SecureStore.deleteItemAsync('token');
            // Force navigation to login
            try {
                // We use dynamic import or check if router is available, 
                // but standard import should work if this file is not circular dependency
                const { router } = require('expo-router');
                router.replace('/login');
            } catch (navError) {
                console.error("Navigation error", navError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
