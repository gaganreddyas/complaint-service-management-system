import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';

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

  // Fetch Complaints on Load
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const res = await axios.get('http://localhost:5000/api/complaints', config);
      setComplaints(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch complaints');
    }
  };

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.post('http://localhost:5000/api/complaints', formData, config);
      toast.success('Complaint Registered!');
      setFormData({ title: '', description: '', category: 'Hardware', priority: 'Low' }); // Reset form
      fetchComplaints(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating complaint');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {/* === CREATE TICKET SECTION === */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Raise a Complaint</h2>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-700">Title</label>
              <input type="text" name="title" value={formData.title} onChange={onChange} required
                className="w-full mt-1 p-2 border rounded-md" placeholder="Brief summary of issue" />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-700">Description</label>
              <textarea name="description" value={formData.description} onChange={onChange} required
                className="w-full mt-1 p-2 border rounded-md" rows="3" placeholder="Describe the issue in detail" />
            </div>

            <div>
              <label className="block text-gray-700">Category</label>
              <select name="category" value={formData.category} onChange={onChange}
                className="w-full mt-1 p-2 border rounded-md">
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Network">Network</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700">Priority</label>
              <select name="priority" value={formData.priority} onChange={onChange}
                className="w-full mt-1 p-2 border rounded-md">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <button type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition w-full md:w-auto">
                Submit Complaint
              </button>
            </div>
          </form>
        </div>

        {/* === TICKET LIST SECTION === */}
        <h2 className="text-2xl font-bold mb-4 text-gray-800">My Complaints</h2>
        <div className="bg-white shadow overflow-hidden rounded-md">
          {loading ? (
            <p className="p-4 text-center">Loading...</p>
          ) : complaints.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No complaints found. Good news!</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {complaints.map((ticket) => (
                <li key={ticket._id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-medium text-blue-600">{ticket.title}</p>
                      <p className="text-sm text-gray-500">{ticket.category} • {new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                        ${ticket.status === 'Open' ? 'bg-green-100 text-green-800' : 
                          ticket.status === 'Closed' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {ticket.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">Priority: {ticket.priority}</p>
                    </div>
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
