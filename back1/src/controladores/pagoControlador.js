const { registrarAuditoria } = require("../services/auditoriaService");
const { db } = require("../config/database");
const { Op, fn, col, literal } = require('sequelize');
const listarPago = async (req, res) => {
  try {
    const lista = await db.pago.findAll({
      include: [
        {
          model: db.pedido,
          include: [
            {
              model: db.libreria,
              as: "libreria",
              include: [
                { model: db.persona } // Persona de la librería
              ]
            }
          ]
        },
        { model: db.persona },      // Persona que registró el pago
        { model: db.metodo_pago }   // Tipo de pago
      ]
    });

    return res.json(lista);
  } catch (error) {
    console.log("Error en listaPago:", error);
    res.status(500).json({ mensaje: "Error al listar pagos" });
  }
};


const registrarPago = async (req, res) => {
    try {
        req.body.idpedido = req.body.pedido?.idpedido;
        req.body.idmetodo = req.body.metodo_pago?.idmetodo;
        const idpersona = req.user.idpersona;
        const detcompra = await db.pago.create(req.body);
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

const buscarPago = async (req, res) => {
  const filtro = req.query.filtro || '';

  try {
    const pagos = await db.pago.findAll({
      include: [
        {
          model: db.pedido,
          include: [
            {
              model: db.libreria,
              as: "libreria",
              include: [
                { model: db.persona } // Persona de la librería
              ]
            }
          ]
        },
        { model: db.persona },      // Persona que registró el pago
        { model: db.metodo_pago }   // Tipo de pago
      ],
      where: filtro ? {
        [Op.or]: [
          { '$pedido.libreria.persona.nombre$': { [Op.iLike]: `%${filtro}%` } },
          { '$pedido.libreria.persona.ap_paterno$': { [Op.iLike]: `%${filtro}%` } },
          { '$pedido.libreria.persona.ap_materno$': { [Op.iLike]: `%${filtro}%` } },
          { '$pedido.libreria.razon_social$': { [Op.iLike]: `%${filtro}%` } }
        ]
      } : undefined
    });

    res.json(pagos);

  } catch (error) {
    console.error("Error en buscarPago:", error);
    res.status(500).json({ mensaje: 'Error al buscar pagos por librería' });
  }
};
const cambiarEstadoPago = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        const nuevoEstado = Number(estado); // no invertirlo

        const resultado = await db.pago.update(
            { estado: nuevoEstado },
            { where: { idpago: id } }
        );
        res.status(200).json({ mensaje: 'Estado actualizado' });
    } catch (error) {
        
        res.status(500).json({ mensaje: 'Error al cambiar estado' });
    }
};


const GenerarReportePago = async (req, res) => {
  try {
    const { estado, nombre, fechaDesde, fechaHasta } = req.query;

    const filtros = {
      where: {},
      include: [
        {
          model: db.pedido,
          include: [
            {
              model: db.libreria,
              as: "libreria",
              include: [{ model: db.persona }],
              required: false
            }
          ]
        },
        { model: db.persona },     // persona que registró el pago
        { model: db.metodo_pago }  // método de pago
      ],
      order: [['idpago', 'DESC']]
    };

    // === FILTRO POR NOMBRE (razón social de la librería) ===
     if (nombre) {
         filtros.where[Op.or] = [
           { '$pedido.libreria.persona.nombre$': { [Op.iLike]: `%${nombre}%` } },
           { '$pedido.libreria.persona.ap_paterno$': { [Op.iLike]: `%${nombre}%` } },
           { '$pedido.libreria.persona.ap_materno$': { [Op.iLike]: `%${nombre}%` } }
         ];
       }

    // === FILTRO POR ESTADO ===
    if (estado !== undefined) {
      filtros.where.estado = estado;
    }

    // === FILTRO POR FECHAS ===
    if (fechaDesde && fechaHasta) {
      filtros.where.fecha = { [Op.between]: [fechaDesde, fechaHasta] };
    } else if (fechaDesde) {
      filtros.where.fecha = { [Op.gte]: fechaDesde };
    } else if (fechaHasta) {
      filtros.where.fecha = { [Op.lte]: fechaHasta };
    }

    // Buscar registros
    const pagos = await db.pago.findAll(filtros);

    // Para cada pago, calcular y anexar el precio_subtotal del pedido asociado
    await Promise.all(pagos.map(async (p) => {
      const idpedido = p.idpedido || (p.pedido && p.pedido.idpedido);
      let subtotal = 0;
      if (idpedido) {
        subtotal = await db.detalle_pedido.sum('precio_subtotal', { where: { idpedido } }) || 0;
      }
      if (p.dataValues) p.dataValues.precio_subtotal = subtotal;
      else p.precio_subtotal = subtotal;
    }));

    // Calcular total sumado de los pagos obtenidos (sin modificar la lógica existente)
    const totalGeneral = pagos.reduce((sum, p) => sum + (p.monto || 0), 0);

    return res.json({
      totalRegistros: pagos.length,
      totalPagado: totalGeneral,
      data: pagos
    });

  } catch (error) {
    console.error("Error en reporte pagos:", error);
    return res.status(500).json({ mensaje: "Error al generar reporte" });
  }
};



module.exports= {listarPago, registrarPago, buscarPago, cambiarEstadoPago, GenerarReportePago};