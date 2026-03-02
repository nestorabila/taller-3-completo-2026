const { db } = require("../config/database");
const rol = require("../modelos/rol");
const { Op } = require('sequelize');
const { registrarAuditoria } = require("../services/auditoriaService");

const listarMetodo_Pago = async (req, res) =>{
    try {
        const lista = await db.metodo_pago.findAll({
        })
        return res.json(lista)
    } catch (error) {
        console.log(error);
        
    }
} 




module.exports = {listarMetodo_Pago}