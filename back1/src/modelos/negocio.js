const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('negocio', {
    idnegocio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    direccion: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    idciudad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ciudad',
        key: 'idciudad'
      },
      unique: "negocio_idciudad_key"
    },
    long: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    lat: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'negocio',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "negocio_idciudad_key",
        unique: true,
        fields: [
          { name: "idciudad" },
        ]
      },
      {
        name: "negocio_pkey",
        unique: true,
        fields: [
          { name: "idnegocio" },
        ]
      },
    ]
  });
};
