import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SupervisorLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: Platform.select({
                    ios: {
                        position: 'absolute',
                    },
                    default: {},
                }),
            }}>
            {/* Incidents Tab */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Incidents',
                    tabBarIcon: ({ color }) => <Ionicons size={28} name="alert-circle" color={color} />,
                }}
            />

            {/* Tasks Tab */}
            <Tabs.Screen
                name="tasks"
                options={{
                    title: 'Tasks',
                    tabBarIcon: ({ color }) => <Ionicons size={28} name="list" color={color} />,
                }}
            />

            {/* Profile Tab */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <Ionicons size={28} name="person" color={color} />,
                }}
            />

            {/* HIDDEN ROUTES */}
            <Tabs.Screen
                name="incidents/[id]"
                options={{
                    href: null,
                    title: 'Incident Details',
                    tabBarStyle: { display: 'none' } // Optional: Hide tab bar on detail
                }}
            />
            <Tabs.Screen
                name="tasks/[id]"
                options={{
                    href: null,
                    title: 'Task Details',
                    tabBarStyle: { display: 'none' } // Optional: Hide tab bar on detail
                }}
            />
        </Tabs>
    );
}
