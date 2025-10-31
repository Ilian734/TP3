import mongoose from 'mongoose';
const { isValidObjectId } = mongoose;

const Schema = new mongoose.Schema({
  photo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Photo', 
    required: true, 
    validate: v => isValidObjectId(v)
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    validate: v => isValidObjectId(v)
  },
  content: { type: String, required: true, minlength: 1, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'comments',
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
// Schéma Mongoose pour les commentaires associés à une photo et à leur auteur dans la base de données.
// Définit les champs, leurs validations et formate la sortie JSON pour afficher id au lieu de _id.
