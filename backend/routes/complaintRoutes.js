const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getComplaints, 
  createComplaint, 
  getComplaint, 
  updateComplaint,
  getAllUsers
} = require('../controllers/complaintController');

router.route('/').get(protect, getComplaints).post(protect, createComplaint);
router.route('/users').get(protect, getAllUsers);
router.route('/:id').get(protect, getComplaint).put(protect, updateComplaint);

module.exports = router;