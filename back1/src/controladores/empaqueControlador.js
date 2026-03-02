const { db } = require("../config/database");
const rol = require("../modelos/rol");
const { Op } = require('sequelize');

const listarEmpaque = async (req, res) =>{
    try {
        const lista = await db.empaque.findAll({
        })
        return res.json(lista)
    } catch (error) {
        console.log(error);
        
    }
} 


module.exports = {listarEmpaque}