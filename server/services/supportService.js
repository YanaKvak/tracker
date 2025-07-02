import Message from "../models/Message.js";
import User from "../models/User.js";
import ChatRoom from "../models/ChatRoom.js";
import { sendEmail } from "./emailService.js";

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

    if (sender === 'admin') {
        try {
            await sendEmail({
            to: chatRoom.user.email,
            subject: `Новое сообщение в вашем чате #${chatRoom.id}`,
            html: `<p>Здравствуйте, у вас новое сообщение от поддержки:</p><p>${text}</p><p>Перейдите в чат для ответа.</p>`
            });
        } catch (err) {
            console.error('Ошибка отправки email:', err);
        }
    }

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

const createRoom = async ({ status = 'open', user_id, topic }) => {
    const user = await User.findByPk(user_id)

    if (!user) {
        throw new Error("Пользователь не найден")
    }

    return await ChatRoom.create({
        topic,
        status,
        user_id: user.id,
    })
}

const getMessages = async ({ chat_room_id, page = 1, limit = 20 }) => {
    page = Number(page);
    limit = Number(limit);

    const offset = (page - 1) * limit;

    const { count, rows } = await Message.findAndCountAll({
        where: { chat_room_id },
        order: [['createdAt', 'ASC']],
        include: ['user'],
        limit,
        offset,
    });

    return {
        messages: rows,
        pagination: {
            totalItems: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            pageSize: limit,
        }
    };
};

const getRooms = async ({ page = 1, limit = 20, user_id, role }) => {
    page = Number(page);
    limit = Number(limit);
  
    const offset = (page - 1) * limit;

    const where = {};
    if (role === 'employee' || role === 'manager') {
      where.user_id = user_id;
    }
  
    const { count, rows } = await ChatRoom.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit,
        offset,
    });

    return {
        rooms: rows,
        pagination: {
            totalItems: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            pageSize: limit,
        }
    };
};

const getRoom = async ({ chat_room_id }) => {

    const room = await ChatRoom.findByPk(chat_room_id)
    return room
}

export default { createMessage, createRoom, closeRoom, getMessages, getRooms, getRoom }