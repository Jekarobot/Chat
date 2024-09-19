import ChatAPI from "./api/ChatAPI";

export default class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatAPI();
    this.user = null;
    this.isSubscribed = false;
  }

  init() {
    this.bindToDOM();
    this.registerEvents();
  }

  bindToDOM() {
    this.container.innerHTML = `
      <div class="chat__container">
        <ul class="chat__userlist" id="userList"></ul>
        <div class="chat__area">
          <div class="chat__messages-container" id="messagesContainer"></div>
          <div class="chat__messages-input">
            <input type="text" id="messageInput" class="form__input" placeholder="Type your message here">
          </div>
        </div>
      </div>
    `;
  }

  registerEvents() {
    const messageInput = this.container.querySelector('#messageInput');
  
    messageInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter' && event.target.value.trim() !== '') {
        console.log('Sending message:', event.target.value);
        this.sendMessage(event.target.value);
        event.target.value = ''; 
      }
    });
  
    this.subscribeOnEvents();
  }

  subscribeOnEvents() {
    if (!this.api.ws || this.api.ws.readyState !== WebSocket.OPEN) {
      console.log('WebSocket is not open. Attempting to connect...');
      this.api.connectWebSocket();
    } else {
      console.log('WebSocket is already connected.');
    }
  
    if (!this.isSubscribed) {
      // Обработка обновленного списка пользователей
      document.addEventListener('userListUpdate', (event) => {
        console.log('User list update event received:', event.detail);
        this.updateUserList(event.detail);
      });
  
      // Обработка добавления нового пользователя
      document.addEventListener('addUser', (event) => {
        console.log('Add user event received:', event.detail);
        this.addUser(event.detail);
      });
  
      // Обработка новых сообщений
      document.addEventListener('newMessage', (event) => {
        const { content, user } = event.detail;
        this.renderMessage(content, user);
      });
  
      // Обработка удаления пользователя
      document.addEventListener('removeUser', (event) => {
        const { userId } = event.detail;
        console.log('Remove user event received for userId:', userId);
        this.requestUpdatedUserList(); // Запрашиваем обновленный список пользователей
      });
  
      this.isSubscribed = true;
    }
  }

  addUser(user) {
    console.log('Adding user:', user);
    const userListElement = document.querySelector('#userList');
    if (!userListElement) {
      console.error('User list element not found.');
      return;
    }
  
    const userElement = document.createElement('li');
    userElement.textContent = user.name;
    userListElement.appendChild(userElement);
  }

  async onEnterChatHandler(nickname) {
    console.log('Entering chat with nickname:', nickname);
    try {
      const user = await this.api.registerUser(nickname);
      if (user) {
        this.user = user;
        document.querySelector('.modal__form').classList.remove('active');
    
        // После логина запрашиваем обновленный список пользователей
        if (this.api.ws && this.api.ws.readyState === WebSocket.OPEN) {
          console.log('Requesting user list...');
          this.api.sendMessage({ type: 'requestUserList' });
        } else {
          console.error('WebSocket is not connected or not open.');
        }
    
        this.subscribeOnEvents();
      } else {
        document.getElementById('errorHint').textContent = 'Ошибка регистрации пользователя';
      }
    } catch (error) {
      console.error('Error entering chat:', error);
    }
  }

  requestUpdatedUserList() {
    if (this.api.ws && this.api.ws.readyState === WebSocket.OPEN) {
      this.api.sendMessage({ type: 'requestUserList' }); // Отправляем запрос на обновление списка
    } else {
      console.error('WebSocket is not connected or not open.');
    }
  }

  onExitChatHandler() {
    if (this.user) {
      console.log('Exiting chat for user:', this.user.name);
      if (this.api.ws && this.api.ws.readyState === WebSocket.OPEN) {
        this.api.sendMessage({ type: 'removeUser', userId: this.user.id });
      } else {
        console.error('WebSocket is not connected or not open.');
      }
    }
  }

  sendMessage(message) {
    console.log('Sending message:', message);
    this.api.sendMessage(message);
  }

  renderMessage(content, user) {
    const messagesContainer = this.container.querySelector('#messagesContainer');
    const messageContainer = document.createElement('div');
    messageContainer.className = user.name === this.user.name ? 'message__container-yourself' : 'message__container-interlocutor';
    messageContainer.innerHTML = `
      <div class="message__header">${user.name === this.user.name ? 'You' : user.name}, ${new Date().toLocaleString()}</div>
      <div class="message__text">${content}</div>
    `;
    messagesContainer.appendChild(messageContainer);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
updateUserList(users) {
  console.log('Updating user list:', users);
  const userListElement = document.querySelector('#userList');
  if (!userListElement) {
    console.error('User list element not found.');
    return;
  }

  // Очистим предыдущий список
  userListElement.innerHTML = '';

  users.forEach(user => {
    if (user.name) {
      const userElement = document.createElement('li');
      userElement.textContent = user.name;
      userElement.dataset.userId = user.id; // Для идентификации пользователя
      userListElement.appendChild(userElement);
    } else {
      console.error('User object does not have a name property:', user);
    }
  });
}

  removeUserFromList(userId) {
    console.log('Removing user with ID:', userId);
    
    const userListElement = document.querySelector('#userList');
    if (!userListElement) {
      console.error('User list element not found.');
      return;
    }
  
    // Находим и удаляем пользователя из списка
    const userItems = Array.from(userListElement.children);
    userItems.forEach((item) => {
      if (item.dataset.userId === userId) {
        userListElement.removeChild(item);
      }
    });
  }

  exitChat() {
    console.log('Exiting chat.');
  
    if (this.api.ws && this.api.ws.readyState === WebSocket.OPEN) {
      if (this.user) {
        this.api.ws.send(JSON.stringify({ type: 'exit', user: this.user }));
      }
    } else {
      console.error('WebSocket is not connected or not open.');
    }
  
    this.updateUserList([]);
    this.api.exitChat();
  }
}
