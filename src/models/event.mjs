import mongoose from 'mongoose';
const { isValidObjectId } = mongoose;

const Schema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3 },
  description: { type: String, maxlength: 800 },
  startDate: { type: Date, required: true },
  endDate: { 
    type: Date, 
    required: true,
    validate: {
      validator: function (v) {
        return !this.startDate || v >= this.startDate;
      }
    }
  },
  location: { type: String, required: true, minlength: 3 },
  coverPhoto: { type: String },
  isPrivate: { type: Boolean, default: false },
  organizers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    validate: v => isValidObjectId(v)
  }],
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    validate: v => isValidObjectId(v)
  }]
}, {
  collection: 'events',
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
// Schéma Mongoose décrivant la structure d’un événement avec ses informations principales et ses participants.
// Inclut les validations de dates, les références aux utilisateurs et la conversion JSON pour remplacer _id par id.
