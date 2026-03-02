const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('auditoria', {
    id_aud: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    accion: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_DATE')
    },
    hora: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: "CURRENT_TIME"
    },
    datos_original: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    datos_nuevo: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    idpersona: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'persona',
        key: 'idpersona'
      }
    }
  }, {
    sequelize,
    tableName: 'auditoria',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "auditoria_pkey",
        unique: true,
        fields: [
          { name: "id_aud" },
        ]
      },
    ]
  });
};
