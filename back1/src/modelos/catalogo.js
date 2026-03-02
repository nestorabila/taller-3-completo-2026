const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('catalogo', {
    idcatalogo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    fotografia: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hora: {
      type: DataTypes.TIME,
      allowNull: false
    },
    destacado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    precio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    idcategoria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categoria',
        key: 'idcategoria'
      }
    }
  }, {
    sequelize,
    tableName: 'catalogo',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "catalogo_pkey",
        unique: true,
        fields: [
          { name: "idcatalogo" },
        ]
      },
    ]
  });
};
