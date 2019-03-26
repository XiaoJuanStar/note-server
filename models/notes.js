module.exports = (sequelize, DataTypes) => sequelize.define(
    'notes',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      note_title: DataTypes.STRING,
      note_content: DataTypes.TEXT,
      note_picture: DataTypes.STRING,
      open_id: DataTypes.STRING,
    },
    {
      tableName: 'notes',
    },
  );