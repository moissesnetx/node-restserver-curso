require('./config/config')


const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

const path = require('path');

const app = express();

//const port = process.env.PORT || 3000;
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


// habilitar la carpeta public
const pashd = path.resolve(__dirname, '../public')
app.use(express.static(pashd))


// CONFIGURACION GLOBAL DE RUTAS
app.use(require('./routes/index'));



mongoose.connect(process.env.URLDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, (err, resp) => {
    if (err) throw err;
    console.log('Base de datos ONLINE');
});


app.listen(process.env.PORT, () => {
    console.log(`Escuchando puerto: ${process.env.PORT}`);
});