import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './config/db';

const PORT = parseInt(process.env.PORT ?? '5000', 10);

const start = async (): Promise<void> => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n  Smart Leads API running on port ${PORT}`);
    console.log(`📦  Environment: ${process.env.NODE_ENV ?? 'development'}\n`);
  });
};

start().catch((err: Error) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
