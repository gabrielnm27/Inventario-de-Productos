require('dotenv').config() 
const express = require('express') // Carga express
const mongoose = require('mongoose')   // Carga mongoose
const session = require('express-session') // Carga express-session
const router = require('../routes/routes') // Carga el router de express
const app = express (); // Crea la aplicación express
const PORT = process.env.PORT || 4000 // Trae el puerto 3000 del archivo .env y si no lo encuentra asigna el 4000.

// Conectar a la base de datos
mongoose.connect (process.env.DB_URI)
const db = mongoose.connection;
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Conectado a la base de datos'))

// Middleware
app.use(express.urlencoded ( {extended: false} )) // Permite a la aplicación leer datos de formularios
app.use(express.json()) // Permite a la aplicación leer datos JSON

app.use(session({
    secret: 'palabra clave',
    saveUninitialized: true,
    resave: false
}))

app.use ((req, res, next) => {
    res.locals.message = req.session.message
    delete req.session.message
    next()
})

app.use(express.static('upload'))

//Configurar motor de plantillas

app.set('view engine', 'ejs')

app.use('/', router)

app.listen(PORT, () => {
    console.log( `Servidor iniciado en http://localhost: ${PORT}`)
})

