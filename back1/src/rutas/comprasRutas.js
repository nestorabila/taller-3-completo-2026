const express = require('express');
const router = express.Router();
const {verificarToken} = require('../middleware/token');
const {listarCompra, registrarCompra, modificarCompra, GenerarGrafico, GenerarReporteCompra} = require('../controladores/comprasControlador')
router.get('/listarCompra', verificarToken, listarCompra);
router.post('/registrarCompra',verificarToken, registrarCompra);
router.get('/graficoCompras', verificarToken, GenerarGrafico);
router.get('/reporteCompras', verificarToken, GenerarReporteCompra);
router.put('/modificarCompra/:id', verificarToken, modificarCompra);
module.exports = router