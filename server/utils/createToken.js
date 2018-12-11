const jwt = require('jsonwebtoken');
const config = require('./../config.js');

module.exports = function(data){
    const token = jwt.sign(data, config.token.secret, {expiresIn: config.token.expires})
    return token;
}