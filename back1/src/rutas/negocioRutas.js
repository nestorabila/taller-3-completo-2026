const express = require('express');
const router = express.Router();
const {verificarToken} = require('../middleware/token');

const {registrarLibreria, reenviarCodigoLibreria, cambiarEstadoLibreria, modificarLibreria,listarReporteLibreria, listarLibreriaID, listarLibreria, eliminarLibreria, } = require('../controladores/negocioControlador')
router.get('/listarNegocio/:idpersona', verificarToken, listarLibreriaID);
router.get('/listarNegocioCompleto', listarLibreria);
router.get('/listarReporteLibreria',verificarToken,listarReporteLibreria)
router.post('/registrarNegocio', registrarLibreria);
router.put('/reenviarCodigoLibreria/:id', reenviarCodigoLibreria);
router.put('/cambiarEstadoLibreria/:id', cambiarEstadoLibreria);
router.put('/modificarNegocio/:id',verificarToken,modificarLibreria);
router.delete('/eliminarNegocio/:xcod',verificarToken, eliminarLibreria);
module.exports = router
