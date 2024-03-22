'use strict';

var usernamePage = document.querySelector('#usernamePage');
var usernameForm = document.querySelector('#usernameForm');
var chatPage = document.querySelector('#chatPage');
var messageArea = document.querySelector('#messageArea');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var connectingElement = document.querySelector('.connecting');

var stompClient = null;
var username = null;

function connect(event){
    username = document.querySelector('#name').value.trim();

    if(username){
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }

    event.preventDefault();
}

function onConnected(){
    stompClient.subscribe("/topic/public", onMessageReceived);

    stompClient.send(
        "/app/chat.addUser", 
        {}, 
        JSON.stringify({sender:username, type:'JOIN'})
        );
        connectingElement.classList.add('hidden');
}

function onError(error){
connectingElement.textContent = "Could not connect to Websocket server";
connectingElement.style.color = 'red';
}

function sendMessage(event){
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient){
        var chatMessage = {
            sender: username,
            type: 'CHAT',
            content: messageInput.value
        };
    stompClient.send(
        "/app/chat.sendMessage",
        {},
        JSON.stringify(chatMessage));
        messageInput.value='';
    }

    event.preventDefault();
}

function onMessageReceived(payload){
    var message = JSON.parse(payload.body);

    if(message.type == 'JOIN'){
        message.content = message.sender + ' joined';
        var textElement = document.createElement('div');
        textElement.innerHTML = `<span class="join-text">${message.content}</span>`;
        messageArea.appendChild(textElement);

    }else if(message.type == 'LEAVE'){
        message.content = message.sender + ' left!';
        var textElement = document.createElement('div');
        textElement.innerHTML = `<span class="join-text">${message.content}</span>`;
        messageArea.appendChild(textElement);
    }else{
        var divElement = document.createElement('div');
        divElement.classList.add('message-style');
        divElement.innerHTML = `<span>${message.sender}:<span>${message.content}</span></span></br>`;
        messageArea.appendChild(divElement);

    }
    messageArea.scrollTop = messageArea.scrollHeight;
}

usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true);