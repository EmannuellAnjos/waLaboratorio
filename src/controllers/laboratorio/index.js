const model = require('../../models');
const yup = require("../../config/yup");
const moment = require('moment');
const sequelizeQuery = require("../../utils/montarFiltro.js");
const { postgreException } = require('../../utils/index.js');

//Controle da rota de Incluir
const incluir = async (req, res) => {
  await incluirLaboratorio(req)
    .then((result) => {
      return res.status(result.status).send(result.result);
    })
    .catch((error) => {
      return res.status(error.status).send(error.message || error);
    })
};

//Controle da rota de Alterar
const alterar = async (req, res) => {
  await alterarLaboratorio(req)
    .then((result) => {
      return res.status(result.status).send(result.result);
    })
    .catch((error) => {
      return res.status(error.status).send(error.message || error);
    })
};

//Controle da rota de Excluir
const excluir = async (req, res) => {
  await excluirLaboratorio(req)
    .then((result) => {
      return res.status(result.status).send(result.result);
    })
    .catch((error) => {
      return res.status(error.status).send(error.message || error);
    })
};

//Controle com Promise para Incluir
const incluirLaboratorio = (req, res) => {
  var statusCodeError
  return new Promise(async (resolve, reject) => {
    try {
      const schema = yup.object().shape({
        nmLaboratorio: yup.string().max(250).required(),
        dsEndereco: yup.string().max(250).required()
      });

      const { nmLaboratorio, dsEndereco } = req.body;
      const dtCadastro = moment().format("YYYY-MM-DD HH:mm:ss")
      await schema.validate(req.body, { strict: true })
        .catch((error) => {
          statusCodeError = 400
          throw new Error(error.message || error)
        })

      const result = await model.Laboratorio.create({
        nmLaboratorio: nmLaboratorio,
        dsEndereco: dsEndereco,
        dtCadastro: dtCadastro,
        flStatus: true

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
const alterarLaboratorio = async (req) => {
  var statusCodeError
  return new Promise(async (resolve, reject) => {
    try {
      const schema = yup.object().shape({
        nmLaboratorio: yup.string().max(250).required(),
        dsEndereco: yup.string().max(250).required()
      });

      const idLaboratorio = req.params.idLaboratorio;
      let { nmLaboratorio, dsEndereco } = req.body;

      const itemAtual = await model.Laboratorio.findByPk(idLaboratorio);
      if (!itemAtual) {
        statusCodeError = 400
        throw new Error("Laboratorio não Encontrado")
      }
      else if (!!itemAtual) {
        if (itemAtual.flStatus == false) {
          statusCodeError = 400
          throw new Error("Laboratorio não Encontrado")
        }
      }

      nmLaboratorio = nmLaboratorio === undefined ? itemAtual.nmLaboratorio : nmLaboratorio
      dsEndereco = dsEndereco === undefined ? itemAtual.dsEndereco : dsEndereco

      await schema.validate({ nmLaboratorio, dsEndereco }, { strict: true })
        .catch((error) => {
          statusCodeError = 400
          throw new Error(error.message || error)
        })

      const result = await model.Laboratorio
        .update({
          nmLaboratorio: nmLaboratorio,
          dsEndereco: dsEndereco

        }, { where: { idLaboratorio: idLaboratorio } })
        .catch(async (error) => {
          statusCodeError = 400
          const errorMessage = await postgreException(error, idLaboratorio, "alterar")
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
const excluirLaboratorio = (req) => {
  var statusCodeError
  return new Promise(async (resolve, reject) => {
    try {
      const schema = yup.object().shape({
        idLaboratorio: yup.string().required().test("validacaoNumerico", "Parâmetro informado não é um número válido!", (value) => !isNaN(value))
      });

      const idLaboratorio = req.params.idLaboratorio;
      await schema.validate({ idLaboratorio }, { strict: true })
        .catch((error) => {
          statusCodeError = 400
          throw new Error(error.message || error)
        })

      const itemAtual = await model.Laboratorio.findByPk(idLaboratorio);
      if (!!itemAtual) {
        if (itemAtual.flStatus == false) {
          statusCodeError = 400
          throw new Error("Laboratorio não Encontrado")
        }
      }
      const dtExclusao = moment().format("YYYY-MM-DD HH:mm:ss")
      const result = await model.Laboratorio
        .update({
          flStatus: false,
          dtExclusao: dtExclusao

        }, { where: { idLaboratorio: idLaboratorio } })
        .catch(async (error) => {
          statusCodeError = 400
          const errorMessage = await postgreException(error, idLaboratorio, "alterar")
            .catch((error) => {
              statusCodeError = 400
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

//Controle da rota de Exibir
//Conceito de Exibir é para para retornar todos os dados/campos através da PK.
const exibir = async (req, res) => {
  var statusCodeError
  try {
    const schema = yup.object().shape({
      idLaboratorio: yup.string().required().test("validacaoNumerico", "Parâmetro informado não é um número válido!", (value) => !isNaN(value))
    });

    const idLaboratorio = req.params.idLaboratorio;
    schema.validate({ idLaboratorio }, { strict: true })
      .catch((error) => {
        statusCodeError = 400
        throw new Error(error.message || error)
      })

    const itemAtual = await model.Laboratorio.findByPk(idLaboratorio);
    if (!!itemAtual) {
      if (itemAtual.flStatus == false) {
        statusCodeError = 400
        throw new Error("Laboratorio não Encontrado")
      }
    }

    const result = await model.Laboratorio
      .findByPk(idLaboratorio)
      .catch((error) => {
        statusCodeError = 500
        throw new Error(error.message || error)
      })

    return res.status(200).send(result)
  } catch (error) {
    return res.status(statusCodeError || 500).send({ error: true, message: error.message || error });
  }
};

//Controle da rota de Listar
//Conceito de Listar retorna todos registro da tabela usando paginação e que o Laboratorio estiver ativo.
const listar = async (req, res) => {
  var statusCodeError
  try {
    const { limit, offset, page, orderBy, orderDirection } = {
      limit: parseInt(req.query.limit) || 5,
      offset: ((parseInt(req.query.page) - 1) * parseInt(req.query.limit)) || 0,
      page: parseInt(req.query.page),
      orderBy: (req.query.orderBy ? req.query.orderBy : model.Laboratorio.primaryKeyAttribute),
      orderDirection: (req.query.orderDirection ? req.query.orderDirection : "ASC"),
    };
    req.query.flStatus = "true"
    const filtros = await sequelizeQuery.montarFiltros(req.query, model.Laboratorio);
    const result = await model.Laboratorio
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


const incluirLote = async (req, res) => {
  try {
    let incluido = []
    let erroInclusao = []

    if (Array.isArray(req.body)) {
      for (let index = 0; index < req.body.length; index++) {
        let item = {}
        item.body = req.body[index];

        await incluirLaboratorio(item)
          .then((result) => {
            incluido.push(result.result)
          })
          .catch((error) => {
            erroInclusao.push({ body: item.body, error: error })
          })
      }
      return res.status(200).send({ message: "Laboratorios incluidos em lote!", incluido, erroInclusao });
    }
    else {
      return res.status(200).send({ error: false, incluido, erroInclusao });
    }
  } catch (error) {
    return res.status(200).send({ status: 500, error: true, message: error })
  }
};

const alterarLote = async (req, res) => {
  try {
    let alterado = []
    let erroAlteracao = []

    if (Array.isArray(req.body)) {

      for (let index = 0; index < req.body.length; index++) {
        let item = {}
        item.body = req.body[index]
        item.params = req.params
        item.params.idLaboratorio = item.body.idLaboratorio

        await alterarLaboratorio(item)
          .then((result) => {
            alterado.push(result.result)
          })
          .catch((error) => {
            erroAlteracao.push({ body: item.body, error: error })
          })

      }
      return res.status(200).send({ message: "Laboratorios alterados em lote!", alterado, erroAlteracao });
    }
    else {
      return res.status(200).send({ error: false, alterado, erroAlteracao });
    }
  } catch (error) {
    return res.status(200).send({ status: 500, error: true, message: error })
  }
};


const excluirLote = async (req, res) => {
  try {
    let excluido = []
    let erroExclusao = []

    if (Array.isArray(req.body)) {

      for (let index = 0; index < req.body.length; index++) {
        let item = {}
        item.body = req.body[index];
        item.params = req.params
        item.params.idLaboratorio = item.body.idLaboratorio.toString()

        await excluirLaboratorio(item)
          .then((result) => {
            excluido.push(result.result)
          })
          .catch((error) => {
            erroExclusao.push({ body: item.body, error: error })
          })

      }
      return res.status(200).send({ message: "Laboratorios excluidos em lote!", excluido, erroExclusao });
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
  alterar,
  excluir,
  exibir,
  listar,
  incluirLaboratorio,
  alterarLaboratorio,
  excluirLaboratorio,
  incluirLote,
  alterarLote,
  excluirLote,
};

