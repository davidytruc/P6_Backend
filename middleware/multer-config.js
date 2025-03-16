import multer from 'multer';

// Cet objet associe chaque type MIME à une extension de fichier.
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Dossier de stockage et nom du fichier enregistré
const storage = multer.diskStorage({
  // callback(null, 'images') indique qu'il n'y a pas d'erreur (null) et définit "images" comme dossier de stockage.
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  // Cette fonction définit le nom du fichier avant son enregistrement
  filename: (req, file, callback) => {
    // file.originalname → Nom d’origine du fichier
    // .replace(/\s+/g, '_') → Remplace les espaces par des underscores (_)
    // .split('.')[0] → Supprime l’extension originale
    const name = file.originalname.replace(/\s+/g, '_').split('.')[0];
    // On récupère l'extension correspondante au MIME type du fichier
    const extension = MIME_TYPES[file.mimetype];

    // Si le fichier n’a pas une extension autorisée (jpg, jpeg, png), on bloque l’upload
    if (!extension) {
      return callback(new Error('Format de fichier non pris en charge'), false);
    }

    // On génère un nom unique en ajoutant la date actuelle (Date.now()).
    callback(null, `${name}_${Date.now()}.${extension}`);
  }
});

// .single('image') signifie que Multer attend un seul fichier dans le champ "image" de la requête
const upload = multer({ storage: storage }).single('image');


export default upload;
