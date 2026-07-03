import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
const port = Number(process.env.PORT || 5000);
const start = async () => { await connectDB(); const server = app.listen(port, () => console.log(`API listening on port ${port}`)); process.on('SIGTERM', () => server.close(() => process.exit(0))); };
start().catch(error => { console.error('Startup failed:', error.message); process.exit(1); });
