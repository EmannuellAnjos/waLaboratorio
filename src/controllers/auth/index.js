const authConfig = require("../../config/auth");
const jwt = require('jsonwebtoken');

//Autenticação por usuario e senha. Token expira em 1 hora 
const login = async (req, res, next) => {

  if (req.body.user === 'ema' && req.body.password === '123') {

    const id = 1;
    const token = jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.ttl
    });
    return res.json({ auth: true, token: token });
  }

  res.status(500).json({ message: 'Login inválido!' });
}

const logout = async (req, res) => {
  res.json({ auth: false, token: null });
}

module.exports = {
  login,
  logout
};