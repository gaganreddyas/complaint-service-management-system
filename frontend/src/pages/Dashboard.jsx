import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import DashboardStats from '../components/DashboardStats';

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Hardware',
    priority: 'Low',
  });

  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token;
  const isAdminOrSupport = user?.role === 'admin' || user?.role === 'support';

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const url = isAdminOrSupport 
        ? 'http://localhost:5000/api/complaints/all' 
        : 'http://localhost:5000/api/complaints';
      const res = await axios.get(url, config);
      setComplaints(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch complaints');
    }
  };

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/complaints', formData, config);
      toast.success('Complaint Registered!');
      setFormData({ title: '', description: '', category: 'Hardware', priority: 'Low' });
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating complaint');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/complaints/${id}`, { status: newStatus }, config);
      toast.success(`Ticket marked as ${newStatus}`);
      fetchComplaints();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdminOrSupport ? 'Admin Dashboard' : 'My Dashboard'}
          </h1>
          <p className="text-gray-600">
            {isAdminOrSupport ? 'Manage and resolve support tickets' : 'Track and manage your complaints'}
          </p>
        </div>

        {isAdminOrSupport && complaints.length > 0 && (
          <DashboardStats complaints={complaints} />
        )}

        {!isAdminOrSupport && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-10">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Raise a Complaint</h2>
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <input type="text" name="title" value={formData.title} onChange={onChange} required
                  className="w-full mt-1 p-2 border rounded-md" placeholder="Title" />
              </div>
              <div className="col-span-1 md:col-span-2">
                <textarea name="description" value={formData.description} onChange={onChange} required
                  className="w-full mt-1 p-2 border rounded-md" rows="2" placeholder="Description" />
              </div>
              <div>
                <select name="category" value={formData.category} onChange={onChange} className="w-full p-2 border rounded-md">
                  <option>Hardware</option><option>Software</option><option>Network</option><option>Other</option>
                </select>
              </div>
              <div>
                <select name="priority" value={formData.priority} onChange={onChange} className="w-full p-2 border rounded-md">
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
              <div className="col-span-1 md:col-span-2">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md w-full">Submit</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden rounded-md">
          {loading ? <p className="p-4 text-center">Loading...</p> : (
            <ul className="divide-y divide-gray-200">
              {complaints.map((ticket) => (
                <li key={ticket._id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex flex-col md:flex-row justify-between md:items-center">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${
                          ticket.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ticket.priority}
                        </span>
                        <h3 className="text-lg font-medium text-blue-600">#{ticket._id.slice(-6)} - {ticket.title}</h3>
                      </div>
                      <p className="text-gray-600 mt-1">{ticket.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Category: {ticket.category} • Status: <span className="font-bold">{ticket.status}</span>
                      </p>
                    </div>

                    {isAdminOrSupport && ticket.status !== 'Closed' && (
                      <div className="flex gap-2">
                        {ticket.status === 'Open' && (
                          <button 
                            onClick={() => handleStatusUpdate(ticket._id, 'In Progress')}
                            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600">
                            Start Progress
                          </button>
                        )}
                        <button 
                          onClick={() => handleStatusUpdate(ticket._id, 'Closed')}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                          Close Ticket
                        </button>
                      </div>
                    )}
                    
                    {(!isAdminOrSupport || ticket.status === 'Closed') && (
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                        ${ticket.status === 'Closed' ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-800'}`}>
                        {ticket.status}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
