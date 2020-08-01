const express = require('express');
const { verificaToken, verificaRole } = require('../middlewares/autenticacion');
const _ = require('underscore');

const app = express();

const Categoria = require('../models/categoria');

// ===============================
// Mostrar todas las categorias
// ===============================

app.get('/categoria', (req, res) => {

    Categoria.find({}, 'descripcion')
        .sort('descripcion') // ordena la respuesta segun el campo expecificado
        .populate('usuario', 'nombre email') // para mostar los datos de la coleccion ref
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
// Mostrar todas las categorias Por Usuario
// ===============================

app.get('/categoriaUsuario', verificaToken, (req, res) => {
    let idUsuario = req.usuario._id;
    Categoria.find({ usuario: idUsuario }, 'descripcion').exec((err, categorias) => {
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
// Mostrar Una categoria por ID
// ===============================

app.get('/categoria/:id', (req, res) => {
    let id = req.params.id;

    Categoria.findById(id, 'descripcion', (err, categoria) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!categoria) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Registro no localizado'
                }
            });

        }
        res.status(200).json({
            ok: true,
            categoria
        });
    });
});

// ===============================
// Crear nueva categoria
// ===============================

app.post('/categoria', verificaToken, (req, res) => {

    let idUsuario = req.usuario._id;
    let body = req.body;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: idUsuario
    });

    categoria.save((err, categoriaBD) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.status(200).json({
            ok: true,
            categoria: categoriaBD
        });
    });
});


// ===============================
// Actualizar categoria
// ===============================

app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let idusua = req.usuario._id;
    let body = _.pick(req.body, ['descripcion']);
    body.usuario = idusua;

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaBD) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBD
        });
    });

});

// ===============================
// eliminar la categoria
// ===============================

app.delete('/categoria/:id', [verificaToken, verificaRole], (req, res) => {
    let id = req.params.id;
    Categoria.findByIdAndDelete(id, (err, result) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!result) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        }
        res.status(200).json({
            ok: true,
            categoria: {
                result,
                message: 'Categoria Borrada'
            }
        })
    });
});

module.exports = app;