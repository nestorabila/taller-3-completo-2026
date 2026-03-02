const express = require('express');
const router = express.Router();
const {verificarToken} = require('../middleware/token');
const {listarNegocio,listarNegocioDTO, modificarNegocio} = require('../controladores/sistemaControlador')
router.get('/listarSistema',verificarToken, listarNegocio);
router.get('/listarSistemaDTO',listarNegocioDTO);
router.put('/modificarSistema/:id',verificarToken, modificarNegocio);
module.exports = router