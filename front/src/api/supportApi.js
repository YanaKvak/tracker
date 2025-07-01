import api from './api';

// Создать чат-комнату
export const createChatRoom = async ({ user_id, topic, status }) => {
    const response = await api.post('/support/chat-room', { user_id, topic, status });
    return response.data;
};

// Закрыть чат-комнату
export const closeChatRoom = async (chat_room_id) => {
    const response = await api.post(`/support/chat-room/${chat_room_id}/close`);
    return response.data;
};

// Получить список чат-комнат с пагинацией
export const getChatRooms = async (page = 1, limit = 20, user_id, role) => {
    const response = await api.get('/support/chat-room', { params: { page, limit, user_id, role } });
    return response.data;
};

// Создать сообщение в чат-комнате
export const createMessage = async ({ chat_room_id, text, sender, user_id }) => {
    const response = await api.post('/support/chat-room/messages', { chat_room_id, text, sender, user_id });
    return response.data;
};

// Получить сообщения из чат-комнаты с пагинацией
export const getMessages = async (chat_room_id, page = 1, limit = 50) => {
    const response = await api.get(`/support/chat-room/${chat_room_id}/messages`, {
        params: { page, limit },
    });
    return response.data;
};

// Получить чат-комнату по иду
export const getRoom = async (chat_room_id) => {
    const response = await api.get(`/support/chat-room/${chat_room_id}/`);
    console.log(response)
    return response.data;
};
