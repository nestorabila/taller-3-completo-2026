const { db } = require("../config/database");
const rol = require("../modelos/rol");
const { Op } = require('sequelize');
const { registrarAuditoria } = require("../services/auditoriaService");

const listarProveedor = async (req, res) =>{
    try {
        const lista = await db.proveedor.findAll({
            include: [
            {model: db.persona},
             {model: db.ciudad}
            ]
        })
        return res.json(lista)
    } catch (error) {
        console.log(error);
        
    }
} 
// POST: Registrar persona
const registrarProveedor = async (req, res) => {
    try {
        req.body.idpersona = req.body.persona?.idpersona;
        req.body.idciudad = req.body.ciudad?.idciudad;
        const categoria = await db.proveedor.create(req.body);
        res.status(201).json(categoria);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar persona' });
    }
};

// PUT: Modificar persona
const modificarProveedor = async (req, res) => {
    const id = req.params.id;
    try {
        await db.proveedor.update(req.body, { where: { idproveedor: id } });
        res.status(200).json({ mensaje: 'modificada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar' });
    }
};
const buscarProveedor = async (req, res) => {
    const filtro = req.query.filtro || '';
    try {
        const categorias = await db.proveedor.findAll({
            include: {model: db.persona},
            where: {
                [Op.or]: [
                    { razon_social: { [Op.iLike]: `%${filtro}%` } },      // PostgreSQL: insensible a mayúsculas
                ]
            }
        });
        res.json(categorias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al buscar' });
    }
};
const eliminarProveedor = async (req, res) => {
    try {
        const id = req.params.xcod;
        const idpersona = req.user.idpersona;
         const pedidoOriginal = await db.proveedor.findByPk(id);
                    await registrarAuditoria(
                        "DELETE",
                        idpersona,
                        pedidoOriginal,
                        req.body
                    );
        await db.proveedor.destroy({ where: { idproveedor: id } });
        res.status(200).json({ mensaje: 'cate eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar' });
    }
}
module.exports = {listarProveedor, registrarProveedor, modificarProveedor, buscarProveedor, eliminarProveedor}