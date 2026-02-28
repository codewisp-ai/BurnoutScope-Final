import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // this alone is enough
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  githubUsername: {
    type: String,
    default: '',
    trim: true,
  },
  lastAnalysis: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


export default mongoose.model('User', userSchema);