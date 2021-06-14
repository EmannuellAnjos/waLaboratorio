const _ = require("lodash");
const { Op } = require("sequelize");
const model = require("../models/index");


//Montra Filtro apartir de uma querystring.
//Essa função identifica todos os parametros e interpreta trasncrevendo para sqlscript em conjunto com o model(tipação).
//Exemplo: http://localhost:8284/lab/v1/exame?limit=10&condicao=And&nmExame_like=02&page=1&orderDirection=desc&orderBy=nmExame
//limit: para paginação
//page: para paginação
//condicao: [and || or]
//nmExame_like: nome do campo com o operador.
//      Exemplo de operadores: in, not in, like, equal
//orderDirection: [asc || desc]
//orderBy: nome do campo

const montarFiltros = async (query, modelo) => {
  const immutable = Object.assign({}, query);
  let where = [];
  let filtros = {};
  let atributos = {};
  let atributosModelo = modelo.tableAttributes;
  let sequelize = model.Sequelize;

  // OBTER O NOME DA TABELA PRINCIPAL E CHAVE PRIMARIA
  let tablename = _.camelCase(modelo.getTableName());
  tablename = _.replace(tablename, 'tb', '');

  if (query.condicao === undefined) {
    query.condicao = 'and'
  }

  _.forEach(immutable, (value, key) => {

    let newKey = key;
    let operador = "";

    if (key.search("_in") !== -1) operador = "in"
    else if (key.search("_notIn") !== -1) operador = "notIn"
    else if (key.search("_like") !== -1) operador = "like"
    else operador = "equal"

    newKey = _.replace(newKey, "_in", "");
    newKey = _.replace(newKey, "_notIn", "");
    newKey = _.replace(newKey, "_like", "");

    atributos[newKey] = {
      operator: operador,
      value: value
    };

  });

  //-----------------------------------------------------------------------------------------------------------------------
  // Extrai da query as propriedades que estiverem presentes no objeto do modelo
  //-----------------------------------------------------------------------------------------------------------------------
  atributos = _.pickBy(atributos, (value, key) => _.hasIn(atributosModelo, key) && (value.value != undefined && value.value != ""));

  //-----------------------------------------------------------------------------------------------------------------------
  // Verifica se existe alguma propriedade extraída da query que exista no modelo
  //-----------------------------------------------------------------------------------------------------------------------
  if (!_.isEmpty(atributos)) {

    //-----------------------------------------------------------------------------------------------------------------------
    // Monta o operador para cada propriedade
    //-----------------------------------------------------------------------------------------------------------------------
    _.forEach(atributos, (value, key) => {

      let campo = `${atributosModelo[key].field}`;
      let tipo = !!atributosModelo[key].type.name ? atributosModelo[key].type.name : atributosModelo[key].type.constructor.name;
      let tiposAConverter = ["INTEGER", "DECIMAL", "DOUBLE", "REAL", "FLOAT", "BIGINT", "DATE", "DATEONLY", "BOOLEAN"];
      let operador = "";

      switch (value.operator) {

        case "in":

          value.value = _.split(value.value, ",");
          operador = _.includes(tiposAConverter, tipo) ? sequelize.where(sequelize.cast(sequelize.col(`${campo}`), "varchar"), { [Op.in]: value.value }) : { [campo]: { [Op.in]: value.value } };
          break;

        case "notIn":

          value.value = _.split(value.value, ",");
          operador = _.includes(tiposAConverter, tipo) ? sequelize.where(sequelize.cast(sequelize.col(`${campo}`), "varchar"), { [Op.notIn]: value.value }) : { [campo]: { [Op.notIn]: value.value } };
          break;

        case "like":

          operador = _.includes(tiposAConverter, tipo) ? sequelize.where(sequelize.cast(sequelize.col(`${campo}`), "varchar"), { [Op.iLike]: '%' + value.value + '%' }) : { [campo]: { [Op.iLike]: '%' + value.value + '%' } };
          break;

        default:

          operador = _.includes(tiposAConverter, tipo) ? sequelize.where(sequelize.cast(sequelize.col(`${campo}`), "varchar"), { [Op.eq]: value.value }) : { [campo]: { [Op.eq]: value.value } };
          break;
      }

      where.push(operador);

    });

    if (query.condicao.toLowerCase() === 'or') {
      filtros = {
        [Op.or]: where
      };
    } else {
      filtros = {
        [Op.and]: where
      };
    }
  }

  return filtros;

};

const filtroParametros = async (filtro) => {

  let where = [];
  let parametros = {};
  let resultado = "";
  let tiposAConverter = ["INTEGER", "DECIMAL", "DOUBLE", "REAL", "FLOAT", "BIGINT", "DATEONLY", "BOOLEAN"];
  let sequelize = model.Sequelize;

  for (i = 0; i < filtro.length; i++) {
    let nomeCampo = "";

    if (filtro[i].campo.indexOf(".") !== -1) {

      filtro[i].campo = _.split(filtro[i].campo, ".");
      //------------------------------------------------------------------------
      // Realiza um forEach para verificar todos os campos dentro do array do filtro[i].campo,depois verifica se 
      // o index do array é o ultimo, caso seja ele, será transformado em snakeCase e concatenado, caso não o valor do campo sera concatenado
      // caso seja o primeiro valor a ser concatenado na string ele não vai colocar um ponto antes, se sim terá um ponto
      //------------------------------------------------------------------------
      _.forEach(filtro[i].campo, (value, index) => nomeCampo += index === (filtro[i].campo.length) - 1 ? `.${_.snakeCase(value)}` : nomeCampo === "" ? value : `.${value}`);
      filtro[i].campo = `$${nomeCampo}$`;
    }

    switch (filtro[i].operador) {

      case "=":
        resultado = _.includes(tiposAConverter, filtro[i].tipo) ? sequelize.where(sequelize.cast(sequelize.col(`${filtro[i].campo}`), "varchar"), { [Op.eq]: filtro[i].valor }) : { [filtro[i].campo]: { [Op.eq]: filtro[i].valor } };
        break;

      case "<>":
        resultado = _.includes(tiposAConverter, filtro[i].tipo) ? sequelize.where(sequelize.cast(sequelize.col(`${filtro[i].campo}`), "varchar"), { [Op.ne]: filtro[i].valor }) : { [filtro[i].campo]: { [Op.ne]: filtro[i].valor } };
        break;

      case "in":
        filtro[i].valor = _.split(filtro[i].valor, ",");
        resultado = _.includes(tiposAConverter, filtro[i].tipo) ? sequelize.where(sequelize.cast(sequelize.col(`${filtro[i].campo}`), "varchar"), { [Op.in]: filtro[i].valor }) : { [filtro[i].campo]: { [Op.in]: filtro[i].valor } };
        break;

      case "notin":
        filtro[i].valor = _.split(filtro[i].valor, ",");
        resultado = _.includes(tiposAConverter, filtro[i].tipo) ? sequelize.where(sequelize.cast(sequelize.col(`${filtro[i].campo}`), "varchar"), { [Op.notIn]: filtro[i].valor }) : { [filtro[i].campo]: { [Op.notIn]: filtro[i].valor } };
        break;

      case "between":
        filtro[i].valor = _.split(filtro[i].valor, ",");
        resultado = _.includes(tiposAConverter, filtro[i].tipo) ? sequelize.where(sequelize.cast(sequelize.col(`${filtro[i].campo}`), "varchar"), { [Op.between]: filtro[i].valor }) : { [filtro[i].campo]: { [Op.between]: filtro[i].valor } };
        break;

      case "notbetween":
        filtro[i].valor = _.split(filtro[i].valor, ",");
        resultado = _.includes(tiposAConverter, filtro[i].tipo) ? sequelize.where(sequelize.cast(sequelize.col(`${filtro[i].campo}`), "varchar"), { [Op.notBetween]: filtro[i].valor }) : { [filtro[i].campo]: { [Op.notBetween]: filtro[i].valor } };
        break;

      case "or":
        filtro[i].valor = _.split(filtro[i].valor, ",");
        resultado = _.includes(tiposAConverter, filtro[i].tipo) ? sequelize.where(sequelize.cast(sequelize.col(`${filtro[i].campo}`), "varchar"), { [Op.or]: filtro[i].valor }) : { [filtro[i].campo]: { [Op.or]: filtro[i].valor } };
        break;

      case "like":
        resultado = _.includes(tiposAConverter, filtro[i].tipo) ? sequelize.where(sequelize.cast(sequelize.col(`${filtro[i].campo}`), "varchar"), { [Op.substring]: filtro[i].valor }) : { [filtro[i].campo]: { [Op.substring]: filtro[i].valor } };
        break;

      case "notlike":
        resultado = _.includes(tiposAConverter, filtro[i].tipo) ? sequelize.where(sequelize.cast(sequelize.col(`${filtro[i].campo}`), "varchar"), { [Op.notLike]: `%${filtro[i].valor}%` }) : { [filtro[i].campo]: { [Op.notLike]: `%${filtro[i].valor}%` } };
        break;

      default:
        break;
    }
    where.push(resultado);

    parametros = {
      [Op.and]: where
    };
  }
  return parametros;
};

const isEmpty = (obj) => [Object, Array].includes((obj || {}).constructor) && !Object.entries((obj || {})).length;

module.exports = {
  montarFiltros,
  filtroParametros,
  isEmpty
};

