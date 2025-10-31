import mongoose from 'mongoose';
const { isValidObjectId } = mongoose;

const Schema = new mongoose.Schema({
  question: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question', 
    required: true,
    validate: v => isValidObjectId(v)
  },
  text: { type: String, required: true, minlength: 1, maxlength: 300 }
}, {
  collection: 'answers',
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
// Schéma Mongoose pour les réponses associées à une question spécifique dans la base de données.
// Définit les champs, leurs contraintes et la transformation JSON pour afficher id au lieu de _id.
