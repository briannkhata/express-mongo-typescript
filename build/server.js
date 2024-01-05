"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config/config");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const Logging_1 = __importDefault(require("./library/Logging"));
const Author_1 = __importDefault(require("./routes/Author"));
const Book_1 = __importDefault(require("./routes/Book"));
const router = (0, express_1.default)();
/** Connect to Database **/
mongoose_1.default
    .connect(config_1.config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
    Logging_1.default.info('connected');
    StartServer();
})
    .catch((error) => {
    Logging_1.default.error(`Unable to connect  ${error}`);
});
/**Only start server if mongo connects**/
const StartServer = () => {
    router.use(express_1.default.urlencoded({ extended: true }));
    router.use(express_1.default.json());
    router.use((req, res, next) => {
        Logging_1.default.info(`Incoming -> Method : [${req.method}] - Url : [${req.url}] - IP : [${req.socket.remoteAddress}]`);
        res.on('finish', () => {
            Logging_1.default.info(`Incoming -> Method : [${req.method}] - Url : [${req.url}] - IP : [${req.socket.remoteAddress}]`);
        });
        next();
    });
    /** Routes**/
    router.use('/authors', Author_1.default);
    router.use('/books', Book_1.default);
    /** Healthcheck**/
    router.get('/test', (req, res, next) => res.status(200).json({ message: 'testing from api' }));
    router.use((req, res, next) => {
        const error = new Error('not found');
        Logging_1.default.error(error);
        return res.status(404).json({ message: error.message });
    });
    http_1.default.createServer(router).listen(config_1.config.server.port, () => Logging_1.default.info(`Server is running on port ${config_1.config.server.port}`));
};
