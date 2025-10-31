import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  firstname: { type: String, required: true, minlength: 2 },
  lastname: { type: String, required: true, minlength: 2 },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
  },
  age: { type: Number, min: 13, max: 120 },
  city: { type: String, maxlength: 100 }
}, {
  collection: 'users',
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
// Schéma Mongoose pour les utilisateurs avec leurs informations personnelles et validations de base.
// Gère les contraintes sur le nom, l’email, l’âge et formate la sortie JSON pour afficher id au lieu de _id.
