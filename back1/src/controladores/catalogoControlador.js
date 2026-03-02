const { db } = require("../config/database");
const rol = require("../modelos/rol");
const { Op } = require('sequelize');
const { registrarAuditoria } = require("../services/auditoriaService");

const listarCatalogo = async (req, res) =>{
    try {
        const lista = await db.catalogo.findAll({
            include: {model: db.categoria, as:'categoria'}
        })
        return res.json(lista)
    } catch (error) {
        console.log(error);
        
    }
} 



const GenerarReporteCatalogo = async (req, res) => {
  try {
    const { categoria,destacado, nombre, estado, fechaDesde, fechaHasta } = req.query;

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

    // Filtro por estado (1 = Activo, 0 = Inactivo, etc.)
    if (estado) {
      filtros.where.estado = estado;
    };
 // Filtro por novedad (1 = novedad, 0 = sin noverdad.)
    if (destacado) {
      filtros.where.destacado =destacado;
    };
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

    const resultado = await db.catalogo.findAll(filtros);
    return res.json(resultado);
  } catch (error) {
    console.error("Error al filtrar catalogos:", error);
    res.status(500).json({ mensaje: "Error al filtrar catalogos" });
  }
};
// POST: Registrar catalogo
const registrarCatalogo = async (req, res) => {
    try {
        req.body.idcategoria = req.body.categoria?.idcategoria;
        const catalogo = await db.catalogo.create(req.body);
        res.status(201).json(catalogo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar catalogo' });
    }
};

const filtrarPorDestacado = async (req, res) => {
  try {
    const { destacado } = req.query;

    const lista = await db.catalogo.findAll({
      where: { destacado: destacado },
      include: { model: db.categoria , as:'categoria' }
    });

    return res.json(lista);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: 'Error al filtrar por destacado' });
  }
};
const filtrarCategoria = async (req, res) => {
  try {
    const { idtipo } = req.query;

    const lista = await db.catalogo.findAll({
      where: { idcategoria: idtipo },
       include: {
        model: db.categoria,
        as: 'categoria',
        where: { estado: 1 } 
      }
    });

    return res.json(lista);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: 'Error al filtrar por tipo' });
  }
};




const subirImagen = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se subió ninguna imagen' });
    }
    res.status(200).json({ nombre: req.file.filename });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al subir imagen' });
  }
};

// PUT: Modificar catalogo
const modificarCatalogo = async (req, res) => {
    const id = req.params.id;
     const idpersona = req.user.idpersona;
    try {
        req.body.idcategoria = req.body.categoria?.idcategoria;
        const pedidoOriginal = await db.catalogo.findByPk(id);
         await registrarAuditoria(
                     "UPDATE",
                     idpersona,
                     pedidoOriginal,
                     req.body
                 );
        await db.catalogo.update(req.body, { where: { idcatalogo: id } });
        res.status(200).json({ mensaje: 'modificada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar' });
    }
};
const buscarCatalogo = async (req, res) => {
    const filtro = req.query.filtro || '';
    try {
        const catalogos = await db.catalogo.findAll({
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
//  cambiar estado catalogo
const cambiarEstadoCatalogo = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        const nuevoEstado = estado === 0 ? 1 : 0;
        await db.catalogo.update({ estado: nuevoEstado }, { where: { idcatalogo: id } });
        res.status(200).json({ mensaje: 'Estado actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al cambiar estado' });
    }
};


module.exports = {filtrarPorDestacado, filtrarCategoria, listarCatalogo, registrarCatalogo, modificarCatalogo, buscarCatalogo, subirImagen, cambiarEstadoCatalogo, GenerarReporteCatalogo}