const express = require('express');
const router = express.Router();
const upload = require('../uploads/uploadConfig');
const {verificarToken} = require('../middleware/token');
const {cambiarEstadoCatalogo, GenerarReporteCatalogo, filtrarPorDestacado, filtrarCategoria, listarCatalogo,subirImagen, registrarCatalogo, modificarCatalogo, buscarCatalogo} = require('../controladores/catalogoControlador')
router.get('/listarCatalogo', listarCatalogo);
router.post('/registrarCatalogo',verificarToken, registrarCatalogo);
router.post('/subirImagen', verificarToken, upload.single('imagen'), subirImagen);
router.get('/filtrarPorDestacado', verificarToken, filtrarPorDestacado);
router.get('/listarReporteCatalogo',verificarToken, GenerarReporteCatalogo)
router.get('/filtrarPorTipo', filtrarCategoria);
router.put('/cambiarEstadoCatalogo/:id', verificarToken, cambiarEstadoCatalogo);
router.put('/modificarCatalogo/:id',verificarToken, modificarCatalogo);
router.get('/buscarCatalogo', buscarCatalogo);
module.exports = router