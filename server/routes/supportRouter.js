import { Router } from 'express';
import supportController from '../controllers/supportController.js';
import { supportSchema } from '../utils/validators.js';
import validate from '../middleware/validate.js';

const router = Router()

router.post('/chat-room', validate(supportSchema.create_room), supportController.createRoom)
router.get('/chat-room', supportController.getRooms)
router.get('/chat-room/:chat_room_id/', supportController.getRoom)
router.post('/chat-room/:chat_room_id/close', validate(supportSchema.close_room), supportController.closeRoom);
router.post('/chat-room/messages', validate(supportSchema.create_message), supportController.createMessage)
router.get('/chat-room/:chat_room_id/messages', supportController.getMessages);
router.post('/callback', validate(supportSchema.callback), supportController.createCallback);

export default router