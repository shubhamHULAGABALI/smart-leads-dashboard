import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not defined');
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(mongoUri);
    console.log(`  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`  MongoDB connection failed: ${msg}`);
    process.exit(1);
  }
};

export default connectDB;
