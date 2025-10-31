import mongoose from 'mongoose';
const { isValidObjectId } = mongoose;

const Schema = new mongoose.Schema({
  poll: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Poll', 
    required: true, 
    validate: v => isValidObjectId(v)
  },
  text: { type: String, required: true, minlength: 5 },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'questions',
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
// Schéma Mongoose pour les questions associées à un sondage spécifique dans la base de données.
// Définit les champs, leurs contraintes et la transformation JSON pour remplacer _id par id.
