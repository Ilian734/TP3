import mongoose from 'mongoose';
const { isValidObjectId } = mongoose;

const Schema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    validate: v => isValidObjectId(v)
  },
  selectedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    required: true,
    validate: v => isValidObjectId(v)
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: v => isValidObjectId(v)
  },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'votes',
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
// Schéma Mongoose pour les votes reliant un utilisateur à une question et à la réponse choisie.
// Définit les références, les validations d’identifiants et formate la sortie JSON pour afficher id au lieu de _id.
