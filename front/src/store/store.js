import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import eventReducer from './slices/eventSlice';
import projectReducer from './slices/projectSlice';
import teamReducer from './slices/teamSlice';
import taskReducer from './slices/taskSlice';
import supportReducer from './slices/supportSlice'

export default configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    projects: projectReducer,
    teams: teamReducer,
    tasks: taskReducer,
    support: supportReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(),
});