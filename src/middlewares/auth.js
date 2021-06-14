const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth");

//middewares para autenticar jwt da Rota.
module.exports = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.replace("Bearer ", "");
    if (!token)
      return res.status(401).json({ auth: false, message: 'No token provided.' });

    jwt.verify(token, authConfig.secret, function (err, decoded) {
      if (err)
        return res.status(401).json({ auth: false, message: 'Failed to authenticate token.' });

      req.userId = decoded.id;
      next();
    });
  }
  else
    return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
}