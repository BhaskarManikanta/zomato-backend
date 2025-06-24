import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  name: String,
  currentLocation: { type: { type: String, default: "Point" }, coordinates: [Number] }, // GeoJSON [lng, lat]
  status: { type: String, enum: ['available', 'busy'], default: 'available' }
}, { timestamps: true });

agentSchema.index({ currentLocation: "2dsphere" });

export default mongoose.model('Agent', agentSchema);