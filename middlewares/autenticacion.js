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
};

// =========================================
//          VERIFICAR ADMIN
// =========================================

exports.verificaADMIN_ROLE = function(req, res, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token no válido - No es administrador',
            errors: { message: 'No es administrador, no puede ingresar' }
        });
    }
};

// =========================================
//          VERIFICAR ADMIN O MISMO USUARIO
// =========================================

exports.verificaADMIN_o_MismoUsuario = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    // usuario._id sacara del token y el id de lo que estamos sacando del url

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token no válido - No es administrador ni es el mismo usuario',
            errors: { message: 'No es administrador, no puede ingresar' }
        });
    }
};