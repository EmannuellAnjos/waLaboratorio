'use strict';
const { Model, Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LabExame extends Model {
    static associate(models) {
    }
  };
  LabExame.init({
    idLabExame: {
      field: "id_lab_exame",
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    idLaboratorio: {
      field: "id_laboratorio",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idExame: {
      field: "id_exame",
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'LabExame',
    tableName: "tb_lab_exame",
    timestamps: false,
  });
  LabExame.customTableAttributes = {
    dsNomeLaboratorio: {
      field: "nm_laboratorio",
      type: DataTypes.STRING,
      allowNull: false
    },
    dsNomeExame: {
      field: "nm_exame",
      type: DataTypes.STRING,
      allowNull: false
    }
  }
  return LabExame;
};

