const express = require('express');
const router = express.Router();
const Producto = require('../models/productos');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const carpetaUpload = path.join(__dirname, '../upload');

// Configuración de Multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, carpetaUpload); // Carpeta donde se guardarán los archivos
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const originalName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${timestamp}_${originalName}`);
    }
});

var upload = multer({
    storage: storage
}).single("imagen");


// Ruta principal
router.get('/', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.render('index', { titulo: 'Inicio', productos: productos });
    } catch (error) {
        res.json({ message: error.message });
    }
});

// Agregar producto
router.get('/agregar', (req, res) => {
    res.render('agregarproducto', { titulo: 'Agregar Productos' });
});

router.post('/agregar', upload, async (req, res) => {
    const producto = new Producto({
        articulo: req.body.articulo,
        descripcion: req.body.descripcion,
        stock: req.body.stock,
        precio: req.body.precio,
        imagen: req.file ? req.file.filename : ''
    });

    try {
        await producto.save();
        req.session.message = {
            message: 'Producto agregado correctamente!',
            type: 'success'
        };
        res.redirect('/');
    } catch (error) {
        res.json({ message: error.message, type: 'danger' });
    }
});

// Editar producto
router.get('/editar/:id', async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) {
            return res.redirect('/');
        }
        res.render('editarproducto', { titulo: 'Editar Producto', productos: producto });
    } catch (error) {
        res.status(500).send();
    }
});

router.post('/editar/:id', upload, async (req, res) => {
    const id = req.params.id;
    let new_image = '';
    const old_image = req.body.old_image; // Nombre de la imagen anterior

    if (req.file) {
        new_image = req.file.filename;

        // Elimina la imagen antigua
        try {
            const oldImagePath = path.join(carpetaUpload, old_image); // Ruta de la imagen vieja
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath); // Elimina la imagen
            }
        } catch (error) {
            console.log('Error eliminando imagen anterior:', error);
        }
    } else {
        new_image = old_image; // Si no hay una nueva imagen, mantiene la anterior.
    }

    try {
        // Actualiza el producto
        await Producto.findByIdAndUpdate(id, {
            articulo: req.body.articulo,
            descripcion: req.body.descripcion,
            stock: req.body.stock,
            precio: req.body.precio,
            imagen: new_image
        });

        req.session.message = {
            message: 'Producto actualizado correctamente!',
            type: 'success'
        };
        res.redirect('/');
    } catch (error) {
        res.json({ message: error.message, type: 'danger' });
    }
});

// Eliminar producto
router.get('/eliminar/:id', async (req, res) => {
    try {
        const producto = await Producto.findByIdAndDelete(req.params.id);

        if (producto && producto.imagen) {

            // Elimina imagen del producto
            try {
                const imagePath = path.join(carpetaUpload, producto.imagen);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            } catch (error) {
                console.log('Error eliminando imagen:', error);
            }
        }

        req.session.message = {
            message: 'Producto eliminado correctamente!',
            type: 'info'
        };
        res.redirect('/');
    } catch (error) {
        res.json({ message: error.message, type: 'danger' });
    }
});

module.exports = router;