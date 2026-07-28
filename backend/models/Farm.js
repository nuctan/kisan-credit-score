const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  landArea: { type: Number, required: true }, // in hectares
  crop: { type: String, required: true },
  soilType: { type: String },
  irrigationSource: { type: String },
  location: {
    state: { type: String },
    district: { type: String },
    village: { type: String }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Farm', farmSchema);
