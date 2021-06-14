const model = require('../../models');
const yup = require("../../config/yup");
const { QueryTypes } = require("sequelize");
const sequelizeQuery = require("../../utils/sequelizeQuery");
const montarFiltros = require("../../utils/montarFiltro");
const { postgreException } = require('../../utils/index.js');

//Controle da rota de Incluir
const incluir = async (req, res) => {
  await incluirExame(req)
    .then((result) => {
      return res.status(result.status).send(result.result);
    })
    .catch((error) => {
      return res.status(error.status).send(error);
    })
};

//Controle da rota de Alterar
const alterar = async (req, res) => {
  await alterarExame(req)
    .then((result) => {
      return res.status(result.status).send(result.result);
    })
    .catch((error) => {
      return res.status(error.status).send(error);
    })
};

//Controle da rota de Excluir
const excluir = async (req, res) => {
  await excluirExame(req)
    .then((result) => {
      return res.status(result.status).send(result.result);
    })
    .catch((error) => {
      return res.status(error.status).send(error);
    })
};

//Controle com Promise para Incluir
const incluirExame = (req, res) => {
  var statusCodeError
  return new Promise(async (resolve, reject) => {
    try {
      const schema = yup.object().shape({
        nmExame: yup.string().max(250).required(),
        idExameTipo: yup.number().integer().required()
      });

      const { nmExame, idExameTipo } = req.body;
      const flStatus = true
      await schema.validate(req.body, { strict: true })
        .catch((error) => {
          statusCodeError = 400
          throw new Error(error.message || error)
        })

      const result = await model.Exame.create({
        nmExame: nmExame,
        idExameTipo: idExameTipo,
        flStatus: flStatus

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
const alterarExame = async (req) => {
  var statusCodeError
  return new Promise(async (resolve, reject) => {
    try {
      let idExame = 0
      const schema = yup.object().shape({
        nmExame: yup.string().max(250).required(),
        idExameTipo: yup.number().integer().required()
      });

      if (req.params.idExame)
        idExame = Number(req.params.idExame);
      else
        throw new Error("IdExame não Encontrado")

      let { nmExame, idExameTipo } = req.body;
      const itemAtual = await model.Exame.findByPk(idExame);
      if (!!itemAtual) {
        if (itemAtual.flStatus == false) {
          statusCodeError = 400
          throw new Error("Exame não Encontrado")
        }
      }

      nmExame = nmExame === undefined ? itemAtual.nmExame : nmExame
      idExameTipo = idExameTipo === undefined ? itemAtual.idExameTipo : idExameTipo

      await schema.validate({ nmExame, idExameTipo }, { strict: true })
        .catch((error) => {
          statusCodeError = 400
          throw new Error(error.message || error)
        })
      const result = await model.Exame
        .update({
          nmExame: nmExame,
          idExameTipo: idExameTipo
        }, { where: { idExame: idExame } })
        .catch(async (error) => {
          statusCodeError = 400
          const errorMessage = await postgreException(error, idExame, "alterar")
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
const excluirExame = (req) => {
  var statusCodeError
  return new Promise(async (resolve, reject) => {
    try {
      const schema = yup.object().shape({
        idExame: yup.string().required().test("validacaoNumerico", "Parâmetro informado não é um número válido!", (value) => !isNaN(value))
      });

      const idExame = req.params.idExame;
      await schema.validate({ idExame }, { strict: true })
        .catch((error) => {
          statusCodeError = 400
          throw new Error(error.message || error)
        })

      const itemAtual = await model.Exame.findByPk(idExame);
      if (!!itemAtual) {
        if (itemAtual.flStatus == false) {
          statusCodeError = 400
          throw new Error("Exame não Encontrado") //Exame desativado.
        }
      }

      const result = await model.Exame
        .update({
          flStatus: false

        }, { where: { idExame: idExame } })
        .catch(async (error) => {
          statusCodeError = 400
          const errorMessage = await postgreException(error, idExame, "alterar")
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

//Controle da rota para Exibir
//Conceito de Exibir é para para retornar todos os dados/campos através da PK.
const exibir = async (req, res) => {
  var statusCodeError
  try {
    const schema = yup.object().shape({
      idExame: yup.string().required().test("validacaoNumerico", "Parâmetro informado não é um número válido!", (value) => !isNaN(value))
    });

    const idExame = req.params.idExame;
    schema.validate({ idExame }, { strict: true })
      .catch((error) => {
        statusCodeError = 400
        throw new Error(error.message || error)
      })

    const itemAtual = await model.Exame.findByPk(idExame);
    if (!!itemAtual) {
      if (itemAtual.flStatus == false) {
        statusCodeError = 400
        throw new Error("Exame não Encontrado")
      }
    }

    const query = `select a.*, b.nm_exame_tipo from tb_exame a
                   inner join tb_exame_tipo b on a.id_exame_tipo = b.id_exame_tipo `

    await sequelizeQuery.sequelizeQuery(query, { type: QueryTypes.SELECT, raw: true })
      .then((result) => {
        return res.status(200).send(result[0])
      })
      .catch(error => { res.status(400).send({ error: true, message: error.message }) })

  } catch (error) {
    return res.status(statusCodeError || 500).send({ error: true, message: error.message || error });
  }
};

//Controle da rota para listar
//Conceito de Lista retorna todos registro da tabela usando paginação e que o exame estiver ativo.
const listar = async (req, res) => {
  var statusCodeError

  //http://localhost:8284/lab/v1/exame?limit=10&condicao=And&nmExame_like=02&page=1&orderDirection=desc&orderBy=nmExame

  try {
    const { limit, offset, page, orderBy, orderDirection } = {
      limit: parseInt(req.query.limit) || 5,
      offset: ((parseInt(req.query.page) - 1) * parseInt(req.query.limit)) || 0,
      page: parseInt(req.query.page),
      orderBy: (req.query.orderBy ? req.query.orderBy : model.Exame.primaryKeyAttribute),
      orderDirection: (req.query.orderDirection ? req.query.orderDirection : "ASC"),
    };

    req.query.flStatus = "true" // filtro apenas os ativos.

    const filtros = await montarFiltros.montarFiltros(req.query, model.Exame);
    const result = await model.Exame
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

//Controle da rota para Busca um Exame pelo nome.
const buscaExame = async (req, res) => {

  const nmExame = req.params.nmExame;
  const query = `
        SELECT a.*,
        c.nm_laboratorio        
        FROM tb_exame a 
        inner join tb_lab_exame b    on a.id_exame = b.id_exame
        inner join tb_laboratorio c  on b.id_laboratorio = c.id_laboratorio and c.fl_ativo = true
        where a.nm_exame = '${nmExame}' and fl_ativo = true`
  try {
    await sequelizeQuery.sequelizeQueryPaginado(req, query, model.Exame)
      .then(result => res.status(200).send(result))
      .catch(error => { res.status(400).send({ error: true, message: error.message }) })
  }
  catch (error) {
    return res.status(500).send({ error: true, message: error.message, page: 1, per_page: 9999, total: 0, total_pages: 0, data: [] });
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

        await incluirExame(item)
          .then((result) => {
            incluido.push(result.result)
          })
          .catch((error) => {
            erroInclusao.push({ body: item.body, error: error })
          })

      }
      return res.status(200).send({ message: "Exames incluidos em lote!", incluido, erroInclusao });
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
        item.params.idExame = item.body.idExame

        await alterarExame(item)
          .then((result) => {
            alterado.push(result.result)
          })
          .catch((error) => {
            erroAlteracao.push({ body: item.body, error: error })
          })

      }
      return res.status(200).send({ message: "Exames alterados em lote!", alterado, erroAlteracao });
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
        item.params.idExame = item.body.idExame.toString()

        await excluirExame(item)
          .then((result) => {
            excluido.push(result.result)
          })
          .catch((error) => {
            erroExclusao.push({ body: item.body, error: error })
          })

      }
      return res.status(200).send({ message: "Exames excluidos em lote!", excluido, erroExclusao });
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
  incluirExame,
  alterarExame,
  excluirExame,
  incluirLote,
  alterarLote,
  excluirLote,
  buscaExame
};

