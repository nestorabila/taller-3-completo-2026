const express = require('express');
const router = express.Router();
module.exports = router
const {verificarToken} = require('../middleware/token');
const {listarMetodo_Pago, listarPunto_Venta} = require('../controladores/ventaControlador')
router.get('/listarMetodo', verificarToken, listarMetodo_Pago)
