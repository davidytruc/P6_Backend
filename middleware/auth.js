// Ce middleware protège les routes en vérifiant le jeton JWT (JSON Web Token) envoyé dans les headers de la requête
// jsonwebtoken est une bibliothèque qui permet de signer et vérifier des tokens JWT
// Elle est utilisée ici pour décoder et valider le token reçu dans la requête
// Ici, il protège les routes en s'assurant que l'utilisateur est bien authentifié

import jwt from 'jsonwebtoken';

export default (req, res, next) => {
    try {
        // req.headers.authorization contient la chaîne Bearer <TOKEN>.
        // .split(' ')[1] extrait uniquement <TOKEN>.
        // ?. évite une erreur si authorization est undefined.
        const token = req.headers.authorization?.split(' ')[1]; // Vérifie si authorization existe
        if (!token) {
            throw new Error('Token manquant !');
        }
        
        // jwt.verify() décodera et validera le token avec la clé secrète
        // Bonne pratique : process.env.JWT_SECRET permet d'utiliser une variable d’environnement au lieu d'une clé codée en dur
        // Si le token est invalide ou expiré, une erreur sera levée
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'RANDOM_TOKEN_SECRET');
        req.auth = { userId: decodedToken.userId };

        // Si le token est valide, la requête continue vers la prochaine étape.
        // Exemple : si l’utilisateur veut modifier un livre, sa requête est autorisée.
        next();

    } catch (error) {
        res.status(401).json({ error: 'Requête non authentifiée !' });
    }
};
