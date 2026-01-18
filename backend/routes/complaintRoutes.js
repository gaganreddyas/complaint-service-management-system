const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getMyComplaints, 
  createComplaint, 
  getAllComplaints,
  getComplaint,
  updateComplaint
} = require('../controllers/complaintController');

// All routes here require the user to be logged in (protect middleware)
router.route('/').get(protect, getMyComplaints).post(protect, createComplaint);
router.route('/all').get(protect, getAllComplaints);

// New Route for operations on specific ID
router.route('/:id')
  .get(protect, getComplaint)
  .put(protect, updateComplaint);

module.exports = router;