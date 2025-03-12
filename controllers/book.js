// Ce fichier contient les contrôleurs de l'API pour gérer les livres (Book).
// Il utilise :
//     MongoDB & Mongoose pour la base de données
//     Express pour gérer les requêtes HTTP
//     fs/promises pour gérer les fichiers (unlink permet de supprimer une image)


import Book from "../models/Books.js";
import { unlink } from "fs/promises";

// Créer un livre
// req.body.book est une chaîne de caractères envoyée dans la requête.
// JSON.parse(req.body.book) transforme cette chaîne en objet JavaScript.
// Cela permet de récupérer les données du livre envoyées par le client (titre, auteur, description, etc.).
export const createBook = async (req, res) => {
    try {
        const bookObject = JSON.parse(req.body.book);

        // MongoDB génère automatiquement un _id unique pour chaque document.
        // Si on laisse un _id dans bookObject, deux problèmes peuvent survenir :
        // Erreur MongoDB : Si l'ID existant est en double, l’insertion échoue.
        // Sécurité : Un utilisateur pourrait forcer un _id personnalisé et écraser un autre document.
        delete bookObject._id;
        delete bookObject._userId;

        // Vérifie si un fichier image (req.file) a été envoyé.
        // Si non → Retourne une erreur 400 avec le message "Aucune image fournie !".
        // Pourquoi ? Parce que chaque livre doit avoir une image, et on l’utilise dans imageUrl.
        if (!req.file) {
            return res.status(400).json({ message: "Aucune image fournie !" });
        }


        // Création d’un nouvel objet Book basé sur bookObject (titre, auteur, description, etc.).
        // Ajout d’informations supplémentaires :
        // userId: req.auth.userId → Associe le livre à l’utilisateur connecté (req.auth.userId).
        // imageUrl: ${req.protocol}://${req.get("host")}/images/${req.file.filename}
        // Crée l’URL complète de l’image.
        // Ex : http://localhost:3000/images/mon-image.jpg
        // averageRating: 0 → La note moyenne commence à 0 car personne n’a encore noté le livre.
        // ratings: [] → Initialise un tableau vide pour stocker les avis.
        const book = new Book({
            ...bookObject, // Représente le formulaire
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
            averageRating: 0,
            ratings: []
        });

        // await book.save(); → Sauvegarde le livre dans MongoDB.
        // Si tout est OK :
        // Répond avec status 201 (création réussie).
        // Message "Livre enregistré !".
        // Si erreur :
        // Répond avec status 400.
        // Envoie l’erreur.
        await book.save();
        res.status(201).json({ message: "Livre enregistré !" });
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Récupérer tous les livres
// Utilise Book.find() pour récupérer tous les livres de MongoDB.
// Si ça marche → Retourne la liste des livres en JSON (status 200).
// Si erreur → Retourne une erreur (status 400).
export const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Récupérer un livre par ID
// Récupère un seul livre avec Book.findOne({ _id: req.params.id }) (l'ID vient de l'URL).
// Si aucun livre n'est trouvé → status 404.
// Si trouvé → Retourne le livre (status 200).
// Si erreur MongoDB → status 400.
export const getOneBook = async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id });
        if (!book) return res.status(404).json({ message: "Livre non trouvé !" });
        res.status(200).json(book);
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Modifier un livre
// Récupération des données
//     Si une nouvelle image a été envoyée (req.file), on met à jour imageUrl.
//     Sinon, on garde les données existantes (req.body).
// Vérification
//     Si le livre n'existe pas → status 404
//     Si l'utilisateur n'est pas le propriétaire → status 403
// Mise à jour du livre
//     Book.updateOne({ _id: req.params.id }, {...bookObject, _id: req.params.id })
//     Retourne status 200 si tout va bien.
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
// Vérification
//     Si le livre n'existe pas → status 404
//     Si l'utilisateur n'est pas le propriétaire → status 403
// Suppression de l'image associée
//     imageUrl est sous forme : http://localhost:3000/images/nomFichier.jpg
//     filename = book.imageUrl.split("/images/")[1]
//     unlink("images/" + filename) supprime le fichier sur le serveur.
// Suppression du livre
//     Book.deleteOne({ _id: req.params.id })
//     Retourne status 200.
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
        // Avant "/images/" → Index [0]
        // Après "/images/" → Index [1] (le nom du fichier)
        const filename = book.imageUrl.split("/images/")[1];
        // Supprime l'image du dossier images/ sur le serveur
        await unlink(`images/${filename}`);

        await Book.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: "Livre supprimé !" });

    } catch (error) {
        res.status(500).json({ error });
    }
};

// Noter un livre
// Vérifications
//     La note (rating) doit être entre 0 et 5 → status 400
//     Si le livre n'existe pas → status 404
//     Si l’utilisateur a déjà noté le livre → status 400
// Ajout de la note
//     book.ratings.push({ userId, grade: rating })
// Calcul de la moyenne
// book.averageRating =
//    book.ratings.reduce((acc, curr) => acc + curr.grade, 0) / book.ratings.length;
//    On additionne toutes les notes et on divise par le nombre de notes.
// Sauvegarde et réponse
//    book.save() met à jour la BDD.
//    Retourne le livre mis à jour (status 200).
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
// Limite le résultat à 3 (limit(3)).
// Retourne la liste des trois meilleurs livres (status 200).
export const getBestRatedBooks = async (req, res) => {
    try {
        const books = await Book.find().sort({ averageRating: -1 }).limit(3);
        res.status(200).json(books);
    } catch (error) {
        res.status(400).json({ error });
    }
};



// Résumé

//     Récupère les données du livre envoyées par le client (req.body.book).
//     Vérifie si une image a été envoyée (req.file).
//     Crée un nouvel objet Book, en ajoutant :
//         L’utilisateur (userId).
//         L’image (imageUrl).
//         Une note moyenne (averageRating).
//         Un tableau vide pour les avis (ratings).
//     Sauvegarde dans la base de données (book.save()).
//     Répond avec un message de succès ou une erreur.
