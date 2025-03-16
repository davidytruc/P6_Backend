import express from 'express'; // Framework pour gérer le serveur HTTP
import mongoose from 'mongoose'; // Permet d’interagir avec MongoDB
import bookRoutes from './routes/book.js'; // Import fichiers Routes des livres
import userRoutes from './routes/user.js'; // Import fichiers Routes des utilisateurs

// Gère les chemins des fichiers de manière compatible avec ES Modules
import path from 'path';
import { fileURLToPath } from 'url';

const app = express(); //Crée une instance d'Express pour gérer les requêtes HTTP

// Middleware pour gérer les requêtes JSON
// Active le parsing du JSON dans le body des requêtes
// Permet d'accéder aux données envoyées dans req.body
app.use(express.json());

// Calcul de __dirname pour les fichiers statiques
const __filename = fileURLToPath(import.meta.url);
// Dans ES Modules, __dirname n'existe pas par défaut.
// Cette ligne le recrée, ce qui est nécessaire pour définir les chemins vers les fichiers statiques (ex: images).
const __dirname = path.dirname(__filename);

// Connexion à MongoDB
// useNewUrlParser: true et useUnifiedTopology: true : Options pour éviter des avertissements de compatibilité
mongoose.connect('mongodb+srv://davidytruc:aYhTE9JXn1isE2BG@cluster0.rbksg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Configuration des permissions CORS (Cross-Origin Resource Sharing) permet aux requêtes venant d'un autre domaine d’accéder à l'API.
// Si le frontend est sur http://localhost:3001 et le backend sur http://localhost:3000, sans CORS, le navigateur bloque les requêtes.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Permet au frontend d’accéder aux images stockées sur le serveur
// Path utilisé : http://localhost:3000/images/nom-du-fichier.jpg
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes de l'API
// Toutes les routes des livres commenceront par /api/books
app.use('/api/books', bookRoutes);
// Toutes les routes d’authentification commenceront par /api/auth
app.use('/api/auth', userRoutes);

export default app;