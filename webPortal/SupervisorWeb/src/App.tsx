import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { IncidentReports } from './pages/IncidentReports';
import { IncidentDetail } from './pages/IncidentDetail';
import { Tasks } from './pages/Tasks';
import { TaskDetail } from './pages/TaskDetail';
import ProfileSettings from './pages/ProfileSettings';

import { SafetyResources } from './pages/SafetyResources';
import { Training } from './pages/Training';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="incidents" element={<IncidentReports />} />
            <Route path="incidents/:id" element={<IncidentDetail />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="tasks/:id" element={<TaskDetail />} />
            <Route path="safety-resources" element={<SafetyResources />} />
            <Route path="training" element={<Training />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;

