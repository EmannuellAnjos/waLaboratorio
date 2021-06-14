const db = require("../models/index");
const { QueryTypes } = require("sequelize");
const camelcaseKeys = require('camelcase-keys');
const { snakeCase } = require('snake-case')
const _ = require("lodash");



// Executa um sql no banco.
const sequelizeQuery = async (query) => {
  try {
    return new Promise(async (resolve, reject) => {
      await db.sequelize.query(query, { type: QueryTypes.SELECT, raw: true })
        .then(async (result) => {
          result = await camelcaseKeys(result);
          resolve(result);
        }).catch((error) => {
          reject(error);
        });
    });
  } catch (error) {
    throw new Error(error.message)
  }
}

//Montra Filtro apartir de um script sql.
//Essa função identifica todos os parametros e interpreta trasncrevendo para sqlscript em conjunto com o model(tipação).
//Exemplo: http://localhost:8284/lab/v1/exame?limit=10&condicao=And&nmExame_like=02&page=1&orderDirection=desc&orderBy=nmExame
//limit: para paginação
//page: para paginação
//condicao: [and || or]
//nmExame_like: nome do campo com o operador.
//      Exemplo de operadores: in, not in, like, equal
//orderDirection: [asc || desc]
//orderBy: nome do campo
const sequelizeQueryPaginado = async (req, query, model) => {

  const { limit, offset, page, orderBy, orderDirection } = {
    limit: parseInt(req.query.limit) || 5,
    offset: ((parseInt(req.query.page) - 1) * parseInt(req.query.limit)) || 0,
    page: parseInt(req.query.page),
    orderBy: (req.query.orderBy ? req.query.orderBy : model.primaryKeyAttribute),
    orderDirection: (req.query.orderDirection ? req.query.orderDirection : "ASC"),
  };

  try {
    let queryCount = `select count(*) as count from (${query}) A`
    let filtros = await montarFiltrosQuery(req.query, model);
    query = `select * from (${query}) A`
    if (filtros) {
      filtros = ` where ${filtros} `
    }
    const orderBySnakeCase = snakeCase(orderBy);
    query = `${query}
                 ${filtros}
                 order by ${orderBySnakeCase} ${orderDirection}
                          limit ${limit} offset ${offset}`
    queryCount = `${queryCount}
                 ${filtros}`
    return new Promise(async (resolve, reject) => {
      await db.sequelize.query(query, { type: QueryTypes.SELECT, raw: true })
        .then(async (result) => {
          await db.sequelize.query(queryCount, { type: QueryTypes.SELECT, raw: true })
            .then(async (resultCount) => {
              const total = Number(resultCount[0].count);
              const per_page = limit;
              const total_pages = total / limit;
              result = await camelcaseKeys(result);
              const data = result;
              resolve({ page, per_page, total, total_pages, data });
            }).catch((error) => {
              reject(error);
            })
        }).catch((error) => {
          reject(error);
        });
    });
  } catch (error) {
    throw new Error(error.message)
  }
}

const montarFiltrosQuery = async (query, modelo) => {
  const immutable = Object.assign({}, query);
  let atributos = {};
  let atributosModelo = modelo.tableAttributes;
  let atributosModeloCustomizado = modelo.customTableAttributes;

  var filtros = "";

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
  if (atributosModeloCustomizado) {
    atributosModelo = Object.assign(atributosModelo, atributosModeloCustomizado)
    atributosCustom = _.pickBy(atributos, (value, key) => _.hasIn(atributosModeloCustomizado, key) && (value.value != undefined && value.value != ""));
  }
  atributos = _.pickBy(atributos, (value, key) => _.hasIn(atributosModelo, key) && (value.value != undefined && value.value != ""));

  //-----------------------------------------------------------------------------------------------------------------------
  // Verifica se existe alguma propriedade extraída da query que exista no modelo
  //-----------------------------------------------------------------------------------------------------------------------
  if (!_.isEmpty(atributos)) {
    //-----------------------------------------------------------------------------------------------------------------------
    // Monta o operador para cada propriedade
    //-----------------------------------------------------------------------------------------------------------------------
    _.forEach(atributos, (value, key) => {
      let campo = atributosModelo[key].field;
      let type = !!atributosModelo[key].type.name ? atributosModelo[key].type.name : atributosModelo[key].type.constructor.name;
      let tiposNumeric = ["INTEGER", "DECIMAL", "DOUBLE", "REAL", "FLOAT", "BIGINT", "DATE", "DATEONLY", "BOOLEAN"];
      let converterString = -1; //= _.findIndex(tiposNumeric, type)

      for (let i = 0; i < tiposNumeric.length; i++) {
        if (tiposNumeric[i] === type) {
          converterString = i;
          break;
        }
      }

      switch (value.operator) {
        case "in":
          filtros += filtros === "" ? `${campo} in (${value.value})` : `${query.condicao.toLowerCase() === 'or' ? 'or' : 'and'} ${campo} in (${value.value})`
          break;
        case "notIn":
          filtros += filtros === "" ? `${campo} not in (${value.value})` : `${query.condicao.toLowerCase() === 'or' ? 'or' : 'and'} ${campo} not in (${value.value})`
          break;
        case "like":
          if (converterString === -1) {
            filtros += filtros === "" ? ` ${campo} ilike '%${value.value}%'` : ` ${query.condicao.toLowerCase() === 'or' ? 'or' : 'and'} ${campo} ilike '%${value.value}%'`
          } else {
            filtros += filtros === "" ? ` cast(${campo} as varchar) ilike '%${value.value}%'` : ` ${query.condicao.toLowerCase() === 'or' ? 'or' : 'and'} cast(${campo} as varchar) ilike '%${value.value}%'`
          }
          break;
        default:
          if (converterString !== -1) {
            filtros += filtros === "" ? ` ${campo} = '${value.value}'` : ` ${query.condicao.toLowerCase() === 'or' ? 'or' : 'and'} ${campo} = '${value.value}'`
          } else {
            filtros += filtros === "" ? ` ${campo} = ${value.value}` : ` ${query.condicao.toLowerCase() === 'or' ? 'or' : 'and'} ${campo} = ${value.value}`
          }
          break;
      }
    });
  }
  return filtros;
};

module.exports = {
  sequelizeQuery,
  sequelizeQueryPaginado,
  montarFiltrosQuery
};