const mongoose = require('mongoose');

// Sub-schema for Audit Log (Who did what and when)
const historySchema = mongoose.Schema({
  action: { type: String, required: true }, // e.g., "STATUS_CHANGE", "ASSIGNMENT"
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: { type: String }, // e.g., "Changed status from Open to In Progress"
  timestamp: { type: Date, default: Date.now }
});

const complaintSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // The Customer
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The Support Engineer
    default: null
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Hardware', 'Software', 'Network', 'HR', 'Other'],
  },
  priority: {
    type: String,
    default: 'Low',
    enum: ['Low', 'Medium', 'High', 'Critical'],
  },
  status: {
    type: String,
    default: 'Open',
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
  },
  slaDeadline: { 
    type: Date 
  },
  history: [historySchema], // The Audit Log Array
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);