import mongoose from 'mongoose';
const { isValidObjectId } = mongoose;

const Schema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 3 },
  group: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group', 
    default: null, 
    validate: v => v === null || isValidObjectId(v)
  },
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    default: null, 
    validate: v => v === null || isValidObjectId(v)
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    validate: v => isValidObjectId(v)
  },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'threads',
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
// Schéma Mongoose pour les fils de discussion liés à un groupe ou un événement et créés par un utilisateur.
// Définit la structure, les références et adapte la sortie JSON pour afficher id au lieu de _id.
