const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BorrowLog = sequelize.define("BorrowLog", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  borrowDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  latitude: DataTypes.FLOAT,
  longitude: DataTypes.FLOAT,
});

module.exports = BorrowLog;
