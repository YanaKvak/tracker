import User from '../models/User.js';
import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Event from '../models/Event.js';
import ChatRoom from '../models/ChatRoom.js';
import Message from '../models/Message.js';

const setupAssociations = () => {
  // User -> Team
  User.hasMany(Team, { foreignKey: 'created_by', as: 'teamsCreated' });
  Team.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  // User -> Task
  User.hasMany(Task, { foreignKey: 'creator_id', as: 'tasksCreated' });
  Task.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });

  // User -> TeamMember
  User.belongsToMany(Team, { through: TeamMember, foreignKey: 'users_id', otherKey: 'team_id', as: 'teams' });
  Team.belongsToMany(User, { through: TeamMember, foreignKey: 'team_id', otherKey: 'users_id', as: 'members' });

  // Team -> Project
  Team.hasMany(Project, { foreignKey: 'team_id', as: 'projects' });
  Project.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });

  // Project -> Task
  Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks' });
  Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

  // User -> Event
  User.hasMany(Event, { foreignKey: 'user_id', as: 'events' });
  Event.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  User.hasMany(Task, { foreignKey: 'assignee_id', as: 'tasksAssigned' });
  Task.belongsTo(User, { foreignKey: 'assignee_id', as: 'assignee' });

  // ChatRoom -> User
  ChatRoom.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  User.hasMany(ChatRoom, { foreignKey: 'user_id', as: 'chatRooms' });

  // Message -> ChatRoom
  Message.belongsTo(ChatRoom, { foreignKey: 'chat_room_id', as: 'chatRoom' });
  ChatRoom.hasMany(Message, { foreignKey: 'chat_room_id', as: 'messages' });

  // Message -> User (sender)
  Message.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  User.hasMany(Message, { foreignKey: 'user_id', as: 'messages' });

};

export default setupAssociations;