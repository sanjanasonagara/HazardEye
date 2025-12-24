import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, User, Search, ShieldAlert } from 'lucide-react';

import {
    LayoutDashboard,
    BarChart3,
    FileText,
    Files,
    BookOpen,
    LogOut,

} from 'lucide-react';

const Header = () => {
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);

    // Close dropdown when clicking outside (simple implementation)
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (isProfileOpen && !event.target.closest('.profile-dropdown-container')) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isProfileOpen]);

    const navItems = [
        { path: '/', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/cms', name: 'Content Management System', icon: Files },

        { path: '/admin/users', name: 'User Management', icon: User },


        { path: '/safety-guidelines', name: 'Safety Resources', icon: BookOpen },

        { path: '/reports', name: 'Reports', icon: FileText },
    ];

    return (
        <header style={{
            height: 'var(--header-height)',
            backgroundColor: '#0f172a', // Using sidebar's dark theme
            color: 'white',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 50
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                {/* Logo Area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ShieldAlert size={28} color="var(--color-hazard)" />
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '-0.025em' }}>HazardEye</span>
                </div>

                {/* Main Navigation */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0',
                                transition: 'all 0.2s',
                                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                                color: isActive ? 'white' : '#94a3b8',
                                textDecoration: 'none',
                                fontWeight: 500,
                                fontSize: '0.875rem'
                            })}
                        >
                            <item.icon size={18} />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {/* Search Mock */}
                <div style={{ position: 'relative', display: 'none' }} className="md:block">
                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search..."
                        style={{
                            paddingLeft: '2.5rem',
                            paddingRight: '1rem',
                            paddingTop: '0.4rem',
                            paddingBottom: '0.4rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            color: 'white',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            width: '14rem',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button style={{
                        position: 'relative',
                        padding: '0.5rem',
                        color: '#94a3b8',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '50%'
                    }}>
                        <Bell size={20} />
                        <span style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '8px',
                            height: '8px',
                            backgroundColor: 'var(--color-hazard)',
                            borderRadius: '0',
                            border: '2px solid #0f172a'
                        }}></span>
                    </button>

                    <div className="profile-dropdown-container" style={{ position: 'relative', paddingLeft: '1rem', borderLeft: '1px solid #334155' }}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0
                            }}
                        >
                            <div style={{ textAlign: 'right' }} className="hidden sm:block">
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>Admin User</p>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Super Admin</p>
                            </div>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                backgroundColor: '#1e293b',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-primary)',
                                border: '1px solid #334155'
                            }}>
                                <User size={20} />
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 10px)',
                                right: 0,
                                width: '280px',
                                backgroundColor: 'white',
                                borderRadius: '0.5rem',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                border: '1px solid #e2e8f0',
                                color: '#1e293b',
                                overflow: 'hidden',
                                zIndex: 100
                            }}>
                                <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <p style={{ fontWeight: 600, fontSize: '1rem', color: '#0f172a' }}>Admin User</p>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>admin@hazardeye.com</p>
                                </div>
                                <div style={{ padding: '0.5rem' }}>
                                    <NavLink
                                        to="/profile"
                                        onClick={() => setIsProfileOpen(false)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem 1rem',
                                            color: '#334155',
                                            textDecoration: 'none',
                                            fontSize: '0.875rem',
                                            borderRadius: '0.25rem',
                                            transition: 'background-color 0.2s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <User size={16} />
                                        Profile Settings
                                    </NavLink>
                                    <button
                                        onClick={() => {
                                            alert('Signed out successfully');
                                            setIsProfileOpen(false);
                                        }}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem 1rem',
                                            color: '#334155',
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '0.875rem',
                                            borderRadius: '0.25rem',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'background-color 0.2s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
