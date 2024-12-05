const express = require('express') // Carga express
const router = express.Router() // Carga el router de express
const Producto = require('../models/productos') //Carga el modelo de agregar productos
const multer = require('multer') //Carga el modulo de multer
const path = require('path') //Carga la carpeta de upload para guardar lo que se suba.
const fs = require('fs') //Carga el modulo de fs para borrar imagenes
const { resourceLimits } = require('worker_threads')
const carpetaUpload = path.join(__dirname, '../upload') //Carpeta de upload

var storage = multer.diskStorage({
    destination:function (req, file, cb) {
        cb(null, carpetaUpload)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname) 
    }
})

var upload = multer({
    storage: storage
}).single("imagen")

router.get ('/', async(req, res) => {

    try{
        const productos = await Producto.find()
        res.render('index', {titulo: 'Inicio', productos: productos})
    }
    catch (error){
        res.json({message: error.message})
    }
})

//Agregar
router.get ('/agregar', (req, res) => {
    res.render('agregarproducto', {titulo: 'Agregar Productos'})
}) //Ruta para agregar productos


router.post('/agregar', upload, (req, res) => {
    const producto = new Producto({
        articulo: req.body.articulo,
        descripcion: req.body.descripcion,
        stock: req.body.stock,
        precio: req.body.precio,
        imagen: req.file.filename
    })

    producto.save().then(() => {
        req.session.message = {
            message: 'Producto agregado correctamente!',
            type: 'success'
        }
        res.redirect('/')
    }).catch((error) => {
        res.json({
            message: error.message,
            type: 'danger'
        })
    })
})

//Editar
router.get('/editar/:id', async(req, res) => {
    const id = req.params.id

    try{
        const producto = await Producto.findById(id)

        if(producto == null){
            res.redirect('/')
        }
        else{
            res.render('editarproducto', {
                titulo: 'Editar Producto', 
                productos: producto
            })
        }
    }
    catch (error){
        res.status(500).send()
    }
})

router.post('/editar/:id', upload, async(req, res) => {
    const id = req.params.id
    let new_image = '' 

    if(req.file){
        new_image = req.file.filename

        try {
            fs.unlinkSync('./upload/' + req.body.old_image)
        }
        catch (error){
            console.log(error)
        }
    }
    else{
        new_image = req.body.old_image
    }
    try{
        await Producto.findByIdAndUpdate(id, {
            articulo: req.body.articulo,
            descripcion: req.body.descripcion,
            stock: req.body.stock,
            precio: req.body.precio,
            imagen: new_image
        })

        req.session.message = {
            message: 'Producto actualizado correctamente!',
            type: 'success'
        }

        res.redirect('/')
    }
    catch (error){
        res.json({
            message: error.message,
            type: 'danger'
        })
    }
})

//Eliminar
router.get('/eliminar/:id', async(req, res) => {
    const id = req.params.id

    try{
        const producto = await Producto.findByIdAndDelete(id)

        if(producto != null && producto.imagen != '') {
             try{
                fs.unlinkSync('./upload/' + resourceLimits.imagen)
            }
            catch (error){
                console.log(error)
            }
        }

        req.session.message = {
            message: 'Producto eliminado correctamente!',
            type: 'info'
        }
        res.redirect('/')
    }
        catch (error){  
            res.json({
                message: error.message,
                type: 'danger'
            }) 
    }
})


module.exports = router //Exporta el router