import { BrowserRouter, Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { LocationProvider } from './shared/context/LocationContext';
import { AppProvider } from './supervisor/context/AppContext'; // New import as per instruction
import AdminApp from './admin/App';
import SupervisorApp from './supervisor/App';
import EmployeeApp from './employee/App';
import { LoginPage } from './auth/LoginPage';

const LandingPage = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
            color: 'white',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <div style={{ marginBottom: '4rem' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '2rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '1.5rem'
                }}>
                    <Shield size={20} color="#3b82f6" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.025em', color: '#94a3b8' }}>INDUSTRIAL SAFETY MANAGEMENT SYSTEM</span>
                </div>
                <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
                    HazardEye <span style={{ color: '#3b82f6' }}>Portal</span>
                </h1>
                <p style={{ fontSize: '1.25rem', opacity: 0.7, maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                    The complete ecosystem for industrial hazard detection, real-time monitoring, and proactive safety management.
                </p>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/login" style={{
                    padding: '1.25rem 2.5rem',
                    borderRadius: '0.75rem',
                    background: '#3b82f6',
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    transition: 'all 0.3s',
                    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.backgroundColor = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.backgroundColor = '#3b82f6';
                    }}
                >
                    Get Started
                </Link>
                <Link to="/signup" style={{
                    padding: '1.25rem 2.5rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    transition: 'all 0.3s'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                >
                    Explore Features
                </Link>
            </div>

            {/* Direct Access for Dev (optional, could be removed later) */}
            <div style={{ marginTop: '5rem', display: 'flex', gap: '2rem', opacity: 0.5 }}>
                <Link to="/admin" style={{ color: 'white', fontSize: '0.875rem' }}>Admin Access</Link>
                <Link to="/supervisor" style={{ color: 'white', fontSize: '0.875rem' }}>Supervisor Access</Link>
                <Link to="/employee" style={{ color: 'white', fontSize: '0.875rem' }}>Employee Access</Link>
            </div>
        </div>
    );
};

const ContextWrapper = () => (
    <AppProvider>
        <Outlet />
    </AppProvider>
);

function App() {
    console.log('App: Rendering');
    return (
        <BrowserRouter>
            <LocationProvider>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />

                    {/* Internal sub-apps */}
                    <Route path="/admin/*" element={<AdminApp />} />

                    {/* Shared Context for Supervisor & Employee to enable seamless switching */}
                    <Route element={<ContextWrapper />}>
                        <Route path="/supervisor/*" element={<SupervisorApp />} />
                        <Route path="/employee/*" element={<EmployeeApp />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </LocationProvider>
        </BrowserRouter>
    );
}

export default App;
