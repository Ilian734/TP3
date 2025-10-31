import PhotoModel from '../models/photo.mjs';
import CommentModel from '../models/comment.mjs';

/**
 * @swagger
 * tags:
 *   name: Photos
 *   description: Gestion des photos d’un album
 */
const Photos = class Photos {
  constructor(app, connect) {
    this.app = app;
    this.PhotoModel = connect.model('Photo', PhotoModel);
    this.CommentModel = connect.model('Comment', CommentModel);
    this.run();
  }

  /**
   * @swagger
   * /album/{id}/photo:
   *   post:
   *     summary: Ajouter une photo dans un album
   *     description: "Permet à un utilisateur d’ajouter une photo à un album existant."
   *     tags: [Photos]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de l’album dans lequel ajouter la photo
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - uploadedBy
   *               - url
   *             properties:
   *               uploadedBy:
   *                 type: string
   *                 description: ID de l’utilisateur qui ajoute la photo
   *                 example: 67205ee0c1f7baaf41d3d1a9
   *               url:
   *                 type: string
   *                 description: Lien HTTPS vers l’image
   *                 example: https://cdn.example.com/photos/image123.jpg
   *               caption:
   *                 type: string
   *                 description: Légende facultative de la photo
   *                 example: Super journée à Paris !
   *     responses:
   *       201:
   *         description: Photo ajoutée avec succès
   *       400:
   *         description: Erreur de validation ou mauvaise requête
   */
  addPhoto() {
    this.app.post('/album/:id/photo', async (req, res) => {
      try {
        const { uploadedBy, url, caption } = req.body;
        const photo = new this.PhotoModel({ album: req.params.id, uploadedBy, url, caption });
        const saved = await photo.save();
        res.status(201).json(saved);
      } catch (err) {
        if (err.name === 'ValidationError') {
          const errors = Object.values(err.errors).map(e => e.message);
          return res.status(400).json({ code: 400, message: 'Validation Error', errors });
        }
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  /**
   * @swagger
   * /photo/{id}/comments:
   *   get:
   *     summary: Voir les commentaires d’une photo
   *     description: "Récupère la liste de tous les commentaires associés à une photo spécifique."
   *     tags: [Photos]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de la photo
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Liste des commentaires de la photo
   *       500:
   *         description: Erreur interne du serveur
   */
  getComments() {
    this.app.get('/photo/:id/comments', async (req, res) => {
      try {
        const comments = await this.CommentModel.find({ photo: req.params.id })
          .populate('author', 'firstname lastname');
        res.status(200).json(comments);
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  run() {
    this.addPhoto();
    this.getComments();
  }
};

export default Photos;
