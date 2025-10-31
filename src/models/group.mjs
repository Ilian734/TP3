import mongoose from 'mongoose';
const { isValidObjectId } = mongoose;

const Schema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3 },
  description: { type: String, maxlength: 500 },
  icon: { type: String },
  coverPhoto: { type: String },
  type: {
    type: String,
    enum: ['public', 'private', 'secret'],
    default: 'public'
  },
  allowPosts: { type: Boolean, default: true },
  allowEventCreation: { type: Boolean, default: false },
  admins: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    validate: v => isValidObjectId(v)
  }],
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    validate: v => isValidObjectId(v)
  }]
}, {
  collection: 'groups',
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

// Schéma Mongoose définissant la structure d’un groupe avec ses propriétés, ses membres et ses administrateurs.
// Gère les types de groupe, les autorisations et formate la sortie JSON pour afficher id au lieu de _id.
