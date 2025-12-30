import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function LandingScreen() {
    const router = useRouter();

    useEffect(() => {
        // ALWAYS default to Field Worker Dashboard
        // Supervisor access is ONLY via Switch Account
        router.replace('/(tabs)/');
    }, []);


    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
        </View>
    );
}
