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
        this.sendMessage(event.target.value);
        event.target.value = ''; 
      }
    });

    this.subscribeOnEvents();
  }

  subscribeOnEvents() {
    if (!this.isSubscribed) {
      document.addEventListener('userListUpdate', (event) => {
        this.updateUserList(event.detail);
      });

      document.addEventListener('addUser', (event) => {
        this.addUser(event.detail);
      });

      document.addEventListener('newMessage', (event) => {
        const { content, user } = event.detail;
        this.renderMessage(content, user);
      });

      document.addEventListener('removeUser', (event) => {
        const { userId } = event.detail;
        this.removeUserFromList(userId);
      });

      this.isSubscribed = true;
    }
  }

  addUser(user) {
    const userListElement = document.querySelector('#userList');
    if (!userListElement) {
      return;
    }
  
    const userElement = document.createElement('li');
    userElement.textContent = user.name;
    userListElement.appendChild(userElement);
  }

  async onEnterChatHandler(nickname) {
    const user = await this.api.registerUser(nickname);
    if (user) {
      this.user = user;
      document.querySelector('.modal__form').classList.remove('active');
  
      // После логина запрашиваем обновленный список пользователей
      if (this.api.ws && this.api.ws.readyState === WebSocket.OPEN) {
        this.api.sendMessage({ type: 'requestUserList' });
      } 
    } else {
      document.getElementById('errorHint').textContent = 'Ошибка регистрации пользователя';
    }
  }

  requestUpdatedUserList() {
    if (this.api.ws && this.api.ws.readyState === WebSocket.OPEN) {
      this.api.sendMessage({ type: 'requestUserList' }); 
    } 
  }

  onExitChatHandler() {
    let isExiting = false;
    if (this.user) {
      if (this.api.ws && this.api.ws.readyState === WebSocket.OPEN) {
        let isExiting = true;
        this.api.sendMessage({
          user: this.user
        }, 'exit');
      } 
    }
  }

  sendMessage(message) {
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
  const userListElement = document.querySelector('#userList');
  if (!userListElement) {
    return;
  }
  userListElement.innerHTML = '';

  users.forEach(user => {
    if (user.name) {
      const userElement = document.createElement('li');
      userElement.textContent = user.name;
      userElement.dataset.userId = user.id; // Для идентификации пользователя
      userListElement.appendChild(userElement);
    } 
  });
}

removeUserFromList(userId) {
  const userListElement = document.querySelector('#userList');
  if (!userListElement) {
    return;
  }

  const userItem = Array.from(userListElement.children).find((item) => item.dataset.userId === userId);
  if (userItem) {
    userListElement.removeChild(userItem);
  }
}

}

