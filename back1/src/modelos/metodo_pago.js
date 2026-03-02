const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('metodo_pago', {
    idmetodo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'metodo_pago',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "metodo_pago_pkey",
        unique: true,
        fields: [
          { name: "idmetodo" },
        ]
      },
    ]
  });
};
