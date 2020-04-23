var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var seed = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

const mdAutenticacion = require('../middlewares/autenticacion');

// =========================================
//          AUTENTICACIÓN DE GOOGLE
// =========================================
app.get('/renuevatoken', mdAutenticacion.verificaToken, (req, res) => {

    var token = jwt.sign({ usuario: req.usuario }, seed, { expiresIn: 14400 });

    res.status(200).json({
        ok: true,
        token: token
    });
});



// =========================================
//          AUTENTICACIÓN DE GOOGLE
// =========================================

//'await' espera hasta que 'client.verifyIdToken' devuelva una respuesta y se guarda en 'ticket'

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    // en el 'payload' se tiene toda la informacion del usuario
    const payload = ticket.getPayload();

    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

// Para usar el 'await' se debe usar el 'async'
app.post('/google', async(req, res) => {

    var token = req.body.token;

    // espera hasta que devuelva el token o un error ...
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        // si existe usuarioDB, ya existe un email en la BD, pero podemos re autenticar
        if (usuarioDB) {

            // si es usuario no fue autenticado por google entonces se cancela porque el usuario no
            // puede autenticarse  '.google' es un flag que se creo en el model de usuario.
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal',
                });
                // el usuario ya existe en la BD que anteriormente fue autenticado por google
                // y se debe generar un nuevo token
            } else {

                var token = jwt.sign({ usuario: usuarioDB }, seed, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            }
        } else {
            // El usuario no existe ... Se debe crear
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {

                var token = jwt.sign({ usuario: usuarioDB }, seed, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id,
                    menu: obtenerMenu(usuarioDB.role)

                });

            });

        }
    });
});


// =========================================
//          AUTENTICACIÓN NORMAL
// =========================================


//Llamamos el seed para el token 

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuario) => {

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
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuario.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // no muestra el password en la respuesta ...
        usuario.password = ':)';

        // Crear un token donde expira en 4 horas
        // el seed es como una clave que valida el token cuando se genera...
        var token = jwt.sign({ usuario: usuario }, seed, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            usuario: usuario,
            token: token,
            id: usuario._id,
            menu: obtenerMenu(usuario.role)
        });
    });


});

function obtenerMenu(ROLE) {
    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'Rxjs', url: '/rxjs' }
            ]
        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                // { titulo: 'Usuarios', url: '/usuarios' },
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' }
            ]
        }
    ];

    if (ROLE === 'ADMIN_ROLE') {

        // con unshift ponemos a usuarios al principio del submenu
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });

    }
    console.log('role-->', ROLE);
    return menu;
}

module.exports = app;