import Chat from './Chat';

const root = document.getElementById('root');

const app = new Chat(root);

document.addEventListener('DOMContentLoaded', () => {
  // Инициализация модального окна
  const modal = document.createElement('div');
  modal.className = 'modal__form active';
  modal.innerHTML = `
    <div class="modal__background"></div>
    <div class="modal__content">
      <div class="modal__header">Выберите псевдоним</div>
      <div class="modal__body">
        <div class="form__group">
          <label class="form__label">Псевдоним:</label>
          <input type="text" class="form__input" id="nicknameInput">
        </div>
        <div class="form__hint" id="errorHint"></div>
      </div>
      <div class="modal__footer">
        <button class="modal__ok" id="continueButton">Продолжить</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const nicknameInput = document.getElementById('nicknameInput');
  const continueButton = document.getElementById('continueButton');

  continueButton.addEventListener('click', () => {
    const nickname = nicknameInput.value.trim();
    if (nickname) {
      app.onEnterChatHandler(nickname);
    } else {
      document.getElementById('errorHint').textContent = 'Пожалуйста, введите псевдоним.';
    }
  });

  window.addEventListener('beforeunload', () => {
    app.onExitChatHandler();
  });

  app.init();
});
