const { Pool } = require("pg");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 10,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 10000,
};
const client = new Pool(config);

client
  .connect()
  .then((result) =>
    console.log("Conexão com banco de dados realizada com sucesso!")
  )
  .catch((error) => {
    console.log(
      `Não foi possível realizar a conexão com o banco de dados! ${error}`
    );
  });

module.exports = {
  query: (text, params) => client.query(text, params),
};
