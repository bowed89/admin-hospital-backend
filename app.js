// Requires --> Importacion de librerias
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// Conexion a la BD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) { throw err; }

    console.log('Base de Datos Conectado');

});

// rutas
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});


// Escuchar peticiones en el puerto 3000 
app.listen(3000, () => {
    console.log('Express Server Puerto: 3000');
});