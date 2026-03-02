const { db } = require("../config/database");
const rol = require("../modelos/rol");
const { Op } = require('sequelize');
const { registrarAuditoria } = require("../services/auditoriaService");

const listarProductoID = async (req, res) => {
    try {
        const idcategoria = req.params.idcategoria;
        const lista = await db.producto.findAll({
            where: { idcategoria },
            include: { model: db.categoria, as: 'categoria'} 
        });
        return res.json(lista);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al listar librerías' });
    }
};
 const listarProducto = async (req, res) =>{
    try {
        const lista = await db.producto.findAll({
              include: { model: db.categoria, as: 'categoria'} 
        })
        return res.json(lista)
    } catch (error) {
        console.log(error);
        
    }
}
const buscarProducto = async (req, res) => {
    const filtro = req.query.filtro || '';
    try {
        const catalogos = await db.producto.findAll({
          include: {model: db.categoria, as: 'categoria'},
            where: {
                [Op.or]: [
                    { nombre: { [Op.iLike]: `%${filtro}%` } },      // PostgreSQL: insensible a mayúsculas
                
                ]
            }
        });
        res.json(catalogos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al buscar' });
    }
};



const registrarProducto = async (req, res) => {
    try {
        req.body.idcategoria = req.body.categoria?.idcategoria;
        const categoria = await db.producto.create(req.body);
        res.status(201).json(categoria);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar persona' });
    }
};



//modifcar sub caegoria
const modificarProducto = async (req, res) => {
    const id = req.params.id;
    const idpersona = req.user.idpersona;

    try {
         req.body.idcategoria = req.body.categoria?.idcategoria;
         const pedidoOriginal = await db.producto.findByPk(id);
         await registrarAuditoria(
                     "UPDATE",
                     idpersona,
                     pedidoOriginal,
                     req.body
                 );
        await db.producto.update(req.body, { where: { idproducto: id } });
        res.status(200).json({ mensaje: 'modificada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar' });
    }
};

const filtrarCategoria = async (req, res) => {
  try {
    const { idcategoria } = req.query;

    const lista = await db.producto.findAll({
      where: { idcategoria: idcategoria },
      include: {
        model: db.categoria,
        as: 'categoria',
        where: { estado: 0 } 
      }
    });

    return res.json(lista);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: 'Error al filtrar por tipo' });
  }
};


const eliminarProducto = async (req, res) => {
    try {
        const id = req.params.xcod;
        const idpersona = req.user.idpersona;
          const pedidoOriginal = await db.producto.findByPk(id);
            await registrarAuditoria(
                "DELETE",
                idpersona,
                pedidoOriginal,
                req.body
            );
        await db.producto.destroy({ where: { idproducto: id } });
        res.status(200).json({ mensaje: 'cate eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar' });
    }
}

const GenerarReporteProducto = async (req, res) => {
  try {
    const { categoria,nombre,fechaDesde, fechaHasta } = req.query;

    const filtros = {
      where: {},
      include: [
        {
          model: db.categoria, as: "categoria",
          attributes: ['idcategoria', 'nombre']
        },
      ]
    };

    // Filtro por rol (idrol)
    if (categoria) {
      filtros.where.idcategoria = categoria;
    }

    // Filtro por nombre o apellidos (similar a búsqueda por texto)
    if (nombre) {
      filtros.where[Op.or] = [
        { nombre: { [Op.iLike]: `%${nombre}%` } }
      ];
    }
    // Filtro por fecha
    if (fechaDesde && fechaHasta) {
      filtros.where.fecha = {
        [Op.between]: [fechaDesde, fechaHasta]
      };
    } else if (fechaDesde) {
      filtros.where.fecha = {
        [Op.gte]: fechaDesde
      };
    } else if (fechaHasta) {
      filtros.where.fecha = {
        [Op.lte]: fechaHasta
      };
    }

    const resultado = await db.producto.findAll(filtros);
    return res.json(resultado);
  } catch (error) {
    console.error("Error al filtrar productos:", error);
    res.status(500).json({ mensaje: "Error al filtrar productos" });
  }
};

module.exports = {listarProducto,filtrarCategoria, buscarProducto, GenerarReporteProducto, registrarProducto, modificarProducto, eliminarProducto, listarProductoID}