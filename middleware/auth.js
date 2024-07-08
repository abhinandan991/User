const jwt = require("jsonwebtoken");
const fs = require('fs');

const auth = async (req, res, next) => {
  try {
    const bearerHeader = req.headers["authorization"];

    if (typeof bearerHeader !== undefined) {
      req.token = bearerHeader.split(" ")[1];
      const publicKey = fs.readFileSync('./constants/certificates/public.crt', 'utf8');

      const verifyUser = jwt.verify(req.token, publicKey, { algorithms: ['RS256'] });

      if (verifyUser.data) {
        req.user_id = verifyUser.data.user_id;
        req.account_id = verifyUser.data.account_id;
        next();
      }
      else {
        return res.json({
          message: "Access Forbidden",
          status: 401,
          success: "0",
        });
      }
    }
    else {
      return res.json({
        message: "Token Not Provided",
        status: 400,
        success: "0",
      });
    }
  }
  catch (err) {
    console.log(err);
    return res.json({
      message: "Access forbidden",
      status: 401,
      success: "0",
    });
  }
};

module.exports = auth;