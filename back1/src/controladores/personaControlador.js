const { db } = require("../config/database");
const { Op } = require('sequelize');

const listarGenero = async (req, res) =>{
    try {
        const lista = await db.genero.findAll({
        })
        return res.json(lista)
    } catch (error) {
        console.log(error);
        
    }
}
const listarPersonas = async (req, res) => {
  try {
    const lista = await db.persona.findAll({
      include: [
          {model: db.genero},
        { model: db.rol, as: 'rol', through: { attributes: [] } }]
    });

    const listaFormateada = lista.map(p => ({
      ...p.toJSON(),
      rol: p.rol // mantener el array completo de objetos { idrol, nombre }
    }));

    res.json(listaFormateada);
  } catch (error) {
    console.error('Error al listar personas:', error);
    res.status(500).json({ error: 'Error al listar personas' });
  }
};


const GenerarReportePersona = async (req, res) => {
  try {
    const { rol, nombre, estado, fechaDesde, fechaHasta } = req.query;

    const filtros = {
      where: {},
      include: [
         {model: db.genero},
        {
          model: db.rol,
          as: 'rol',            // 👈 importante: alias correcto
          through: { attributes: [] },
          attributes: ['idrol', 'nombre']
        },
        {
          model: db.credencial,
          attributes: ['usuario']
        }
      ]
    };

    // Filtro por rol (idrol)
    if (rol) {
      // buscar el include que corresponde al modelo 'rol' (por seguridad no depender del índice)
      const rolInclude = filtros.include.find(inc => inc.model === db.rol || inc.as === 'rol');
      if (rolInclude) {
        rolInclude.where = { idrol: rol };
      }
    }

    // Filtro por nombre o apellidos
    if (nombre) {
      filtros.where[Op.or] = [
        { nombre: { [Op.iLike]: `%${nombre}%` } },
        { ap_paterno: { [Op.iLike]: `%${nombre}%` } },
        { ap_materno: { [Op.iLike]: `%${nombre}%` } }
      ];
    }

    // Filtro por estado
    if (estado) {
      filtros.where.estado = estado;
    }

    // Filtro por fecha
    if (fechaDesde && fechaHasta) {
      filtros.where.fecha = { [Op.between]: [fechaDesde, fechaHasta] };
    } else if (fechaDesde) {
      filtros.where.fecha = { [Op.gte]: fechaDesde };
    } else if (fechaHasta) {
      filtros.where.fecha = { [Op.lte]: fechaHasta };
    }

    const resultado = await db.persona.findAll(filtros);

    // Formatear para mantener array de roles completo
    const resultadoFormateado = resultado.map(p => ({
      ...p.toJSON(),
      rol: p.rol
    }));

    return res.json(resultadoFormateado);
  } catch (error) {
    console.error("Error al generar reporte de personas:", error);
    res.status(500).json({ mensaje: "Error al generar reporte de personas" });
  }
};

const listarPersonasFiltradas = async (req, res) => {
  const filtro = req.query.filtro?.toLowerCase();

  try {
    let personas;

    switch (filtro) {
      case 'clientes':
        personas = await db.persona.findAll({
          include: [
             {model: db.genero},
             {
            model: db.rol,
            as: 'rol',
            where: { idrol: 2 },
            through: { attributes: [] }
          }]
        });
        break;

      case 'proveedor':
        personas = await db.persona.findAll({
          include: [{
            model: db.rol,
            as: 'rol',
            where: { idrol: 5 },
            through: { attributes: [] }
          }]
        });
        break;

      case 'personal':
        personas = await db.persona.findAll({
          include: [{
            model: db.rol,
            as: 'rol',
            where: { idrol: { [Op.in]: [3, 4] } },
            through: { attributes: [] }
          }]
        });
        break;

      case 'activos':
        personas = await db.persona.findAll({
          where: { estado: 1 },
          include: [{
            model: db.rol,
            as: 'rol',
            where: { idrol: { [Op.in]: [2, 3, 4, 5] } },
            through: { attributes: [] }
          }]
        });
        break;

      case 'bloqueados':
        personas = await db.persona.findAll({
          where: { estado: 0 },
          include: [{
            model: db.rol,
            as: 'rol',
            where: { idrol: { [Op.in]: [2, 3, 4, 5] } },
            through: { attributes: [] }
          }]
        });
        break;

      case 'todos':
      default:
        personas = await db.persona.findAll({
          include: [{
            model: db.rol,
            as: 'rol',
            where: { idrol: { [Op.in]: [2, 3, 4, 5] } }, // excluye idrol 1 (Admin)
            through: { attributes: [] }
          }]
        });
        break;
    }

    res.json(personas);
  } catch (error) {
    console.error('Error al listar personas filtradas:', error);
    res.status(500).json({ mensaje: 'Error al listar personas filtradas' });
  }
};

// POST: Registrar persona
const registrarPersona = async (req, res) => {
  try {
    // Extraemos los roles enviados desde el frontend
    const { rol: rolesSeleccionados, ...datosPersona } = req.body;

    // Creamos la persona
     datosPersona.idgenero = req.body.genero?.idgenero;
    const persona = await db.persona.create(datosPersona);

    // Si hay roles seleccionados, los asociamos en rol_persona
    if (rolesSeleccionados && rolesSeleccionados.length > 0) {
      const rolesParaInsertar = rolesSeleccionados.map((r) => ({
        idpersona: persona.idpersona,
        idrol: r.idrol,
      }));

      await db.rol_persona.bulkCreate(rolesParaInsertar);
    }

    res.status(201).json(persona);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar persona' });
  }
};



const GuardarFotografia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se subió ninguna imagen' });
    }
    res.status(200).json({ nombre: req.file.filename });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al subir imagen' });
  }
};
const modificarPersona = async (req, res) => {
  const id = req.params.id;
  try {
    // Extraer roles
    const { rol: rolesSeleccionados, ...datosPersona } = req.body;

    // Actualizar persona
    datosPersona.idgenero = req.body.genero?.idgenero;
    await db.persona.update(datosPersona, { where: { idpersona: id } });

    // Eliminar roles antiguos
    await db.rol_persona.destroy({ where: { idpersona: id } });

    // Insertar nuevos roles si hay
    if (rolesSeleccionados && rolesSeleccionados.length > 0) {
      const rolesParaInsertar = rolesSeleccionados.map(r => ({
        idpersona: id,
        idrol: r.idrol,
      }));
      await db.rol_persona.bulkCreate(rolesParaInsertar);
    }

    res.status(200).json({ mensaje: 'Persona modificada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al modificar persona' });
  }
};


// GET: Buscar personas por filtro
const buscarPersonas = async (req, res) => {
    const filtro = req.query.filtro || '';
    try {
        const personas = await db.persona.findAll({
  include: [{ model: db.rol, as: 'rol', through: { attributes: [] } }],
            where: {
                [Op.or]: [
                    { nombre: { [Op.iLike]: `%${filtro}%` } },      // PostgreSQL: insensible a mayúsculas
                    { ap_paterno: { [Op.iLike]: `%${filtro}%` } }  // también buscar en ap_paterno
                ]
            }
            
        });
        
        res.json(personas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al buscar personas' });
    }
};

// PUT: Cambiar estado de persona
const cambiarEstadoPersona = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        const nuevoEstado = estado === 0 ? 1 : 0;
        await db.persona.update({ estado: nuevoEstado }, { where: { idpersona: id } });
        res.status(200).json({ mensaje: 'Estado actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al cambiar estado' });
    }
};

const verDetallesPersona = async (req, res) => {
  const { id } = req.params;

  try {
    const persona = await db.persona.findOne({
      where: { idpersona: id },
      include: [
        {model: db.genero},
        {
          model: db.rol,
          as: 'rol', // usa el alias definido en la asociación
          through: { attributes: [] } // oculta la tabla intermedia rol_persona
        },
        {
          model: db.credencial,
          required: false
        }
      ]
    });

    if (!persona) {
      return res.status(404).json({ mensaje: 'Persona no encontrada' });
    }

    return res.json(persona);
  } catch (error) {
    console.error('Error al obtener detalles de la persona:', error);
    return res.status(500).json({ mensaje: 'Error al obtener detalles de la persona' });
  }
};


module.exports = {verDetallesPersona, listarPersonas, listarPersonasFiltradas,listarGenero, buscarPersonas, registrarPersona, modificarPersona, cambiarEstadoPersona, GuardarFotografia, GenerarReportePersona}