const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('detalle_pedido', {
    iddetalle_pedido: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    precio_subtotal: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    idcatalogo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'catalogo',
        key: 'idcatalogo'
      }
    },
    idpedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pedido',
        key: 'idpedido'
      }
    }
  }, {
    sequelize,
    tableName: 'detalle_pedido',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "detalle_pedido_pkey",
        unique: true,
        fields: [
          { name: "iddetalle_pedido" },
        ]
      },
    ]
  });
};
