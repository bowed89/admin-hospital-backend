var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Validar 'tipo' de la coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida' }
        });
    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener el nombre del archivo
    var archivo = req.files.imagen;
    // dvidide el nombre del archivo que se subio
    var nombreCortado = archivo.name.split('.');
    // obtenemos el nombre de la img
    var nArchivo = nombreCortado[nombreCortado.length - 2];
    // obtenemos la ultima palabra del nombre del archivo cortado
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];
    // Validar solo estas extensiones de imagenes :::
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });

    }

    // Nombre de archivo personalizado:
    // Se armará con el ID del usuario + un numero random + la extension del archivo subido
    //var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo} `;
    var nombreArchivo = `${nArchivo}.${extensionArchivo}`;

    //Mover el archivo del temporal a una ruta especifica
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });

});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }


            // Obtenemos la ruta que se creo en el upload
            var pathViejo = './uploads/usuarios' + usuario.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            // Guarda la ruta dela img en el documento de usuario
            usuario.img = nombreArchivo;



            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizado',
                    usuario: usuarioActualizado
                });

            });

        });
    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'medico no existe',
                    errors: { message: 'medico no existe' }
                });
            }

            // Obtenemos la ruta que se creo en el upload
            var pathViejo = './uploads/medicos' + medico.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            // Guarda la ruta dela img en el documento de usuario
            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizado',
                    medico: medicoActualizado
                });

            });

        });
    }
    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'hospital no existe',
                    errors: { message: 'hospital no existe' }
                });
            }

            // Obtenemos la ruta que se creo en el upload
            var pathViejo = './uploads/hospitales' + hospital.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            // Guarda la ruta dela img en el documento de usuario
            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {


                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizado',
                    hospital: hospitalActualizado
                });

            });

        });

    }

}

module.exports = app;