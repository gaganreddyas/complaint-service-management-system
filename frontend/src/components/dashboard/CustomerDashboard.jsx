import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CustomerDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Hardware', priority: 'Low' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const token = JSON.parse(localStorage.getItem('user')).token;
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        const res = await axios.get('https://complaint-backend-cafm.onrender.com/api/complaints', config);
        setComplaints(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMyTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('https://complaint-backend-cafm.onrender.com/api/complaints', formData, config);
      toast.success('Ticket Created!');
      setFormData({ title: '', description: '', category: 'Hardware', priority: 'Low' });
      const res = await axios.get('https://complaint-backend-cafm.onrender.com/api/complaints', config);
      setComplaints(res.data);
    } catch (err) {
      toast.error('Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow h-fit">
        <h2 className="text-xl font-bold mb-4">Raise a New Complaint</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700">Title</label>
            <input type="text" className="w-full border p-2 rounded" required
              value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Description</label>
            <textarea className="w-full border p-2 rounded" rows="3" required
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
                <label className="block text-sm text-gray-700">Category</label>
                <select className="w-full border p-2 rounded"
                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option>Hardware</option><option>Software</option><option>Network</option>
                </select>
            </div>
            <div>
                <label className="block text-sm text-gray-700">Priority</label>
                <select className="w-full border p-2 rounded"
                value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                <option>Low</option><option>Medium</option><option>High</option>
                </select>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full text-white py-2 rounded transition ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2">
        <h2 className="text-xl font-bold mb-4">My History</h2>
        <div className="space-y-4">
          {complaints.map((ticket) => (
            <div key={ticket._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800">{ticket.title}</h3>
                <p className="text-sm text-gray-500">Status: <span className="font-semibold text-blue-600">{ticket.status}</span></p>
              </div>
              <div className="text-right">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CustomerDashboard;
