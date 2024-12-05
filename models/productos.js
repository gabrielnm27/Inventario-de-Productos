const mongoose = require('mongoose'); // Carga mongoose

const productoSchema = new mongoose.Schema({
    
    articulo: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    imagen: {
        type: String,
        required: true
    },
    creado: {
        type: Date,
        required: true,
        default: Date.now
    }
})

const Producto = mongoose.model('Producto', productoSchema)
module.exports = Producto