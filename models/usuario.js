var mongoose = require('mongoose');

// Para que muestre un mensaje que el email debe ser unico
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

// Para que en los roles solo permita ADMIN_ROLE  y USER_ROLE
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El email es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    // si es true el usuario se creo por google, si es false no puede autenticarse por google porque
    // uso ese correo de google para registrarse directamente por la app....
    google: { type: Boolean, default: false }
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);