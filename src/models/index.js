"use strict";

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const db = {};

let sequelize;

sequelize = new Sequelize(process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  dialectOptions:
  {
    useUTC: false, // for reading from database
  },
  timezone: '-03:00', // for writing to database
});

const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados ok!");
  } catch (error) {
    console.log("Ocorreu um erro ao conectar ao banco de dados, verifique as variáveis de ambiente!");
  }
}

connection();
fs
  .readdirSync(__dirname)
  .filter(file => (file.indexOf(".") !== 0) && (file !== basename))
  .forEach(file => {
    const model = require(path.join(__dirname, file, basename))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) { db[modelName].associate(db); }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

