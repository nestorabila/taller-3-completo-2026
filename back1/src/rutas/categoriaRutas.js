const express = require('express');
const router = express.Router();
const {verificarToken} = require('../middleware/token');
const {registrarCategoria, modificarCategoria, listarCategoria, buscarCategoria, eliminarCategoria} = require('../controladores/categoriaControlador')
router.get('/listarCategoria', listarCategoria);
router.post('/registrarCategoria',verificarToken, registrarCategoria);
router.put('/modificarCategoria/:id',verificarToken, modificarCategoria);
router.delete('/eliminarCategoria/:xcod',verificarToken, eliminarCategoria);
router.get('/buscarCategoria',verificarToken, buscarCategoria);
module.exports = router