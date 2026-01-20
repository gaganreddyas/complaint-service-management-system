import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import DashboardStats from '../DashboardStats';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem('user')).token;
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketRes = await axios.get('https://complaint-backend-cafm.onrender.com/api/complaints', config);
        setComplaints(ticketRes.data);

        const userRes = await axios.get('https://complaint-backend-cafm.onrender.com/api/complaints/users', config);
        setUsers(userRes.data.filter(u => u.role === 'support'));
        
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load data');
      }
    };
    fetchData();
  }, []);

  const handleAssign = async (ticketId, engineerId) => {
    try {
      await axios.put(
        `https://complaint-backend-cafm.onrender.com/api/complaints/${ticketId}`, 
        { assignedTo: engineerId }, 
        config
      );
      toast.success('Ticket Assigned Successfully!');
      
      const updatedList = complaints.map(ticket => 
        ticket._id === ticketId 
          ? { ...ticket, assignedTo: users.find(u => u._id === engineerId), status: 'In Progress' } 
          : ticket
      );
      setComplaints(updatedList);

    } catch (err) {
      toast.error('Assignment Failed');
    }
  };

  if (loading) return <p>Loading Admin Panel...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Control Center</h1>
      
      <DashboardStats complaints={complaints} />

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority / SLA</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {complaints.map((ticket) => (
              <tr key={ticket._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{ticket._id.slice(-6)}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                  <div className="text-sm text-gray-500">{ticket.category}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${ticket.priority === 'High' || ticket.priority === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {ticket.priority}
                  </span>
                  <div className="text-xs text-red-500 mt-1">
                    Due: {new Date(ticket.slaDeadline).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{ticket.status}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <select 
                    className="border rounded p-1 text-sm"
                    value={ticket.assignedTo?._id || ticket.assignedTo || ''}
                    onChange={(e) => handleAssign(ticket._id, e.target.value)}
                    disabled={ticket.status === 'Closed'}
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
