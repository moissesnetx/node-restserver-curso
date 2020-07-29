const express = require('express');
const bcrypt = require('bcrypt'); // encriptamos la contraseña
const jwt = require('jsonwebtoken'); // es para general el TOKEN
const Usuario = require('../models/usuario')

const app = express();


app.post('/login', (req, res) => {


    let body = req.body;


    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }


        let token = jwt.sign({
            usuario: usuarioBD
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); // 60 (seg) * 60 (min) * 24 (hor) * 30 (dia) vencimiento del token

        res.json({
            ok: true,
            usuario: usuarioBD,
            token: token
        });

    });

});


module.exports = app;