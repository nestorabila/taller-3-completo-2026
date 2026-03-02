const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pago', {
    idpago: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
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
      allowNull: false,
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
    monto: {
      type: DataTypes.INTEGER,
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
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1 // 1 = Registrado, 0 = Anulado (ejemplo)
    },
    nota: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'pago',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pago_pkey",
        unique: true,
        fields: [
          { name: "idpago" }
        ]
      }
    ]
  });
};
