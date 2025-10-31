import CommentModel from '../models/comment.mjs';

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Gestion des commentaires sur les photos
 */
const Comments = class Comments {
  constructor(app, connect) {
    this.app = app;
    this.CommentModel = connect.model('Comment', CommentModel);
    this.run();
  }

  /**
   * @swagger
   * /photo/{id}/comment:
   *   post:
   *     summary: Ajouter un commentaire à une photo
   *     description: "Permet à un utilisateur d’ajouter un commentaire sur une photo spécifique."
   *     tags: [Comments]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de la photo à commenter
   *         schema:
   *           type: string
   *           example: 67205f81c1f7baaf41d3d1b3
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - author
   *               - content
   *             properties:
   *               author:
   *                 type: string
   *                 description: ID de l’utilisateur qui commente
   *                 example: 67205f9bc1f7baaf41d3d1b8
   *               content:
   *                 type: string
   *                 description: Contenu du commentaire (1 à 500 caractères)
   *                 example: "Superbe photo ! La lumière est magnifique."
   *     responses:
   *       201:
   *         description: Commentaire ajouté avec succès
   *       400:
   *         description: Erreur de validation ou mauvaise requête
   *       500:
   *         description: Erreur interne du serveur
   */
  addComment() {
    this.app.post('/photo/:id/comment', async (req, res) => {
      try {
        const { author, content } = req.body;

        const comment = new this.CommentModel({
          photo: req.params.id,
          author,
          content
        });

        const saved = await comment.save();
        res.status(201).json(saved);
      } catch (err) {
        if (err.name === 'ValidationError') {
          const errors = Object.values(err.errors).map(e => e.message);
          return res.status(400).json({
            code: 400,
            message: 'Validation Error',
            errors
          });
        }

        console.error(`[ERROR] addComment -> ${err}`);
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  run() {
    this.addComment();
  }
};

export default Comments;
