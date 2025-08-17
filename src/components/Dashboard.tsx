import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import CitizenDashboard from './CitizenDashboard';
import AgentDashboard from './AgentDashboard';
import WorkerDashboard from './WorkerDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'citizen':
      return <CitizenDashboard />;
    case 'agent':
      return <AgentDashboard />;
    case 'worker':
      return <WorkerDashboard />;
    default:
      return <div>Invalid user role</div>;
  }
};

export default Dashboard;