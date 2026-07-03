import mongoose from 'mongoose';
const schema = new mongoose.Schema({ recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, title: String, message: String, type: { type: String, default: 'info' }, readAt: Date }, { timestamps: true });
export default mongoose.model('Notification', schema);
