const { registrarAuditoria } = require("../services/auditoriaService");
const { db } = require("../config/database");
const { Op, fn, col, literal } = require('sequelize');
const listarPedido = async (req, res) => {
  try {
    const lista = await db.pedido.findAll({
      attributes: {
        include: [
          [fn("SUM", col("detalle_pedidos.precio_subtotal")), "precio_total"]
        ]
      },
      include: [
        {
          model: db.libreria, as: "libreria",
          include: [
            { model: db.persona }
          ]
        },
        {
          model: db.detalle_pedido,
          attributes: [] // No traer detalles, solo para sumar
        }
      ],
      group: ['pedido.idpedido', 'libreria.idlibreria', 'libreria->persona.idpersona']
    });

    return res.json(lista);
  } catch (error) {
    console.log("Error en listarPedido:", error);
    res.status(500).json({ mensaje: "Error al listar pedidos con precio total" });
  }
};

const registrarPedido = async (req, res) => {
    try {
        req.body.idlibreria = req.body.libreria?.idlibreria;
        const idpersona = req.user.idpersona;
        const detcompra = await db.pedido.create(req.body);
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
const modificarPedido = async (req, res) => {
    const id = req.params.id;
    const idpersona = req.user.idpersona;
    try {
        req.body.idlibreria = req.body.libreria?.idlibreria;
         const pedidoOriginal = await db.pedido.findByPk(id);
        await registrarAuditoria(
            "UPDATE",
           idpersona,
            pedidoOriginal,
            req.body
        );
        await db.pedido.update(req.body, { where: { idpedido: id } });
        res.status(200).json({ mensaje: 'modificada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar' });
    }
};

const listarPedidosFiltradas = async (req, res) => {
    const filtro = req.query.filtro?.toLowerCase();

    try {
        let personas;
        switch (filtro) {
            case 'pendientes':
                personas = await db.pedido.findAll({
                    where: { estado: 1 },
                    include: [
                    { model: db.libreria, as: "libreria",
                       include: [
                      {model: db.persona,
                     }
                     ]
                      }
                     ]
                });
                break;

            case 'cancelados':
                personas = await db.pedido.findAll({
                    where: { estado: 0 },
                   include: [
                   { model: db.libreria,as: "libreria",
                     include: [
                   {model: db.persona,
                    }
                    ]
                   }
                  ]
                });
                break;

                 case 'entregados':
                personas = await db.pedido.findAll({
                    where: { estado: 4 },
                   include: [
                   { model: db.libreria, as: "libreria",
                     include: [
                   {model: db.persona,
                    }
                    ]
                   }
                  ]
                });
                break;

                 case 'proceso':
                personas = await db.pedido.findAll({
                    where: { estado: 2 },
                   include: [
                   { model: db.libreria, as: "libreria",
                     include: [
                   {model: db.persona,
                    }
                    ]
                   }
                  ]
                });
                break;

                 case 'completado':
                personas = await db.pedido.findAll({
                    where: { estado: 3 },
                   include: [
                   { model: db.libreria, as: "libreria",
                     include: [
                   {model: db.persona,
                    }
                    ]
                   }
                  ]
                });
                break;

            case 'todos':
            default:
                personas = await db.pedido.findAll({
                    include: [
                   { model: db.libreria, as: "libreria",
                     include: [
                   {model: db.persona,
                    }
                    ]
                   }
                  ]
                });
                break;
        }

        res.json(personas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al listar personas' });
    }
};

const cambiarEstadoPedido = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        const nuevoEstado = estado === 0 ? 1 : 0;
        await db.pedido.update({ estado: nuevoEstado }, { where: { idpedido: id } });
        res.status(200).json({ mensaje: 'Estado actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al cambiar estado' });
    }
};
const buscarPedidos = async (req, res) => {
    const filtro = req.query.filtro || '';

    try {
        const pedidos = await db.pedido.findAll({
            include: [
                {
                    model: db.libreria, as: "libreria",
                    where: {
                        razon_social: {
                            [Op.iLike]: `%${filtro}%`
                        }
                    },
                    include: [
                        {
                            model: db.persona
                        }
                    ]
                }
            ]
        });

        res.json(pedidos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al buscar pedidos por negocio' });
    }
};

const GenerarReportePedido = async (req, res) => {
  try {
    const { estado, nombre, fechaDesde, fechaHasta } = req.query;

    const filtros = {
      attributes: {
        include: [
          [fn("SUM", col("detalle_pedidos.cantidad")), "cantidad_total"],
          [fn("SUM", col("detalle_pedidos.precio_subtotal")), "precio_total"]
        ]
      },
      where: {},
      include: [
        {
          model: db.persona
        },
        {
          model: db.libreria, as: "libreria",
          include: [
            {
              model: db.persona
            }
          ]
        },
        {
          model: db.detalle_pedido,
          attributes: []
        }
      ],
      group: ['pedido.idpedido',"persona.idpersona", 'libreria.idlibreria', 'libreria->persona.idpersona',
        
      ],
      raw: false
    };

    // Filtro por nombre (razon_social del negocio)
    if (nombre) {
      filtros.include[0].where = {
        razon_social: {
          [Op.iLike]: `%${nombre}%`
        }
      };
      filtros.include[0].required = true;
    }

    // Filtro por estado
    if (estado) {
      filtros.where.estado = estado;
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

    const resultado = await db.pedido.findAll(filtros);
    return res.json(resultado);
  } catch (error) {
    console.error("Error al filtrar pedidos:", error);
    res.status(500).json({ mensaje: "Error al filtrar pedidos 500" });
  }
};
//aqi debeo hace otro emeoto muy aparte si te gustas
const ReportePedidosProximos = async (req, res) => {
  try {
    const hoy = new Date();

    const resultado = await db.pedido.findAll({
      attributes: [
        "idpedido",
        "fecha_entrega",
        "estado",
        [fn("SUM", col("detalle_pedidos.cantidad")), "cantidad_total"],
        [fn("SUM", col("detalle_pedidos.precio_subtotal")), "precio_total"],
        [literal("(fecha_entrega - CURRENT_DATE)"), "dias_faltantes"]
      ],
      include: [
        {
          model: db.libreria, as: "libreria",
          include: [{ model: db.persona }]
        },
         {
    model: db.persona, as: "persona", attributes: ["idpersona", "nombre", "ap_paterno", "ap_materno"]
  },
        {
          model: db.detalle_pedido,
          attributes: []
        }
      ],
      where: {
        estado: { [Op.in]: [1, 2] },
        fecha_entrega: { [Op.gte]: hoy }
      },
      group: ['pedido.idpedido', 'libreria.idlibreria', 'libreria->persona.idpersona', 'persona.idpersona'],
      order: [[literal("dias_faltantes"), "ASC"]],
      raw: false
    });

    return res.json(resultado);
  } catch (error) {
    console.error("Error al generar reporte de pedidos próximos:", error);
    res.status(500).json({ mensaje: "Error al generar reporte de pedidos próximos." });
  }
};



module.exports= {ReportePedidosProximos, listarPedido, registrarPedido, modificarPedido, listarPedidosFiltradas, cambiarEstadoPedido, buscarPedidos, GenerarReportePedido};