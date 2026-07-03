import mongoose from 'mongoose';
const schema = new mongoose.Schema({ actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, action: String, resource: String, resourceId: mongoose.Schema.Types.ObjectId, ip: String, metadata: mongoose.Schema.Types.Mixed }, { timestamps: true });
export default mongoose.model('ActivityLog', schema);
