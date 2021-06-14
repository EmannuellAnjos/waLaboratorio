const express = require("express");
const routes = express.Router();
const autorizacaotoken = require("../../middlewares/auth.js");

const exameTipoController = require('../../controllers/exameTipo');

routes.post("/lab/v1/exameTipo", autorizacaotoken, exameTipoController.incluir);
routes.put("/lab/v1/exameTipo/:idExameTipo", autorizacaotoken, exameTipoController.alterar);
routes.delete("/lab/v1/exameTipo/:idExameTipo", autorizacaotoken, exameTipoController.excluir);
routes.get("/lab/v1/exameTipo/:idExameTipo", autorizacaotoken, exameTipoController.exibir);
routes.get("/lab/v1/exameTipo", autorizacaotoken, exameTipoController.listar);

module.exports = routes;

