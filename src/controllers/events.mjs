import EventModel from '../models/event.mjs';
import UserModel from '../models/user.mjs';

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Gestion des événements
 */
const Events = class Events {
  constructor(app, connect) {
    this.app = app;
    this.EventModel = connect.model('Event', EventModel);
    this.UserModel = connect.model('User', UserModel);
    this.run();
  }

  /**
   * @swagger
   * /event:
   *   post:
   *     summary: Créer un nouvel événement
   *     description: "Permet à un organisateur de créer un événement (public ou privé) avec ses informations principales."
   *     tags: [Events]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - startDate
   *               - endDate
   *               - location
   *             properties:
   *               name:
   *                 type: string
   *                 example: Conférence Tech 2025
   *               description:
   *                 type: string
   *                 example: Une conférence dédiée aux nouvelles technologies web.
   *               startDate:
   *                 type: string
   *                 format: date-time
   *                 example: 2025-11-12T09:00:00Z
   *               endDate:
   *                 type: string
   *                 format: date-time
   *                 example: 2025-11-12T17:00:00Z
   *               location:
   *                 type: string
   *                 example: Paris - La Défense Arena
   *               isPrivate:
   *                 type: boolean
   *                 example: false
   *               organizers:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ["67205f81c1f7baaf41d3d1b3"]
   *     responses:
   *       201:
   *         description: Événement créé avec succès
   *       400:
   *         description: Erreur de validation ou mauvaise requête
   */
  create() {
    this.app.post('/event', async (req, res) => {
      try {
        const event = new this.EventModel(req.body);
        const savedEvent = await event.save();
        res.status(201).json(savedEvent);
      } catch (err) {
        if (err.name === 'ValidationError') {
          const errors = Object.values(err.errors).map(e => e.message);
          return res.status(400).json({ code: 400, message: 'Validation Error', errors });
        }
        console.error(`[ERROR] events/create -> ${err}`);
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  /**
   * @swagger
   * /events:
   *   get:
   *     summary: Récupérer tous les événements
   *     description: "Retourne la liste complète des événements avec leurs organisateurs et participants."
   *     tags: [Events]
   *     responses:
   *       200:
   *         description: Liste des événements récupérée avec succès
   *       500:
   *         description: Erreur interne du serveur
   */
  getAll() {
    this.app.get('/events', async (req, res) => {
      try {
        const events = await this.EventModel.find()
          .populate('organizers', 'firstname lastname email')
          .populate('participants', 'firstname lastname email');
        res.status(200).json(events);
      } catch {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  /**
   * @swagger
   * /event/{id}:
   *   get:
   *     summary: Récupérer un événement par ID
   *     description: "Retourne les détails d’un événement spécifique (organisateurs, participants, etc.)."
   *     tags: [Events]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de l’événement
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Événement trouvé
   *       404:
   *         description: Événement introuvable
   */
  getById() {
    this.app.get('/event/:id', async (req, res) => {
      try {
        const event = await this.EventModel.findById(req.params.id)
          .populate('organizers', 'firstname lastname email')
          .populate('participants', 'firstname lastname email');

        if (!event) return res.status(404).json({ code: 404, message: 'Event Not Found' });
        res.status(200).json(event);
      } catch {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  /**
   * @swagger
   * /event/{id}:
   *   delete:
   *     summary: Supprimer un événement
   *     description: "Supprime un événement existant via son ID."
   *     tags: [Events]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de l’événement à supprimer
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Événement supprimé avec succès
   *       500:
   *         description: Erreur interne du serveur
   */
  deleteById() {
    this.app.delete('/event/:id', async (req, res) => {
      try {
        const deleted = await this.EventModel.findByIdAndDelete(req.params.id);
        res.status(200).json(deleted || {});
      } catch {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  /**
   * @swagger
   * /event/{id}/addParticipant:
   *   patch:
   *     summary: Ajouter un participant à un événement
   *     description: "Ajoute un utilisateur à la liste des participants d’un événement existant."
   *     tags: [Events]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de l’événement
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *             properties:
   *               userId:
   *                 type: string
   *                 example: 67205f9bc1f7baaf41d3d1b8
   *     responses:
   *       200:
   *         description: Participant ajouté avec succès
   *       404:
   *         description: Événement ou utilisateur introuvable
   *       400:
   *         description: Mauvaise requête
   */
  addParticipant() {
    this.app.patch('/event/:id/addParticipant', async (req, res) => {
      try {
        const { userId } = req.body;
        const event = await this.EventModel.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const userExists = await this.UserModel.findById(userId);
        if (!userExists) return res.status(404).json({ message: 'User not found' });

        if (!event.participants.includes(userId)) {
          event.participants.push(userId);
          await event.save();
        }

        res.status(200).json(event);
      } catch (err) {
        console.error(`[ERROR] addParticipant -> ${err}`);
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  /**
   * @swagger
   * /event/{id}/removeParticipant:
   *   patch:
   *     summary: Retirer un participant d’un événement
   *     description: "Supprime un utilisateur de la liste des participants d’un événement."
   *     tags: [Events]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de l’événement
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *             properties:
   *               userId:
   *                 type: string
   *                 example: 67205f9bc1f7baaf41d3d1b8
   *     responses:
   *       200:
   *         description: Participant retiré avec succès
   *       404:
   *         description: Événement ou utilisateur introuvable
   *       400:
   *         description: Mauvaise requête
   */
  removeParticipant() {
    this.app.patch('/event/:id/removeParticipant', async (req, res) => {
      try {
        const { userId } = req.body;
        const event = await this.EventModel.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const userExists = await this.UserModel.findById(userId);
        if (!userExists) return res.status(404).json({ message: 'User not found' });

        event.participants = event.participants.filter(id => id.toString() !== userId);
        await event.save();
        res.status(200).json(event);
      } catch (err) {
        console.error(`[ERROR] removeParticipant -> ${err}`);
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  run() {
    this.create();
    this.getAll();
    this.getById();
    this.deleteById();
    this.addParticipant();
    this.removeParticipant();
  }
};

export default Events;
