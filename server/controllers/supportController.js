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
        await supportService.closeRoom(req.body);
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
        const chat_room_id = req.params.chat_room_id;
        const messages = await supportService.getMessages({ chat_room_id });
        res.json(messages);
    } catch (err) {
        next(err);
    }
};

const getRooms = async (req, res, next) => {
    try {
        const rooms = await supportService.getRooms(req.query);
        res.json(rooms);
    } catch (err) {
        next(err);
    }
};

const getRoom = async (req, res, next) => {
    try {
        const room = await supportService.getRoom(req.body);
        res.json(room);
    } catch (err) {
        next(err);
    }
};

const createCallback = async (req, res, next) => {
    try {
        await supportService.createCallback(req.body);
        res.status(200).json([]);
    } catch (err) {
        next(err);
    }
};

export default { createRoom, createMessage, closeRoom, getMessages, getRooms, getRoom, createCallback };