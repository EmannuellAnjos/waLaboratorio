require('dotenv').config();
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./src/swagger/swagger.json");

const express = require('express');
const helmet = require('helmet');
const logger = require('morgan');

const cors = require('cors');
const routes = require('./src/routes/index');
const app = express();

const port = process.env.PORT || 3114;

app.use(helmet());
app.use(logger('dev'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: false }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use(cors());
app.use(routes);

module.exports = app;

app.listen(port, () => console.log(`Listening on port ${port}!`));

