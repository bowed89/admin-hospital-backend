var jwt = require('jsonwebtoken');
var seed = require('../config/config').SEED;

// =========================================
//          VERIFICAR TOKEN
// =========================================

exports.verificaToken = function(req, res, next) {

    //El token se pasara por el url
    var token = req.query.token;

    jwt.verify(token, seed, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token no válido',
                errors: err
            });
        }
        // Esta volviendo a codificar toda la informacion del token 
        // en un valor json que se lea : {role, nombre, _id, etc...}
        req.usuario = decoded.usuario;

        next();


    });
}