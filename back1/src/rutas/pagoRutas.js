const express = require('express');
const router = express.Router();
const {verificarToken} = require('../middleware/token');
const {listarPago,registrarPago,GenerarReportePago, cambiarEstadoPago, buscarPago} = require('../controladores/pagoControlador')
router.get('/listarPago', verificarToken, listarPago);
router.post('/registrarPago',verificarToken, registrarPago);
router.get('/buscarPago', verificarToken, buscarPago);
router.get('/listarReportePago',verificarToken, GenerarReportePago)
router.put('/cambiarEstadoPago/:id', verificarToken, cambiarEstadoPago);
module.exports = router