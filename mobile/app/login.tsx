import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../src/services/api';
import { AxiosError } from 'axios';

import { LoginResponse, UserDto } from '../src/types';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    // Use password instead of PIN for now, or map PIN to password if backend expects that
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            router.replace('/(tabs)');
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Adjust endpoint payload to match AuthController.Login(LoginRequest)
            // Assuming LoginRequest is { email, password }
            const response = await api.post<LoginResponse>('/Auth/login', {
                email, // Mapping username input to email field
                password: password
            });

            const { token, user } = response.data;

            await SecureStore.setItemAsync('token', token);
            await SecureStore.setItemAsync('user', JSON.stringify(user));
            // Store role for permission checks
            await SecureStore.setItemAsync('userRole', user.role);

            router.replace('/(tabs)');
        } catch (err: any) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || 'Login failed. Verify your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.title}>Hazard-Eye</Text>
                <Text style={styles.subtitle}>Worker Login</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </TouchableOpacity>

                {/* Registration link removed as registration is usually admin-controlled or separate flow */}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2D3748',
        justifyContent: 'center',
        padding: 20,
    },
    form: {
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#E53E3E',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 18,
        color: '#718096',
        marginBottom: 30,
    },
    input: {
        width: '100%',
        backgroundColor: '#EDF2F7',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        width: '100%',
        backgroundColor: '#3182CE',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#A0AEC0',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
