const express = require('express');
const { verificaToken, verificaRole } = require('../middlewares/autenticacion');
const _ = require('underscore');

const Producto = require('../models/producto');
const { json } = require('body-parser');

const app = express();


// ===============================
// Crear nueva producto
// ===============================

app.post('/producto', verificaToken, (req, res) => {

    let idUsuario = req.usuario._id; // Usuario extraido de la validacion del token
    let body = req.body; // datos que se van a guardar

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.value,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: idUsuario
    });

    producto.save((err, productoBD) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.status(200).json({
            ok: true,
            producto: productoBD
        });
    });
});


// ===============================
// Mostrar todas las productos
// ===============================

app.get('/producto', verificaToken, (req, res) => {
    // const consul = req.query.consul || ''
    Producto.find({}, 'nombre descripcion precioUni disponible')
        .sort('nombre descripcion ') // ordena la respuesta segun el campo expecificado
        .populate('usuario', 'nombre email') // para mostar los datos de la coleccion ref
        .populate('categoria', 'descripcion') // para mostar los datos de la coleccion ref
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.status(200).json({
                ok: true,
                categorias
            });
        });
});

// ===============================
// Mostrar busqueda por parametro
// ===============================

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let consul = req.params.termino

    let regex = new RegExp(consul, 'i');


    Producto.find({ nombre: regex }, 'nombre descripcion precioUni disponible')
        .sort('nombre descripcion ') // ordena la respuesta segun el campo expecificado
        .populate('usuario', 'nombre email') // para mostar los datos de la coleccion ref
        .populate('categoria', 'descripcion') // para mostar los datos de la coleccion ref
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.status(200).json({
                ok: true,
                categorias
            });
        });
});


// ===============================
// Mostrar un producto
// ===============================

app.get('/producto/:id', verificaToken, (req, respu) => {
    let idp = req.params.id;

    Producto.find({ _id: idp })
        .populate('usuario', 'nombre email') // para mostar los datos de la coleccion ref
        .populate('categoria', 'descripcion') // para mostar los datos de la coleccion ref
        .exec((err, productoDB) => {
            if (err) {
                return respu.status(400).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB) {
                return respu.status(401).json({
                    ok: false,
                    err: {
                        message: 'Producto no localizado'
                    }
                });
            }
            respu.status(200).json({
                ok: true,
                producto: productoDB
            });
        });

});

// ===============================
// Actualizar un producto
// ===============================

app.put('/producto/:id', [verificaToken, verificaRole], (req, respuesta) => {

    let idp = req.params.id;
    let idUs = req.usuario._id;

    let body = _.pick(req.body, ['nombre', 'descripcion', 'disponible', 'categoria', 'precioUni']);

    Producto.findByIdAndUpdate(idp, body, { new: true, runValidators: true, useFindAndModify: false }, (err, productoBD) => {
        if (err) {
            return respuesta.status(400).json({
                ok: false,
                err
            });
        }
        if (!productoBD) {
            return respuesta.status(401), json({
                ok: false,
                err: {
                    message: 'Producto no localizado para modificar'
                }
            });
        }
        respuesta.status(200).json({
            ok: true,
            producto: productoBD
        });
    });
});


// ===============================
// Eliminar un producto
// ===============================
app.delete('/producto/:id', verificaToken, (req, respuesta) => {
    let idp = req.params.id;

    Producto.findById(idp, (err, productoBD) => {
        if (err) {
            return respuesta.status(400).json({
                ok: false,
                err
            });
        }
        if (!productoBD) {
            return respuesta.status(401).json({
                ok: false,
                err: {
                    message: 'Producto no localizado'
                }
            });
        }
        productoBD.disponible = false;

        productoBD.save((err, productoBorrado) => {
            respuesta.status(200).json({
                ok: true,
                producto: {
                    nombre: productoBorrado.nombre,
                    descripcion: productoBorrado.descripcion
                },
                message: 'Producto No Dispponible'
            })
        });
    });




    // let campMod = {
    //     disponible: false
    // }


    // Producto.findByIdAndUpdate(idp, campMod, { useFindAndModify: false }, (err, productoBD) => {
    //     if (err) {
    //         return respuesta.status(400).json({
    //             ok: false,
    //             err
    //         });
    //     }
    //     if (!productoBD) {
    //         return respuesta.status(401).json({
    //             ok: false,
    //             err: {
    //                 message: 'Producto no localizado'
    //             }
    //         });
    //     }
    //     respuesta.status(200).json({
    //         ok: true,
    //         producto: {
    //             nombre: productoBD.nombre,
    //             descripcion: productoBD.descripcion
    //         },
    //         message: 'Producto Desactivado'
    //     })
    // });

});



module.exports = app;