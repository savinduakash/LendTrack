const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Books', 'Equipment', 'Electronics', 'Tools', 'Other'], 
    default: 'Other' 
  },
  borrowerName: { type: String, required: true },
  borrowerPhone: { type: String, required: true }, // Include Sri Lanka country code (+94)
  borrowerEmail: { type: String },
  borrowDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Active', 'Overdue', 'Returned'], 
    default: 'Active' 
  },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);