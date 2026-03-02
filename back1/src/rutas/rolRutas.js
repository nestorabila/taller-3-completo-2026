const express = require('express');
const router = express.Router();
module.exports = router
const {verificarToken} = require('../middleware/token');
const {listarRol} = require('../controladores/rolControlador')
router.get('/listarRol', verificarToken, listarRol)


