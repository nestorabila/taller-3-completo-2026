const { db } = require("../config/database");
const rol = require("../modelos/rol");
const { Op } = require('sequelize');
const { registrarAuditoria } = require("../services/auditoriaService");

const listarNegocio = async (req, res) =>{
    try {
        const lista = await db.negocio.findAll({
            include: {model: db.ciudad}
        })
        return res.json(lista)
    } catch (error) {
        console.log(error);
        
    }
} 

const listarNegocioDTO = async (req, res) => {
    try {
        const lista = await db.negocio.findAll({
            attributes: { exclude: ['idnegocio'] },
            include: {
                model: db.ciudad
            }
        });
        return res.json(lista);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al listar sistemas' });
    }
};

// PUT: Modificar catalogo
const modificarNegocio= async (req, res) => {
    const id = req.params.id;
    try {
        req.body.idciudad = req.body.ciudad?.idciudad;
        await db.negocio.update(req.body, { where: { idnegocio: id } });
        res.status(200).json({ mensaje: 'modificada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar' });
    }
};

module.exports ={listarNegocio, modificarNegocio, listarNegocioDTO};