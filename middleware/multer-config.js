// Ce middleware utilise Multer pour gérer l'upload des images en les enregistrant sur le serveur
// multer est un middleware Node.js utilisé pour gérer les fichiers envoyés dans les requêtes HTTP (multipart/form-data)
// Il permet de stocker et nommer correctement les fichiers

import multer from 'multer';

// Cet objet associe chaque type MIME à une extension de fichier.
// Exemples :
//     image/jpeg → .jpg
//     image/png → .png
// Il sera utilisé pour donner la bonne extension aux fichiers téléchargés.
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Cette configuration permet de personnaliser :
//     Le dossier de stockage
//     Le nom du fichier enregistré
const storage = multer.diskStorage({
  // Tous les fichiers seront enregistrés dans le dossier "images".
  // callback(null, 'images') indique qu'il n'y a pas d'erreur (null) et définit "images" comme dossier de stockage.
  destination: (req, file, callback) => {
    callback(null, 'images'); // Dossier où enregistrer les images
  },
  // Cette fonction définit le nom du fichier avant son enregistrement
  filename: (req, file, callback) => {
    // file.originalname → Nom d’origine du fichier
    // .replace(/\s+/g, '_') → Remplace les espaces par des underscores (_).
    // .split('.')[0] → Supprime l’extension originale (on la remettra après).
    const name = file.originalname.replace(/\s+/g, '_').split('.')[0];
    // On récupère l'extension correspondante au MIME type du fichier
    const extension = MIME_TYPES[file.mimetype];

    // Si le fichier n’a pas une extension autorisée (jpg, jpeg, png), on bloque l’upload
    if (!extension) {
      return callback(new Error('Format de fichier non pris en charge'), false);
    }

    // On génère un nom unique en ajoutant la date actuelle (Date.now()).
    // Exemples :
    //     "photo_profil_1709578923456.jpg"
    //     "image_annonce_1709580456789.png"
    callback(null, `${name}_${Date.now()}.${extension}`);
  }
});

// .single('image') signifie que Multer attend un seul fichier dans le champ "image" de la requête
const upload = multer({ storage: storage }).single('image');


export default upload;
