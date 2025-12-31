import { useState } from 'react';
import { User, Shield, LogOut, ArrowRightLeft, Mail, Phone, Building, Camera, Edit2, Lock, Key } from 'lucide-react';

const ProfileSettings = () => {
    // Load user state from localStorage or mock
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            if (stored) {
                const p = JSON.parse(stored);
                return {
                    name: p.name || 'Admin User',
                    role: p.role || 'Administration',
                    email: p.email || 'adminhazardeye@google.com',
                    employeeId: p.employeeId || 'EMP-ADMIN-001',
                    phone: p.phone || '9649838764',
                    department: p.department || 'Safety & Operations'
                };
            }
        } catch (e) {
            console.error("Error parsing user from local storage", e);
        }
        return {
            name: 'Admin User',
            role: 'Administration',
            email: 'adminhazardeye@google.com',
            employeeId: 'EMP-ADMIN-001',
            phone: '9649838764',
            department: 'Safety & Operations'
        };
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ ...user });

    const [notifications, setNotifications] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(true);

    // Mock accounts for switcher
    const accounts = [
        { id: 1, name: 'Admin User', role: 'Admin', active: true },
        { id: 2, name: 'Site Manager', role: 'Manager', active: false },
        { id: 3, name: 'Safety Officer', role: 'Inspector', active: false },
    ];

    const handleSwitchAccount = (accountName: string) => {
        alert(`Switching to account: ${accountName}`);
    };

    const handleSaveProfile = () => {
        setUser(editForm);
        setIsEditing(false);
        // Persist to local storage if desired, but for now just state
        alert('Profile updated successfully!');
    };

    const handleChangePhoto = () => {
        alert('Change Photo clicked (Mock Action)');
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Password update requested (Mock Action)');
    };

    const handleForgotPassword = () => {
        alert('Password reset link sent to your email.');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Profile & Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Profile Card */}
                <div className="card lg:col-span-1 h-fit" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        padding: '2rem',
                        paddingBottom: '2.5rem',
                        background: 'linear-gradient(to bottom, #f1f5f9, #ffffff)',
                        borderBottom: '1px solid #e2e8f0',
                        position: 'relative'
                    }}>
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                style={{ padding: '0.5rem', borderRadius: '50%', border: 'none', background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', cursor: 'pointer', color: '#64748b' }}
                                title="Edit Profile"
                            >
                                <Edit2 size={16} />
                            </button>
                        </div>

                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                            <div style={{
                                width: '110px',
                                height: '110px',
                                background: 'white',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-primary)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}>
                                <User size={52} />
                            </div>
                            <button
                                onClick={handleChangePhoto}
                                style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    right: '0',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    border: '3px solid white',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                <Camera size={16} />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800">{user.name}</h3>
                        <p className="text-sm font-medium text-slate-500 mb-1">{user.role}</p>
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ fontFamily: 'monospace', background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                {user.employeeId}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' }}>Active</span>
                            <span className="badge" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #dcfce7' }}>Verified</span>
                        </div>
                    </div>

                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:bg-white focus:border-blue-500 transition-colors outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</label>
                                    <input
                                        type="text"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:bg-white focus:border-blue-500 transition-colors outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</label>
                                    <input
                                        type="text"
                                        value={editForm.department}
                                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:bg-white focus:border-blue-500 transition-colors outline-none"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={handleSaveProfile} className="btn btn-primary flex-1 justify-center py-2">Save Changes</button>
                                    <button onClick={() => setIsEditing(false)} className="btn btn-outline flex-1 justify-center py-2">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f8fafc' }}>
                                    <div className="text-slate-400"><Mail size={18} /></div>
                                    <span className="text-sm font-medium text-slate-700">{user.email}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f8fafc' }}>
                                    <div className="text-slate-400"><Phone size={18} /></div>
                                    <span className="text-sm font-medium text-slate-700">{user.phone}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f8fafc' }}>
                                    <div className="text-slate-400"><Building size={18} /></div>
                                    <span className="text-sm font-medium text-slate-700">{user.department}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Column: Settings & Account Switcher */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Account Switcher Section */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <ArrowRightLeft className="text-slate-500" size={24} />
                                <h3 className="text-lg font-bold text-slate-800">Switch Account</h3>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {accounts.map((acc) => (
                                <div
                                    key={acc.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        border: acc.active ? '1px solid var(--color-primary)' : '1px solid #e2e8f0',
                                        borderRadius: '0.5rem',
                                        backgroundColor: acc.active ? '#eff6ff' : 'white'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: acc.active ? 'var(--color-primary)' : '#e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: acc.active ? 'white' : '#64748b'
                                        }}>
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{acc.name}</p>
                                            <p className="text-xs text-slate-500">{acc.role}</p>
                                        </div>
                                    </div>
                                    {acc.active ? (
                                        <span className="badge" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>Current</span>
                                    ) : (
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                                            onClick={() => handleSwitchAccount(acc.name)}
                                        >
                                            Switch
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Section */}
                    {/* Security Section */}
                    <div className="card" style={{
                        background: 'linear-gradient(to bottom left, #b3c4f1ff, #ffffff)',
                        border: '1px solid #ffffffff',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Decorative background element */}
                        <div style={{
                            position: 'absolute',
                            top: -20,
                            right: -20,
                            width: '100px',
                            height: '100px',
                            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, rgba(255,255,255,0) 70%)',
                            borderRadius: '50%',
                            pointerEvents: 'none'
                        }}></div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', position: 'relative' }}>
                            <div style={{ padding: '0.5rem', background: '#fff7ed', borderRadius: '0.5rem', color: '#232323ff' }}>
                                <Lock size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Security & Password</h3>
                                <p className="text-xs text-slate-500">Manage your password and account recovery</p>
                            </div>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-5 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Current Password</label>
                                    <div className="relative">
                                        <Key size={16} className="absolute left-3 top-3 text-slate-400" />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full pl-9 p-2.5 bg-white border border-slate-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">New Password</label>
                                    <div className="relative">
                                        <Key size={16} className="absolute left-3 top-3 text-slate-400" />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full pl-9 p-2.5 bg-white border border-slate-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-orange-100/50 mt-2">
                                <button type="button" onClick={handleForgotPassword} className="text-sm text-slate-500 hover:text-orange-600 font-medium transition-colors">
                                    Forgot Password?
                                </button>
                                <button type="submit" className="btn" style={{ backgroundColor: '#404dc5ff', color: 'white', border: 'none', boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.2)' }}>
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* General Settings */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <Shield className="text-slate-500" size={24} />
                            <h3 className="text-lg font-bold text-slate-800">Preferences</h3>
                        </div>

                        <div className="space-y-4">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                <div>
                                    <p className="font-medium text-slate-800">Push Notifications</p>
                                    <p className="text-sm text-slate-500">Receive alerts on your device</p>
                                </div>
                                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                                    <input
                                        type="checkbox"
                                        checked={notifications}
                                        onChange={() => setNotifications(!notifications)}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <span style={{
                                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                        backgroundColor: notifications ? 'var(--color-primary)' : '#cbd5e1',
                                        borderRadius: '34px', transition: '.4s'
                                    }}></span>
                                    <span style={{
                                        position: 'absolute', content: '""', height: '18px', width: '18px', left: '3px', bottom: '3px',
                                        backgroundColor: 'white', borderRadius: '50%', transition: '.4s',
                                        transform: notifications ? 'translateX(20px)' : 'translateX(0)'
                                    }}></span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                <div>
                                    <p className="font-medium text-slate-800">Email Alerts</p>
                                    <p className="text-sm text-slate-500">Receive daily summary emails</p>
                                </div>
                                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                                    <input
                                        type="checkbox"
                                        checked={emailAlerts}
                                        onChange={() => setEmailAlerts(!emailAlerts)}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <span style={{
                                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                        backgroundColor: emailAlerts ? 'var(--color-primary)' : '#cbd5e1',
                                        borderRadius: '34px', transition: '.4s'
                                    }}></span>
                                    <span style={{
                                        position: 'absolute', content: '""', height: '18px', width: '18px', left: '3px', bottom: '3px',
                                        backgroundColor: 'white', borderRadius: '50%', transition: '.4s',
                                        transform: emailAlerts ? 'translateX(20px)' : 'translateX(0)'
                                    }}></span>
                                </label>
                            </div>

                            <div style={{ paddingTop: '0.5rem' }}>
                                <button className="btn" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca' }}>
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
