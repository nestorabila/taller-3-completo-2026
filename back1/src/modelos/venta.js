const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('venta', {
    idventa: {
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
    idpedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pedido',
        key: 'idpedido'
      }
    },
    idmetodo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'metodo_pago',
        key: 'idmetodo'
      }
    },
    idpersona: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'persona',
        key: 'idpersona'
      }
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'venta',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "venta_pkey",
        unique: true,
        fields: [
          { name: "idventa" },
        ]
      },
    ]
  });
};
