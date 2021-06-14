'use strict';
const { Model, Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Laboratorio extends Model {
    static associate(models) {
    }
  };
  Laboratorio.init({
    idLaboratorio: {
      field: "id_laboratorio",
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    dtCadastro: {
      field: "dt_cadastro",
      type: DataTypes.DATE,
      allowNull: false
    },
    nmLaboratorio: {
      field: "nm_laboratorio",
      type: DataTypes.STRING,
      allowNull: false
    },
    dsEndereco: {
      field: "ds_endereco",
      type: DataTypes.STRING,
      allowNull: false
    },
    flStatus: {
      field: "fl_status",
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    dtExclusao: {
      field: "dt_exclusao",
      type: DataTypes.DATE,
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'Laboratorio',
    tableName: "tb_laboratorio",
    timestamps: false,
  });
  return Laboratorio;
};

