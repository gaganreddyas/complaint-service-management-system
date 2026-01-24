const Complaint = require('../models/Complaint');
const User = require('../models/User');

// --- HELPER: SLA CALCULATOR ---
// Returns a Date object based on priority
const calculateSLA = (priority) => {
  const now = new Date();
  switch (priority) {
    case 'Critical': return new Date(now.getTime() + 1 * 60 * 60 * 1000); // +1 Hour
    case 'High': return new Date(now.getTime() + 4 * 60 * 60 * 1000); // +4 Hours
    case 'Medium': return new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 Hours
    case 'Low': return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // +3 Days
    default: return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  }
};

// @desc    Get user complaints (Customer: Own, Support: Assigned, Admin: All)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
  let complaints;

  if (req.user.role === 'admin') {
    // Admin sees ALL tickets
    complaints = await Complaint.find().populate('user', 'name email').populate('assignedTo', 'name');
  } else if (req.user.role === 'support') {
    // Support sees only ASSIGNED tickets
    complaints = await Complaint.find({ assignedTo: req.user.id }).populate('user', 'name email');
  } else {
    // Customer sees only OWN tickets
    complaints = await Complaint.find({ user: req.user.id });
  }

  res.status(200).json(complaints);
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
const getComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('user', 'name')
    .populate('assignedTo', 'name')
    .populate('history.performedBy', 'name'); // Also fetch names for audit log

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  // Security Check: Customers can't see others' tickets
  if (req.user.role === 'customer' && complaint.user._id.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not Authorized');
  }

  res.status(200).json(complaint);
};

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private (Customer only mostly)
const createComplaint = async (req, res) => {
  const { title, description, category, priority } = req.body;

  if (!title || !description || !category) {
    res.status(400);
    throw new Error('Please include all fields');
  }

  // 1. Calculate SLA Deadline
  const slaDate = calculateSLA(priority || 'Low');

  // 2. Create Ticket with Initial History
  const complaint = await Complaint.create({
    user: req.user.id,
    title,
    description,
    category,
    priority,
    status: 'Open',
    slaDeadline: slaDate,
    history: [{
      action: 'CREATED',
      performedBy: req.user.id,
      details: `Ticket created with priority ${priority}`,
    }]
  });

  res.status(201).json(complaint);
};

// @desc    Update complaint (Status or Assignment)
// @route   PUT /api/complaints/:id
// @access  Private (Admin & Support)
const updateComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  // --- AUTHORIZATION CHECKS ---
  // 1. Customer can only close their own tickets if status is 'Resolved'
  if (req.user.role === 'customer') {
    // Check if this is their ticket
    if (complaint.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('Not Authorized');
    }
    // Allow only closing resolved tickets
    if (req.body.status !== 'Closed' || complaint.status !== 'Resolved') {
      res.status(401);
      throw new Error('You can only close resolved tickets');
    }
  }

  // 2. Support can only update tickets assigned to them (unless they are grabbing a new one)
  if (req.user.role === 'support' && 
      complaint.assignedTo?.toString() !== req.user.id && 
      req.body.status !== 'In Progress') { // Allow them to grab ticket? Let's keep strict for now
      // Strict: Support can only touch if assigned
      if (complaint.assignedTo?.toString() !== req.user.id) {
         res.status(401);
         throw new Error('Not Authorized: Ticket not assigned to you');
      }
  }

  const { status, assignedTo } = req.body;
  let historyEntry = null;

  // --- LOGIC: ASSIGNMENT (Admin Only) ---
  if (assignedTo && req.user.role === 'admin') {
    complaint.assignedTo = assignedTo;
    complaint.status = 'In Progress'; // Auto-start
    historyEntry = {
      action: 'ASSIGNED',
      performedBy: req.user.id,
      details: `Assigned to engineer ID ${assignedTo}`
    };
  }

  // --- LOGIC: STATUS CHANGE ---
  if (status) {
    // Prevent backward movement? (Optional, skipping for simplicity)
    complaint.status = status;
    historyEntry = {
      action: 'STATUS_CHANGE',
      performedBy: req.user.id,
      details: `Status changed to ${status}`
    };
  }

  // Apply History
  if (historyEntry) {
    complaint.history.push(historyEntry);
  }

  const updatedComplaint = await complaint.save();
  res.status(200).json(updatedComplaint);
};

// We also need a way to get all users (so Admin can see who to assign to)
const getAllUsers = async (req, res) => {
    const users = await User.find({ role: { $ne: 'customer' } }).select('-password');
    res.status(200).json(users);
}

module.exports = {
  getComplaints,
  createComplaint,
  getComplaint,
  updateComplaint,
  getAllUsers // Added this new function export
};