const { db } = require("../config/database");
const { Op } = require('sequelize');
const { registrarAuditoria } = require("../services/auditoriaService");

const listarDetallePedido = async (req, res) =>{
    try {
        const lista = await db.detalle_pedido.findAll({
             include: [
        { model: db.pedido },
        { model: db.catalogo }  
      ]
        })
        return res.json(lista)
    } catch (error) {
        console.log(error);
        
    }
}

const listarDetallePedidoID = async (req, res) => {
    try {
        const idpedido = req.params.idpedido;
        const lista = await db.detalle_pedido.findAll({
            where: { idpedido },
             include: [
             { model: db.catalogo },
      ] 
        });
        return res.json(lista);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al listar librerías' });
    }
};
const registrarDetallePedido = async (req, res) => {
    try {
        req.body.idpedido = req.body.pedido?.idpedido;
        req.body.idcatalogo = req.body.catalogo?.idcatalogo;
        const detcompra = await db.detalle_pedido.create(req.body);
        res.status(201).json(detcompra);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar persona' });
    }
};
// PUT: Modificar persona
const modificarDetallePedido = async (req, res) => {
    const id = req.params.id;
    const idpersona = req.user.idpersona;

    try {
       req.body.idpedido = req.body.pedido?.idpedido;
        req.body.idcatalogo = req.body.catalogo?.idcatalogo;
        const pedidoOriginal = await db.detalle_pedido.findByPk(id);
                await registrarAuditoria(
                    "UPDATE",
                    idpersona,
                    pedidoOriginal,
                    req.body
                );
        await db.detalle_pedido.update(req.body, { where: { iddetalle_pedido: id } });
        res.status(200).json({ mensaje: 'modificada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar' });
    }
};
const eliminarDetPedido = async (req, res) => {
    try {
        const id = req.params.xcod;
        const idpersona = req.user.idpersona;

         const pedidoOriginal = await db.detalle_pedido.findByPk(id);
                    await registrarAuditoria(
                      
                        "DELETE",
                        idpersona,
                        pedidoOriginal,
                        req.body
                    );
        await db.detalle_pedido.destroy({ where: { iddetalle_pedido: id } });
        res.status(200).json({ mensaje: 'Librería eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar librería' });
    }
}
const actualizarEstadoPedidoSegunDetalles = async (idpedido) => {
  const detalles = await db.detalle_pedido.findAll({ where: { idpedido } });

  const totalDetalles = detalles.length;
  const completados = detalles.filter(d => d.estado === 1).length;

  let nuevoEstado = 1; // Pendiente por defecto

  if (completados === totalDetalles && totalDetalles > 0) {
    nuevoEstado = 3; // Completado
  } else if (completados > 0) {
    nuevoEstado = 2; // En proceso
  }

  await db.pedido.update({ estado: nuevoEstado }, { where: { idpedido } });
};

const cambiarEstadoDetPedido = async (req, res) => {
  const { id } = req.params;
  const { estado, pedidoIdpedido } = req.body;

  try {
    const nuevoEstado = estado === 0 ? 1 : 0;

    // Actualiza el estado del detalle pedido
    await db.detalle_pedido.update(
      { estado: nuevoEstado },
      { where: { iddetalle_pedido: id } }
    );

    // Actualiza el estado del pedido padre
    await actualizarEstadoPedidoSegunDetalles(pedidoIdpedido);

    // Obtener el detalle pedido actualizado con el pedido incluido
    const detalleActualizado = await db.detalle_pedido.findOne({
      where: { iddetalle_pedido: id },
      include: [{ model: db.pedido }]
    });

    res.status(200).json({
      mensaje: 'Estado actualizado y pedido sincronizado',
      detalle: detalleActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al cambiar estado' });
  }
};



module.exports= {listarDetallePedido, listarDetallePedidoID, registrarDetallePedido, cambiarEstadoDetPedido, modificarDetallePedido, eliminarDetPedido};