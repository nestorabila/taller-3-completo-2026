const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('empaque', {
    idempaque: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'empaque',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "empaque_pkey",
        unique: true,
        fields: [
          { name: "idempaque" },
        ]
      },
    ]
  });
};
