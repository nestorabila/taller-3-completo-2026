const express = require('express');
const router = express.Router();
const {verificarToken} = require('../middleware/token');
const {listarDetallePedido, listarDetallePedidoID, registrarDetallePedido,cambiarEstadoDetPedido, modificarDetallePedido, eliminarDetPedido} = require('../controladores/detalle_pedidoControlador')
router.get('/listarDetallePedido', verificarToken, listarDetallePedido);
router.get('/listarDetallePedidoID/:idpedido',verificarToken, listarDetallePedidoID);
router.post('/registrarDetallePedido',verificarToken, registrarDetallePedido);
router.put('/modificarDetallePedido/:id', verificarToken, modificarDetallePedido);
router.put('/cambiarEstadoDetPedido/:id', verificarToken, cambiarEstadoDetPedido);
router.delete('/eliminarDetPedido/:xcod',verificarToken, eliminarDetPedido);
module.exports = router