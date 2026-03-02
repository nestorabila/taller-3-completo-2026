const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ciudad', {
    idciudad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    iddep: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'departamento',
        key: 'iddep'
      }
    }
  }, {
    sequelize,
    tableName: 'ciudad',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "ciudad_pkey",
        unique: true,
        fields: [
          { name: "idciudad" },
        ]
      },
    ]
  });
};
