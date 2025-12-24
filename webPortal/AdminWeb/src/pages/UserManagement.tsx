
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Search,
    Trash2,
    RotateCcw,
    User as UserIcon,
    CheckCircle2,
    XCircle,
    History,
    AlertCircle,
    ChevronDown
} from 'lucide-react';
import './UserManagement.css';

// --- Mock Data Generator ---

const AVAILABLE_DEPARTMENTS = ['Safety', 'Operations', 'Maintenance', 'Fire & Security', 'Management'];

const INITIAL_USERS = [
    {
        id: '1',
        name: 'Sanjana',
        email: 'sanjana@hazardeye.com',
        role: 'ADMIN',
        department: 'Management',
        status: 'ACTIVE',
        lastActive: 'Just now',
        lastActiveDate: new Date(),
        isDeleted: false,
        avatarInitials: 'S'
    },
    {
        id: '2',
        name: 'ankit',
        email: 'ankit@hazardeye.com',
        role: 'EMPLOYEE',
        department: 'Safety',
        status: 'ACTIVE',
        lastActive: '5 mins ago',
        lastActiveDate: new Date(Date.now() - 5 * 60000),
        isDeleted: false,
        avatarInitials: 'A'
    },
    {
        id: '3',
        name: 'lavanya ',
        email: 'lavanya@hazardeye.com',
        role: 'FIELD WORKER',
        department: 'Operations',
        status: 'ACTIVE',
        lastActive: '1 hour ago',
        lastActiveDate: new Date(Date.now() - 60 * 60000),
        isDeleted: false,
        avatarInitials: 'L'
    },
    {
        id: '4',
        name: 'hemani',
        email: 'hemani@hazardeye.com',
        role: 'FIELD WORKER',
        department: 'Fire & Security',
        status: 'DISABLED',
        lastActive: '2 days ago',
        lastActiveDate: new Date(Date.now() - 2 * 24 * 60 * 60000),
        isDeleted: false,
        avatarInitials: 'H'
    },
    {
        id: '5',
        name: 'kartik',
        email: 'kartik@hazardeye.com',
        role: 'EMPLOYEE',
        department: 'Maintenance',
        status: 'ACTIVE',
        lastActive: 'Yesterday',
        lastActiveDate: new Date(Date.now() - 24 * 60 * 60000),
        isDeleted: false,
        avatarInitials: 'K'
    },

];

// --- Helpers ---

const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + "y ago";
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + "mo ago";
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + "d ago";
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return interval + "h ago";
    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + "m ago";
    return Math.floor(seconds) + "s ago";
};

// --- Custom Components ---

const CustomDropdown = ({ options, value, onChange, placeholder = "Select..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="custom-select-container" ref={dropdownRef}>
            <div
                className={`custom-select-trigger ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{value || placeholder}</span>
                <ChevronDown size={14} className="text-gray-400" />
            </div>
            {isOpen && (
                <div className="custom-dropdown-menu">
                    {options.map((option) => (
                        <button
                            key={option}
                            className={`custom-dropdown-item ${value === option ? 'selected' : ''}`}
                            onClick={() => {
                                onChange(option);
                                setIsOpen(false);
                            }}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Component ---

const UserManagement = () => {
    // State
    const [users, setUsers] = useState(INITIAL_USERS);
    const [auditLog, setAuditLog] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Filters State
    const [roleFilter, setRoleFilter] = useState('All');
    const [deptFilter, setDeptFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [lastActiveFilter, setLastActiveFilter] = useState('All');

    // --- Actions ---

    const addAuditEntry = (
        actionType,
        description,
        affectedUserId,
        previousState
    ) => {
        const newEntry = {
            id: Math.random().toString(36).substr(2, 9),
            actionType,
            description,
            affectedUserId,
            previousState,
            timestamp: new Date(),
            reversible: true,
            undone: false,
        };
        setAuditLog(prev => [newEntry, ...prev]);
    };

    const updateUser = (id, updates, actionType, baseDescription) => {
        const user = users.find(u => u.id === id);
        if (!user) return;

        const previousState = {};
        Object.keys(updates).forEach(key => {
            previousState[key] = user[key];
        });

        // Format: "Action for User Name: description"
        const fullDescription = `Action for ${user.name}: ${baseDescription}`;

        addAuditEntry(actionType, fullDescription, id, previousState);

        setUsers(prevUsers =>
            prevUsers.map(u => (u.id === id ? { ...u, ...updates } : u))
        );
    };

    const handleRoleChange = (userId, newRole) => {
        updateUser(userId, { role: newRole }, 'ROLE_CHANGE', `Role changed to ${newRole}`);
    };

    const handleDeptChange = (userId, newDept) => {
        updateUser(userId, { department: newDept }, 'DEPARTMENT_CHANGE', `Department changed to ${newDept}`);
    };

    const handleStatusToggle = (user) => {
        const newStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
        updateUser(user.id, { status: newStatus }, 'STATUS_CHANGE', `Status changed to ${newStatus}`);
    };

    const handleDelete = (userId) => {
        updateUser(userId, { isDeleted: true }, 'DELETE', 'User soft deleted');
    };

    const handleUndo = (auditId) => {
        const logEntry = auditLog.find(l => l.id === auditId);
        if (!logEntry || logEntry.undone || !logEntry.reversible) return;

        // Apply previous state
        setUsers(prevUsers =>
            prevUsers.map(u =>
                u.id === logEntry.affectedUserId
                    ? { ...u, ...logEntry.previousState }
                    : u
            )
        );
        setAuditLog(prevLog => {
            const updatedLog = prevLog.map(l => l.id === auditId ? { ...l, undone: true, reversible: false } : l);

            const distinctUndoEntry = {
                id: Math.random().toString(36).substr(2, 9),
                actionType: logEntry.actionType,
                description: `Undo: ${logEntry.description}`,
                affectedUserId: logEntry.affectedUserId,
                previousState: {},
                timestamp: new Date(),
                reversible: false,
                undone: false,
            };

            return [distinctUndoEntry, ...updatedLog];
        });
    };

    // --- Filtering Logic ---

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            if (user.isDeleted) return false;

            // Search
            const matchesSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            // Type filters
            if (roleFilter !== 'All' && user.role !== roleFilter) return false;
            if (deptFilter !== 'All' && user.department !== deptFilter) return false;
            if (statusFilter !== 'All' && user.status !== statusFilter) return false;

            // Last Active
            if (lastActiveFilter !== 'All') {
                const now = new Date();
                const diffHours = (now.getTime() - user.lastActiveDate.getTime()) / (1000 * 60 * 60);

                if (lastActiveFilter === '24h' && diffHours > 24) return false;
                if (lastActiveFilter === '7d' && diffHours > 24 * 7) return false;
                if (lastActiveFilter === 'Inactive' && diffHours <= 24 * 7) return false;
            }

            return true;
        });
    }, [users, searchQuery, roleFilter, deptFilter, statusFilter, lastActiveFilter]);

    return (
        <div className="user-management-container">
            <div className="page-header">
                <div className="page-title">
                    <h1>User Management</h1>
                    <p>Manage system access, roles, and departments</p>
                </div>
            </div>

            {/* --- Filters & Search --- */}
            <div className="filters-card">
                <div className="filters-layout">

                    {/* Search */}
                    <div className="search-container">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="search-input"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filters Group */}
                    <div className="filters-group">
                        {/* Role */}
                        <select
                            className="filter-select"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="All">All Roles</option>
                            <option value="ADMIN">Admin</option>
                            <option value="EMPLOYEE">Employee</option>
                            <option value="FIELD_WORKER">Field Worker</option>
                        </select>

                        {/* Department */}
                        <select
                            className="filter-select"
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                        >
                            <option value="All">All Departments</option>
                            {AVAILABLE_DEPARTMENTS.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>

                        {/* Status */}
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="DISABLED">Disabled</option>
                        </select>

                        {/* Last Active */}
                        <select
                            className="filter-select"
                            value={lastActiveFilter}
                            onChange={(e) => setLastActiveFilter(e.target.value)}
                        >
                            <option value="All">Any Time</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="Inactive">Inactive (7+ Days)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* --- Users Table --- */}
            <div className="table-card">
                <div className="table-responsive">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Name / Email</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th>Last Active</th>
                                <th align="right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-info">
                                                <div className="avatar-initials">
                                                    {user.avatarInitials}
                                                </div>
                                                <div className="user-text">
                                                    <h4>{user.name}</h4>
                                                    <span>{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <CustomDropdown
                                                options={['ADMIN', 'EMPLOYEE', 'FIELD_WORKER']}
                                                value={user.role}
                                                onChange={(val) => handleRoleChange(user.id, val)}
                                            />
                                        </td>
                                        <td>
                                            <CustomDropdown
                                                options={AVAILABLE_DEPARTMENTS}
                                                value={user.department}
                                                onChange={(val) => handleDeptChange(user.id, val)}
                                            />
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.status === 'ACTIVE'
                                                    ? 'status-active'
                                                    : 'status-disabled'
                                                }`}>
                                                {user.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {user.status === 'ACTIVE' ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                            {user.lastActive}
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    onClick={() => handleStatusToggle(user)}
                                                    className={`action-btn ${user.status === 'ACTIVE'
                                                            ? 'btn-toggle-active'
                                                            : 'btn-toggle-inactive'
                                                        }`}
                                                    title={user.status === 'ACTIVE' ? "Disable User" : "Enable User"}
                                                >
                                                    {user.status === 'ACTIVE' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="action-btn btn-delete"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="empty-state">
                                        <UserIcon size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
                                        <p className="text-lg font-medium">No users found</p>
                                        <p className="text-sm">Try adjusting your search or filters</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Audit Log --- */}
            <div className="audit-log-section">
                <h2 className="audit-title">
                    <History size={20} className="text-slate-500" />
                    Audit Log
                </h2>
                <div className="audit-list">
                    {auditLog.length > 0 ? (
                        <div>
                            {auditLog.map(entry => (
                                <div key={entry.id} className="audit-item">
                                    <div className="audit-content">
                                        <div className={`audit-dot ${entry.actionType === 'DELETE' ? 'dot-delete' :
                                                entry.actionType === 'STATUS_CHANGE' ? 'dot-status' :
                                                    'dot-default'
                                            }`} />
                                        <div className="audit-text">
                                            <p>
                                                {entry.description}
                                            </p>
                                            <div className="audit-meta">
                                                by System Admin • {entry.timestamp.toLocaleTimeString()} ({timeAgo(entry.timestamp)})
                                                {entry.undone && (
                                                    <span className="undo-badge">Undone</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {entry.reversible && !entry.undone && (
                                        <button
                                            onClick={() => handleUndo(entry.id)}
                                            className="btn-undo"
                                        >
                                            <RotateCcw size={12} />
                                            Undo
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <AlertCircle size={32} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.3 }} />
                            <div style={{ fontSize: '0.875rem' }}>No actions recorded yet.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
