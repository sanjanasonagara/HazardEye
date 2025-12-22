import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, ClipboardList, User, ChevronDown, LogOut, FileText, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const Header: React.FC = () => {
  const { state, switchRole } = useApp();
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const navigate = useNavigate();

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    setShowRoleMenu(false);
  };

  return (
    <header className="bg-[#030d29] border-b border-blue-800 px-6 py-3 flex items-center justify-between text-white">
      {/* Left: App name / logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/hazardeye-logo.png"
            alt="HazardEye logo"
            className="w-8 h-8 rounded-lg object-contain shadow-sm shadow-black/20"
          />
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-semibold text-white">HazardEye</span>
            <span className="text-xs text-blue-200">
              {state.currentUser.role === 'supervisor' ? 'Supervisor Portal' : 'Employee Portal'}
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Navigation links */}
      <nav className="hidden md:flex items-center gap-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
              ? 'text-white bg-blue-900/80 shadow-sm'
              : 'text-blue-100 hover:text-white hover:bg-blue-800/60'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </NavLink>
        <NavLink
          to="/incidents"
          className={({ isActive }) =>
            `inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
              ? 'text-white bg-blue-900/80 shadow-sm'
              : 'text-blue-100 hover:text-white hover:bg-blue-800/60'
            }`
          }
        >
          <AlertTriangle className="w-4 h-4" />
          Incidents
        </NavLink>
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
              ? 'text-white bg-blue-900/80 shadow-sm'
              : 'text-blue-100 hover:text-white hover:bg-blue-800/60'
            }`
          }
        >
          <ClipboardList className="w-4 h-4" />
          Tasks
        </NavLink>
        <NavLink
          to="/safety-resources"
          className={({ isActive }) =>
            `inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
              ? 'text-white bg-blue-900/80 shadow-sm'
              : 'text-blue-100 hover:text-white hover:bg-blue-800/60'
            }`
          }
        >
          <FileText className="w-4 h-4" />
          Safety Resources
        </NavLink>
        <NavLink
          to="/training"
          className={({ isActive }) =>
            `inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
              ? 'text-white bg-blue-900/80 shadow-sm'
              : 'text-blue-100 hover:text-white hover:bg-blue-800/60'
            }`
          }
        >
          <BookOpen className="w-4 h-4" />
          Training
        </NavLink>
      </nav>

      {/* Right: Role switch + user info */}
      <div className="flex items-center gap-4">
        {/* Role Switch */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-800/60 hover:bg-blue-700/70 rounded-lg transition-colors border border-blue-700"
          >
            <span className="text-sm font-medium text-blue-100 capitalize">
              {state.currentUser.role}
            </span>
            <ChevronDown className="w-4 h-4 text-blue-200" />
          </button>

          {showRoleMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowRoleMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => handleRoleSwitch('supervisor')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${state.currentUser.role === 'supervisor'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700'
                    }`}
                >
                  Supervisor
                </button>
                <button
                  onClick={() => handleRoleSwitch('employee')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${state.currentUser.role === 'employee'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700'
                    }`}
                >
                  Employee
                </button>
              </div>
            </>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 hover:bg-blue-800/60 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center shadow-sm shadow-black/20">
              <span className="text-xs font-semibold text-white">
                {state.currentUser.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-white">
                {state.currentUser.name}
              </p>
              <p className="text-xs text-blue-200">
                {state.currentUser.department || 'General'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-blue-200" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {state.currentUser.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {state.currentUser.email}
                  </p>
                </div>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                >
                  <User className="w-4 h-4" />
                  Profile Settings
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

