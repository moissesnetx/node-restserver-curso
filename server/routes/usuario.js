const express = require('express');
const bcrypt = require('bcrypt'); // encriptamos la contraseña
const _ = require('underscore');
const Usuario = require('../models/usuario')
const { verificaToken, verificaRole } = require('../middlewares/autenticacion')

const app = express();

app.get('/usuario', verificaToken, (req, res) => {

    // ACA demuestra que yo puedo tener la informacion del usuario que esta utilizando el token o realizando la solicitud
    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email
    // });


    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({}, 'nombre email role estado img google')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.count({}, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            });

        });
});

app.post('/usuario', [verificaToken, verificaRole], (req, res) => {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });


});

app.put('/usuario/:idusua', [verificaToken, verificaRole], (req, res) => {

    let id = req.params.idusua;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioBD) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        res.json({
            ok: true,
            usuario: usuarioBD
        });
    });


});

app.delete('/usuario/:id', [verificaToken, verificaRole], (req, res) => {

    let id = req.params.id;

    // //// voy a validar si el registro ya esta desactivado para no actualizar
    // Usuario.findById(id, (err, usuarioBD) => {
    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 message: "Id no localizado"
    //             }
    //         });
    //     }
    // });


    let cambiaEstado = {
        estado: false
    }
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioDelete) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioDelete) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario no encontrado"
                }
            });
        }

        res.json({
            ok: true,
            usuarios: usuarioDelete
        });
    });


    /////  Con este codigo borramos el registro completamente de la base datos

    // Usuario.findByIdAndRemove(id, (err, usuariodelete) => {
    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         });
    //     }

    //     if (!usuariodelete) {
    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 message: "Usuario no encontrado"
    //             }
    //         });
    //     }

    //     res.json({
    //         ok: true,
    //         usuario: usuariodelete
    //     });

    // });

});

module.exports = app;