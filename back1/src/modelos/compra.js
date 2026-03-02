const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('compra', {
    idcompra: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hora: {
      type: DataTypes.TIME,
      allowNull: false
    },
    idproveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'proveedor',
        key: 'idproveedor'
      }
    }
  }, {
    sequelize,
    tableName: 'compra',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "compra_pkey",
        unique: true,
        fields: [
          { name: "idcompra" },
        ]
      },
    ]
  });
};
