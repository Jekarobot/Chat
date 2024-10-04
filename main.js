(()=>{"use strict";const e=async e=>{const{url:t,method:s="GET",data:n={},headers:r={}}=e;try{const e=await fetch(t,{method:s,headers:{"Content-Type":"application/json",...r},body:"GET"!==s?JSON.stringify(n):void 0});if(!e.ok)throw new Error(`HTTP error! Status: ${e.status}`);return await e.json()}catch(e){throw console.error("Error with request:",e),e}};class t{constructor(e){this.baseUrl=e}async list(){try{return await e({url:`${this.baseUrl}`,method:"GET"})}catch(e){throw console.error("Error fetching list:",e),e}}async get(t){try{return await e({url:`${this.baseUrl}/${t}`,method:"GET"})}catch(e){throw console.error("Error fetching item:",e),e}}async create(t){try{return await e({url:`${this.baseUrl}/new-user`,method:"POST",data:t})}catch(e){throw console.error("Error creating item:",e),e}}async update(t,s){try{return await e({url:`${this.baseUrl}/${t}`,method:"PUT",data:s})}catch(e){throw console.error("Error updating item:",e),e}}async delete(t){try{return await e({url:`${this.baseUrl}/${t}`,method:"DELETE"})}catch(e){throw console.error("Error deleting item:",e),e}}}const s="https://chatserver-production-5893.up.railway.app";class n extends t{constructor(){super(s),this.ws=null,this.user=null}async registerUser(t){try{const s=await e({url:`${this.baseUrl}/new-user`,method:"POST",data:{name:t}});if("ok"===s.status)return this.user=s.user,this.connectWebSocket(),s.user;throw new Error(s.message)}catch(e){throw e.message.includes("409")&&alert("Имя пользователя уже занято. Пожалуйста, выберите другое имя."),e}}connectWebSocket(){const e=s.replace(/^https/,"wss");this.ws||(this.ws=new WebSocket(e),this.ws.addEventListener("message",(e=>{const t=JSON.parse(e.data);this.handleWebSocketMessage(t)})),this.ws.addEventListener("close",(()=>{this.ws=null})))}handleWebSocketMessage(e){Array.isArray(e)?document.dispatchEvent(new CustomEvent("userListUpdate",{detail:e})):"send"===e.type&&("exit"===e.content.type?this.removeUserFromList(e.user.id):this.handleNewMessage(e))}addUserToList(e){document.dispatchEvent(new CustomEvent("addUser",{detail:e}))}removeUserFromList(e){const t=document.querySelector("#userList");if(!t)return;const s=Array.from(t.children).find((t=>t.dataset.userId===e));s&&t.removeChild(s)}async requestUserList(){if(this.ws&&this.ws.readyState===WebSocket.OPEN){const e={type:"requestUserList"};this.sendMessage(e)}}handleNewMessage(e){document.dispatchEvent(new CustomEvent("newMessage",{detail:e}))}sendMessage(e,t="send"){if(!this.ws||this.ws.readyState!==WebSocket.OPEN)return;const s={type:t,user:this.user,content:e};this.ws.send(JSON.stringify(s))}}const r=document.getElementById("root"),a=new class{constructor(e){this.container=e,this.api=new n,this.user=null,this.isSubscribed=!1}init(){this.bindToDOM(),this.registerEvents()}bindToDOM(){this.container.innerHTML='\n      <div class="chat__container">\n        <ul class="chat__userlist" id="userList"></ul>\n        <div class="chat__area">\n          <div class="chat__messages-container" id="messagesContainer"></div>\n          <div class="chat__messages-input">\n            <input type="text" id="messageInput" class="form__input" placeholder="Type your message here">\n          </div>\n        </div>\n      </div>\n    '}registerEvents(){this.container.querySelector("#messageInput").addEventListener("keypress",(e=>{"Enter"===e.key&&""!==e.target.value.trim()&&(this.sendMessage(e.target.value),e.target.value="")})),this.subscribeOnEvents()}subscribeOnEvents(){this.isSubscribed||(document.addEventListener("userListUpdate",(e=>{this.updateUserList(e.detail)})),document.addEventListener("addUser",(e=>{this.addUser(e.detail)})),document.addEventListener("newMessage",(e=>{const{content:t,user:s}=e.detail;this.renderMessage(t,s)})),document.addEventListener("removeUser",(e=>{const{userId:t}=e.detail;this.removeUserFromList(t)})),this.isSubscribed=!0)}addUser(e){const t=document.querySelector("#userList");if(!t)return;const s=document.createElement("li");s.textContent=e.name,t.appendChild(s)}async onEnterChatHandler(e){const t=await this.api.registerUser(e);t?(this.user=t,document.querySelector(".modal__form").classList.remove("active"),this.api.ws&&this.api.ws.readyState===WebSocket.OPEN&&this.api.sendMessage({type:"requestUserList"})):document.getElementById("errorHint").textContent="Ошибка регистрации пользователя"}requestUpdatedUserList(){this.api.ws&&this.api.ws.readyState===WebSocket.OPEN&&this.api.sendMessage({type:"requestUserList"})}onExitChatHandler(){this.user&&this.api.ws&&this.api.ws.readyState===WebSocket.OPEN&&this.api.sendMessage({type:"exit",user:this.user})}sendMessage(e){this.api.sendMessage(e)}renderMessage(e,t){const s=this.container.querySelector("#messagesContainer"),n=document.createElement("div");n.className=t.name===this.user.name?"message__container-yourself":"message__container-interlocutor",n.innerHTML=`\n      <div class="message__header">${t.name===this.user.name?"You":t.name}, ${(new Date).toLocaleString()}</div>\n      <div class="message__text">${e}</div>\n    `,s.appendChild(n),s.scrollTop=s.scrollHeight}updateUserList(e){const t=document.querySelector("#userList");t&&(t.innerHTML="",e.forEach((e=>{if(e.name){const s=document.createElement("li");s.textContent=e.name,s.dataset.userId=e.id,t.appendChild(s)}})))}removeUserFromList(e){const t=document.querySelector("#userList");if(!t)return;const s=Array.from(t.children).find((t=>t.dataset.userId===e));s&&t.removeChild(s)}}(r);document.addEventListener("DOMContentLoaded",(()=>{const e=document.createElement("div");e.className="modal__form active",e.innerHTML='\n    <div class="modal__background"></div>\n    <div class="modal__content">\n      <div class="modal__header">Выберите псевдоним</div>\n      <div class="modal__body">\n        <div class="form__group">\n          <label class="form__label">Псевдоним:</label>\n          <input type="text" class="form__input" id="nicknameInput">\n        </div>\n        <div class="form__hint" id="errorHint"></div>\n      </div>\n      <div class="modal__footer">\n        <button class="modal__ok" id="continueButton">Продолжить</button>\n      </div>\n    </div>\n  ',document.body.appendChild(e);const t=document.getElementById("nicknameInput");document.getElementById("continueButton").addEventListener("click",(()=>{const e=t.value.trim();e?a.onEnterChatHandler(e):document.getElementById("errorHint").textContent="Пожалуйста, введите псевдоним."})),window.addEventListener("beforeunload",(()=>{a.onExitChatHandler()})),a.init()}))})();