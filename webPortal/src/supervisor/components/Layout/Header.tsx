import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, ClipboardList, User, ChevronDown, LogOut, FileText, Bell, RefreshCw, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { fetchApi } from '../../../shared/services/api';

export const Header: React.FC = () => {
  const { state, switchRole } = useApp();
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  // Initialize with local state to prevent UI flicker
  const [realRole, setRealRole] = React.useState<{ isAdmin: boolean; isSupervisor: boolean } | null>(() => {
    const role = state.currentUser.role?.toLowerCase();
    return {
      isAdmin: role === 'admin' || role === 'systemadmin',
      isSupervisor: role === 'supervisor' || role === 'safetyofficer'
    };
  });
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchApi<any>('/users/me')
      .then(data => {
        const role = data.role?.toLowerCase();
        const isAdmin = role === 'admin' || role === 'systemadmin';
        const isSupervisor = role === 'supervisor' || role === 'safetyofficer';
        
        setRealRole({ isAdmin, isSupervisor });
        
        // If user is NEITHER Supervisor NOR Admin, but is on Supervisor Page, kick them out.
        if (!isSupervisor && !isAdmin) {
          console.warn("User access revoked. Redirecting to Employee Dashboard.");
          // Optional: Update local state role if needed, but navigation is enough
          navigate('/employee');
        }
      })
      .catch(console.error);
  }, [navigate]);

  // Combine alerts and emergency instructions for notifications
  const notifications = React.useMemo(() => {
    const alerts = state.alerts.map(a => ({ ...a, type: 'alert' as const }));
    const emergencies = state.emergencyInstructions.map(e => ({ ...e, type: 'emergency' as const, timestamp: new Date() }));
    return [...alerts, ...emergencies].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [state.alerts, state.emergencyInstructions]);

  const unreadCount = notifications.length;

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    setShowRoleMenu(false);
    if (role === 'employee') {
      navigate('/employee');
    } else if (role === 'supervisor') {
      navigate('/supervisor');
    }
  };

  const navItems = [
    { path: '/supervisor', name: 'Dashboard', icon: LayoutDashboard, end: true },
    { path: '/supervisor/incidents', name: 'Incidents', icon: AlertTriangle },
    { path: '/supervisor/tasks', name: 'Tasks', icon: ClipboardList },
    { path: '/supervisor/safety-resources', name: 'Safety Resources', icon: FileText },
  ];

  return (
    <header style={{
      height: 'var(--header-height, 64px)',
      backgroundColor: '#0f172a',
      color: 'white',
      borderBottom: '1px solid #1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
        {/* Logo Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldAlert size={28} color="var(--color-hazard)" />
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '-0.025em' }}>HazardEye</span>
        </div>

        {/* Main Navigation - Same as Admin */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                transition: 'all 0.2s',
                backgroundColor: isActive ? 'var(--color-primary, #3b82f6)' : 'transparent',
                color: isActive ? 'white' : '#94a3b8',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.875rem'
              })}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Role Switcher - Maintaining functionality but styling like Admin elements */}
        {/* Only show if user is actually a Supervisor (or Admin) based on fresh DB data */}
        {(realRole?.isSupervisor || realRole?.isAdmin) && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.75rem',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: '#cbd5e1',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              <span style={{ textTransform: 'capitalize' }}>{state.currentUser.role}</span>
              <ChevronDown size={14} />
            </button>

            {showRoleMenu && (
              <>
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} onClick={() => setShowRoleMenu(false)} />
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 5px)',
                  right: 0,
                  width: '120px',
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                  padding: '4px 0',
                  zIndex: 20
                }}>
                  <button
                    onClick={() => handleRoleSwitch('supervisor')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      fontSize: '0.875rem',
                      background: state.currentUser.role === 'supervisor' ? '#f1f5f9' : 'none',
                      color: state.currentUser.role === 'supervisor' ? '#3b82f6' : '#475569',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >Supervisor</button>
                  <button
                    onClick={() => handleRoleSwitch('employee')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      fontSize: '0.875rem',
                      background: state.currentUser.role === 'employee' ? '#f1f5f9' : 'none',
                      color: state.currentUser.role === 'employee' ? '#3b82f6' : '#475569',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >Employee</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Profile Dropdown - Admin Style */}
        <div style={{ position: 'relative', borderLeft: '1px solid #334155', paddingLeft: '1rem' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
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
            <div style={{ textAlign: 'right' }} className="hidden md:block">
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>{state.currentUser.name}</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                {realRole?.isAdmin ? 'Administrator' : realRole?.isSupervisor ? 'Supervisor' : 'Employee'}
              </p>
            </div>
            <div style={{
              width: '36px',
              height: '36px',
              backgroundColor: '#1e293b',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
              border: '1px solid #334155'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                {state.currentUser.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </button>

          {showUserMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowUserMenu(false)} />
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '240px',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                color: '#1e293b',
                overflow: 'hidden',
                zIndex: 100
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>{state.currentUser.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0 0' }}>{state.currentUser.email}</p>
                </div>
                <div style={{ padding: '4px' }}>
                  <button
                    onClick={() => { setShowUserMenu(false); navigate('/supervisor/profile'); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '10px 12px', color: '#475569', background: 'none', border: 'none', fontSize: '0.875rem', borderRadius: '4px', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <User size={16} /> Profile Settings
                  </button>
                  <button
                    onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '10px 12px', color: '#475569', background: 'none', border: 'none', fontSize: '0.875rem', borderRadius: '4px', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                  <button
                    onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '10px 12px', color: '#475569', background: 'none', border: 'none', fontSize: '0.875rem', borderRadius: '4px', cursor: 'pointer', textAlign: 'left', borderTop: '1px solid #f1f5f9' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <RefreshCw size={16} /> Switch Account
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notifications Bell - At the Corner */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              padding: '0.5rem',
              color: '#94a3b8',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '10px',
                height: '10px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                border: '2px solid #0f172a'
              }}></span>
            )}
          </button>

          {showNotifications && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowNotifications(false)} />
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '320px',
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 100,
                color: '#1e293b'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Notifications</h3>
                  <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 500 }}>{unreadCount} New</span>
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>No new notifications</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {notifications.map((note, idx) => (
                      <div key={idx} style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', backgroundColor: (note as any).severity === 'High' ? '#fef2f2' : 'white' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{
                            padding: '6px',
                            borderRadius: '8px',
                            backgroundColor: (note as any).severity === 'High' ? '#fee2e2' : '#fff7ed',
                            color: (note as any).severity === 'High' ? '#ef4444' : '#f97316'
                          }}>
                            <AlertTriangle size={14} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                              <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600 }}>{note.title}</p>
                              <span style={{ fontSize: '0.625rem', color: '#94a3b8' }}>{format(note.timestamp || new Date(), 'h:mm a')}</span>
                            </div>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                              {(note as any).message || (note as any).steps?.[0]}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

