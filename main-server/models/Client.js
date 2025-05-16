const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Agregar más campos según sea necesario
}, {
  timestamps: true,
  tableName: 'clients'
});

module.exports = Client; 