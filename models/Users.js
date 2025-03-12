// Ce fichier définit le modèle User pour MongoDB avec Mongoose
// Il sert à stocker les utilisateurs inscrits dans la base de données

// mongoose → Permet de créer un modèle de données pour MongoDB
import mongoose from 'mongoose';
// mongoose-unique-validator → Plugin qui empêche d'enregistrer des emails en double dans la base
import uniqueValidator from 'mongoose-unique-validator';

// Explication
//     mongoose.Schema → Crée un schéma de données (équivalent à une table en SQL)
//     Champs définis :
//         email → Type String, obligatoire (required: true), et unique (unique: true)
//         password → Type String, obligatoire.
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Explication
//     userSchema.plugin(uniqueValidator) → Vérifie que l'email est bien unique AVANT l'enregistrement en base.
//     Pourquoi l'utiliser ?
//     Mongoose autorise les doublons même avec unique: true, mais ce plugin permet de gérer proprement les erreurs.
userSchema.plugin(uniqueValidator);

// Explication
//     mongoose.model('User', userSchema) →
//         Crée une collection users dans MongoDB (Mongoose met automatiquement le nom au pluriel)
//         Associe le modèle User au schéma userSchema
const User = mongoose.model('User', userSchema);


export default User;