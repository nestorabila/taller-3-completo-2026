const { db } = require("../config/database");
const { Op } = require('sequelize');
const { registrarAuditoria } = require("../services/auditoriaService");

const listarDetalleCompra = async (req, res) =>{
    try {
        const lista = await db.detalle_compra.findAll({
              include: [
             { model: db.empaque },
             { model: db.compra },
             {
          model: db.producto,
          include: [
            {
              model: db.categoria,
              as: 'categoria' 
            }
          ]
        }
      ]
        })
        return res.json(lista)
    } catch (error) {
        console.log(error);
        
    }
}

const listarDetalleCompraID = async (req, res) => {
    try {
        const idcompra = req.params.idcompra;
        const lista = await db.detalle_compra.findAll({
            where: { idcompra },
             include: [
             { model: db.empaque },
             { model: db.compra },
             {
          model: db.producto,
          include: [
            {
              model: db.categoria,
              as: 'categoria' 
            }
          ]
        }
      ] 
        });
        return res.json(lista);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al listar librerías' });
    }
};
const registrarDetalleCompra = async (req, res) => {
    try {
        req.body.idcompra = req.body.compra?.idcompra;
        req.body.idempaque = req.body.empaque?.idempaque;
        req.body.idproducto = req.body.producto?.idproducto;
        const detcompra = await db.detalle_compra.create(req.body);
        res.status(201).json(detcompra);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar persona' });
    }
};
// PUT: Modificar persona
const modificarDetalleCompra = async (req, res) => {
    const id = req.params.id;
    const idpersona = req.user.idpersona;

    try {
        req.body.idempaque = req.body.empaque?.idempaque;
        req.body.idcompra = req.body.compra?.idcompra;
        req.body.idproducto = req.body.producto?.idproducto;
        const pedidoOriginal = await db.detalle_compra.findByPk(id);
        await registrarAuditoria(
            "UPDATE",
            idpersona,
            pedidoOriginal,
            req.body
        );
        await db.detalle_compra.update(req.body, { where: { iddetalle_compra: id } });
        res.status(200).json({ mensaje: 'modificada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar' });
    }
};
const eliminarDetCompra = async (req, res) => {
    try {
        const id = req.params.xcod;
        const idpersona = req.user.idpersona;

         const pedidoOriginal = await db.detalle_compra.findByPk(id);
            await registrarAuditoria(
                "DELETE",
                idpersona,
                pedidoOriginal,
                req.body
            );
        await db.detalle_compra.destroy({ where: { iddetalle_compra: id } });
        res.status(200).json({ mensaje: 'Librería eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar librería' });
    }
}
module.exports= {listarDetalleCompra, registrarDetalleCompra, listarDetalleCompraID, eliminarDetCompra, modificarDetalleCompra};