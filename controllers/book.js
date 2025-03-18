import sharp from "sharp"; // Pour compresser les images
import fs from "fs/promises"; // Pour gérer les fichiers
import { unlink } from 'fs/promises';
import Book from "../models/Books.js";

// Créer un livre
// req.body.book est une chaîne de caractères envoyée dans la requête.
// JSON.parse(req.body.book) transforme cette chaîne en objet JavaScript.
// Cela permet de récupérer les données du livre envoyées par le client (titre, auteur, description, etc.).
export const createBook = async (req, res) => {
    try {
        console.log("Corps de la requête :", req.body);
        console.log("Fichier reçu :", req.file);

        const bookObject = JSON.parse(req.body.book);

        delete bookObject._id;
        delete bookObject._userId;

        // Vérifie si un fichier image (req.file) a été envoyé.
        if (!req.file) {
            return res.status(400).json({ message: "Aucune image fournie !" });
        }

        // Récupérer la note du créateur depuis `bookObject`
        const creatorRating = bookObject.ratings?.[0]?.grade || 0; // Note par défaut à 0 si absente

        // Création d’un nom unique pour l'image compressée
        const filename = `compressed_${Date.now()}.webp`;

        // Compression et sauvegarde de l'image avec Sharp
        await sharp(req.file.path)
            .resize({ width: 500 })
            .toFormat("webp")
            .webp({ quality: 80 })
            .toFile(`images/${filename}`);

        // Supprimer l'ancienne image originale (non compressée)
        await fs.unlink(req.file.path);

        // Création et enregistrement du livre
        const book = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get("host")}/images/${filename}`,
            ratings: [{ userId: req.auth.userId, grade: creatorRating }],
            averageRating: creatorRating,
        });

        await book.save();

        res.status(201).json({ message: "Livre enregistré !" });
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Récupérer tous les livres
export const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Récupérer un livre par ID
export const getOneBook = async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id }); // L'id vient de l'URL
        if (!book) return res.status(404).json({ message: "Livre non trouvé !" });
        res.status(200).json(book);
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Modifier un livre
export const modifyBook = async (req, res) => {
    try {
        const bookObject = req.file
            ? {
                  ...JSON.parse(req.body.book),
                  imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
              }
            : { ...req.body };

        delete bookObject._userId;

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
        // La méthode .split("/images/") divise la chaîne en deux parties :
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

        // Vérifier si l'utilisateur a déjà noté ce livre
        if (book.ratings.some((r) => r.userId === userId)) {
            return res.status(400).json({ message: "Vous avez déjà noté ce livre !" });
        }

        // Ajouter la note
        book.ratings.push({ userId, grade: rating });

        // Mettre à jour la moyenne
        book.averageRating =
            book.ratings.reduce((acc, curr) => acc + curr.grade, 0) / book.ratings.length;

        await book.save();
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ error });
    }
};

// Récupérer les 3 livres les mieux notés
// Trie les livres par averageRating décroissant (-1).
export const getBestRatedBooks = async (req, res) => {
    try {
        const books = await Book.find().sort({ averageRating: -1 }).limit(3);
        res.status(200).json(books);
    } catch (error) {
        res.status(400).json({ error });
    }
};