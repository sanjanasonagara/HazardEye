import React, { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  LogOut,
  ArrowRightLeft,
  Mail,
  Phone,
  Building,
  Camera,
  Edit2,
  Lock,
  Key,
} from 'lucide-react';

const ProfileSettings: React.FC = () => {
  // Load user state from localStorage or mock
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const p = JSON.parse(stored);
        return {
          name: p.name || 'Supervisor User',
          role: p.role || 'Supervision',
          email: p.email || 'supervisor@hazardeye.com',
          employeeId: p.employeeId || 'EMP-SUP-001',
          phone: p.phone || '9876543210',
          department: p.department || 'Operations',
        };
      }
    } catch (e) {
      console.error("Error parsing user from local storage", e);
    }
    return {
      name: 'Supervisor User',
      role: 'Supervision',
      email: 'supervisor@hazardeye.com',
      employeeId: 'EMP-SUP-001',
      phone: '9876543210',
      department: 'Safety & Operations',
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
    alert('Profile updated successfully!');
  };

  const handleChangePhoto = () => {
    alert('Change Photo clicked (Mock Action)');
  };

  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Password update requested (Mock Action)');

  };

  const handleForgotPassword = () => {
    alert('Password reset link sent to your email.');
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Profile & Settings</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative lg:col-span-1">
          <div className="flex flex-col items-center text-center p-8 pb-10 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 relative">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2.5 rounded-full bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-slate-600 hover:shadow-md transition-all active:scale-95"
                title="Edit Profile"
              >
                <Edit2 size={16} />
              </button>
            </div>

            <div className="relative mb-5 group">
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center text-[color:var(--color-primary)] shadow-lg ring-4 ring-slate-50">
                <User size={56} />
              </div>
              <button
                onClick={handleChangePhoto}
                className="absolute bottom-1 right-1 bg-[color:var(--color-primary)] text-white border-[3px] border-white rounded-full w-9 h-9 flex items-center justify-center shadow-sm hover:bg-blue-700 transition-colors cursor-pointer group-hover:scale-105"
              >
                <Camera size={15} />
              </button>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-1">{user.name}</h3>
            <p className="text-sm font-medium text-slate-500 mb-2 bg-slate-100 px-3 py-1 rounded-full">{user.role}</p>

            <div className="mb-4">
              <span className="font-mono bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-xs">
                {user.employeeId}
              </span>
            </div>

            <div className="flex gap-2 justify-center w-full">
              <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-md text-xs font-semibold shadow-sm">
                Active
              </span>
              <span className="bg-green-50 text-green-600 border border-green-100 px-3 py-1 rounded-md text-xs font-semibold shadow-sm">
                Verified
              </span>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {isEditing ? (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-3">
                  <button
                    onClick={handleSaveProfile}
                    className="btn btn-primary flex-1 py-2.5 font-medium shadow-sm hover:shadow active:scale-[0.98] transition-all"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn border border-slate-200 text-slate-600 hover:bg-slate-50 flex-1 py-2.5 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="p-2 bg-white rounded-lg text-slate-400 shadow-sm border border-slate-100">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Email</span>
                    <span className="font-medium text-slate-700">{user.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="p-2 bg-white rounded-lg text-slate-400 shadow-sm border border-slate-100">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Phone</span>
                    <span className="font-medium text-slate-700">{user.phone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="p-2 bg-white rounded-lg text-slate-400 shadow-sm border border-slate-100">
                    <Building size={18} />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Department</span>
                    <span className="font-medium text-slate-700">{user.department}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Settings & Account Switcher */}
        <div className="lg:col-span-2 space-y-8">
          {/* Account Switcher Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <ArrowRightLeft size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Switch Account</h3>
                  <p className="text-sm text-slate-500">Access other profiles you manage</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className={`flex justify-between items-center p-4 border rounded-xl transition-all ${acc.active
                    ? 'border-[color:var(--color-primary)] bg-blue-50/50 ring-1 ring-blue-100'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${acc.active
                        ? 'bg-[color:var(--color-primary)] text-white shadow-md'
                        : 'bg-slate-100 text-slate-500'
                        }`}
                    >
                      {acc.name.charAt(0)}
                    </div>
                    <div>
                      <p className={`font-semibold ${acc.active ? 'text-[color:var(--color-primary)]' : 'text-slate-700'}`}>
                        {acc.name}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">{acc.role}</p>
                    </div>
                  </div>
                  {acc.active ? (
                    <span className="bg-white text-[color:var(--color-primary)] px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-blue-100">
                      Active
                    </span>
                  ) : (
                    <button
                      className="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 relative overflow-hidden">
            {/* Subtle Gradient Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-transparent to-white pointer-events-none" />

            <div className="flex items-center gap-3 mb-8 relative">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 shadow-sm">
                <Lock size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Security & Password</h3>
                <p className="text-sm text-slate-500">Manage your password and account recovery</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    Current Password
                  </label>
                  <div className="relative group">
                    <Key size={16} className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-[color:var(--color-primary)] transition-colors" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm transition-all outline-none focus:bg-white focus:border-[color:var(--color-primary)] focus:ring-4 focus:ring-blue-50/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    New Password
                  </label>
                  <div className="relative group">
                    <Key size={16} className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-[color:var(--color-primary)] transition-colors" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm transition-all outline-none focus:bg-white focus:border-[color:var(--color-primary)] focus:ring-4 focus:ring-blue-50/50"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-6 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-slate-500 hover:text-indigo-600 font-semibold transition-colors decoration-indigo-200 hover:underline underline-offset-4"
                >
                  Forgot Password?
                </button>
                <button
                  type="submit"
                  className="btn bg-[color:#404dc5] hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-md shadow-indigo-100 border-none transition-all active:scale-[0.98]"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Preferences Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <Shield size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Preferences</h3>
                <p className="text-sm text-slate-500">Customize your notification settings</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all bg-slate-50/50">
                <div className="flex gap-4">
                  <div className="mt-1 bg-white p-2 h-fit rounded-full border border-slate-100 text-slate-400">
                    <Bell size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Push Notifications</p>
                    <p className="text-xs text-slate-500 mt-0.5">Receive real-time alerts on your device</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={() => setNotifications(!notifications)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--color-primary)]"></div>
                </label>
              </div>

              <div className="flex justify-between items-center p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all bg-slate-50/50">
                <div className="flex gap-4">
                  <div className="mt-1 bg-white p-2 h-fit rounded-full border border-slate-100 text-slate-400">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Email Alerts</p>
                    <p className="text-xs text-slate-500 mt-0.5">Receive daily summary emails</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={() => setEmailAlerts(!emailAlerts)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--color-primary)]"></div>
                </label>
              </div>

              <div className="pt-8 mt-4 border-t border-slate-100">
                <button
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 py-3 rounded-lg font-semibold transition-all duration-200 active:scale-[0.99] border border-red-100 hover:border-red-200 hover:shadow-sm"
                >
                  <LogOut size={18} />
                  Sign Out of Account
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
