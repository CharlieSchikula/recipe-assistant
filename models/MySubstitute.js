import mongoose from 'mongoose';

const substituteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  ingredient: { type: String, required: true },
  mySubstitutes: [
    {
      originalPortion: { type: String, required: true },
      substituteName: { type: String, required: true },
      substitutePortion: { type: String, required: true },
      vegetarian: { type: Boolean, default: false }
    }
  ]
});

const mySubstitute = mongoose.model('mySubstitute', substituteSchema);

export default mySubstitute;