import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Alerts
import Login from './pages/Login';
import Register from './pages/Register';

// Placeholder for Dashboard (we will build this later)
const Home = () => <div className="p-10 text-2xl font-bold text-center">Dashboard Coming Soon!</div>;

function App() {
  return (
    <>
      {/* Toaster handles popup alerts */}
      <Toaster position="top-center" reverseOrder={false} />
      
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Home />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
