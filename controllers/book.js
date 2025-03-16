import Book from "../models/Books.js";
import { unlink } from "fs/promises";

// Créer un livre
// req.body.book est une chaîne de caractères envoyée dans la requête.
// JSON.parse(req.body.book) transforme cette chaîne en objet JavaScript.
// Cela permet de récupérer les données du livre envoyées par le client (titre, auteur, description, etc.).
export const createBook = async (req, res) => {
    try {
        const bookObject = JSON.parse(req.body.book);

        delete bookObject._id;
        delete bookObject._userId;

        // Vérifie si un fichier image (req.file) a été envoyé.
        if (!req.file) {
            return res.status(400).json({ message: "Aucune image fournie !" });
        }

        // Création d’un nouvel objet Book basé sur bookObject (titre, auteur, description, etc.).
        const book = new Book({
            ...bookObject,
            userId: req.auth.userId, // Pour récupérer le userID
            imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
            averageRating: 0,
            ratings: []
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
        if (rating < 0 || rating > 5) {
            return res.status(400).json({ message: "La note doit être entre 0 et 5." });
        }

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