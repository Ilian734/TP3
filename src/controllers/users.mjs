import UserModel from '../models/user.mjs';

const Users = class Users {
  constructor(app, connect) {
    this.app = app;
    this.UserModel = connect.model('User', UserModel);
    this.run();
  }

  /**
   * @swagger
   * /user:
   *   post:
   *     summary: Créer un nouvel utilisateur
   *     description: Ajoute un utilisateur à la base de données.
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - firstname
   *               - lastname
   *               - email
   *             properties:
   *               firstname:
   *                 type: string
   *                 example: Ervin
   *               lastname:
   *                 type: string
   *                 example: Goby
   *               email:
   *                 type: string
   *                 example: ervin@example.com
   *               age:
   *                 type: integer
   *                 example: 20
   *               city:
   *                 type: string
   *                 example: Paris
   *     responses:
   *       201:
   *         description: Utilisateur créé avec succès
   *       400:
   *         description: Erreur de validation
   */
  create() {
    this.app.post('/user', async (req, res) => {
      try {
        const user = new this.UserModel(req.body);
        const savedUser = await user.save();
        res.status(201).json(savedUser);
      } catch (err) {
        console.error(`[ERROR] users/create -> ${err}`);

        if (err.name === 'ValidationError') {
          const errors = Object.values(err.errors).map(e => e.message);
          return res.status(400).json({ code: 400, message: 'Validation Error', errors });
        }

        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  /**
   * @swagger
   * /users:
   *   get:
   *     summary: Récupérer tous les utilisateurs
   *     description: Retourne la liste complète des utilisateurs.
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: Liste des utilisateurs
   */
  getAll() {
    this.app.get('/users', async (req, res) => {
      try {
        const users = await this.UserModel.find();
        res.status(200).json(users);
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  /**
   * @swagger
   * /user/{id}:
   *   get:
   *     summary: Récupérer un utilisateur par ID
   *     description: Retourne un utilisateur spécifique grâce à son ID MongoDB.
   *     tags: [Users]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de l'utilisateur
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Utilisateur trouvé
   *       404:
   *         description: Utilisateur introuvable
   */
  getById() {
    this.app.get('/user/:id', async (req, res) => {
      try {
        const user = await this.UserModel.findById(req.params.id);
        res.status(200).json(user || {});
      } catch (err) {
        res.status(404).json({ code: 404, message: 'User Not Found' });
      }
    });
  }

  /**
   * @swagger
   * /user/{id}:
   *   delete:
   *     summary: Supprimer un utilisateur par ID
   *     description: Supprime un utilisateur de la base de données.
   *     tags: [Users]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de l'utilisateur
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Utilisateur supprimé avec succès
   *       500:
   *         description: Erreur interne du serveur
   */
  deleteById() {
    this.app.delete('/user/:id', async (req, res) => {
      try {
        const deleted = await this.UserModel.findByIdAndDelete(req.params.id);
        res.status(200).json(deleted || {});
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  run() {
    this.create();
    this.getAll();
    this.getById();
    this.deleteById();
  }
};

export default Users;
