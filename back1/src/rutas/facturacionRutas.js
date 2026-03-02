const express = require('express');
const router = express.Router();
const upload = require('../uploads/uploadConfig');
const path = require('path');
const fs = require('fs');
const {verificarToken} = require('../middleware/token');
const {listarVenta,GenerarReporteVenta, anularVenta, buscarVenta,  registrarVenta} = require('../controladores/facturacionControlador')
router.get('/listarFactura', verificarToken, listarVenta);
router.post('/registrarFactura',verificarToken, registrarVenta);
router.put('/anularFactura/:xcod',verificarToken, anularVenta);
router.get('/buscarFactura',verificarToken, buscarVenta);
router.get('/listarReporteFactura',verificarToken,GenerarReporteVenta)

router.get('/factura/:idfactura/pdf', verificarToken, (req, res) => {
  const { idfactura } = req.params;

  // Ruta de la carpeta donde guardas las facturas
  const carpeta = path.join(__dirname, '../facturas_xml');
  const rutaArchivoPDF = path.join(carpeta, `factura_${idfactura}.pdf`);

  if (fs.existsSync(rutaArchivoPDF)) {
    res.download(rutaArchivoPDF, `factura_${idfactura}.pdf`);
  } else {
    res.status(404).json({ error: 'Factura no encontrada' });
  }
});
module.exports = router