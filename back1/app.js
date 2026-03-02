
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config()

const allowedOrigins = [
  'https://creacioneslucianitav7.onrender.com',
  'http://localhost:4200',
  'http://localhost:4300',
  'http://192.168.0.64:4300',
  'capacitor://localhost',
  'https://localhost'
];

app.use(cors({
  origin: function(origin, callback) {
    
    if (!origin) {
   
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
   
      return callback(null, true);
    } else {
      console.warn(`❌ Origen NO permitido: ${origin}`);
      return callback(new Error('CORS Error: Origen no permitido - ' + origin), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}))

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'");
    next();
});

//cualquier api que hagas al servidor siempre va pasar pruimero por este archivo app.js de aqui se rediriguen a las rutas
app.get('/', (req, res) => {
    res.send('API de luci funcionando correctamente');
});
// Middleware para analizar JSON
app.use(express.json());//para que sis se envia json del cliente el servidor lo entienda
app.use(express.urlencoded({ extended: true}))
// app - rutas(aproabdo por token) - recienpasa a controladores
const personaRoute = require('./src/rutas/personaRutas')
app.use('/api',personaRoute)

const productoRoute = require('./src/rutas/productoRutas')
app.use('/api',productoRoute)

const pagoRoute = require('./src/rutas/pagoRutas')
app.use('/api',pagoRoute)

const pedidoRoute = require('./src/rutas/pedidosRutas')
app.use('/api',pedidoRoute)

const facturaRoute = require('./src/rutas/facturacionRutas')
app.use('/api',facturaRoute)

const ventaRoute = require('./src/rutas/ventaRutas')
app.use('/api',ventaRoute)

const pedidodetRoute = require('./src/rutas/detallePedidoRutas')
app.use('/api',pedidodetRoute)

const audiRoute = require('./src/rutas/auditoriaRutas')
app.use('/api',audiRoute)

const empaqueRoute = require('./src/rutas/empaqueRutas')
app.use('/api',empaqueRoute)

const ciudadRoute = require('./src/rutas/ciudadRutas')
app.use('/api',ciudadRoute)
// Servir imágenes públicamente desde esta ruta:
app.use('/imagenPersona', express.static(path.join(__dirname, './src/uploads/imgPersona')));
// Servir imágenes públicamente desde esta ruta:
app.use('/imagenes', express.static(path.join(__dirname, './src/uploads/imgCatalogo')));

const rolRoute = require('./src/rutas/rolRutas')
app.use('/api',rolRoute)

const credencialRoute = require('./src/rutas/credencialRutas')
app.use('/api',credencialRoute)

const negocioRoute = require('./src/rutas/negocioRutas')
app.use('/api',negocioRoute)

const compraRoute = require('./src/rutas/comprasRutas')
app.use('/api',compraRoute)

const detCompraRoute = require('./src/rutas/detalleCompraRutas')
app.use('/api',detCompraRoute)

const CategoriaRoute = require('./src/rutas/categoriaRutas')
app.use('/api',CategoriaRoute)

const ProveedorRoute = require('./src/rutas/proveedorRutas')
app.use('/api',ProveedorRoute)

const CatalogoRoute = require('./src/rutas/catalogoRutas')
app.use('/api',CatalogoRoute)

const SistemaRoute = require('./src/rutas/sistemaRutas')
app.use('/api',SistemaRoute)

const LoginRoute = require('./src/rutas/IniciarSesionRutas')
app.use('/api',LoginRoute)

const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
