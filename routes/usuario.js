var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// LLama la funcion creada para autenticar con el token
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();


var Usuario = require('../models/usuario');

// =========================================
//          OBTENER TODOS LOS USUARIOS
// =========================================

app.get('/', (req, res, next) => {

    // 'limit' muestra que se cargara solo 5 registros del total de la coleccion que hay en la bd.
    // 'desde' ingresamos por teclado cuantos registros se van a cargar luego de los 5 primeros registros que se muestran
    // 'skip' muestran los siguientes registros que ingresamos por teclado ...

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                // 'count' nos muestra el total de registros que hay en la collection 

                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });
                });


            });
});



// =========================================
//          ACTUALIZAR USUARIO
// =========================================

// mdAutenticacion.verificaToken inyecta la utenticacion con el token

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });

});

// =========================================
//          CREAR UN NUEVO USUARIO
// =========================================

// mdAutenticacion.verificaToken inyecta la utenticacion con el token

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuarios',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            // esta devolviendo los datos del usuario que creo a este nuevo user mediante el token
            usuariotoken: req.usuario
        });

    });
});

// =========================================
//          ELIMINAR UN USUARIO
// =========================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndDelete(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});


module.exports = app;