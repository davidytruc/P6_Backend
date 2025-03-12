// Le fichier book.js dans le dossier routes définit les routes de l’API liées aux livres.
// Il gère les requêtes HTTP et connecte chaque endpoint à un contrôleur spécifique.

import express from "express"; // Framework pour créer les routes
import auth from "../middleware/auth.js"; // Middleware qui vérifie si l’utilisateur est authentifié
import multer from "../middleware/multer-config.js"; // Middleware qui gère l’upload des fichiers
// Import des contrôleurs
// Ces fonctions exécutent la logique métier pour chaque route (ex : créer un livre, récupérer les livres, etc.).
import { 
    createBook, 
    getAllBooks, 
    getOneBook, 
    modifyBook, 
    deleteBook, 
    rateBook, 
    getBestRatedBooks
} from "../controllers/book.js";

// Création du router Express
const router = express.Router();



// .................... GESTION DES ROUTES ET DU CRUD..................................//
// Chaque route correspond à une action (CRUD) sur un livre

// Exemple d’appel frontend : fetch("http://localhost:3000/api/books") etc.
router.get("/", getAllBooks); // Récupérer tous les livres, Accès public

// Récupérer les livres les mieux notés, Accès public
router.get("/bestrating", getBestRatedBooks);

// Récupérer un seul livre, Accès public, les deux points ":" signifient qu'il s'agit d'un paramètre
router.get("/:id", getOneBook);

// Ajouter un nouveau livre, Accès privé (Middleware Auth) + upload Image (Middlewares multer & createBook)
// Exemple d'appel frontEnd
// const formData = new FormData();
// formData.append("title", "Nouveau Livre");
// formData.append("author", "Jean Dupont");
// formData.append("image", fileInput.files[0]); // Image uploadée
// fetch("http://localhost:3000/api/books", {
//   method: "POST",
//   headers: {
//     "Authorization": "Bearer token_utilisateur"
//   },
//   body: formData
// });
router.post("/", auth, multer, createBook);

// Modifier un livre, Accès privé (Middleware Auth) + upload Image (Middlewares multer & modifyBook)
// Exemple d’appel frontend :
// const bookData = {
//   title: "Titre Modifié",
//   author: "Auteur Modifié"
// };
// fetch("http://localhost:3000/api/books/123456", {
//   method: "PUT",
//   headers: {
//     "Content-Type": "application/json",
//     "Authorization": "Bearer token_utilisateur"
//   },
//   body: JSON.stringify(bookData)
// });
router.put("/:id", auth, multer, modifyBook); // Auth + Image, les deux points ":" signifie qu'il s'agit d'un paramètre

// Supprimer un livre, Accès privé (Middleware Auth + deleteBook)
// Exemple d’appel frontend :
// fetch("http://localhost:3000/api/books/123456", {
//   method: "DELETE",
//   headers: {
//     "Authorization": "Bearer token_utilisateur"
//   }
// });
router.delete("/:id", auth, deleteBook); // Auth, les deux points ":" signifie qu'il s'agit d'un paramètre

// Noter un livre, Accès privé (Middleware Auth + rateBook)
// Exemple d’appel frontend :
// const ratingData = {
//   grade: 5
// };
// fetch("http://localhost:3000/api/books/123456/rating", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     "Authorization": "Bearer token_utilisateur"
//   },
//   body: JSON.stringify(ratingData)
// });
router.post("/:id/rating", auth, rateBook); // Auth, les deux points ":" signifie qu'il s'agit d'un paramètre


export default router;


// Améliorations possibles

//     Vérifier les données avant l’ajout/modification d’un livre (validation avec Joi).
//     Limiter l’accès aux utilisateurs authentifiés avec des rôles (admin, user).
//     Ajouter un contrôle sur multer pour limiter la taille et le format des fichiers.

// Bonnes pratiques : Garder les mêmes noms de champs

// Dans un projet classique Node.js + Express + MongoDB, il est recommandé d'utiliser les mêmes noms de champs partout (frontend, API et base de données) pour éviter toute confusion.

// Exemple : Champ title

// 1️⃣ Frontend (React ou Vue.js)

// const newBook = {
//   title: "Harry Potter",
//   author: "J.K. Rowling"
// };

// fetch("http://localhost:3000/api/books", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json"
//   },
//   body: JSON.stringify(newBook)
// });


// 2️⃣ Backend (Express API)

// app.post("/api/books", async (req, res) => {
//   try {
//     const book = new Book({
//       title: req.body.title,
//       author: req.body.author
//     });
//     await book.save();
//     res.status(201).json({ message: "Livre enregistré !" });
//   } catch (error) {
//     res.status(500).json({ error });
//   }
// });


// 3️⃣ MongoDB (Modèle Mongoose)

// const bookSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   author: { type: String, required: true }
// });
// const Book = mongoose.model("Book", bookSchema);


// ✅ Avantages :

//     Facilité de maintenance (même champ partout).
//     Pas besoin de transformer les données entre frontend, API et BDD.
//     Moins d’erreurs et de confusion.
