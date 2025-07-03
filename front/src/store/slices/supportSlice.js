import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createChatRoom,
  closeChatRoom,
  getChatRooms,
  createMessage,
  getMessages,
  getRoom
} from '../../api/supportApi';

export const fetchChatRooms = createAsyncThunk(
  'support/fetchChatRooms',
  async ({ user_id, team_id, role }, thunkAPI) => {
    try {
      return await getChatRooms({ user_id, team_id, role });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchChatRoom = createAsyncThunk(
    'support/fetchChatRoom',
    async (chat_room_id, thunkAPI) => {
      try {
        return await getRoom(chat_room_id);
      } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
      }
    }
);

export const addChatRoom = createAsyncThunk(
  'support/addChatRoom',
  async (roomData, thunkAPI) => {
    try {
      return await createChatRoom(roomData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const closeChatRoomById = createAsyncThunk(
  'support/closeChatRoomById',
  async (chat_room_id, thunkAPI) => {
    try {
      return await closeChatRoom(chat_room_id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'support/fetchMessages',
  async ({ chat_room_id, page = 1, limit = 50 }, thunkAPI) => {
    try {
      const data = await getMessages(chat_room_id, page, limit);
      return { chat_room_id, ...data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addMessage = createAsyncThunk(
  'support/addMessage',
  async (messageData, thunkAPI) => {
    try {
      return await createMessage(messageData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const supportSlice = createSlice({
  name: 'support',
  initialState: {
    rooms: [],
    roomsPagination: {},
    roomsLoading: false,
    roomsError: null,

    currentRoom: null,
    currentRoomLoading: false,
    currentRoomError: null,

    messagesByRoomId: {},
  },
  reducers: {
    clearMessagesForRoom(state, action) {
      delete state.messagesByRoomId[action.payload];
    },
    addMessageToStore(state, action) {
        const { chat_room_id: roomId, message } = action.payload;
        if (!state.messagesByRoomId[roomId]) {
          state.messagesByRoomId[roomId] = {
            messages: [],
            pagination: {},
            loading: false,
            error: null,
          };
        }
        state.messagesByRoomId[roomId].messages.push(message);
      }      
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatRooms.pending, (state) => {
        state.roomsLoading = true;
        state.roomsError = null;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.roomsLoading = false;
        // Добавляем новые комнаты к уже существующим, без дубликатов
        const newRooms = action.payload.rooms || [];
        const existingRooms = state.rooms || [];
      
        // Можно фильтровать дубликаты по id
        const existingRoomIds = new Set(existingRooms.map(r => r.id));
        const combinedRooms = [
          ...existingRooms,
          ...newRooms.filter(r => !existingRoomIds.has(r.id))
        ];
      
        state.rooms = combinedRooms;
        state.roomsPagination = action.payload.pagination || {};
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.roomsLoading = false;
        state.roomsError = action.payload || 'Failed to fetch chat rooms';
      })

      .addCase(addChatRoom.pending, (state) => {
        state.roomsError = null;
      })
      .addCase(addChatRoom.fulfilled, (state, action) => {
        // state.rooms.unshift(action.payload);
      })
      .addCase(addChatRoom.rejected, (state, action) => {
        state.roomsError = action.payload || 'Failed to create chat room';
      })

      .addCase(closeChatRoomById.pending, (state) => {
        state.roomsError = null;
      })
      .addCase(closeChatRoomById.fulfilled, (state, action) => {
        const closedRoomId = action.meta.arg;
        const room = state.rooms.find((r) => r.id === closedRoomId);
        if (room) room.status = 'closed';
      })
      .addCase(closeChatRoomById.rejected, (state, action) => {
        state.roomsError = action.payload || 'Failed to close chat room';
      })

      .addCase(fetchMessages.pending, (state, action) => {
        const roomId = action.meta.arg.chat_room_id;
        if (!state.messagesByRoomId[roomId]) state.messagesByRoomId[roomId] = {};
        state.messagesByRoomId[roomId].loading = true;
        state.messagesByRoomId[roomId].error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const roomId = action.payload.chat_room_id;
        state.messagesByRoomId[roomId] = {
          messages: action.payload.messages,
          pagination: action.payload.pagination,
          loading: false,
          error: null,
        };
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        const roomId = action.meta.arg.chat_room_id;
        if (!state.messagesByRoomId[roomId]) state.messagesByRoomId[roomId] = {};
        state.messagesByRoomId[roomId].loading = false;
        state.messagesByRoomId[roomId].error =
          action.payload || 'Failed to fetch messages';
      })
      .addCase(fetchChatRoom.pending, (state) => {
        state.currentRoomLoading = true;
        state.currentRoomError = null;
      })
      .addCase(fetchChatRoom.fulfilled, (state, action) => {
        state.currentRoom = action.payload;
        state.currentRoomLoading = false;
      })
      .addCase(fetchChatRoom.rejected, (state, action) => {
        state.currentRoomLoading = false;
        state.currentRoomError = action.payload || 'Failed to fetch chat room';
      })
      .addCase(addMessage.fulfilled, (state, action) => {
        const msg = action.payload;
        const roomId = msg.chat_room_id;
        if (!state.messagesByRoomId[roomId]) {
          state.messagesByRoomId[roomId] = {
            messages: [],
            pagination: {},
            loading: false,
            error: null,
          };
        }
        state.messagesByRoomId[roomId].messages.push(msg);
      });
  },
});

export const { clearMessagesForRoom, addMessageToStore } = supportSlice.actions;

export default supportSlice.reducer;