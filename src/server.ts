import { config } from './config/config';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import Logging from './library/Logging';
import authorRoutes from './routes/Author';
import bookRoutes from './routes/Book';
const router = express();

/** Connect to Database **/
mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        Logging.info('connected');
        StartServer();
    })
    .catch((error) => {
        Logging.error(`Unable to connect  ${error}`);
    });

/**Only start server if mongo connects**/
const StartServer = () => {
    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());

    router.use((req, res, next) => {
        Logging.info(`Incoming -> Method : [${req.method}] - Url : [${req.url}] - IP : [${req.socket.remoteAddress}]`);

        res.on('finish', () => {
            Logging.info(`Incoming -> Method : [${req.method}] - Url : [${req.url}] - IP : [${req.socket.remoteAddress}]`);
        });

        next();
    });

    /** Routes**/

    router.use('/authors', authorRoutes);
    router.use('/books', bookRoutes);

    /** Healthcheck**/

    router.get('/test', (req, res, next) => res.status(200).json({ message: 'testing from api' }));

    router.use((req, res, next) => {
        const error = new Error('not found');
        Logging.error(error);

        return res.status(404).json({ message: error.message });
    });

    http.createServer(router).listen(config.server.port, () => Logging.info(`Server is running on port ${config.server.port}`));
};
