import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ChatRoom = sequelize.define('ChatRoom', {
    topic: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('open', 'closed'),
        defaultValue: 'open',
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    team_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
  tableName: 'chat_rooms',
  timestamps: true,
});

export default ChatRoom;