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
        next();

    } catch (error) {
        res.status(401).json({ error: 'Requête non authentifiée !' });
    }
};
