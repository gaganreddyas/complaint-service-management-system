import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const SupportDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem('user')).token;
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get('https://complaint-backend-cafm.onrender.com/api/complaints', config);
        setComplaints(res.data);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to fetch tasks');
      }
    };
    fetchTickets();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`https://complaint-backend-cafm.onrender.com/api/complaints/${id}`, { status: newStatus }, config);
      toast.success(`Ticket marked as ${newStatus}`);
      
      setComplaints(complaints.map(ticket => 
        ticket._id === id ? { ...ticket, status: newStatus } : ticket
      ));
    } catch (err) {
      toast.error('Update failed');
    }
  };

  if (loading) return <p className="p-10">Loading your tasks...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Workstation</h1>

      {complaints.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center text-gray-500">
          🎉 No pending tickets! Good job.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {complaints.map((ticket) => (
            <div key={ticket._id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 text-xs font-bold rounded uppercase 
                  ${ticket.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                  {ticket.priority}
                </span>
                <span className="text-xs text-gray-500">Due: {new Date(ticket.slaDeadline).toLocaleDateString()}</span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">{ticket.title}</h3>
              <p className="text-gray-600 text-sm mb-4 h-12 overflow-hidden">{ticket.description}</p>

              <div className="flex gap-2 mt-4">
                {ticket.status !== 'In Progress' && ticket.status !== 'Resolved' && (
                  <button 
                    onClick={() => updateStatus(ticket._id, 'In Progress')}
                    className="flex-1 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition">
                    Start Work
                  </button>
                )}
                
                {ticket.status === 'In Progress' && (
                  <button 
                    onClick={() => updateStatus(ticket._id, 'Resolved')}
                    className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition">
                    Resolve
                  </button>
                )}
                 
                 {ticket.status === 'Resolved' && (
                     <p className="text-center w-full text-green-600 font-bold border border-green-200 py-2 rounded bg-green-50">
                         ✅ Resolved
                     </p>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportDashboard;
