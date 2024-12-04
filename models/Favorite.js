import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  }
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;