const express = require('express');
const router = express.Router();
const {verificarToken} = require('../middleware/token');
const {listarEmpaque} = require('../controladores/empaqueControlador')
router.get('/listarEmpaque',verificarToken, listarEmpaque);

module.exports = router