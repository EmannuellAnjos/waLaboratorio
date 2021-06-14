'use strict';
const { Model, Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExameTipo extends Model {
    static associate(models) {
    }
  };
  ExameTipo.init({
    idExameTipo: {
      field: "id_exame_tipo",
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nmExameTipo: {
      field: "nm_exame_tipo",
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'ExameTipo',
    tableName: "tb_exame_tipo",
    timestamps: false,
  });
  return ExameTipo;
};

