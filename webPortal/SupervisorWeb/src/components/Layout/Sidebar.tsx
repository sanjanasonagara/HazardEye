import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  ClipboardList,
  FileText,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/incidents', label: 'Incident Reports', icon: AlertTriangle },
  { path: '/tasks', label: 'Tasks', icon: ClipboardList },
  { path: '/safety-resources', label: 'Safety Resources', icon: FileText },
  { path: '/training', label: 'Training', icon: BookOpen },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { state } = useApp();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">HazardEye</h1>
        <p className="text-sm text-gray-400 mt-1">Supervisor Portal</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-sm font-semibold">
              {state.currentUser.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {state.currentUser.name}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {state.currentUser.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

