// Ce fichier contient deux fonctions :
//     signup → Inscription d'un nouvel utilisateur.
//     login → Connexion d'un utilisateur existant.

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/Users.js';

// Inscription
export const signup = async (req, res) => {
    try {
        // req.body.password → Récupère le mot de passe envoyé par l'utilisateur.
        // bcrypt.hash(password, 10) →
        // Crypte le mot de passe avec un "salt" de 10 tours.
        // Plus le "salt" est élevé, plus le hachage est sécurisé (mais plus lent).
        // Cela empêche de stocker le mot de passe en clair dans la base de données.
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // Crée un nouvel objet avec email et le mp hashé
        const user = new User({
            email: req.body.email,
            password: hashedPassword
        });
        // Sauvegarde dans la collection User dans MongoDB
        await user.save();
        // Gestion des erreurs
        res.status(201).json({ message: 'Utilisateur créé !' });
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Connexion
export const login = async (req, res) => {
    try {
        // User.findOne({ email: req.body.email }) → Cherche un utilisateur avec cet email dans la base de données
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }
        // bcrypt.compare(password_saisi, password_hashé) → Vérifie si le mot de passe saisi correspond au mot de passe crypté en base de données
        const valid = await bcrypt.compare(req.body.password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }
        // Si tout est OK, on retourne un status 200 avec :
        // userId: user._id → Permet au frontend d'identifier l'utilisateur connecté.
        // Un token JWT généré par jwt.sign() :
        // Payload → { userId: user._id } (contient l'ID de l'utilisateur).
        // Clé secrète → 'RANDOM_TOKEN_SECRET' (doit être stockée dans une variable d'environnement en prod).
        // Expiration → '24h' (le token expire après 24 heures).
        res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, 'RANDOM_TOKEN_SECRET', { expiresIn: '24h' })
        });
    } catch (error) {
        res.status(500).json({ error });
    }
};
