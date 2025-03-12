import { createServer } from 'http'; //Module HTTP de Node.js, permet de créer un serveur HTTP
import app from './app.js'; // Importe l'application Express définie dans app.js

const port = process.env.PORT || 3000; //Récupération du port défini par l'environnement, 3000 par défaut

// On s'assure que le port est bien un nombre entier positif
const normalizePort = val => {
    const port = parseInt(val, 10);
  
    if (isNaN(port)) {
      return val; // Retourne un port sous forme de chaîne de caractères si ce n'est pas un nombre
    }
    if (port >= 0) {
      return port; // Retourne le port si il est supérieur ou égal à 0
    }
    return false;
};

app.set('port', normalizePort(port)); // Stocke la valeur du port dans Express pour la récupérer plus tard avec app.get('port')

// Gestion des erreurs possibles lors du lancement du serveur
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  
  const port = app.get('port');
  const bind = typeof port === 'string' ? 'pipe ' + port : 'port ' + port;

  switch (error.code) {
    case 'EACCES': //Accès refusé
      console.error(`${bind} requires elevated privileges.`);
      process.exit(1);
      break;
    case 'EADDRINUSE': //Port déjà utilisé
      console.error(`${bind} is already in use.`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// Création du serveur HTTP avec Express comme gestionnaire de requêtes
const server = createServer(app);

// Lorsque le serveur rencontre une erreur, il appelle errorHandler pour la traiter
server.on('error', errorHandler);

// Une fois le serveur lancé, on affiche l'adresse et le port d'écoute
server.on('listening', () => {
  const address = server.address();  // Adresse et port du serveur
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + address.port;
  console.log(`Listening on ${bind}`); // Affiche le port d'écoute
});

// Démarre le serveur
server.listen(app.get('port')); // Utilise app.get pour récupérer le port


// Pourquoi utiliser http.createServer() alors qu'Express peut démarrer tout seul ?

// Avec http.createServer(app), tu as plus de flexibilité, comme :

// Support des WebSockets (ex: socket.io).
// Gérer plusieurs types de connexions (HTTP et HTTPS en même temps).
// Ajout de middlewares natifs de http.

// Dans un projet simple, tu pourrais directement faire :

// app.listen(3000, () => console.log('Serveur démarré sur le port 3000'));

// Mais avec createServer(), tu es prêt pour des applications plus complexes ! 🚀


// Ce code server.js est réutilisable à 95%, avec quelques ajustements

// Ce server.js peut être utilisé pour chaque projet avec :

//     Un fichier .env pour éviter de toucher au code.
//     Un port configurable.
//     Une option pour HTTPS.
//     Un meilleur système de logs.

// Tu peux donc le copier-coller dans un nouveau projet et ne modifier que les détails dans .env et app.js ! 🚀
