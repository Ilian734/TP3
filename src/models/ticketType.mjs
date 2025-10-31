import mongoose from "mongoose";
const { isValidObjectId } = mongoose;

const Schema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
    validate: v => isValidObjectId(v)
  },
  name: { type: String, required: true, minlength: 2 },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: v => isValidObjectId(v)
  },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: "ticketTypes",
  versionKey: false
}).set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

export default Schema;
// Schéma Mongoose pour les types de tickets associés à un événement et créés par un utilisateur.
// Définit les champs essentiels (nom, prix, quantité) et formate la sortie JSON pour remplacer _id par id.
