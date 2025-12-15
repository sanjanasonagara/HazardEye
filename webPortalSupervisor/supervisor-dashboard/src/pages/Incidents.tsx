import React from 'react';
import IncidentList from '../components/IncidentList';

const Incidents: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Incidents Management</h1>
            <IncidentList />
        </div>
    );
};

export default Incidents;
