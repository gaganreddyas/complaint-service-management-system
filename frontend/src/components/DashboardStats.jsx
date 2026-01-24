import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardStats = ({ complaints }) => {
  // Calculate stats dynamically
  const total = complaints.length;
  const completed = complaints.filter(c => c.status === 'Closed' || c.status === 'Resolved').length;
  const pending = total - completed;

  const data = [
    { name: 'Pending', value: pending },
    { name: 'Completed', value: completed },
  ];

  const COLORS = ['#FBBF24', '#10B981']; // Yellow for Pending, Green for Completed

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row items-center justify-between">
      
      {/* Text Stats */}
      <div className="mb-6 md:mb-0 text-center md:text-left">
        <h3 className="text-xl font-bold text-gray-700 mb-2">Ticket Overview</h3>
        <p className="text-4xl font-bold text-blue-600">{total} <span className="text-base text-gray-500 font-normal">Total Tickets</span></p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <p className="text-gray-600">Completed: <span className="font-bold text-gray-900">{completed}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <p className="text-gray-600">Pending: <span className="font-bold text-gray-900">{pending}</span></p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full md:w-1/2 h-64" role="region" aria-label="Ticket status distribution chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardStats;
