import Entity from './Entity';
import createRequest from './createRequest';
import BASE_URL from '../config';

export default class ChatAPI extends Entity {
  constructor() {
    super(BASE_URL);
    this.ws = null;
    this.user = null;
  }

  async registerUser(name) {
    console.log('Registering user:', name);
    try {
      const response = await createRequest({
        url: `${this.baseUrl}/new-user`,
        method: 'POST',
        data: { name },
      });

      console.log('User registration response:', response);

      if (response.status === 'ok') {
        this.user = response.user;
        console.log('User registered successfully:', this.user);
        this.connectWebSocket();
        return response.user;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Failed to register user:', error);
      throw error;
    }
  }

  connectWebSocket() {
    const WS_URL = BASE_URL.replace(/^https/, 'wss');
    console.log('Connecting to WebSocket:', WS_URL);
  
    if (this.ws) {
      console.log('WebSocket already connected.');
      return;
    }
  
    this.ws = new WebSocket(WS_URL);
  
    this.ws.addEventListener('open', () => {
      console.log('WebSocket connection opened.');
    });
  
    this.ws.addEventListener('message', (event) => {
      console.log('WebSocket message received:', event.data);
      const message = JSON.parse(event.data);
      this.handleWebSocketMessage(message);
    });
  
    this.ws.addEventListener('close', () => {
      console.log('WebSocket connection closed.');
      this.ws = null;
    });
  
    this.ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  handleWebSocketMessage(message) {
    console.log('Handling WebSocket message:', message);
  
    if (Array.isArray(message)) {
      // Обновление списка пользователей
      console.log('User list updated:', message);
      document.dispatchEvent(new CustomEvent('userListUpdate', { detail: message }));
    } else if (message.type === 'send' && message.content?.type === 'requestUserList') {
      this.addUserToList(message.user);
    } else if (message.type === 'send' && message.content?.type === 'removeUser') {
      // Удаление пользователя, если сервер присылает сообщение removeUser
      document.dispatchEvent(new CustomEvent('removeUser', { detail: message.content }));
    } else if (message.type === 'send') {
      // Обработка нового сообщения в чат
      this.handleNewMessage(message);
    } else if (message.type === 'exit') {
      this.exitChat();
      // Удаление пользователя при выходе
      console.log('User exited:', message.user);
      // Логика для удаления пользователя
      document.dispatchEvent(new CustomEvent('removeUser', { detail: message.user }));
    } else {
      console.error('Received invalid WebSocket message:', message);
    }
  }
  addUserToList(user) {
    console.log('Adding new user to list:', user);
    document.dispatchEvent(new CustomEvent('addUser', { detail: user }));
  }

  removeUserFromList(userId) {
    // Здесь ты должен обновить список пользователей на клиенте
    console.log('Removing user with ID:', userId);
  
    // Отправляем событие обновления списка пользователей
    document.dispatchEvent(new CustomEvent('removeUser', { detail: { userId } }));
  }

async requestUserList() {
  // Отправляем запрос на обновление через WebSocket
  if (this.ws && this.ws.readyState === WebSocket.OPEN) {
    const message = { type: 'exit' };
    this.sendMessage(message);
  } else {
    console.error('WebSocket is not connected.');
  }
}

  handleNewMessage(message) {
    console.log('New message received:', message);
    document.dispatchEvent(new CustomEvent('newMessage', { detail: message }));
  }

  sendMessage(content) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected.');
      return;
    }

    console.log('Sending message:', content);

    const message = {
      type: 'send',
      user: this.user,
      content,
    };

    this.ws.send(JSON.stringify(message));
  }

  exitChat() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Отправляем сообщение о выходе перед закрытием WebSocket
      const message = {
        type: 'exit',
        user: this.user,
      };
      this.ws.send(JSON.stringify(message));
      this.ws.close();
    } else {
      console.error('WebSocket is not connected.');
    }
  }
}