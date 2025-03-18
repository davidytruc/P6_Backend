import express from "express"; // Framework pour créer les routes
import auth from "../middleware/auth.js"; // Middleware qui vérifie si l’utilisateur est authentifié
import upload from "../middleware/multer-config.js"; // Middleware qui gère l’upload des fichiers
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

router.get("/", getAllBooks); // Récupérer tous les livres, Accès public

// Récupérer les livres les mieux notés, Accès public
router.get("/bestrating", getBestRatedBooks);

// Récupérer un seul livre, Accès public, les deux points ":" signifient qu'il s'agit d'un paramètre
router.get("/:id", getOneBook);

// Ajouter un nouveau livre, Accès privé (Middleware Auth) + upload Image (Middlewares multer & createBook)
router.post("/", auth, upload, createBook);

// Modifier un livre, Accès privé (Middleware Auth) + upload Image (Middlewares multer & modifyBook)
router.put("/:id", auth, upload, modifyBook); // Auth + Image, les deux points ":" signifie qu'il s'agit d'un paramètre

// Supprimer un livre, Accès privé (Middleware Auth + deleteBook)
router.delete("/:id", auth, deleteBook); // Auth, les deux points ":" signifie qu'il s'agit d'un paramètre

// Noter un livre, Accès privé (Middleware Auth + rateBook)
router.post("/:id/rating", auth, rateBook); // Auth, les deux points ":" signifie qu'il s'agit d'un paramètre


export default router;