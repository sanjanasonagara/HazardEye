import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    className = '',
    disabled = false,
    ...props
}) => {
    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0.5rem',
        fontWeight: 500,
        transition: 'background-color 0.2s, color 0.2s',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.5 : 1,
        border: '1px solid transparent',
        outline: 'none',
    };

    const variants = {
        primary: {
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
        },
        secondary: {
            backgroundColor: '#e2e8f0',
            color: '#1e293b',
            border: 'none',
        },
        danger: {
            backgroundColor: 'var(--color-danger)',
            color: 'white',
            border: 'none',
        },
        outline: {
            backgroundColor: 'white',
            border: '1px solid #cbd5e1',
            color: '#475569',
        },
    };

    const sizes = {
        sm: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
        md: { padding: '0.5rem 1rem', fontSize: '1rem' },
        lg: { padding: '0.75rem 1.5rem', fontSize: '1.125rem' },
    };

    const combinedStyle = {
        ...baseStyle,
        ...variants[variant],
        ...sizes[size],
    };

    return (
        <button
            className={className}
            style={combinedStyle}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <span style={{ marginRight: '0.5rem' }}>...</span>
                    Loading...
                </>
            ) : (
                children
            )}
        </button>
    );
};
