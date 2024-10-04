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
    try {
      const response = await createRequest({
        url: `${this.baseUrl}/new-user`,
        method: 'POST',
        data: { name },
      });

      if (response.status === 'ok') {
        this.user = response.user;
        this.connectWebSocket();
        return response.user;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      if (error.message.includes('409')) {
        alert('Имя пользователя уже занято. Пожалуйста, выберите другое имя.');
      }
      throw error;
    }
  }

  connectWebSocket() {
    const WS_URL = BASE_URL.replace(/^https/, 'wss');
  
    if (this.ws) {
      return;
    }
  
    this.ws = new WebSocket(WS_URL);
  
    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      this.handleWebSocketMessage(message);
    });
  
    this.ws.addEventListener('close', () => {
      this.ws = null;
    });
  }

  handleWebSocketMessage(message) {
  
    if (Array.isArray(message)) {
      // Обновление списка пользователей
      document.dispatchEvent(new CustomEvent('userListUpdate', { detail: message }));
    } else if (message.type === 'send') {
      if (message.content.type === 'exit') {
        // Удаляем пользователя из списка
        this.removeUserFromList(message.user.id);
      } else {
        // Обработка нового сообщения в чат
        this.handleNewMessage(message);
      }
    } 
  }
  
  addUserToList(user) {
    document.dispatchEvent(new CustomEvent('addUser', { detail: user }));
  }

  removeUserFromList(userId) {
    const userListElement = document.querySelector('#userList');
    if (!userListElement) {
      return;
    }
  
    // Находим и удаляем пользователя из списка
    const userItem = Array.from(userListElement.children).find((item) => item.dataset.userId === userId);
    if (userItem) {
      userListElement.removeChild(userItem);
    } 
  }
  async requestUserList() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = { type: 'requestUserList' }; 
      this.sendMessage(message);
    } 
  }

  handleNewMessage(message) {
    document.dispatchEvent(new CustomEvent('newMessage', { detail: message }));
  }

  sendMessage(content, type = 'send') {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
  
    const message = {
      type,
      user: this.user,
      content,
    };
  
    this.ws.send(JSON.stringify(message));
  }
}