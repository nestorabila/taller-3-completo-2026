var DataTypes = require("sequelize").DataTypes;
var _auditoria = require("./auditoria");
var _catalogo = require("./catalogo");
var _categoria = require("./categoria");
var _ciudad = require("./ciudad");
var _compra = require("./compra");
var _credencial = require("./credencial");
var _departamento = require("./departamento");
var _detalle_compra = require("./detalle_compra");
var _detalle_pedido = require("./detalle_pedido");
var _empaque = require("./empaque");
var _genero = require("./genero");
var _libreria = require("./libreria");
var _metodo_pago = require("./metodo_pago");
var _negocio = require("./negocio");
var _pedido = require("./pedido");
var _persona = require("./persona");
var _producto = require("./producto");
var _proveedor = require("./proveedor");
var _rol = require("./rol");
var _rol_persona = require("./rol_persona");
var _venta = require("./venta");
var _pago = require("./pago");

function initModels(sequelize) {
  var auditoria = _auditoria(sequelize, DataTypes);
  var catalogo = _catalogo(sequelize, DataTypes);
  var categoria = _categoria(sequelize, DataTypes);
  var ciudad = _ciudad(sequelize, DataTypes);
  var compra = _compra(sequelize, DataTypes);
  var credencial = _credencial(sequelize, DataTypes);
  var departamento = _departamento(sequelize, DataTypes);
  var detalle_compra = _detalle_compra(sequelize, DataTypes);
  var detalle_pedido = _detalle_pedido(sequelize, DataTypes);
  var empaque = _empaque(sequelize, DataTypes);
  var genero = _genero(sequelize, DataTypes);
  var libreria = _libreria(sequelize, DataTypes);
  var metodo_pago = _metodo_pago(sequelize, DataTypes);
  var negocio = _negocio(sequelize, DataTypes);
  var pedido = _pedido(sequelize, DataTypes);
  var pago = _pago(sequelize, DataTypes);
  var persona = _persona(sequelize, DataTypes);
  var producto = _producto(sequelize, DataTypes);
  var proveedor = _proveedor(sequelize, DataTypes);
  var rol = _rol(sequelize, DataTypes);
  var rol_persona = _rol_persona(sequelize, DataTypes);
  var venta = _venta(sequelize, DataTypes);

  persona.belongsToMany(rol, { as: 'rol', through: rol_persona, foreignKey: "idpersona", otherKey: "idrol" });
  rol.belongsToMany(persona, { through: rol_persona, foreignKey: "idrol", otherKey: "idpersona" });
  detalle_pedido.belongsTo(catalogo, {  foreignKey: "idcatalogo"});
  catalogo.hasMany(detalle_pedido, {  foreignKey: "idcatalogo"});
  catalogo.belongsTo(categoria, {  foreignKey: "idcategoria", as: "categoria"});
  categoria.hasMany(catalogo, {  foreignKey: "idcategoria"});
  producto.belongsTo(categoria, {  foreignKey: "idcategoria", as: "categoria"});
  categoria.hasMany(producto, {  foreignKey: "idcategoria"});
  libreria.belongsTo(ciudad, {  foreignKey: "idciudad"});
  ciudad.hasMany(libreria, {  foreignKey: "idciudad"});
  negocio.belongsTo(ciudad, {  foreignKey: "idciudad"});
  ciudad.hasOne(negocio, {  foreignKey: "idciudad"});
  proveedor.belongsTo(ciudad, {  foreignKey: "idciudad"});
  ciudad.hasMany(proveedor, {  foreignKey: "idciudad"});
  detalle_compra.belongsTo(compra, {  foreignKey: "idcompra"});
  compra.hasMany(detalle_compra, {  foreignKey: "idcompra"});
  ciudad.belongsTo(departamento, {  foreignKey: "iddep"});
  departamento.hasMany(ciudad, {  foreignKey: "iddep"});
  detalle_compra.belongsTo(empaque, {  foreignKey: "idempaque"});
  empaque.hasMany(detalle_compra, {  foreignKey: "idempaque"});
  persona.belongsTo(genero, {  foreignKey: "idgenero"});
  genero.hasMany(persona, {  foreignKey: "idgenero"});
  pedido.belongsTo(libreria, { foreignKey: "idlibreria",as: "libreria"});
  libreria.hasMany(pedido, {  foreignKey: "idlibreria"});
  venta.belongsTo(metodo_pago, {  foreignKey: "idmetodo"});
  metodo_pago.hasMany(venta, {  foreignKey: "idmetodo"});
  detalle_pedido.belongsTo(pedido, {  foreignKey: "idpedido"});
  pedido.hasMany(detalle_pedido, {  foreignKey: "idpedido"});
  venta.belongsTo(pedido, {  foreignKey: "idpedido"});
  pedido.hasMany(venta, { foreignKey: "idpedido"});
  auditoria.belongsTo(persona, {  foreignKey: "idpersona"});
  persona.hasMany(auditoria, {  foreignKey: "idpersona"});
  credencial.belongsTo(persona, {  foreignKey: "idpersona"});
  persona.hasOne(credencial, {  foreignKey: "idpersona"});
  libreria.belongsTo(persona, {  foreignKey: "idpersona"});
  persona.hasMany(libreria, {  foreignKey: "idpersona"});
  pedido.belongsTo(persona, {  foreignKey: "idpersona"});
  persona.hasMany(pedido, {  foreignKey: "idpersona"});
  proveedor.belongsTo(persona, {  foreignKey: "idpersona"});
  persona.hasOne(proveedor, {  foreignKey: "idpersona"});
  rol_persona.belongsTo(persona, {  foreignKey: "idpersona"});
  persona.hasMany(rol_persona, {  foreignKey: "idpersona"});
  venta.belongsTo(persona, { foreignKey: "idpersona"});
  persona.hasMany(venta, {  foreignKey: "idpersona"});
  detalle_compra.belongsTo(producto, {  foreignKey: "idproducto"});
  producto.hasMany(detalle_compra, { foreignKey: "idproducto"});
  compra.belongsTo(proveedor, {  foreignKey: "idproveedor"});
  proveedor.hasMany(compra, {  foreignKey: "idproveedor"});
  rol_persona.belongsTo(rol, {  foreignKey: "idrol"});
  rol.hasMany(rol_persona, { foreignKey: "idrol"});
  // Relación con Pedido
pago.belongsTo(pedido, { foreignKey: "idpedido" });
pedido.hasMany(pago, { foreignKey: "idpedido" });

// Relación con Persona (quien registró el pago)
pago.belongsTo(persona, { foreignKey: "idpersona" });
persona.hasMany(pago, { foreignKey: "idpersona" });

// Relación con MetodoPago
pago.belongsTo(metodo_pago, { foreignKey: "idmetodo" });
metodo_pago.hasMany(pago, { foreignKey: "idmetodo" });


  return {
    auditoria,
    catalogo,
    categoria,
    ciudad,
    compra,
    credencial,
    departamento,
    detalle_compra,
    detalle_pedido,
    empaque,
    genero,
    libreria,
    metodo_pago,
    negocio,
    pedido,
    persona,
    producto,
    proveedor,
    rol,
    rol_persona,
    venta,
    pago,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
