const { db } = require("../config/database");
const rol = require("../modelos/rol");
const { Op } = require('sequelize');
const axios = require('axios');
const soap = require('soap');
const crypto = require('crypto');
const { create } = require('xmlbuilder2');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { registrarAuditoria } = require("../services/auditoriaService");

const num = require("numero-a-letras");
console.log(num);


const listarVenta = async (req, res) => {
  try {
    const lista = await db.venta.findAll({
       order: [['idventa', 'DESC']],
      include: [
        {
          model: db.pedido,
          include: [
             {
              model: db.detalle_pedido,
              attributes: ['cantidad', 'precio_subtotal', 'idcatalogo'],
              include: [
                {
                  model: db.catalogo, 
                 
                }
              ]
            },
            {
              model: db.libreria, as: "libreria",
              include: [{model: db.ciudad},
                { model: db.persona }]
            }
          ]
        },
        { model: db.metodo_pago }
      ]
    });

    // Agregar precio_total a cada factura
    const listaConTotal = lista.map(f => {
      const detalles = f.pedido.detalle_pedidos || [];
      const precio_total = detalles.reduce((sum, d) => sum + Number(d.precio_subtotal), 0);
      return { ...f.toJSON(), precio_total };
    });

    return res.json(listaConTotal);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Error al listar facturas' });
  }
};

const GenerarReporteVenta = async (req, res) => {
  try {
    const { rol, nombre, estado, fechaDesde, fechaHasta } = req.query;

    const filtros = {
      where: {},
      include: [
         {
          model: db.persona
          },
        {
          model: db.pedido,
          include: [
            {
              model: db.detalle_pedido,
              attributes: ['precio_subtotal']
            },
            {
              model: db.libreria, as: "libreria",
              include: [{ model: db.persona }]
            }
          ]
        },
        { model: db.metodo_pago }
      ]
    };

    // Filtros
    if (rol) filtros.where.idmetodo = rol;
    if (estado) filtros.where.estado = estado;
    if (nombre) {
      filtros.where[Op.or] = [
        { '$pedido.libreria.persona.nombre$': { [Op.iLike]: `%${nombre}%` } },
        { '$pedido.libreria.persona.ap_paterno$': { [Op.iLike]: `%${nombre}%` } },
        { '$pedido.libreria.persona.ap_materno$': { [Op.iLike]: `%${nombre}%` } }
      ];
    }
    if (fechaDesde && fechaHasta) {
      filtros.where.fecha = { [Op.between]: [fechaDesde, fechaHasta] };
    } else if (fechaDesde) {
      filtros.where.fecha = { [Op.gte]: fechaDesde };
    } else if (fechaHasta) {
      filtros.where.fecha = { [Op.lte]: fechaHasta };
    }

    // Buscar facturas (no personas)
    const lista = await db.venta.findAll(filtros);

    // Agregar precio_total a cada factura
    const listaConTotal = lista.map(f => {
      const detalles = f.pedido.detalle_pedidos || [];
      const precio_total = detalles.reduce((sum, d) => sum + Number(d.precio_subtotal), 0);
      return { ...f.toJSON(), precio_total };
    });

    return res.json(listaConTotal);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Error al generar reporte de facturas' });
  }
};

const buscarVenta= async (req, res) => {
    const filtro = req.query.filtro || '';
    try {
        const facturas = await db.venta.findAll({
            include: [
                {
                    model: db.pedido,
                    include: [
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
                            attributes: ['precio_subtotal']
                        }
                    ]
                },
                { model: db.metodo_pago }
            ],
            where: {
                [Op.or]: [
                    { '$pedido.libreria.persona.nombre$': { [Op.iLike]: `%${filtro}%` } },
                    { '$pedido.libreria.persona.ap_paterno$': { [Op.iLike]: `%${filtro}%` } },
                    { '$pedido.libreria.persona.ap_materno$': { [Op.iLike]: `%${filtro}%` } }
                ]
            }
        });

        // Agregar precio_total a cada factura
        const listaConTotal = facturas.map(f => {
            const detalles = f.pedido.detalle_pedidos || [];
            const precio_total = detalles.reduce((sum, d) => sum + Number(d.precio_subtotal), 0);
            return { ...f.toJSON(), precio_total };
        });

        res.json(listaConTotal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al buscar facturas' });
    }
};

const anularVenta = async (req, res) => {
    const id = req.params.xcod; // id de la factura
    try {
        // Usamos db.factura en vez de factura
         const pedidoOriginal = await db.venta.findByPk(id);
            await registrarAuditoria(
                "venta anulada",
                "DELETE",
                req.user.nombreCompleto,
                pedidoOriginal,
                req.body
            );
        const facturaEncontrada = await db.venta.findByPk(id);

        if (!facturaEncontrada) {
            return res.status(404).json({ mensaje: 'Factura no encontrada' });
        }

        // Cambiamos estado a 0
        facturaEncontrada.estado = 0;
        await facturaEncontrada.save();

        res.json({ mensaje: 'Factura anulada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al anular la factura' });
    }
};

const registrarVenta = async (req, res) => {
    const idpersona = req.user.idpersona;

    try {
        req.body.idpedido = req.body.pedido?.idpedido;
        const categoria = await db.venta.create(req.body);
        await registrarAuditoria(
            "INSERT",
            idpersona,
            null,
            categoria
        );

        if (req.body.idpedido) {
            const pedido = await db.pedido.findByPk(req.body.idpedido);

            if (pedido && pedido.estado === 3) {
                pedido.estado = 4;
                await pedido.save();
               
            }
        }

        // 🚀 RESPUESTA AL FRONTEND
        return res.status(200).json({
            mensaje: "Venta registrada correctamente",
            data: categoria
        });

    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al registrar venta', error });
    }
};


module.exports = { listarVenta, GenerarReporteVenta, registrarVenta, anularVenta, buscarVenta};



