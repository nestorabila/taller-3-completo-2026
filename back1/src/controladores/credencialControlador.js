const { db } = require("../config/database");
const bcrypt = require('bcrypt');
const { registrarAuditoria } = require("../services/auditoriaService");
const listarCredencial = async (req, res) =>{
    try {
        const lista = await db.credencial.findAll({
            include: {model: db.persona}
        })
        return res.json(lista)
    } catch (error) {
        console.log(error);
        
    }
}
// editar usuario
const modificarCredencial = async (req, res) => {
    const id = req.params.id;
    try {
        req.body.idpersona = req.body.persona?.idpersona;

        // Verificar si se envió una nueva contraseña
        if (req.body.contrasena) {
            // Hashear la contraseña antes de guardar
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(req.body.contrasena, saltRounds);
            req.body.contrasena = hashedPassword;
        }

        // Verificar si ya existe una credencial con ese usuario
        const existente = await db.credencial.findOne({ where: { usuario: id } });

        if (existente) {
            // Modificar credencial
            const pedidoOriginal = await db.credencial.findByPk(id);
        await registrarAuditoria(
            "credencial",
            "UPDATE",
            req.user.nombreCompleto,
            pedidoOriginal,
            req.body
        );
            await db.credencial.update(req.body, { where: { usuario: id } });
            res.status(200).json({ mensaje: 'Credencial modificada' });
        } else {
            // Registrar nueva credencial
            req.body.usuario = id;
            await db.credencial.create(req.body);
            res.status(201).json({ mensaje: 'Credencial registrada' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar o registrar credencial' });
    }
};
const registrarCredencial = async (req, res) => {
  try {
    req.body.idpersona = req.body.persona?.idpersona;

    // Verificar si se envió una contraseña y hashearla
    if (req.body.contrasena) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(req.body.contrasena, saltRounds);
      req.body.contrasena = hashedPassword;
    }
    const credencial =  await db.credencial.create(req.body);
    res.status(201).json(credencial);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar persona' });
  }
};


module.exports = {listarCredencial, modificarCredencial, registrarCredencial}