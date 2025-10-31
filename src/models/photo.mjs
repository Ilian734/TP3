import mongoose from 'mongoose';
const { isValidObjectId } = mongoose;

const Schema = new mongoose.Schema({
  album: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Album', 
    required: true,
    validate: v => isValidObjectId(v)
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    validate: v => isValidObjectId(v)
  },
  url: { 
    type: String, 
    required: true,
    match: /^https?:\/\/[^\s$.?#].[^\s]*$/ 
  },
  caption: { type: String, maxlength: 300 },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'photos',
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
// Schéma Mongoose pour les photos associées à un album et à un utilisateur ayant effectué l’envoi.
// Définit les champs, leurs validations (URL, texte, références) et formate la sortie JSON pour afficher id au lieu de _id.
