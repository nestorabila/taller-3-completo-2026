const express = require('express');
const router = express.Router();
module.exports = router
const {verificarToken} = require('../middleware/token');
const {listarAuditoria} = require('../controladores/auditoriaControlador')
router.get('/listaAuditoria', verificarToken, listarAuditoria)
