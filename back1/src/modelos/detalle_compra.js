const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('detalle_compra', {
    iddetalle_compra: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    precio_u: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    precio_t: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    cantidad_u: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cantidad_e: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cantidad_t: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    observacion: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    idproducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'producto',
        key: 'idproducto'
      }
    },
    idempaque: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empaque',
        key: 'idempaque'
      }
    },
    idcompra: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'compra',
        key: 'idcompra'
      }
    }
  }, {
    sequelize,
    tableName: 'detalle_compra',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "detalle_compra_pkey",
        unique: true,
        fields: [
          { name: "iddetalle_compra" },
        ]
      },
    ]
  });
};
