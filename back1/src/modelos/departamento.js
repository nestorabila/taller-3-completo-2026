const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('departamento', {
    iddep: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'departamento',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "departamento_pkey",
        unique: true,
        fields: [
          { name: "iddep" },
        ]
      },
    ]
  });
};
