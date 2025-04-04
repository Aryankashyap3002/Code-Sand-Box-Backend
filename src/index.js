import express from 'express';
import { PORT } from './config/serverConfig.js';
import connectDB from './config/dbConfig.js';
import { StatusCodes } from 'http-status-codes';
import apiRouter from './routes/apiRoutes.js';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRouter);

app.get('/ping', (req, res) => {
    return res.status(StatusCodes.OK).json({
        msg: "pong"
    });
});

app.listen(PORT, () => {
    console.log("Server connected at 3000");
    connectDB();
});