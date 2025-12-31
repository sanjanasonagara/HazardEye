import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { TaskDetail } from './pages/TaskDetail';
import ProfileSettings from './pages/ProfileSettings';
import { Incidents } from './pages/Incidents';
import { SafetyResources } from './pages/SafetyResources';

const EmployeeApp: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="tasks/:id" element={<TaskDetail />} />
                <Route path="incidents" element={<Incidents />} />
                <Route path="resources" element={<SafetyResources />} />
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="*" element={<Navigate to="/employee" replace />} />
            </Route>
        </Routes>
    );
};

export default EmployeeApp;
