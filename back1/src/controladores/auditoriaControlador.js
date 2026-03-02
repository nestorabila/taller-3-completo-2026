const { db } = require("../config/database");
const { Op } = require('sequelize');

// 👉 Función para limpiar los JSON y no devolver objetos grandes
function limpiarJSON(data) {
    const limpio = {};

    for (const key in data) {
        // Mantener solo valores simples (string, number, boolean)
        if (typeof data[key] !== "object") {
            limpio[key] = data[key];
        }
    }

    return limpio;
}

const listarAuditoria = async (req, res) => {
    try {
        const lista = await db.auditoria.findAll({
            include: [
                {
                    model: db.persona
                }
            ],
            order: [
                ['fecha', 'DESC'],
                ['hora', 'DESC']
            ]
        });

        const respuesta = lista.map(item => ({
            id_aud: item.id_aud,
            accion: item.accion,
            fecha: item.fecha,
            hora: item.hora,
            persona: item.persona || null, // 👈 AQUÍ VA EL OBJETO COMPLETO

            datos_original: item.datos_original
                ? limpiarJSON(item.datos_original)
                : null,

            datos_nuevo: item.datos_nuevo
                ? limpiarJSON(item.datos_nuevo)
                : null
        }));

        res.json(respuesta);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error al listar auditoría" });
    }
};



module.exports ={listarAuditoria}