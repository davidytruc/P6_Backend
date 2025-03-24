import sharp from "sharp"; // Module pour compresser et convertir les images
import fs from "fs/promises"; // Module pour gérer les fichiers de manière asynchrone
import { unlink } from 'fs/promises'; // Fonction pour supprimer un fichier
import Book from "../models/Books.js"; // Importation du modèle Book

// Créer un livre
export const createBook = async (req, res) => {
    try {
        console.log("Corps de la requête :", req.body);
        console.log("Fichier reçu :", req.file);

        // Convertit les données envoyées sous forme de chaîne JSON en objet JavaScript
        const bookObject = JSON.parse(req.body.book);

        // Supprime l'ID et userId envoyés pour éviter toute modification indésirable
        delete bookObject._id;
        delete bookObject._userId;

        // Vérifie si un fichier image a été envoyé
        if (!req.file) {
            return res.status(400).json({ message: "Aucune image fournie !" });
        }

        // Récupérer la note du créateur, ou mettre 0 par défaut
        const creatorRating = bookObject.ratings?.[0]?.grade || 0;

        // Génère un nom unique pour l'image compressée
        const filename = `compressed_${Date.now()}.webp`;

        // Compression et conversion de l'image avec Sharp
        await sharp(req.file.path)
            .resize({ width: 500 }) // Redimensionne l'image en 500px de largeur
            .toFormat("webp") // Convertit en format WebP
            .webp({ quality: 80 }) // Qualité de 80%
            .toFile(`images/${filename}`); // Sauvegarde dans le dossier images

        // Supprime l'image originale non compressée
        await fs.unlink(req.file.path);

        // Création et enregistrement du livre avec les données traitées
        const book = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get("host")}/images/${filename}`,
            ratings: [{ userId: req.auth.userId, grade: creatorRating }],
            averageRating: creatorRating,
        });

        await book.save(); // Sauvegarde du livre en base de données

        res.status(201).json({ message: "Livre enregistré !" });
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Récupérer tous les livres
export const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find(); // Récupère tous les livres en base de données
        res.status(200).json(books);
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Récupérer un livre par ID
export const getOneBook = async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id }); // Recherche le livre par ID
        if (!book) return res.status(404).json({ message: "Livre non trouvé !" });
        res.status(200).json(book);
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Modifier un livre
export const modifyBook = async (req, res) => {
    try {
        // Si une nouvelle image est envoyée, on met à jour l'URL de l'image
        const bookObject = req.file
            ? {
                  ...JSON.parse(req.body.book),
                  imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
              }
            : { ...req.body };

        delete bookObject._userId; // Empêche la modification de userId

        const book = await Book.findOne({ _id: req.params.id });

        if (!book) {
            return res.status(404).json({ message: "Livre non trouvé !" });
        }

        if (book.userId !== req.auth.userId) {
            return res.status(403).json({ message: "Action non autorisée !" });
        }

        await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });

        res.status(200).json({ message: "Livre modifié !" });
    } catch (error) {
        res.status(500).json({ error });
    }
};

// Supprimer un livre
export const deleteBook = async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id });
        if (!book) {
            return res.status(404).json({ message: "Livre non trouvé !" });
        }
        if (book.userId !== req.auth.userId) {
            return res.status(403).json({ message: "Non autorisé" });
        }
        
        // Supprime l'image associée au livre
        const filename = book.imageUrl.split("/images/")[1];
        await unlink(`images/${filename}`);

        await Book.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: "Livre supprimé !" });
    } catch (error) {
        res.status(500).json({ error });
    }
};

// Noter un livre
export const rateBook = async (req, res) => {
    try {
        const { userId, rating } = req.body;
        const book = await Book.findOne({ _id: req.params.id });
        if (!book) {
            return res.status(404).json({ message: "Livre non trouvé !" });
        }

        // Vérifie si l'utilisateur a déjà noté ce livre
        if (book.ratings.some((r) => r.userId === userId)) {
            return res.status(400).json({ message: "Vous avez déjà noté ce livre !" });
        }

        // Ajoute la nouvelle note et met à jour la moyenne
        book.ratings.push({ userId, grade: rating });
        book.averageRating = book.ratings.reduce((acc, curr) => acc + curr.grade, 0) / book.ratings.length;

        await book.save();
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ error });
    }
};

// Récupérer les 3 livres les mieux notés
export const getBestRatedBooks = async (req, res) => {
    try {
        const books = await Book.find().sort({ averageRating: -1 }).limit(3); // Trie par moyenne décroissante et limite à 3
        res.status(200).json(books);
    } catch (error) {
        res.status(400).json({ error });
    }
};
