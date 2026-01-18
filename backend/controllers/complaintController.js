const Complaint = require('../models/Complaint');

// @desc    Get user complaints
// @route   GET /api/complaints
// @access  Private
const getMyComplaints = async (req, res) => {
  const complaints = await Complaint.find({ user: req.user.id });
  res.status(200).json(complaints);
};

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req, res) => {
  const { title, description, category, priority } = req.body;

  if (!title || !description || !category) {
    res.status(400);
    throw new Error('Please include all fields');
  }

  const complaint = await Complaint.create({
    user: req.user.id,
    title,
    description,
    category,
    priority,
    status: 'Open',
  });

  res.status(201).json(complaint);
};

// @desc    Get ALL complaints (Admin only)
// @route   GET /api/complaints/all
// @access  Private
const getAllComplaints = async (req, res) => {
    // Simple version: Fetch everything
    const complaints = await Complaint.find().populate('user', 'name email');
    res.status(200).json(complaints);
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  // Allow user to see only their own complaints (unless they are admin/support)
  if (complaint.user.toString() !== req.user.id && req.user.role === 'customer') {
    res.status(401);
    throw new Error('Not Authorized');
  }

  res.status(200).json(complaint);
};

// @desc    Update complaint (Status or Assignment)
// @route   PUT /api/complaints/:id
// @access  Private
const updateComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  // Update logic: simpler version for fresher project
  // We just take whatever is in the body and update it
  // Example body: { "status": "Closed", "note": "Fixed the cable" }
  
  const updatedComplaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true } // Return the updated version
  );

  res.status(200).json(updatedComplaint);
};

module.exports = {
  getMyComplaints,
  createComplaint,
  getAllComplaints,
  getComplaint,
  updateComplaint,
};