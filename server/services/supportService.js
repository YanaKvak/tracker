import Message from "../models/Message.js";
import User from "../models/User.js";
import ChatRoom from "../models/ChatRoom.js";
import { sendEmail } from "./emailService.js";
import teamService from "./teamService.js"
import { Op } from 'sequelize';

const createMessage = async ({ text, sender, chat_room_id, user_id }) => {
    const user = await User.findByPk(user_id)
    const chatRoom = await ChatRoom.findOne({
        where: { id: chat_room_id },
        include: ['user']
    });

    if (!user || !chatRoom) {
        throw new Error("Пользователь или чат-комната не найдены")
    }
    if (chatRoom.status === 'closed') {
        const error = new Error('Чат-комната закрыта');
        error.status = 400;
        throw error;
    }

    // if (sender === 'admin') {
    //     try {
    //         await sendEmail({
    //         to: chatRoom.user.email,
    //         subject: `Новое сообщение в вашем чате #${chatRoom.id}`,
    //         html: `<p>Здравствуйте, у вас новое сообщение от поддержки:</p><p>${text}</p><p>Перейдите в чат для ответа.</p>`
    //         });
    //     } catch (err) {
    //         console.error('Ошибка отправки email:', err);
    //     }
    // }

    return await Message.create({ 
        text,
        sender,
        user_id: user.id,
        chat_room_id: chatRoom.id
    })
}

const closeRoom = async ({ chat_room_id }) => {
    const chatRoom = await ChatRoom.findByPk(chat_room_id)

    if (!chatRoom) {
        const error = new Error('Чат-комната не найдена');
        error.status = 404;
        throw error;
    }
    
    if (chatRoom.status === 'closed') {
        const error = new Error('Чат-комната уже закрыта');
        error.status = 400;
        throw error;
    }
  
    chatRoom.status = "closed";
    await chatRoom.save();
}

const createRoom = async ({ status = 'open', user_id, topic, team_id }) => {
    const user = await User.findByPk(user_id)

    if (!user) {
        throw new Error("Пользователь не найден")
    }

    return await ChatRoom.create({
        topic,
        status,
        user_id: user.id,
        team_id: team_id,
    })
}

const getMessages = async ({ chat_room_id }) => {

    const { count, rows } = await Message.findAndCountAll({
        where: { chat_room_id },
        order: [['createdAt', 'ASC']],
        include: ['user'],
    });

    return {
        messages: rows,
    };
};

// Получаем комнаты. Для админа - все, для создателя его комната, для всех участников в выбранной комнате
const getRooms = async ({ user_id, team_id, role }) => {
    if (!role) {
        return { rooms: [] };
    }

    const where = {};

    // if (role === 'employee' || role === 'manager') {
    //     if (team_id) {}
    //     const included_users = await teamService.getTeamMembers(team_id);
    //     const userIds = included_users.map(user => user.id);

    //     where[Op.or] = [
    //         { user_id: user_id },
    //         { team_id: team_id }
    //     ];
    // }

    if (role === 'employee' || role === 'manager') {
        const orConditions = [{ user_id: user_id }];
      
        if (team_id) {
            orConditions.push({ team_id: team_id });
        }
      
        where[Op.or] = orConditions;
    }

    if (!role) {
        return {
          rooms: [],
        }
    }

    const { count, rows } = await ChatRoom.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
    });

    return {
        rooms: rows,
    };
};

const createCallback = async ({ text, email }) => {

    try {
        await sendEmail({
        to: process.env.EMAIL_FROM,
        subject: `Новое сообщение в поддержку`,
        html: `<p>${text}</p>Почта отправителя ${email}`
        });
    } catch (err) {
        console.error('Ошибка отправки email:', err);
    }
}


const getRoom = async ({ chat_room_id }) => {
    console.log(chat_room_id)

    const room = await ChatRoom.findByPk(chat_room_id)
    return room
}

export default { createMessage, createRoom, closeRoom, getMessages, getRooms, getRoom, createCallback }