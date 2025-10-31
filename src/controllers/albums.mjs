import AlbumModel from '../models/album.mjs';
import PhotoModel from '../models/photo.mjs';

/**
 * @swagger
 * tags:
 *   name: Albums
 *   description: Gestion des albums photos liés aux événements
 */
const Albums = class Albums {
  constructor(app, connect) {
    this.app = app;
    this.AlbumModel = connect.model('Album', AlbumModel);
    this.PhotoModel = connect.model('Photo', PhotoModel);
    this.run();
  }

  /**
   * @swagger
   * /album:
   *   post:
   *     summary: Créer un album photo
   *     description: "Permet de créer un album photo lié à un événement et à un utilisateur (créateur)."
   *     tags: [Albums]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - event
   *               - title
   *               - createdBy
   *             properties:
   *               event:
   *                 type: string
   *                 description: ID de l’événement associé
   *                 example: 67205f81c1f7baaf41d3d1b3
   *               title:
   *                 type: string
   *                 example: "Souvenirs de la Conférence Tech 2025"
   *               description:
   *                 type: string
   *                 example: "Album regroupant les meilleures photos de l’événement."
   *               createdBy:
   *                 type: string
   *                 description: ID de l’utilisateur ayant créé l’album
   *                 example: 67205f9bc1f7baaf41d3d1b8
   *     responses:
   *       201:
   *         description: Album créé avec succès
   *       400:
   *         description: Erreur de validation ou mauvaise requête
   *       500:
   *         description: Erreur interne du serveur
   */
  createAlbum() {
    this.app.post('/album', async (req, res) => {
      try {
        const album = new this.AlbumModel(req.body);
        const saved = await album.save();
        res.status(201).json(saved);
      } catch (err) {
        if (err.name === 'ValidationError') {
          const errors = Object.values(err.errors).map(e => e.message);
          return res
            .status(400)
            .json({ code: 400, message: 'Validation Error', errors });
        }
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  /**
   * @swagger
   * /album:
   *   get:
   *     summary: Récupérer tous les albums
   *     description: "Retourne la liste de tous les albums créés, avec leurs événements et auteurs."
   *     tags: [Albums]
   *     responses:
   *       200:
   *         description: Liste des albums récupérée avec succès
   *       500:
   *         description: Erreur interne du serveur
   */
  getAllAlbums() {
    this.app.get('/album', async (req, res) => {
      try {
        const albums = await this.AlbumModel.find()
          .populate('event', 'name')
          .populate('createdBy', 'firstname lastname');
        res.status(200).json(albums);
      } catch {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  /**
   * @swagger
   * /album/{id}/photos:
   *   get:
   *     summary: Voir les photos d’un album
   *     description: "Affiche toutes les photos appartenant à un album spécifique."
   *     tags: [Albums]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de l’album
   *         schema:
   *           type: string
   *           example: 67205f81c1f7baaf41d3d1b3
   *     responses:
   *       200:
   *         description: Liste des photos récupérée avec succès
   *       404:
   *         description: Album introuvable
   *       500:
   *         description: Erreur interne du serveur
   */
  getPhotosByAlbum() {
    this.app.get('/album/:id/photos', async (req, res) => {
      try {
        const photos = await this.PhotoModel.find({ album: req.params.id })
          .populate('uploadedBy', 'firstname lastname');
        res.status(200).json(photos);
      } catch {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  run() {
    this.createAlbum();
    this.getAllAlbums();
    this.getPhotosByAlbum();
  }
};

export default Albums;
