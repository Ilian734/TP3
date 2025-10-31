import ThreadModel from '../models/thread.mjs';
import MessageModel from '../models/message.mjs';

/**
 * @swagger
 * tags:
 *   name: Threads
 *   description: Gestion des fils de discussion (Groupes / Événements)
 */
const Threads = class Threads {
  constructor(app, connect) {
    this.app = app;
    this.ThreadModel = connect.model('Thread', ThreadModel);
    this.MessageModel = connect.model('Message', MessageModel);
    this.run();
  }

  /**
   * @swagger
   * /thread:
   *   post:
   *     summary: Créer un nouveau fil de discussion
   *     description: Permet de créer un fil de discussion lié soit à un groupe, soit à un événement.
   *     tags: [Threads]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - createdBy
   *             properties:
   *               title:
   *                 type: string
   *                 example: Discussion générale du groupe EFREI
   *               group:
   *                 type: string
   *                 example: 671f6e3d99b6e7d2b18f1a9c
   *               event:
   *                 type: string
   *                 example: null
   *               createdBy:
   *                 type: string
   *                 description: ID de l'utilisateur créateur
   *                 example: 67203546d8f19bb8b11dc9e4
   *     responses:
   *       201:
   *         description: Thread créé avec succès
   *       400:
   *         description: Erreur de validation ou de requête
   */
  createThread() {
    this.app.post('/thread', async (req, res) => {
      try {
        const thread = new this.ThreadModel(req.body);
        const saved = await thread.save();
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
   * /thread:
   *   get:
   *     summary: Récupérer tous les fils de discussion
   *     description: Retourne la liste complète des fils de discussion (groupes ou événements).
   *     tags: [Threads]
   *     responses:
   *       200:
   *         description: Liste des threads récupérée avec succès
   *       500:
   *         description: Erreur interne du serveur
   */
  getAllThreads() {
    this.app.get('/thread', async (req, res) => {
      try {
        const threads = await this.ThreadModel.find()
          .populate('group', 'name')
          .populate('event', 'name')
          .populate('createdBy', 'firstname lastname');
        res.status(200).json(threads);
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  /**
   * @swagger
   * /thread/{id}/messages:
   *   get:
   *     summary: Récupérer tous les messages d’un fil de discussion
   *     description: Retourne tous les messages d’un thread, avec auteur et message parent si applicable.
   *     tags: [Threads]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID du thread
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Liste des messages
   *       500:
   *         description: Erreur interne du serveur
   */
  getMessagesByThread() {
    this.app.get('/thread/:id/messages', async (req, res) => {
      try {
        const messages = await this.MessageModel.find({ thread: req.params.id })
          .populate('author', 'firstname lastname')
          .populate('replyTo', 'content');
        res.status(200).json(messages);
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  /**
   * @swagger
   * /thread/{id}/message:
   *   post:
   *     summary: Envoyer un message dans un fil de discussion
   *     description: Permet à un utilisateur d’envoyer un message dans un thread, avec réponse facultative à un autre message.
   *     tags: [Threads]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID du thread
   *         schema:
   *           type: string
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
   *                 example: 671f6e3d99b6e7d2b18f1a9c
   *               content:
   *                 type: string
   *                 example: Bonjour à tous, voici les informations de l’événement !
   *               replyTo:
   *                 type: string
   *                 example: null
   *     responses:
   *       201:
   *         description: Message envoyé avec succès
   *       400:
   *         description: Erreur de validation
   */
  addMessage() {
    this.app.post('/thread/:id/message', async (req, res) => {
      try {
        const { author, content, replyTo } = req.body;
        const message = new this.MessageModel({
          thread: req.params.id,
          author,
          content,
          replyTo: replyTo || null
        });

        const savedMessage = await message.save();
        res.status(201).json(savedMessage);
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
   * /message/{id}:
   *   delete:
   *     summary: Supprimer un message
   *     description: Supprime un message spécifique par son ID.
   *     tags: [Threads]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID du message à supprimer
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Message supprimé avec succès
   *       500:
   *         description: Erreur interne du serveur
   */
  deleteMessage() {
    this.app.delete('/message/:id', async (req, res) => {
      try {
        const deleted = await this.MessageModel.findByIdAndDelete(req.params.id);
        res.status(200).json(deleted || {});
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  run() {
    this.createThread();
    this.getAllThreads();
    this.getMessagesByThread();
    this.addMessage();
    this.deleteMessage();
  }
};

export default Threads;
