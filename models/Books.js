// Ce fichier définit la structure d'un livre dans la base de données MongoDB grâce à Mongoose

import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    ratings: [
        {
            userId: { type: String, required: true },
            grade: { type: Number, required: true, min: 0, max: 5 }
        }
    ],
    averageRating: { type: Number, default: 0 }, // Initialisation à 0
});

export default mongoose.model("Book", bookSchema);
