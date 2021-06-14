const express = require("express");
const routes = express.Router();
const autorizacaotoken = require("../../middlewares/auth.js");

const exameController = require('../../controllers/exame');

routes.post("/lab/v1/exame", autorizacaotoken, exameController.incluir);
routes.put("/lab/v1/exame/:idExame", autorizacaotoken, exameController.alterar);
routes.delete("/lab/v1/exame/:idExame", autorizacaotoken, exameController.excluir);
routes.get("/lab/v1/exame/:idExame", autorizacaotoken, exameController.exibir);
routes.get("/lab/v1/exame", autorizacaotoken, exameController.listar);
routes.post("/lab/v1/exame/incluirLote", autorizacaotoken, exameController.incluirLote);
routes.post("/lab/v1/exame/alterarLote", autorizacaotoken, exameController.alterarLote);
routes.post("/lab/v1/exame/excluirLote", autorizacaotoken, exameController.excluirLote);
routes.get("/lab/v1/exame/buscaExame/:nmExame", autorizacaotoken, exameController.buscaExame);

module.exports = routes;