import React from 'react';

export const Card = ({ children, className = '', style = {}, onClick }) => {
    const cardStyle = {
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s',
        ...style
    };

    return (
        <div
            className={className}
            style={cardStyle}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '', style = {} }) => {
    const headerStyle = {
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: '#f8fafc',
        ...style
    };

    return (
        <div className={className} style={headerStyle}>
            {children}
        </div>
    );
};

export const CardBody = ({ children, className = '', style = {} }) => {
    const bodyStyle = {
        padding: '1.5rem',
        ...style
    };

    return (
        <div className={className} style={bodyStyle}>
            {children}
        </div>
    );
};
