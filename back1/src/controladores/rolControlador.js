const { db } = require("../config/database");
const rol = require("../modelos/rol");
const { Op } = require('sequelize');
const listarRol = async (req, res) =>{
    try {
        const lista = await db.rol.findAll({
             where: {
               idrol: {
            [Op.notIn]: [1]
              }
            }
        })
        return res.json(lista)
    } catch (error) {
        console.log(error);
        
    }
}
module.exports = {listarRol}