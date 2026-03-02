const { db } = require("../config/database");
const rol = require("../modelos/rol");
const { Op } = require('sequelize');
const { registrarAuditoria } = require("../services/auditoriaService");

const listarSubCategoriaID = async (req, res) => {
    try {
        const idcategoria = req.params.idcategoria;
        const lista = await db.subcategoria.findAll({
            where: { idcategoria },
            include: { model: db.categoria, as: 'categoria'} 
        });
        return res.json(lista);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al listar librerías' });
    }
};

const listarCategoria = async (req, res) =>{
    try {
        const lista = await db.categoria.findAll({
        })
        return res.json(lista)
    } catch (error) {
        console.log(error);
        
    }
} 


// POST: Registrar persona
const registrarCategoria = async (req, res) => {
    try {
        const categoria = await db.categoria.create(req.body);
        res.status(201).json(categoria);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar persona' });
    }
};


// PUT: Modificar persona
const modificarCategoria = async (req, res) => {
    const id = req.params.id;
    const idpersona = req.user.idpersona;
    try {
        const pedidoOriginal = await db.categoria.findByPk(id);
                 await registrarAuditoria(
                             "UPDATE",
                             idpersona,
                             pedidoOriginal,
                             req.body
                         );
        await db.categoria.update(req.body, { where: { idcategoria: id } });
        res.status(200).json({ mensaje: 'modificada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar' });
    }
};

//modifcar sub caegoria
const buscarCategoria = async (req, res) => {
    const filtro = req.query.filtro || '';
    try {
        const categorias = await db.categoria.findAll({
            where: {
                [Op.or]: [
                    { nombre: { [Op.iLike]: `%${filtro}%` } },      // PostgreSQL: insensible a mayúsculas
                
                ]
            }
        });
        res.json(categorias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al buscar' });
    }
};

const eliminarCategoria = async (req, res) => {
    try {
        const id = req.params.xcod;
        const idpersona = req.user.idpersona;
         const pedidoOriginal = await db.categoria.findByPk(id);
            await registrarAuditoria(
                "DELETE",
                idpersona,
                pedidoOriginal,
                req.body
            );
        await db.categoria.destroy({ where: { idcategoria: id } });
        res.status(200).json({ mensaje: 'cate eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar' });
    }
}
module.exports = {listarCategoria, registrarCategoria, modificarCategoria, eliminarCategoria, buscarCategoria}