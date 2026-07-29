const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, default: 'farmer', enum: ['farmer', 'officer', 'admin'] },
  farmProfile: {
    state: { type: String, default: 'Maharashtra' },
    district: { type: String, default: '' },
    crop: { type: String, default: '' },
    areaHectares: { type: Number, default: 0 },
    loanTenureYears: { type: Number, default: 1 },
    startMonthIndex: { type: Number, default: 10 },
    cropDurationMonths: { type: Number, default: 4 },
    suggestedLoanLimit: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
