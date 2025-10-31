import mongoose from 'mongoose';
const { isValidObjectId } = mongoose;

const Schema = new mongoose.Schema({
  thread: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Thread', 
    required: true,
    validate: v => isValidObjectId(v)
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    validate: v => isValidObjectId(v)
  },
  content: { type: String, required: true, minlength: 1, maxlength: 2000 },
  replyTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Message', 
    default: null,
    validate: v => v === null || isValidObjectId(v)
  },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'messages',
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
// Schéma Mongoose décrivant la structure des messages liés à un fil de discussion et à leur auteur.
// Gère les réponses, les validations d’identifiants et la conversion JSON pour afficher id au lieu de _id.
