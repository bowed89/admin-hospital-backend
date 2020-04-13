var express = require('express');
var jwt = require('jsonwebtoken');

// LLama la funcion creada para autenticar con el token
var mdAutenticacion = require('../middlewares/autenticacion');

//Llamamos el seed para el token 
var seed = require('../config/config').SEED;

var app = express();


var Hospital = require('../models/hospital');

// =========================================
//          OBTENER TODOS LOS HOSPITALES
// =========================================

// El populate muestra datos del nombre y email del documento 'usuario'
// 'limit' muestra que se cargara solo 5 registros del total de la coleccion que hay en la bd.
// 'desde' ingresamos por teclado cuantos registros se van a cargar luego de los 5 primeros registros que se muestran
// 'skip' muestran los siguientes registros que ingresamos por teclado ...

app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospoitales',
                        error: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });

            });

});

// =========================================
//          CREAR UN NUEVO HOSPITAL
// =========================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});


// =========================================
//          ACTUALIZAR HOSPITAL
// =========================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }
        // Solo se actualiza el nombre del hospital *.*
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });
    });

});


// =========================================
//          ELIMINAR UN HOSPITAL
// =========================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndDelete(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalBorrado
        });


    });
});


module.exports = app;