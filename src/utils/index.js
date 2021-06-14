//Função responsavel por transcrever o erro de banco de dados para melhor entendimento.
const postgreException = async (error, identityValue, operationType) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (error.name) {
        if (error.name === 'Error') {
          return resolve(error.message)
        } else if (error.name === 'SequelizeValidationError') {
          let msgSequelizeError = ""
          for (let i = 0; i < error.errors.length; i++) {
            if (error.errors[0].type === 'notNull Violation') {
              msgSequelizeError = "O campo [ " + error.errors[0].path + " ] não pode ser nulo, favor verificar!"
            }
            if (msgSequelizeError) {
              return resolve(msgSequelizeError)
            }
          }
          return resolve(error.message)
        } else {
          let tabelaOrigem = ""
          let tabelaDestino = ""

          if (operationType === "incluir") {
            identityValue = "INCLUIR"
            tabelaOrigem = error.parent.table
            tabelaDestino = error.parent.table
          } else {
            tabelaOrigem = error.table
            tabelaDestino = error.parent.table
          }

          switch (error.parent.code) {
            case "23000": // INTEGRITY_CONSTRAINT_VIOLATION
              return resolve(error.message);
              break
            case "23001": // RESTRICT_VIOLATION
              return resolve(error.message);
              break
            case "23502": // NOT_NULL_VIOLATION
              return resolve("Não será possível " + operationType + " o/a " + tabelaOrigem + " pois o campo [ " + error.parent.column + " ] está nulo!");
              break
            case "23503": // FOREIGN_KEY_VIOLATION
              let mensagem = error.message
              if (operationType === "excluir") {
                mensagem = "Não será possível " + operationType + " o/a " + tabelaOrigem + " [ " + identityValue + " ] pois esta vinculado(a) a um(a) " + tabelaDestino
              } else {
                mensagem = error.parent.detail.replace('Key', 'A chave').replace('is not present in table', 'não se encontra na tabela') + " Favor verificar os dados lançados! [F.K.]"
              }
              return resolve(mensagem);
              break
            case "23505": // UNIQUE_VIOLATION
              return resolve("Não será possível " + operationType + " o/a " + tabelaDestino + " pois já existe o mesmo registro! [U.K.]");
              break
            case "23514": // CHECK_VIOLATION
              return resolve(error.message);
              break
            case "23P01": // EXCLUSION_VIOLATION
              return resolve(error.message);
              break
            default:
              return resolve(error.message);
              break;
          }
        }
      }
    } catch (error) { return resolve(error.message) }
  })
}

module.exports = { postgreException }