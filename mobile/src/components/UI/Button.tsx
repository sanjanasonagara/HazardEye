import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

interface ButtonProps {
    onPress: () => void;
    children: React.ReactNode;
    variant?: 'primary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    style?: ViewStyle;
    textStyle?: TextStyle;
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    onPress,
    children,
    variant = 'primary',
    size = 'md',
    style,
    textStyle,
    loading = false,
    disabled = false,
    icon,
}) => {
    const getVariantStyle = (): { container: ViewStyle, text: TextStyle } => {
        switch (variant) {
            case 'outline':
                return {
                    container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#CBD5E0' },
                    text: { color: '#4A5568' },
                };
            case 'ghost':
                return {
                    container: { backgroundColor: 'transparent' },
                    text: { color: '#4A5568' },
                };
            case 'danger':
                return {
                    container: { backgroundColor: '#C53030' },
                    text: { color: '#fff' },
                };
            default: // primary
                return {
                    container: { backgroundColor: '#2563EB' },
                    text: { color: '#fff' },
                };
        }
    };

    const getSizeStyle = (): { container: ViewStyle, text: TextStyle } => {
        switch (size) {
            case 'sm':
                return {
                    container: { paddingVertical: 6, paddingHorizontal: 12 },
                    text: { fontSize: 12 },
                };
            case 'lg':
                return {
                    container: { paddingVertical: 14, paddingHorizontal: 24 },
                    text: { fontSize: 16 },
                };
            default: // md
                return {
                    container: { paddingVertical: 10, paddingHorizontal: 16 },
                    text: { fontSize: 14 },
                };
        }
    };

    const variantStyles = getVariantStyle();
    const sizeStyles = getSizeStyle();

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                variantStyles.container,
                sizeStyles.container,
                disabled && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={variantStyles.text.color} size="small" />
            ) : (
                <>
                    {icon}
                    <Text style={[styles.text, variantStyles.text, sizeStyles.text, icon ? { marginLeft: 8 } : {}, textStyle]}>
                        {children}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontWeight: '600',
    },
    disabled: {
        opacity: 0.6,
    },
});
