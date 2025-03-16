// mongoose → Permet de créer un modèle de données pour MongoDB
import mongoose from 'mongoose';
// mongoose-unique-validator → Plugin qui empêche d'enregistrer des emails en double dans la base
import uniqueValidator from 'mongoose-unique-validator';

// mongoose.Schema → Crée un schéma de données
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// userSchema.plugin(uniqueValidator) → Vérifie que l'email est bien unique AVANT l'enregistrement en base.
userSchema.plugin(uniqueValidator);

// Crée une collection users dans MongoDB (Mongoose met automatiquement le nom au pluriel)
const User = mongoose.model('User', userSchema);

export default User;