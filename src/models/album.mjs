import mongoose from 'mongoose';
const { isValidObjectId } = mongoose;

const Schema = new mongoose.Schema({
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true,
    validate: v => isValidObjectId(v)
  },
  title: { type: String, required: true, minlength: 3 },
  description: { type: String, maxlength: 800 },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    validate: v => isValidObjectId(v)
  },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'albums',
  minimize: false,
  versionKey: false
}).set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

export default Schema;

// Schéma Mongoose définissant la structure des albums liés à un événement et à un utilisateur créateur.
// Configure la transformation JSON pour remplacer _id par id et simplifier les données retournées.
