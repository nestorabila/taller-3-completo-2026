const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('libreria', {
    idlibreria: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nit: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    codigo: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    razon_social: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hora: {
      type: DataTypes.TIME,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    idpersona: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'persona',
        key: 'idpersona'
      }
    },
    idciudad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ciudad',
        key: 'idciudad'
      }
    }
  }, {
    sequelize,
    tableName: 'libreria',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "libreria_pkey",
        unique: true,
        fields: [
          { name: "idlibreria" },
        ]
      },
    ]
  });
};
