const { db } = require("../config/database");
const { Op } = require('sequelize');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const { registrarAuditoria } = require("../services/auditoriaService");
const listarLibreria = async (req, res) =>{
    try {
        const lista = await db.libreria.findAll({
            include: [
        { model: db.persona },
        { model: db.ciudad }
      ]
        })
        return res.json(lista)
    } catch (error) {
        console.log(error);
        
    }
}
const listarReporteLibreria = async (req, res) => {
  try {
    const { idciudad, razon_social, desde, hasta } = req.query;

    const where = {};
    if (idciudad) {
      where.idciudad = idciudad;
    }
    if (razon_social) {
      where.razon_social = {
        [Op.iLike]: `%${razon_social}%`,
      };
    }
    if (desde && hasta) {
      where.fecha = {
        [Op.between]: [desde, hasta],
      };
    } else if (desde) {
      where.fecha = { [Op.gte]: desde };
    } else if (hasta) {
      where.fecha = { [Op.lte]: hasta };
    }

   const lista = await db.libreria.findAll({
  where,
  include: [
    {
      model: db.persona,
      attributes: ['nombre', 'ap_paterno', 'ap_materno'],
    },
    {
      model: db.ciudad, // ✅ Esto es correcto
    }
  ],
  order: [['fecha', 'DESC']],
});


    return res.json(lista);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al generar el reporte de negocios" });
  }
};

const listarLibreriaID = async (req, res) => {
    try {
        const idpersona = req.params.idpersona;
        const lista = await db.libreria.findAll({
            where: { idpersona },
            include: [
            {model: db.persona},
             {model: db.ciudad}
            ]
        });
        return res.json(lista);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al listar librerías' });
    }
};

// Configurar API Key de Brevo
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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'; // <-- pega aquí tu API Key

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

async function enviarCodigo(correo, nombre, razon_social, codigo) {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = { email: 'abilaf354@gmail.com', name: 'Sistema LUCIWEB' };
    sendSmtpEmail.to = [{ email: correo, name: nombre }];
    sendSmtpEmail.subject = 'Código de verificación de librería';
    sendSmtpEmail.textContent = `Hola ${nombre}, tu código de verificación para la librería "${razon_social}" es: ${codigo}.`;

    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`Correo enviado a ${correo}`);
    } catch (error) {
        console.error('Error enviando correo:', error);
        throw error;
    }
}


function generarCodigo(length = 6) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let codigo = '';
    for (let i = 0; i < length; i++) {
        codigo += chars[Math.floor(Math.random() * chars.length)];
    }
    return codigo;
}

const registrarLibreria = async (req, res) => {
    try {
        req.body.idpersona = req.body.persona?.idpersona;
        req.body.idciudad = req.body.ciudad?.idciudad;
        const codigo = generarCodigo();
        req.body.codigo = codigo; 

        const persona = await db.libreria.create(req.body);

        if (req.body.persona?.correo) {
            await enviarCodigo(
                req.body.persona.correo,
                req.body.persona.nombre,
                req.body.razon_social,
                codigo
            );
        }

        res.status(201).json(persona);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar persona' });
    }
};

// PUT: Modificar persona
const modificarLibreria = async (req, res) => {
    const id = req.params.id;
    const idpersona = req.user.idpersona;

    try {
        req.body.idpersona = req.body.persona?.idpersona;
        req.body.idciudad = req.body.ciudad?.idciudad;
        const pedidoOriginal = await db.libreria.findByPk(id);
        await registrarAuditoria(
            "UPDATE",
            idpersona,
            pedidoOriginal,
            req.body
        );
        await db.libreria.update(req.body, { where: { idlibreria: id } });
        res.status(200).json({ mensaje: 'libreria modificada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar persona' });
    }
};
const eliminarLibreria = async (req, res) => {
    try {
        const id = req.params.xcod;
        const idpersona = req.user.idpersona;
         const pedidoOriginal = await db.libreria.findByPk(id);
            await registrarAuditoria(
                "DELETE",
                idpersona,
                pedidoOriginal,
                req.body
            );
        await db.libreria.destroy({ where: { idlibreria: id } });
        res.status(200).json({ mensaje: 'Librería eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar librería' });
    }
}

const cambiarEstadoLibreria = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        const nuevoEstado = Number(estado); // no invertirlo

        const resultado = await db.libreria.update(
            { estado: nuevoEstado },
            { where: { idlibreria: id } }
        );
        res.status(200).json({ mensaje: 'Estado actualizado' });
    } catch (error) {
        
        res.status(500).json({ mensaje: 'Error al cambiar estado' });
    }
};

const reenviarCodigoLibreria = async (req, res) => {
  try {
    const { id } = req.params;

    const libreria = await db.libreria.findByPk(id, {
      include: [{ model: db.persona }]
    });

    if (!libreria) {
      return res.status(404).json({ mensaje: 'Librería no encontrada' });
    }

    // generar nuevo código
    const nuevoCodigo = generarCodigo();

    // actualizar SOLO el código
    await db.libreria.update(
      { codigo: nuevoCodigo },
      { where: { idlibreria: id } }
    );

    // enviar correo
    if (libreria.persona?.correo) {
      await enviarCodigo(
        libreria.persona.correo,
        libreria.persona.nombre,
        libreria.razon_social,
        nuevoCodigo
      );
    }

    res.status(200).json({ mensaje: 'Código reenviado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al reenviar código' });
  }
};


module.exports = {listarLibreriaID,cambiarEstadoLibreria, reenviarCodigoLibreria, listarLibreria, registrarLibreria, modificarLibreria, eliminarLibreria, listarReporteLibreria}