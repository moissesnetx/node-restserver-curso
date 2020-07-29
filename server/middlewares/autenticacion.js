const jwt = require('jsonwebtoken'); // libreria para el token


// =======================
// Verificar Token
// =======================


let verificaToken = (req, res, next) => {

    let token = req.get('token'); // leer los headers de la solicitud

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no Valido'
                }
            });
        }
        req.usuario = decoded.usuario;
        next();
    });




};

// =======================
// Verificar Administrador
// =======================

let verificaRole = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(400).json({
            ok: false,
            err: {
                message: "Usuario sin Privilegio ADMIN"
            }
        });
    }

}


module.exports = {
    verificaToken,
    verificaRole
}