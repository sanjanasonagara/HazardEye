import { useState, useMemo, useEffect } from 'react';
import { Trash2, UserPlus, Filter, Download, Search, CheckCircle, Shield, MoreVertical, CheckCircle2, XCircle, History, AlertCircle, Briefcase, X } from 'lucide-react';
import { API_BASE_URL } from '../../shared/services/api';
import './UserManagement.css';

// --- Interfaces ---

interface User {
    id: number;
    name: string;
    email: string;
    employeeId: string;
    isActive: boolean;
    lastLoginAt: string;
    createdAt: string;
    isAdmin: boolean;
    isSupervisor: boolean;
    isEmployee: boolean;
    supervisorDepartments: string[];
    supervisorDepartmentIds: number[];
    phone?: string;
    company?: string;
}



interface Department {
    id: number;
    name: string;
}

interface AuditEntry {
    id: number;
    action: string;
    entityType: string;
    entityId: number;
    details: any;
    timestamp: string;
    user: { name: string } | null;
}

// --- API Helpers ---
// Ideally these move to a service file

// API_BASE removed in favor of import

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// --- Main Component ---

const UserManagement = () => {
    // State
    const [users, setUsers] = useState<User[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [roles, setRoles] = useState<any[]>([]); // Dynamic roles
    const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    // Create User State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'Viewer',
        employeeId: '',
        phone: '',
        company: 'Operations' // Default
    });

    // Modal State
    const [modalForm, setModalForm] = useState({
        isAdmin: false,
        isSupervisor: false,
        selectedDeptIds: [] as number[]
    });

    // --- Data Fetching ---

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, deptsRes, rolesRes] = await Promise.all([
                fetch(`${API_BASE_URL}/users`, { headers: getAuthHeaders() }),
                fetch(`${API_BASE_URL}/departments`, { headers: getAuthHeaders() }),
                fetch(`${API_BASE_URL}/roles`, { headers: getAuthHeaders() })
            ]);

            if (usersRes.ok) {
                const usersData = await usersRes.json();
                // Map backend DTO to frontend User interface
                const mappedUsers = usersData.map((u: any) => ({
                    id: u.id,
                    name: `${u.firstName} ${u.lastName}`,
                    email: u.email,
                    employeeId: u.employeeId || '',
                    isActive: u.isActive,
                    lastLoginAt: u.lastLoginAt,
                    createdAt: u.createdAt,
                    isAdmin: u.role === 'Admin',
                    isSupervisor: u.role === 'Supervisor' || u.role === 'SafetyOfficer',
                    isEmployee: u.role === 'Worker' || u.role === 'Viewer',
                    supervisorDepartments: u.supervisorDepartments || [],
                    supervisorDepartmentIds: u.supervisorDepartmentIds || [],
                    phone: u.phone,
                    company: u.company
                }));
                setUsers(mappedUsers);
            } else {
                console.error("Failed to fetch users", usersRes.status);
                if (usersRes.status === 401 || usersRes.status === 403) {
                    setError("Unauthorized: Please log out and log in again.");
                } else {
                    setError(`Failed to load users (Status: ${usersRes.status})`);
                }
            }

            if (deptsRes.ok) {
                const deptsData = await deptsRes.json();
                setDepartments(deptsData);
            }

            if (rolesRes.ok) {
                const rolesData = await rolesRes.json();
                setRoles(rolesData);
            }

            // Fetch Audit Logs (Optional/Separate)
            const auditRes = await fetch(`${API_BASE_URL}/audit`, { headers: getAuthHeaders() });
            if (auditRes.ok) {
                const auditData = await auditRes.json();
                setAuditLog(auditData);
            }

        } catch (err) {
            console.error(err);
            setError("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Actions ---

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(createForm)
            });

            if (!res.ok) {
                const json = await res.json();
                alert(json.message || "Failed to create user.");
                return;
            }

            alert("User created successfully!");
            setIsCreateModalOpen(false);
            setCreateForm({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                role: 'Viewer',
                employeeId: '',
                phone: '',
                company: 'Operations'
            });
            fetchData();
        } catch (err) {
            console.error(err);
            alert("An error occurred.");
        }
    };

    const handleOpenPermissions = (user: User) => {
        setSelectedUser(user);

        // Use IDs directly from backend DTO, fallback to empty array if undefined
        const currentDeptIds = user.supervisorDepartmentIds || [];

        setModalForm({
            isAdmin: user.isAdmin,
            isSupervisor: user.isSupervisor,
            selectedDeptIds: currentDeptIds
        });
        setIsModalOpen(true);
    };

    // ... handleSavePermissions, handleToggleStatus ... (omitted for brevity in replacement, but I must be careful not to delete them)
    // Actually, sticking to smaller replacements is safer. 
    // I will return the original logic for handleSave + permissions but insert handleCreate.

    const handleSavePermissions = async () => {
        if (!selectedUser) return;

        try {
            const response = await fetch(`${API_BASE_URL}/users/${selectedUser.id}/permissions`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    isAdmin: modalForm.isAdmin,
                    isSupervisor: modalForm.isSupervisor,
                    supervisorDepartmentIds: modalForm.selectedDeptIds
                })
            });

            if (!response.ok) {
                let errMsg = `Error ${response.status}: ${response.statusText}`;
                try {
                    const text = await response.text();
                    if (text) {
                        const json = JSON.parse(text);
                        errMsg = json.message || errMsg;
                        if (json.details) errMsg += `\n${json.details}`;
                    }
                } catch (e) { }

                if (response.status === 401 || response.status === 403) {
                    errMsg = "Access Denied. Please log out and log back in to refresh your permissions.";
                }

                alert(errMsg);
                return;
            }

            // Success
            setIsModalOpen(false);
            await fetchData(); // Refresh list to get audit log & updates
            alert('Permissions updated successfully.');
        } catch (err) {
            console.error(err);
            alert('An unexpected error occurred. Please check console.');
        }
    };

    const handleToggleStatus = async (user: User) => {
        if (!confirm(`Are you sure you want to ${user.isActive ? 'disable' : 'enable'} ${user.name}?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/users/${user.id}/role`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    isActive: !user.isActive
                })
            });

            if (!response.ok) {
                let errMsg = `Error ${response.status}: ${response.statusText}`;
                try {
                    const text = await response.text();
                    if (text) {
                        const json = JSON.parse(text);
                        errMsg = json.message || errMsg;
                        if (json.details) errMsg += `\n${json.details}`;
                    }
                } catch (e) { }

                if (response.status === 401 || response.status === 403) {
                    errMsg = "Access Denied. Please log out and log back in to refresh your permissions.";
                }

                alert(errMsg);
                return;
            }

            await fetchData();
        } catch (err) {
            console.error(err);
            alert('An unexpected error occurred.');
        }
    };

    const handleDeleteUser = async (user: User) => {
        if (!confirm(`Are you sure you want to PERMANENTLY delete ${user.name}? This cannot be undone.`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                alert(`Failed to delete user. Status: ${response.status}`);
                return;
            }

            alert("User deleted successfully.");
            fetchData();
        } catch (err) {
            console.error(err);
            alert('An unexpected error occurred.');
        }
    };

    // --- Filtering ---

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            // Search
            const matchesSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.employeeId && user.employeeId.toLowerCase().includes(searchQuery.toLowerCase()));
            if (!matchesSearch) return false;

            // Role Filter
            if (roleFilter === 'ADMIN' && !user.isAdmin) return false;
            if (roleFilter === 'SUPERVISOR' && !user.isSupervisor) return false;
            if (roleFilter === 'EMPLOYEE_ONLY' && (user.isAdmin || user.isSupervisor)) return false;

            return true;
        });
    }, [users, searchQuery, roleFilter]);


    // --- Render ---

    return (
        <div className="user-management-container">
            <div className="page-header">
                <div className="page-title">
                    <h1>User Management & Governance</h1>
                    <p>Manage system authority, responsibilities, and access controls</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)} style={{ padding: '8px 16px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserPlus size={18} />
                        Add User
                    </button>
                    <button className="btn-secondary" onClick={fetchData} style={{ padding: '8px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>
                        Refresh
                    </button>
                </div>
            </div>

            {/* --- Filters --- */}
            <div className="filters-card">
                <div className="filters-layout">
                    <div className="search-container">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="search-input"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filters-group">
                        <select
                            className="filter-select"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="All">All Users</option>
                            <option value="ADMIN">Admins</option>
                            <option value="SUPERVISOR">Supervisors</option>
                            <option value="EMPLOYEE_ONLY">Employees Only</option>
                        </select>
                    </div>
                </div>
            </div>
            
            {/* Create User Modal */}
            {isCreateModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Create New User</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateUser} style={{ display: 'grid', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>First Name</label>
                                    <input required type="text" value={createForm.firstName} onChange={e => setCreateForm({...createForm, firstName: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Last Name</label>
                                    <input required type="text" value={createForm.lastName} onChange={e => setCreateForm({...createForm, lastName: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Email</label>
                                <input required type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Password</label>
                                <input required type="password" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Role</label>
                                    <select value={createForm.role} onChange={e => setCreateForm({...createForm, role: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                                        {roles.length > 0 ? roles.map(r => (
                                            <option key={r.id} value={r.name}>{r.name}</option>
                                        )) : (
                                            <>
                                                <option value="Worker">Worker</option>
                                                <option value="Supervisor">Supervisor</option>
                                                <option value="Admin">Admin</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Department</label>
                                    <select value={createForm.company} onChange={e => setCreateForm({...createForm, company: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                                        {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Employee ID</label>
                                <input type="text" value={createForm.employeeId} onChange={e => setCreateForm({...createForm, employeeId: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <button type="submit" style={{ marginTop: '16px', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>Create User</button>
                        </form>
                    </div>
                </div>
            )}

            {error && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            {/* --- Table --- */}
            <div className="table-card">
                <div className="table-responsive">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Identity</th>
                                <th>Contact & Dept</th>
                                <th>Role & Responsibilities</th>
                                <th>Assigned Scope (Sup.)</th>
                                <th>Status</th>
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
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="user-text">
                                                    <h4>{user.name}</h4>
                                                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                                                        <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '0 4px', borderRadius: '4px' }}>
                                                            {user.employeeId || 'NO-ID'}
                                                        </span>
                                                        <span>{user.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.875rem' }}>
                                                <div style={{ fontWeight: 500, color: '#334155' }}>
                                                    {user.company || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No Dept</span>}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                    {user.phone || '—'}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                <span className="status-badge" style={{ backgroundColor: '#e2e8f0', color: '#475569' }}>Employee</span>
                                                {user.isSupervisor && (
                                                    <span className="status-badge" style={{ backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#bfdbfe' }}>
                                                        <Briefcase size={10} style={{ marginRight: 4 }} /> Supervisor
                                                    </span>
                                                )}
                                                {user.isAdmin && (
                                                    <span className="status-badge" style={{ backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>
                                                        <Shield size={10} style={{ marginRight: 4 }} /> Admin
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {user.isSupervisor ? (
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                    {user.supervisorDepartments.length > 0
                                                        ? user.supervisorDepartments.join(', ')
                                                        : <span style={{ color: '#ef4444' }}>No Scope Assigned</span>}
                                                </div>
                                            ) : (
                                                <span style={{ color: '#cbd5e1' }}>—</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.isActive ? 'status-active' : 'status-disabled'}`}>
                                                {user.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {user.isActive ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    onClick={() => handleOpenPermissions(user)}
                                                    title="Manage Permissions"
                                                    style={{
                                                        padding: '6px 12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        borderRadius: '6px',
                                                        border: '1px solid #cbd5e1',
                                                        backgroundColor: 'white',
                                                        color: '#475569',
                                                        cursor: 'pointer',
                                                        marginRight: '8px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    Manage Access
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`action-btn ${user.isActive ? 'btn-toggle-inactive' : 'btn-toggle-active'}`}
                                                    title={user.isActive ? "Disable Access" : "Enable Access"}
                                                >
                                                    {user.isActive ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="action-btn"
                                                    style={{ marginLeft: '8px', color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}
                                                    title="Permanently Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="empty-state">
                                        {loading ? "Loading users..." : "No users found matching your filters."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Permissions Modal --- */}
            {isModalOpen && selectedUser && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)'
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        >
                            <X size={20} />
                        </button>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>Manage Access</h2>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '24px' }}>
                            Configure responsibilities for <strong>{selectedUser.name}</strong> <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '0 4px', borderRadius: '4px' }}>{selectedUser.employeeId}</span>
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Admin Toggle */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: modalForm.isAdmin ? '#fffbeb' : 'white' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '6px', color: '#d97706' }}>
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>System Administrator</h4>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Full access to all settings</p>
                                    </div>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={modalForm.isAdmin}
                                        onChange={e => setModalForm({ ...modalForm, isAdmin: e.target.checked })}
                                        style={{ width: '20px', height: '20px' }}
                                    />
                                </label>
                            </div>

                            {/* Supervisor Toggle */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: modalForm.isSupervisor ? '#eff6ff' : 'white' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ padding: '8px', backgroundColor: '#dbeafe', borderRadius: '6px', color: '#2563eb' }}>
                                            <Briefcase size={20} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Safety Supervisor</h4>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Department-specific oversight</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={modalForm.isSupervisor}
                                        onChange={e => setModalForm({ ...modalForm, isSupervisor: e.target.checked })}
                                        style={{ width: '20px', height: '20px' }}
                                    />
                                </div>

                                {modalForm.isSupervisor && (
                                    <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
                                            Assigned Departments (Scope)
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                            {departments.map(dept => (
                                                <label key={dept.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={modalForm.selectedDeptIds.includes(dept.id)}
                                                        onChange={e => {
                                                            const isChecked = e.target.checked;
                                                            setModalForm(prev => ({
                                                                ...prev,
                                                                selectedDeptIds: isChecked
                                                                    ? [...prev.selectedDeptIds, dept.id]
                                                                    : prev.selectedDeptIds.filter(id => id !== dept.id)
                                                            }));
                                                        }}
                                                    />
                                                    {dept.name}
                                                </label>
                                            ))}
                                        </div>
                                        {modalForm.selectedDeptIds.length === 0 && (
                                            <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '8px', fontStyle: 'italic' }}>
                                                * Check at least one department
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 500, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSavePermissions}
                                disabled={modalForm.isSupervisor && modalForm.selectedDeptIds.length === 0}
                                style={{
                                    padding: '10px 24px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 600, cursor: 'pointer',
                                    opacity: (modalForm.isSupervisor && modalForm.selectedDeptIds.length === 0) ? 0.5 : 1
                                }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Audit Log --- */}
            <div className="audit-log-section">
                <h2 className="audit-title">
                    <History size={20} className="text-slate-500" />
                    Governance Audit Log
                </h2>
                <div className="audit-list">
                    {auditLog.length > 0 ? (
                        <div>
                            {auditLog.map(entry => (
                                <div key={entry.id} className="audit-item">
                                    <div className="audit-content">
                                        <div className="audit-dot dot-default" />
                                        <div className="audit-text">
                                            <p>
                                                <span style={{ fontWeight: 600 }}>{entry.action}</span>
                                                {entry.details?.TargetEmployeeId && (
                                                    <span style={{ marginLeft: '8px', fontFamily: 'monospace', background: '#f1f5f9', padding: '0 4px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                                        {entry.details.TargetEmployeeId}
                                                    </span>
                                                )}
                                            </p>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                                                {Object.entries(entry.details || {})
                                                    .filter(([k]) => k !== 'TargetEmployeeId')
                                                    .map(([k, v]) => (
                                                        <span key={k} style={{ marginRight: '12px' }}>
                                                            {k}: {JSON.stringify(v)}
                                                        </span>
                                                    ))}
                                            </div>
                                            <div className="audit-meta" style={{ marginTop: '4px' }}>
                                                By {entry.user?.name || 'System'} • {new Date(entry.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <AlertCircle size={32} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.3 }} />
                            <div style={{ fontSize: '0.875rem' }}>No recent governance actions logged.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
