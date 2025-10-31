import TicketTypeModel from "../models/ticketType.mjs";
import TicketModel from "../models/ticket.mjs";

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Gestion de la billetterie des événements types de billets et achats
 */
const Tickets = class Tickets {
  constructor(app, connect) {
    this.app = app;
    this.TicketTypeModel = connect.model("TicketType", TicketTypeModel);
    this.TicketModel = connect.model("Ticket", TicketModel);
    this.run();
  }

  /**
   * @swagger
   * /event/{id}/ticketType:
   *   post:
   *     summary: Créer un type de billet pour un événement
   *     description: Permet à un organisateur de créer un nouveau type de billet
   *     tags: [Tickets]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de l'événement
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - price
   *               - quantity
   *               - createdBy
   *             properties:
   *               name:
   *                 type: string
   *                 example: Pass Journée
   *               price:
   *                 type: number
   *                 example: 25
   *               quantity:
   *                 type: number
   *                 example: 100
   *               createdBy:
   *                 type: string
   *                 description: ID de l'organisateur créateur
   *                 example: 671f6e3d99b6e7d2b18f1a9c
   *     responses:
   *       201:
   *         description: Type de billet créé avec succès
   *       400:
   *         description: Erreur de validation ou requête invalide
   */
  createTicketType() {
    this.app.post("/event/:id/ticketType", async (req, res) => {
      try {
        const { name, price, quantity, createdBy } = req.body;
        const ticketType = new this.TicketTypeModel({
          event: req.params.id,
          name,
          price,
          quantity,
          createdBy
        });

        const saved = await ticketType.save();
        res.status(201).json(saved);
      } catch (err) {
        if (err.name === "ValidationError") {
          const errors = Object.values(err.errors).map(e => e.message);
          return res.status(400).json({ code: 400, message: "Validation Error", errors });
        }
        res.status(400).json({ code: 400, message: "Bad Request" });
      }
    });
  }

  /**
   * @swagger
   * /ticketType/{id}/buy:
   *   post:
   *     summary: Acheter un billet
   *     description: Permet à une personne d'acheter un billet en renseignant ses coordonnées.
   *     tags: [Tickets]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID du type de billet
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - firstName
   *               - lastName
   *               - address
   *             properties:
   *               firstName:
   *                 type: string
   *                 example: Ervin
   *               lastName:
   *                 type: string
   *                 example: Goby
   *               address:
   *                 type: string
   *                 example: 12 rue des Fleurs, Paris
   *     responses:
   *       201:
   *         description: Billet acheté avec succès
   *       400:
   *         description: Aucun billet disponible ou erreur de validation
   *       500:
   *         description: Erreur interne du serveur
   */
  buyTicket() {
    this.app.post("/ticketType/:id/buy", async (req, res) => {
      try {
        const { firstName, lastName, address } = req.body;
        const type = await this.TicketTypeModel.findById(req.params.id);

        if (!type || type.quantity <= 0) {
          return res.status(400).json({ message: "Plus de billets disponibles" });
        }

        const ticket = new this.TicketModel({
          ticketType: req.params.id,
          firstName,
          lastName,
          address
        });

        await ticket.save();
        type.quantity -= 1;
        await type.save();

        res.status(201).json(ticket);
      } catch (err) {
        if (err.name === "ValidationError") {
          const errors = Object.values(err.errors).map(e => e.message);
          return res.status(400).json({ code: 400, message: "Validation Error", errors });
        }
        res.status(500).json({ code: 500, message: "Internal Server Error" });
      }
    });
  }

  /**
   * @swagger
   * /event/{id}/ticketTypes:
   *   get:
   *     summary: Voir tous les types de billets d’un événement
   *     description: Retourne la liste des types de billets disponibles pour un événement.
   *     tags: [Tickets]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de l'événement
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Liste des types de billets
   *       500:
   *         description: Erreur interne du serveur
   */
  getTicketTypes() {
    this.app.get("/event/:id/ticketTypes", async (req, res) => {
      try {
        const tickets = await this.TicketTypeModel.find({ event: req.params.id })
          .populate("createdBy", "firstname lastname");
        res.status(200).json(tickets);
      } catch (err) {
        res.status(500).json({ code: 500, message: "Internal Server Error" });
      }
    });
  }

  /**
   * @swagger
   * /ticketType/{id}/tickets:
   *   get:
   *     summary: Voir tous les billets achetés pour un type
   *     description: Retourne la liste complète des billets achetés pour un type de billet donné.
   *     tags: [Tickets]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID du type de billet
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Liste des billets achetés
   *       500:
   *         description: Erreur interne du serveur
   */
  getTicketsByType() {
    this.app.get("/ticketType/:id/tickets", async (req, res) => {
      try {
        const list = await this.TicketModel.find({ ticketType: req.params.id });
        res.status(200).json(list);
      } catch (err) {
        res.status(500).json({ code: 500, message: "Internal Server Error" });
      }
    });
  }

  run() {
    this.createTicketType();
    this.buyTicket();
    this.getTicketTypes();
    this.getTicketsByType();
  }
};

export default Tickets;
