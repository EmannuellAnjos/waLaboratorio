const express = require("express");
const routes = express.Router();
const autorizacaotoken = require("../../middlewares/auth.js");

const laboratorioController = require('../../controllers/laboratorio');

routes.post("/lab/v1/laboratorio", autorizacaotoken, laboratorioController.incluir);
routes.put("/lab/v1/laboratorio/:idLaboratorio", autorizacaotoken, laboratorioController.alterar);
routes.delete("/lab/v1/laboratorio/:idLaboratorio", autorizacaotoken, laboratorioController.excluir);
routes.get("/lab/v1/laboratorio/:idLaboratorio", autorizacaotoken, laboratorioController.exibir);
routes.get("/lab/v1/laboratorio", autorizacaotoken, laboratorioController.listar);
routes.post("/lab/v1/laboratorio/incluirLote", autorizacaotoken, laboratorioController.incluirLote);
routes.post("/lab/v1/laboratorio/alterarLote", autorizacaotoken, laboratorioController.alterarLote);
routes.post("/lab/v1/laboratorio/excluirLote", autorizacaotoken, laboratorioController.excluirLote);

module.exports = routes;

