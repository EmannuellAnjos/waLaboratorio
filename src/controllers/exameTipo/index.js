const model = require('../../models');
const yup = require("../../config/yup");
const moment = require('moment');
const sequelizeQuery = require("../../utils/montarFiltro");
const { postgreException } = require('../../utils/index.js');

//Controle da rota para Incluir
const incluir = async (req, res) => {
  await incluirExameTipo(req)
    .then((result) => {
      return res.status(result.status).send(result.result);
    })
    .catch((error) => {
      return res.status(error.status).send(error.message || error);
    })
};

//Controle da rota para Alterar
const alterar = async (req, res) => {
  await alterarExameTipo(req)
    .then((result) => {
      return res.status(result.status).send(result.result);
    })
    .catch((error) => {
      return res.status(error.status).send(error.message || error);
    })
};

//Controle da rota para Excluir
const excluir = async (req, res) => {
  await excluirExameTipo(req)
    .then((result) => {
      return res.status(result.status).send(result.result);
    })
    .catch((error) => {
      return res.status(error.status).send(error.message || error);
    })
};

//Controle com Promise para Incluir
const incluirExameTipo = (req, res) => {
  var statusCodeError
  return new Promise(async (resolve, reject) => {
    try {
      const schema = yup.object().shape({
        nmExameTipo: yup.string().max(250).required()
      });

      const { nmExameTipo } = req.body;
      await schema.validate(req.body, { strict: true })
        .catch((error) => {
          statusCodeError = 400
          throw new Error(error.message || error)
        })

      const result = await model.ExameTipo.create({
        nmExameTipo: nmExameTipo

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

//Controle com Promise para Alterar
const alterarExameTipo = async (req) => {
  var statusCodeError
  return new Promise(async (resolve, reject) => {
    try {
      const schema = yup.object().shape({
        nmExameTipo: yup.string().max(250).required()
      });

      const idExameTipo = req.params.idExameTipo;
      let { nmExameTipo } = req.body;
      const itemAtual = await model.ExameTipo.findByPk(idExameTipo);
      if (!itemAtual) {
        statusCodeError = 400
        throw new Error("Item não Encontrado")
      }
      nmExameTipo = nmExameTipo === undefined ? itemAtual.nmExameTipo : nmExameTipo


      await schema.validate({ nmExameTipo }, { strict: true })
        .catch((error) => {
          statusCodeError = 400
          throw new Error(error.message || error)
        })
      const result = await model.ExameTipo
        .update({
          nmExameTipo: nmExameTipo

        }, { where: { idExameTipo: idExameTipo } })
        .catch(async (error) => {
          statusCodeError = 400
          const errorMessage = await postgreException(error, idExameTipo, "alterar")
            .catch((error) => {
              statusCodeError = 400
              return error.message || error
            });
          throw new Error(errorMessage.message || errorMessage || error.message || error)
        });

      return resolve({ status: 200, result: { message: "Alteração efetuada com sucesso", error: false, body: { lista: [], numeroLinhas: result, } } })
    } catch (error) {
      return reject({ status: statusCodeError || 500, error: true, message: error.message || error });
    }
  })
};
//Controle com Promise para Excluir
const excluirExameTipo = (req) => {
  var statusCodeError
  return new Promise(async (resolve, reject) => {
    try {
      const schema = yup.object().shape({
        idExameTipo: yup.string().required().test("validacaoNumerico", "Parâmetro informado não é um número válido!", (value) => !isNaN(value))
      });

      const idExameTipo = req.params.idExameTipo;
      await schema.validate({ idExameTipo }, { strict: true })
        .catch((error) => {
          statusCodeError = 400
          throw new Error(error.message || error)
        })

      const result = await model.ExameTipo
        .destroy({ where: { idExameTipo: idExameTipo } })
        .catch(async (error) => {
          statusCodeError = 400
          const errorMessage = await postgreException(error, idExameTipo, "excluir")
            .catch((error) => {
              statusCodeError = 500
              return error.message || error
            });
          throw new Error(errorMessage.message || errorMessage || error.message || error)
        });

      return resolve({ status: 200, result: { message: "Exclusão efetuada com sucesso", error: false, body: { lista: [], numeroLinhas: result } } })
    } catch (error) {
      return reject({ status: statusCodeError || 500, error: true, message: error.message || error })
    }
  })
};

//Controle da rota para exibir
const exibir = async (req, res) => {
  var statusCodeError
  try {
    const schema = yup.object().shape({
      idExameTipo: yup.string().required().test("validacaoNumerico", "Parâmetro informado não é um número válido!", (value) => !isNaN(value))
    });

    const idExameTipo = req.params.idExameTipo;
    schema.validate({ idExameTipo }, { strict: true })
      .catch((error) => {
        statusCodeError = 400
        throw new Error(error.message || error)
      })

    const result = await model.ExameTipo
      .findByPk(idExameTipo)
      .catch((error) => {
        statusCodeError = 500
        throw new Error(error.message || error)
      })

    return res.status(200).send(result)
  } catch (error) {
    return res.status(statusCodeError || 500).send({ error: true, message: error.message || error });
  }
};

//Controle da rota para listar
const listar = async (req, res) => {
  var statusCodeError
  try {
    const { limit, offset, page, orderBy, orderDirection } = {
      limit: parseInt(req.query.limit) || 5,
      offset: ((parseInt(req.query.page) - 1) * parseInt(req.query.limit)) || 0,
      page: parseInt(req.query.page),
      orderBy: (req.query.orderBy ? req.query.orderBy : model.ExameTipo.primaryKeyAttribute),
      orderDirection: (req.query.orderDirection ? req.query.orderDirection : "ASC"),
    };

    const filtros = await sequelizeQuery.montarFiltros(req.query, model.ExameTipo);
    const result = await model.ExameTipo
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

module.exports = {
  incluir,
  alterar,
  excluir,
  exibir,
  listar,
  incluirExameTipo,
  alterarExameTipo,
  excluirExameTipo
};

