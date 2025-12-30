import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type BadgeVariant = 'High' | 'Medium' | 'Low' | 'open' | 'verified' | 'closed' | string;

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant, style, textStyle }) => {
    const getStyle = (): { container: ViewStyle, text: TextStyle } => {
        switch (String(variant).toLowerCase()) {
            // Severities
            case 'high':
                return {
                    container: { backgroundColor: '#FFF5F5', borderColor: '#FEB2B2', borderWidth: 1 },
                    text: { color: '#C53030' }
                };
            case 'medium':
                return {
                    container: { backgroundColor: '#FFFAF0', borderColor: '#FBD38D', borderWidth: 1 },
                    text: { color: '#DD6B20' }
                };
            case 'low':
                return {
                    container: { backgroundColor: '#EBF8FF', borderColor: '#90CDF4', borderWidth: 1 },
                    text: { color: '#3182CE' }
                };

            // Statuses
            case 'open':
                return {
                    container: { backgroundColor: '#FEFCBF' },
                    text: { color: '#D69E2E' }
                };
            case 'verified':
                return {
                    container: { backgroundColor: '#C6F6D5' },
                    text: { color: '#2F855A' }
                };
            case 'closed':
                return {
                    container: { backgroundColor: '#E2E8F0' },
                    text: { color: '#4A5568' }
                };

            default:
                return {
                    container: { backgroundColor: '#EDF2F7' },
                    text: { color: '#4A5568' }
                };
        }
    };

    const stylesForVariant = getStyle();

    return (
        <View style={[styles.badge, stylesForVariant.container, style]}>
            <Text style={[styles.text, stylesForVariant.text, textStyle]}>
                {children}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
});
