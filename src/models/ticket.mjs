import mongoose from "mongoose";
const { isValidObjectId } = mongoose;

const Schema = new mongoose.Schema({
  ticketType: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "TicketType", 
    required: true, 
    validate: v => isValidObjectId(v) 
  },
  firstName: { type: String, required: true, minlength: 2 },
  lastName: { type: String, required: true, minlength: 2 },
  address: { type: String, required: true, minlength: 5 },
  purchaseDate: { type: Date, default: Date.now }
}, {
  collection: "tickets",
  versionKey: false
}).set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

export default Schema;
// Schéma Mongoose définissant la structure des tickets avec leur type, les informations de l’acheteur et la date d’achat.
// Gère les validations et formate la sortie JSON pour afficher id au lieu de _id.
