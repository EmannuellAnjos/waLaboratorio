const model = require('../../models');
const yup = require("../../config/yup");
const moment = require('moment');
const montarFiltro = require("../../utils/montarFiltro");
const sequelizeQuery = require("../../utils/sequelizeQuery");
const { postgreException } = require('../../utils/index.js');

//Controle da rota de Incluir
const incluir = async (req, res) => {
  await incluirLabExame(req)
    .then((result) => {
      return res.status(result.status).send(result.result);
    })
    .catch((error) => {
      return res.status(error.status).send(error.message || error);
    })
};

//Controle da rota de Excluir
const excluir = async (req, res) => {
  await excluirLabExame(req)
    .then((result) => {
      return res.status(result.status).send(result.result);
    })
    .catch((error) => {
      return res.status(error.status).send(error.message || error);
    })
};

//Controle com Promise para Incluir
const incluirLabExame = (req, res) => {
  var statusCodeError
  return new Promise(async (resolve, reject) => {
    try {
      const schema = yup.object().shape({
        idLaboratorio: yup.number().integer().required(),
        idExame: yup.number().integer().required()
      });

      const { idLaboratorio, idExame } = req.body;
      await schema.validate(req.body, { strict: true })
        .catch((error) => {
          statusCodeError = 400
          throw new Error(error.message || error)
        })

      const result = await model.LabExame.create({
        idLaboratorio: idLaboratorio,
        idExame: idExame

      })
        .catch(async (error) => {
          statusCodeError = 400
          const errorMessage = await postgreException(error, null, "incluir")
            .catch((error) => {
              statusCodeError = 500
              return error.message || error
            });
          throw new Error(errorMessage.message || errorMessage || error.message || error)
        });
      return resolve({ status: 201, result })
    } catch (error) {
      return reject({ status: statusCodeError || 500, error: true, message: error.message || error })
    }
  })
};

//Controle com Promise para Excluir
const excluirLabExame = (req) => {
  var statusCodeError
  return new Promise(async (resolve, reject) => {
    try {
      const schema = yup.object().shape({
        idLaboratorio: yup.number().integer().required(),
        idExame: yup.number().integer().required()
      });

      const { idLaboratorio, idExame } = req.body;
      await schema.validate(req.body, { strict: true })
        .catch((error) => {
          statusCodeError = 400
          throw new Error(error.message || error)
        })

      const itemAtual = await model.LabExame.findOne({ where: { idLaboratorio: idLaboratorio, idExame: idExame } });
      if (!itemAtual) {
        statusCodeError = 400
        throw new Error("Não Existe esse Exame associado a esse Laboratorio")
      }
      else {
        const result = await model.LabExame
          .destroy({ where: { idLabExame: itemAtual.idLabExame } })
          .catch(async (error) => {
            statusCodeError = 400
            const errorMessage = await postgreException(error, idLabExame, "excluir")
              .catch((error) => {
                statusCodeError = 500
                return error.message || error
              });
            throw new Error(errorMessage.message || errorMessage || error.message || error)
          });
        return resolve({ status: 200, result: { message: "Exclusão efetuada com sucesso", error: false, body: { lista: [], numeroLinhas: result } } })
      }

    } catch (error) {
      return reject({ status: statusCodeError || 500, error: true, message: error.message || error })
    }
  })
};

//Controle da rota de Listar 
//Utilizando query e retornando paginado.
const listar = async (req, res) => {
  const query = `
        SELECT a.*,
        b.nm_laboratorio,
        c.nm_exame
        FROM tb_lab_exame a 
        inner join tb_laboratorio b  on a.id_laboratorio = b.id_laboratorio
        inner join tb_exame c  on a.id_exame = c.id_exame`
  try {
    await sequelizeQuery.sequelizeQueryPaginado(req, query, model.LabExame)
      .then(result => res.status(200).send(result))
      .catch(error => { res.status(400).send({ error: true, message: error.message }) })
  }
  catch (error) {
    return res.status(500).send({ error: true, message: error.message, page: 1, per_page: 9999, total: 0, total_pages: 0, data: [] });
  }
};


//Função sem link, para mostrar que posso utilizar o ORM e com paginação
const listar2 = async (req, res) => {
  var statusCodeError
  try {
    const { limit, offset, page, orderBy, orderDirection } = {
      limit: parseInt(req.query.limit) || 5,
      offset: ((parseInt(req.query.page) - 1) * parseInt(req.query.limit)) || 0,
      page: parseInt(req.query.page),
      orderBy: (req.query.orderBy ? req.query.orderBy : model.LabExame.primaryKeyAttribute),
      orderDirection: (req.query.orderDirection ? req.query.orderDirection : "ASC"),
    };

    const filtros = await montarFiltro.montarFiltros(req.query, model.LabExame);
    const result = await model.LabExame
      .findAndCountAll({
        where: filtros,
        limit: limit,
        offset: offset,
        order: [[orderBy, orderDirection]]
      })
      .catch((error) => {
        statusCodeError = 500
        throw new Error(error.message || error)
      })

    const total = Number(result.count)
    const per_page = limit;
    const total_pages = total / limit;
    const data = result.rows;

    return res.status(200).send({ page, per_page, total, total_pages, data });
  }
  catch (error) {
    return res.status(statusCodeError || 500).send({ error: true, message: error.message, page: 1, per_page: 5, total: 0, total_pages: 0, data: [] });
  }
};

//Controle da rota de Incluir em Lote
//Ao receber um array irá tentar incluir todos, será separar os sucesso e os erros e irá retornar para quem chamou.
const incluirLote = async (req, res) => {
  let incluido = []
  let erroInclusao = []
  try {

    if (Array.isArray(req.body)) {

      for (let index = 0; index < req.body.length; index++) {
        let item = {}
        item.body = req.body[index];

        await incluirLabExame(item)
          .then((result) => {
            incluido.push(result.result)
          })
          .catch((error) => {
            erroInclusao.push({ body: item.body, error: error })
          })

      }
      return res.status(200).send({ message: "labExames incluidos em lote!", incluido, erroInclusao });
    }
    else {
      return res.status(200).send({ error: false, incluido, erroInclusao });
    }
  } catch (error) {
    return res.status(200).send({ status: 500, error: true, message: error })
  }
};

//Controle da rota de Excluir em Lote
//Ao receber um array irá tentar incluir todos, será separar os sucesso e os erros e irá retornar para quem chamou.
const excluirLote = async (req, res) => {
  try {
    let excluido = []
    let erroExclusao = []

    if (Array.isArray(req.body)) {

      for (let index = 0; index < req.body.length; index++) {
        let item = {}
        item.body = req.body[index];
        item.params = req.params

        await excluirLabExame(item)
          .then((result) => {
            excluido.push(result.result)
          })
          .catch((error) => {
            erroExclusao.push({ body: item.body, error: error })
          })

      }
      return res.status(200).send({ message: "labExames excluidos em lote!", excluido, erroExclusao });
    }
    else {
      return res.status(200).send({ error: false, excluido, erroExclusao });
    }
  } catch (error) {
    return res.status(200).send({ status: 500, error: true, message: error })
  }
};

module.exports = {
  incluir,
  excluir,
  listar,
  incluirLabExame,
  excluirLabExame,
  incluirLote,
  excluirLote,
};