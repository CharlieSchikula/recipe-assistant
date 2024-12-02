import mongoose from 'mongoose';

const substituteSchema = new mongoose.Schema({
  ingredient: { type: String, required: true },
  substitutes: [
    {
      originalPortion: { type: String, required: true },
      substituteName: { type: String, required: true },
      substitutePortion: { type: String, required: true },
      vegetarian: { type: Boolean, default: false }
    }
  ]
});

const Substitute = mongoose.model('Substitute', substituteSchema);

export default Substitute;