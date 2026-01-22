import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import SupportDashboard from '../components/dashboard/SupportDashboard';
import CustomerDashboard from '../components/dashboard/CustomerDashboard';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    } else {
      navigate('/login');
    }
  }, [navigatenavigate]);

  // This loading screen will now only show for a split second before redirecting
  if (!user) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {/* === ROLE BASED ROUTING === */}
        {user.role === 'admin' && <AdminDashboard />}
        {user.role === 'support' && <SupportDashboard />}
        {user.role === 'customer' && <CustomerDashboard />}

      </div>
    </div>
  );
};

export default Dashboard;
