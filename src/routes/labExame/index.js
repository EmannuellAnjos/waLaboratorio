const express = require("express");
const routes = express.Router();
const autorizacaotoken = require("../../middlewares/auth.js");

const labExameController = require('../../controllers/labExame');

routes.post("/lab/v1/labExame", autorizacaotoken, labExameController.incluir);
routes.delete("/lab/v1/labExame/:idLabExame", autorizacaotoken, labExameController.excluir);
routes.get("/lab/v1/labExame", autorizacaotoken, labExameController.listar);
routes.post("/lab/v1/labExame/incluirLote", autorizacaotoken, labExameController.incluirLote);
routes.post("/lab/v1/labExame/excluirLote", autorizacaotoken, labExameController.excluirLote);
module.exports = routes;

