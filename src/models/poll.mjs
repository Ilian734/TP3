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
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    validate: v => isValidObjectId(v)
  },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'polls',
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
// Schéma Mongoose pour les sondages liés à un événement et créés par un utilisateur.
// Définit la structure, les validations d’identifiants et adapte la sortie JSON pour afficher id au lieu de _id.
