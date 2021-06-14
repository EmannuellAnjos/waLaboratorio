const express = require("express");
const routes = express.Router();

const authController = require('../../controllers/auth');

routes.post("/lab/v1/auth/login", authController.login);
routes.put("/lab/v1/auth/logout", authController.logout);

module.exports = routes;