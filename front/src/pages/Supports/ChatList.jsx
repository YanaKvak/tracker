import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatRooms, addChatRoom } from '../../store/slices/supportSlice';
import { useTranslation } from 'react-i18next';
import { toast, ToastContainer } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import './ChatList.css';
import { useNavigate } from 'react-router-dom';
import { getTeams, addTeam, editTeam, removeTeam, searchUsers, clearSearchResults } from '../../store/slices/teamSlice';

export default function ChatList() {
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const { teams, searchResults, loading: teamLoading, error: teamError } = useSelector((state) => state.teams);
    const { rooms, loading, error } = useSelector((state) => state.support);
    const [showForm, setShowForm] = useState(false);
    const [topic, setTopic] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && savedLanguage !== i18n.language) {
        i18n.changeLanguage(savedLanguage);
        }
        dispatch(getTeams(user.id)).catch((err) => {
            console.error('Ошибка загрузки команд:', err);
            toast.error('Не удалось загрузить команды');
        });
    }, [i18n]);

    useEffect(() => {
        if (user && teams.length) {
          teams.forEach(team => {
            dispatch(fetchChatRooms({
              user_id: user.id,
              team_id: team.id,
              role: user.role
            }));
          });
        } else if (user){
            dispatch(fetchChatRooms({
              user_id: user.id,
              role: user.role
            }));
        }
      }, [dispatch, user, teams]);

    useEffect(() => {
        if (error) {
        toast.error(error.message || 'Error loading chat rooms');
        }
    }, [error]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        dispatch(getTeams(user)).catch((err) => {
            console.error('Ошибка загрузки команд:', err);
            toast.error('Не удалось загрузить команды');
        });
    }, [dispatch, user, navigate]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!topic.trim()) {
        toast.error(t('topic_required'));
        return;
        }
        try {
            console.log(user.id, topic, selectedTeam)
            await dispatch(addChatRoom({
                user_id: user.id,
                topic,
                status: 'open',
                team_id: Number(selectedTeam),
            })).unwrap();
            toast.success(t('chat_created'));
            setTopic('');
            setShowForm(false);
            dispatch(fetchChatRooms({
                user_id: user.id,
                team_id: Number(selectedTeam),
                role: user.role,
            }));
        } catch (err) {
        toast.error(err.message || t('error_creating_chat'));
        }
    };

    return (
        <nav className="home-container">
            <ToastContainer />
            <nav className="main-content">
                <nav className="breadcrumb">{t('breadcrump_support')}</nav>
                <h1 className="dashboard-title">{user?.role === 'admin' ? t('support_title_admin') : t('support_title')}</h1>
                {/* {user.role != "admin" &&  */}
                    <button className="create-button" onClick={() => setShowForm(true)}>
                        {t('create_new_chat')}
                    </button>
                {/* } */}
                {loading && <p>Loading...</p>}
                {!loading && rooms && rooms.length === 0 && <p>{t('no_chat_rooms')}</p>}
                {!loading && rooms && rooms.length > 0 && (
                <ul>
                    {rooms.map(room => (
                        <div key={room.id} className="chat-item" onClick={room.status !== 'closed' ? () => navigate(`/support/${room.id}`) : undefined}>
                            <div className="chat-content">
                                {room.status == "closed" ? (<span className='text-muted'>{room.topic}</span>) : (<strong>{room.topic}</strong>)}
                                {room.status == "closed" ? (<span className='text-muted'>{new Date(room.createdAt).toLocaleString()}</span>) : (<span>{new Date(room.createdAt).toLocaleString()}</span>)}
                            </div>
                        </div>
                    ))}
                </ul>
                )}
            </nav>
            {showForm && (
            <div className="event-modal-overlay">
                <div className="event-modal">
                    <div className="event-modal-header">
                        <h3>{t('support_modal_new_chat')}</h3>
                        <button
                        className="close-modal"
                        onClick={() => {
                            setShowForm(false);
                            setTopic('');
                        }}
                        >
                        <FaTimes />
                        </button>
                    </div>

                    <div className="form-group">
                        <label>{t('label_modal_new_chat')}</label>
                        <input
                        type="text"
                        className="form-control"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('project_form_team')}</label>
                        <select
                            className="form-select"
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                        >
                            <option value="">{t('project_form_select_team')}</option>
                            {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-actions">
                        <button
                        className="save-event-button"
                        onClick={handleFormSubmit}
                        disabled={!topic}
                        >
                        {t('save_modal_new_chat')}
                        </button>
                    </div>
                </div>
            </div>
            )}
        </nav>
    );
}
