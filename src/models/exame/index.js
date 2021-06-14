'use strict';
const { Model, Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Exame extends Model {
    static associate(models) {
    }
  };
  Exame.init({
    idExame: {
      field: "id_exame",
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nmExame: {
      field: "nm_exame",
      type: DataTypes.STRING,
      allowNull: false
    },
    idExameTipo: {
      field: "id_exame_tipo",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    flStatus: {
      field: "fl_status",
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Exame',
    tableName: "tb_exame",
    timestamps: false,
  });
  Exame.customTableAttributes = {
    dsNomeExameTipo: {
      field: "nm_exame_tipo",
      type: DataTypes.STRING,
      allowNull: false
    }
  }
  return Exame;
};

