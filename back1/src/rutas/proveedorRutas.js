const express = require('express');
const router = express.Router();
const {verificarToken} = require('../middleware/token');
const {listarProveedor, registrarProveedor, modificarProveedor, eliminarProveedor, buscarProveedor} = require('../controladores/proveedorControlador')
router.get('/listarProveedor',verificarToken, listarProveedor);
router.post('/registrarProveedor',verificarToken, registrarProveedor);
router.put('/modificarProveedor/:id',verificarToken, modificarProveedor);
router.delete('/eliminarProveedor/:xcod',verificarToken, eliminarProveedor);
router.get('/buscarProveedor',verificarToken, buscarProveedor);
module.exports = router