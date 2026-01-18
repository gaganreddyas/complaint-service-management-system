const mongoose = require('mongoose');

const complaintSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Link to the User model
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
    enum: ['Hardware', 'Software', 'Network', 'Other'],
  },
  priority: {
    type: String,
    default: 'Low',
    enum: ['Low', 'Medium', 'High'],
  },
  status: {
    type: String,
    default: 'Open',
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
  },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);