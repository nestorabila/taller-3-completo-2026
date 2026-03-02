const express = require('express');
const router = express.Router();
const {verificarToken} = require('../middleware/token');
const {listarDetalleCompra, eliminarDetCompra, modificarDetalleCompra, registrarDetalleCompra, listarDetalleCompraID} = require('../controladores/detalle_compraControlador')
router.get('/listarDetalleCompra', verificarToken, listarDetalleCompra);
router.get('/listarDetalleCompraID/:idcompra',verificarToken, listarDetalleCompraID);
router.post('/registrarDetalleCompra',verificarToken, registrarDetalleCompra);
router.put('/modificarDetalleCompra/:id', verificarToken, modificarDetalleCompra);
router.delete('/eliminarDetCompra/:xcod',verificarToken, eliminarDetCompra);
module.exports = router