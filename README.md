API criada em node.js

Banco de dados postgres, o modelo e sql estão na pasta files.

Para montar o ambiente apenas "npm install" na pasta do projeto, pois não é necessario nenhum configuração extra.

o arquivo .env na raiz do projeto é para configurar a porta e as credenciais do banco de dados.

Segurança:
    Todas as rotas estão utilizando JWT e para gerar um token valido necessario logar atraves da rota 
    http://localhost:8284/lab/v1/auth/login  passando as credenciais com json.
    {
        "user" : "ema",
        "password": "123"
    }

    Exemplo no print .\files\login.png. Foi utilizado para testar o Postman.
    Com o Token em mãos podemos utilizar todas as rotas.
    lembrando que o token expira em 1 hora.

Documentação:
    http://localhost:8284/api-docs/#/

    Foi feito a documentação parcial devio o tempo que foi exigido para entregar esse teste.
    Documentação do Exames, mas já mostra que utilizar o swagger.

Paginação:
    Na pasta .\src\utils temos alguns arquivos para tratar erro e gerar paginação e filtros.
      esse mini-framework dá o front-end autonomia para consultas sem depender do back-end.
      esse mini-framework está sempre em evolução, pois as consultas ainda são limitadas.

    Exemplo: http://localhost:8284/lab/v1/exame?limit=10&condicao=And&nmExame_like=02&page=1&orderDirection=desc&orderBy=nmExame
    limit: para paginação
    page: para paginação
    condicao: [and || or]
    nmExame_like: nome do campo com o operador.
          Exemplo de operadores: in, not in, like, equal
    atualmente não há limites de quantidade de campos para consultar, é necessario que esteja mapeado no model.
    orderDirection: [asc || desc]
    orderBy: nome do campo

Todos as consultas nessa API tem paginação, caso necessario uma extração de dados é necessario criar um end point exclusivo, pós analise da necessidade. Sempre visando performace.

Na tabela Laboratorio criei 2 campos extras de data, para mostrar que sei utilizar data e o moment().

Rotas:
    Foi escolhido o Express.

Ambiente Cloud:
  Não foi feito
Container:
  Não foi feito.