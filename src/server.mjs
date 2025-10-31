import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import config from './config.mjs';
import routes from './controllers/routes.mjs';

const Server = class Server {
  constructor() {
    this.app = express();
    this.config = config[process.argv[2]] || config.development;
  }

  async dbConnect() {
    try {
      const host = this.config.mongodb;

      this.connect = await mongoose.createConnection(host, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      console.log('[CONNECTED] MongoDB connected successfully');
    } catch (err) {
      console.error(`[ERROR] api dbConnect() -> ${err}`);
    }
  }


  middleware() {
    this.app.use(compression());
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
  }

  security() {
    this.app.use(helmet());
    this.app.disable('x-powered-by');
  }

  routes() {
    new routes.Users(this.app, this.connect);
    new routes.Events(this.app, this.connect);
    new routes.Groups(this.app, this.connect);
    new routes.Threads(this.app, this.connect);
    new routes.Albums(this.app, this.connect);
    new routes.Photos(this.app, this.connect);
    new routes.Comments(this.app, this.connect);
    new routes.Polls(this.app, this.connect);
    new routes.Tickets(this.app, this.connect);
    this.app.use((req, res) => {
      res.status(404).json({ code: 404, message: 'Not Found' });
    });
  }

  swaggerDocs() {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'My Social Networks API',
        version: '1.0.0',
        description: 'API REST Node.js / Express / MongoDB par Ervin Goby'
      }
    },
    apis: ['./src/controllers/*.mjs']
  };

  const specs = swaggerJsdoc(options);
  this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  console.log('[DOCS] Swagger disponible sur http://localhost:3000/api-docs');
}

  async run() {
    try {
      await this.dbConnect();
      this.security();
      this.middleware();
      this.swaggerDocs();
      this.routes();

      this.app.listen(this.config.port, () => {
        console.log(`[START] Server running on port ${this.config.port}`);
      });
    } catch (err) {
      console.error(`[ERROR] Server -> ${err}`);
    }
  }
};

export default Server;
