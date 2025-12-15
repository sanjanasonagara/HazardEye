import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import Login from './pages/Login';
import { LayoutDashboard, AlertTriangle } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col">
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-2xl font-bold text-center">HazardEye</h1>
            <p className="text-xs text-center text-slate-400">Supervisor Portal</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link to="/" className="flex items-center p-3 rounded hover:bg-slate-800 transition-colors">
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            <Link to="/incidents" className="flex items-center p-3 rounded hover:bg-slate-800 transition-colors">
              <AlertTriangle className="mr-3 h-5 w-5" />
              Incidents
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/incidents" element={<Incidents />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
