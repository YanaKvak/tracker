import supportService from '../services/supportService.js';

const createRoom = async (req, res, next) => {
    try {
        await supportService.createRoom(req.body);
        res.status(201).json({ message: 'Комната создана' });
    } catch (err) {
        next(err);
    }
};

const closeRoom = async (req, res, next) => {
    try {
        await supportService.closeRoom(req.params);
        res.json({ message: 'Комната закрыта' });
    } catch (err) {
        next(err);
    }
};

const createMessage = async (req, res, next) => {
    try {
        await supportService.createMessage(req.body);
        res.status(201).json({ message: 'Сообщение создано'});
    } catch (err) {
        next(err);
    }
};

const getMessages = async (req, res, next) => {
    try {
        const { page, limit, chat_room_id } = req.params || {};
        const messages = await supportService.getMessages({ chat_room_id, page, limit });
        res.json(messages);
    } catch (err) {
        next(err);
    }
};

const getRooms = async (req, res, next) => {
    try {
        const { page, limit, user_id, role } = req.query.page || {};
        const rooms = await supportService.getRooms({ page, limit, user_id, role });
        res.json(rooms);
    } catch (err) {
        next(err);
    }
};

const getRoom = async (req, res, next) => {
    try {
        const room = await supportService.getRoom(req.params);
        res.json(room);
    } catch (err) {
        next(err);
    }
};

export default { createRoom, createMessage, closeRoom, getMessages, getRooms, getRoom };