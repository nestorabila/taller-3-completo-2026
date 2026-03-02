const { db } = require("../config/database");
const { Op } = require('sequelize');
const { fn, col, literal } = require('sequelize');
const { registrarAuditoria } = require("../services/auditoriaService");

const listarCompra = async (req, res) => {
  try {
    const lista = await db.compra.findAll({
      attributes: {
        include: [
          [fn("SUM", col("detalle_compras.precio_t")), "precio_total"]
        ]
      },
      include: [
        {
          model: db.proveedor
        },
        {
          model: db.detalle_compra,
          attributes: [] // No traemos los detalles, solo los usamos para sumar
        }
      ],
      group: ['compra.idcompra', 'proveedor.idproveedor']
    });

    return res.json(lista);
  } catch (error) {
    console.log("Error en listarCompra:", error);
    res.status(500).json({ mensaje: "Error al listar compras con total" });
  }
};
const GenerarGrafico = async (req, res) => {
  try {
    const { periodo } = req.query; // opcional: 'mes' o 'dia'

    const agruparPor = periodo === 'mes'
  ? literal(`TO_CHAR("fecha", 'YYYY-MM')`)        // Agrupa por mes
  : literal(`TO_CHAR("fecha", 'YYYY-MM-DD')`);    // Agrupa por día


    const datos = await db.compra.findAll({
      attributes: [
        [agruparPor, 'periodo'],
        [fn('SUM', col('detalle_compras.precio_t')), 'precio_total']
      ],
      include: [{
        model: db.detalle_compra,
        attributes: []
      }],
      group: [literal('periodo')],
      order: [[literal('periodo'), 'ASC']],
      raw: true
    });

    res.json(datos);
  } catch (error) {
    console.error("Error al obtener datos para gráfico:", error);
    res.status(500).json({ mensaje: "Error al obtener datos para gráfico" });
  }
};

const GenerarReporteCompra = async (req, res) => {
  try {
    const {nombre, fechaDesde, fechaHasta } = req.query;

    const filtros = {
      attributes: {
        include: [
          [fn("SUM", col("detalle_compras.cantidad_t")), "cantidad_total"],
          [fn("SUM", col("detalle_compras.precio_t")), "precio_total"]
        ]
      },
      where: {},
      include: [
        {
          model: db.proveedor,
          include: [
            {
              model: db.persona,
            }
          ]
        },
        {
          model: db.detalle_compra,
          attributes: []
        }
      ],
      group: ['compra.idcompra', 'proveedor.idproveedor', 'proveedor->persona.idpersona',
        
      ],
      raw: false
    };

   // Filtro por idcompra (numérico)
if (nombre) {
  filtros.where = {
    idcompra: Number(nombre)
  };
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

    const resultado = await db.compra.findAll(filtros);
    return res.json(resultado);
  } catch (error) {
    console.error("Error al filtrar compras:", error);
    res.status(500).json({ mensaje: "Error al filtrar compras 500" });
  }
};

const registrarCompra = async (req, res) => {
  
    try {
      const idpersona = req.user.idpersona;
        req.body.idproveedor = req.body.proveedor?.idproveedor;
        const detcompra = await db.compra.create(req.body);
        await registrarAuditoria(
          "INSERT",
          idpersona,  
          null,         
          detcompra    
      );
        res.status(201).json(detcompra);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar persona' });
    }
};

// PUT: Modificar compra
const modificarCompra = async (req, res) => {
    const id = req.params.id;
    const idpersona = req.user.idpersona;
    try {
        req.body.idproveedor = req.body.proveedor?.idproveedor;
        const pedidoOriginal = await db.compra.findByPk(id);
        await registrarAuditoria(
            "UPDATE",
            idpersona,
            pedidoOriginal,
            req.body
        );
        await db.compra.update(req.body, { where: { idcompra: id } });
        res.status(200).json({ mensaje: 'modificada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar' });
    }
};
module.exports= {listarCompra, registrarCompra, modificarCompra, GenerarGrafico, GenerarReporteCompra};