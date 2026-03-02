const express = require('express');
const router = express.Router();
const {verificarToken} = require('../middleware/token');
const {listarPedido, registrarPedido,ReportePedidosProximos, modificarPedido, GenerarReportePedido, cambiarEstadoPedido, buscarPedidos, listarPedidosFiltradas} = require('../controladores/pedidosControlador')
router.get('/listarPedido', verificarToken, listarPedido);
router.post('/registrarPedido',verificarToken, registrarPedido);
router.put('/modificarPedido/:id', verificarToken, modificarPedido);
router.get('/listarReportePedido',verificarToken, GenerarReportePedido)
router.get('/reportePedidosProximos', verificarToken, ReportePedidosProximos);

router.put('/cambiarEstadoPedido/:id', verificarToken, cambiarEstadoPedido);
router.get('/buscarPedido', verificarToken, buscarPedidos);
router.get('/listarPedidoFiltradas',verificarToken, listarPedidosFiltradas)
module.exports = router