const express = require('express');
const router = express.Router();
const {verificarToken} = require('../middleware/token');
const {listarProducto, registrarProducto,filtrarCategoria,GenerarReporteProducto, modificarProducto,buscarProducto, listarProductoID, eliminarProducto} = require('../controladores/productoControlador')
router.get('/buscarProducto',verificarToken, buscarProducto);
router.get('/listarProdudctoID/:idcategoria',verificarToken, listarProductoID);
router.get('/listarProducto',verificarToken, listarProducto);
router.get('/listarReporteProducto',verificarToken, GenerarReporteProducto)
router.post('/registrarProducto',verificarToken, registrarProducto);
router.get('/filtrarCategoriaProducto', verificarToken, filtrarCategoria);
router.put('/modificarProducto/:id',verificarToken, modificarProducto);
router.delete('/eliminarProducto/:xcod',verificarToken, eliminarProducto);
module.exports = router