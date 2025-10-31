import PollModel from '../models/poll.mjs';
import QuestionModel from '../models/question.mjs';
import AnswerModel from '../models/answer.mjs';
import VoteModel from '../models/vote.mjs';

/**
 * @swagger
 * tags:
 *   name: Polls
 *   description: Gestion des sondages pour les événements
 */
const Polls = class Polls {
  constructor(app, connect) {
    this.app = app;
    this.PollModel = connect.model('Poll', PollModel);
    this.QuestionModel = connect.model('Question', QuestionModel);
    this.AnswerModel = connect.model('Answer', AnswerModel);
    this.VoteModel = connect.model('Vote', VoteModel);
    this.run();
  }

  /**
   * @swagger
   * /event/{id}/poll:
   *   post:
   *     summary: Créer un sondage pour un événement
   *     description: "Permet à un organisateur de créer un sondage lié à un événement donné."
   *     tags: [Polls]
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
   *               - title
   *               - createdBy
   *             properties:
   *               title:
   *                 type: string
   *                 example: Sondage sur la restauration de l'événement
   *               createdBy:
   *                 type: string
   *                 example: 67204deeb6121b8d0b9a58d1
   *     responses:
   *       201:
   *         description: Sondage créé avec succès
   *       400:
   *         description: Erreur de validation
   */
  createPoll() {
    this.app.post('/event/:id/poll', async (req, res) => {
      try {
        const { title, createdBy } = req.body;
        const poll = new this.PollModel({ event: req.params.id, title, createdBy });
        const saved = await poll.save();
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
   * /poll/{id}/question:
   *   post:
   *     summary: Ajouter une question à un sondage
   *     description: "Ajoute une question à un sondage existant."
   *     tags: [Polls]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID du sondage
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - text
   *             properties:
   *               text:
   *                 type: string
   *                 example: Quel type de repas préférez-vous ?
   *     responses:
   *       201:
   *         description: Question ajoutée avec succès
   *       400:
   *         description: Erreur de validation
   */
  addQuestion() {
    this.app.post('/poll/:id/question', async (req, res) => {
      try {
        const question = new this.QuestionModel({ poll: req.params.id, text: req.body.text });
        const saved = await question.save();
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
   * /question/{id}/answer:
   *   post:
   *     summary: Ajouter une réponse possible à une question
   *     description: "Ajoute une réponse à une question de sondage."
   *     tags: [Polls]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de la question
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - text
   *             properties:
   *               text:
   *                 type: string
   *                 example: Repas végétarien
   *     responses:
   *       201:
   *         description: Réponse ajoutée avec succès
   *       400:
   *         description: Erreur de validation
   */
  addAnswer() {
    this.app.post('/question/:id/answer', async (req, res) => {
      try {
        const answer = new this.AnswerModel({ question: req.params.id, text: req.body.text });
        const saved = await answer.save();
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
   * /question/{id}/vote:
   *   post:
   *     summary: Voter pour une réponse
   *     description: "Permet à un utilisateur de voter pour une réponse donnée à une question."
   *     tags: [Polls]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de la question
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - user
   *               - selectedAnswer
   *             properties:
   *               user:
   *                 type: string
   *                 example: 67204deeb6121b8d0b9a58d1
   *               selectedAnswer:
   *                 type: string
   *                 example: 67204f0ab6121b8d0b9a58d4
   *     responses:
   *       201:
   *         description: Vote enregistré avec succès
   *       400:
   *         description: L'utilisateur a déjà voté ou erreur de validation
   */
  addVote() {
    this.app.post('/question/:id/vote', async (req, res) => {
      try {
        const { user, selectedAnswer } = req.body;

        const existing = await this.VoteModel.findOne({ question: req.params.id, user });
        if (existing) {
          return res.status(400).json({ message: 'User has already voted on this question' });
        }

        const vote = new this.VoteModel({ question: req.params.id, user, selectedAnswer });
        const saved = await vote.save();
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
   * /poll/{id}/results:
   *   get:
   *     summary: Voir les résultats d’un sondage
   *     description: "Retourne la liste des questions, réponses et nombre de votes associés à chaque réponse."
   *     tags: [Polls]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID du sondage
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Résultats du sondage retournés avec succès
   *       500:
   *         description: Erreur interne du serveur
   */
  getResults() {
    this.app.get('/poll/:id/results', async (req, res) => {
      try {
        const questions = await this.QuestionModel.find({ poll: req.params.id });
        const results = [];

        for (const q of questions) {
          const answers = await this.AnswerModel.find({ question: q.id });
          const stats = [];

          for (const a of answers) {
            const count = await this.VoteModel.countDocuments({ selectedAnswer: a.id });
            stats.push({ answer: a.text, votes: count });
          }

          results.push({ question: q.text, results: stats });
        }

        res.status(200).json(results);
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  run() {
    this.createPoll();
    this.addQuestion();
    this.addAnswer();
    this.addVote();
    this.getResults();
  }
};

export default Polls;
