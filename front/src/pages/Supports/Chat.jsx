import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMessages, addMessageToStore, addMessage, closeChatRoomById, fetchChatRoom } from '../../store/slices/supportSlice';
import { toast, ToastContainer } from 'react-toastify';
import { io } from 'socket.io-client';

export default function Chat() {
    const { t, i18n } = useTranslation();
    const { chat: chatRoomId } = useParams();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const messagesState = useSelector((state) => state.support.messagesByRoomId[chatRoomId] || {});
    const currentRoomLoading = useSelector((state) => state.support.currentRoomLoading);
    const currentRoomError = useSelector((state) => state.support.currentRoomError);
    const currentRoom = useSelector((state) => state.support.currentRoom);
    const { messages = [], loading = false, error = null } = messagesState;
    const [text, setText] = useState('');
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && savedLanguage !== i18n.language) {
        i18n.changeLanguage(savedLanguage);
        }
    }, [i18n]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (chatRoomId) {
          dispatch(fetchChatRoom(chatRoomId)).then((res) => {
            console.log('Комната загружена:', res);
          });
        }
      }, [dispatch, chatRoomId]);

    useEffect(() => {
        if (!chatRoomId) return;
        
        dispatch(fetchMessages({ chat_room_id: chatRoomId, page: 1, limit: 50 }));

        socketRef.current = io('http://localhost:8080');

        if (user.role === 'admin') {
            socketRef.current.emit('join_support_chat', { userId: chatRoomId });
        } else if (user.role === 'manager' || user.role === 'employee') {
            socketRef.current.emit('join_user_chat', { userId: chatRoomId });
        }

        socketRef.current.on('receive_message', (message) => {
        dispatch(addMessageToStore({ chat_room_id: chatRoomId, message }));
        console.log('Сообщение поймано')
        });

        return () => {
        socketRef.current.disconnect();
        };
    }, [chatRoomId, dispatch]);

    useEffect(() => {
        if (error) {
        toast.error(error.message || t('error_loading_messages'));
        }
    }, [error, t]);

    const handleCloseRoom = () => {
        dispatch(closeChatRoomById(chatRoomId))
          .unwrap()
          .then(() => {
            toast.success(t('chat_closed_success'));
            navigate('/support');
          })
          .catch((err) => {
            toast.error(err.message || t('error_closing_chat'));
          });
      };

    const handleSend = () => {
        if (!text.trim()) return toast.error(t('empty_message_error'));
        const messageData = {
        chat_room_id: chatRoomId,
        text,
        sender: user.role,
        user_id: user.id,
        };

        dispatch(addMessage(messageData))
        .unwrap()
        .then(() => {
            socketRef.current.emit('send_message', {
            userId: chatRoomId,
            sender: user.role,
            text,
            });
            setText('');
        })
        .catch((err) => {
            toast.error(err.message || t('error_sending_message'));
        });
    };

    return (
        <nav className="home-container">
        <ToastContainer />
        <nav className="main-content">
            <nav className="breadcrumb">{t('breadcrump_support_chat')}</nav>
            {currentRoomLoading ? (
            <h1 className="dashboard-title">{t('loading_messages')}</h1>
            ) : currentRoomError ? (
            <h1 className="dashboard-title">{t('error_loading_messages')}</h1>
            ) : currentRoom ? (
            <h1 className="dashboard-title">
                {t('support_title_chat')} "{currentRoom.topic}"
            </h1>
            ) : null}
            <div className="chat-messages" style={{ maxHeight: '500px', overflowY: 'auto', marginBottom: '1rem' }}>
            {loading && <p>{t('loading_messages')}</p>}
            {!loading && messages && messages.length === 0 && <p>{t('no_messages')}</p>}
            {!loading && messages && messages.length > 0 &&
                messages.map((msg) => (
                <div key={msg.id} className={`message-item ${msg.sender === user.role ? 'own-message' : ''}`} style={{ marginBottom: '10px' }}>
                    <div><strong>{msg.sender}</strong></div>
                    <div>{msg.text}</div>
                    <div style={{ fontSize: '0.8em', color: 'gray' }}>{new Date(msg.createdAt || Date.now()).toLocaleString()}</div>
                </div>
                ))
            }
            <div ref={messagesEndRef} />
            </div>

            <div className="chat-input" style={{ display: 'flex', gap: '10px' }}>
            <input
                type="text"
                placeholder={t('enter_message')}
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ flexGrow: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <button
                onClick={handleSend}
                style={{ padding: '10px 20px', borderRadius: '5px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
                {t('send')}
            </button>
            </div>
        </nav>
        <button className="create-button mx-2" onClick={() => navigate('/support')}>
            {t('back_to_list_chat')}
        </button>
        <button className="create-button" onClick={() => handleCloseRoom()}>
            {t('close_chat')}
        </button>
        </nav>
    );
}
