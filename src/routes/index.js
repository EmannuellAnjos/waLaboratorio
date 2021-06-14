const auth = require("./auth/index");
const laboratorioRoute = require("./laboratorio/index");
const labExameRoute = require("./labExame/index");
const exameRoute = require("./exame/index");
const exameTipoRoute = require("./exameTipo/index");

const express = require("express");
const routes = express.Router();

// Inclusão das rotas
routes.use(auth);
routes.use(laboratorioRoute);
routes.use(labExameRoute);
routes.use(exameRoute);
routes.use(exameTipoRoute);

module.exports = routes;