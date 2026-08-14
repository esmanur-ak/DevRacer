// OYUN VE PEERJS DURUM DEĞİŞKENLERİ
let peer = null;
let conn = null; // Client için host bağlantısı
let connections = []; // Host için bağlanan tüm client'lar
let isHost = false;
let isMultiplayer = false;

// Multiplayer oyuncu listesi ve yarış verileri
let roomPlayers = {}; // peerId -> { name, avatar, bg }
let playerProgress = {}; // peerId -> percent (0-100)
let playerFinishData = {}; // peerId -> { stats, elapsedMs }

// SERİ VE RÖVANŞ DURUMLARI (Multiplayer serisi host tarafından yönetilir)
let matchMode = 'single'; // 'single', 'bo3', 'bo5'
let playerWins = {}; // peerId -> win count
let playerNextRoundReady = {}; // peerId -> boolean

// 4 Haneli Oda Kodu Üretici (2-5 karakter arası)
function generateRoomId() {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4 haneli sayısal kod
}

function initPeer(customId = null) {
  peer = new Peer(customId);

  peer.on('error', (err) => {
    console.error('PeerJS Hata:', err);
    if (roomStatus) {
      if (err.type === 'unavailable-id') {
        roomStatus.innerText = 'Bu Oda ID zaten kullanımda! Başka bir ID deneyin.';
      } else {
        roomStatus.innerText = 'Bağlantı hatası oluştu! Tekrar deneyin.';
      }
    }
  });

  return customId;
}

function setupConnectionListeners(connection) {
  connection.on('open', () => {
    // Katılımcı için lobi ekranına geçiş yap
    if (!isHost) {
      const lobbyCardEl = document.getElementById('lobby-card');
      const roomInfoCardEl = document.getElementById('room-info-card');
      const displayRoomIdEl = document.getElementById('display-room-id');
      const roomInfoTitleEl = document.getElementById('room-info-title');
      const inputRoomIdEl = document.getElementById('input-room-id');

      if (lobbyCardEl) lobbyCardEl.classList.add('hidden');
      if (roomInfoCardEl) roomInfoCardEl.classList.remove('hidden');
      if (displayRoomIdEl && inputRoomIdEl) {
        displayRoomIdEl.value = inputRoomIdEl.value.trim();
      }
      if (roomInfoTitleEl) {
        roomInfoTitleEl.innerText = "Odaya Katılındı! 🎮";
      }
    }

    // Profil bilgisini hemen gönder
    connection.send({ 
      type: 'SHARE_PROFILE', 
      profile: myProfile, 
      peerId: peer.id 
    });

    if (isHost) {
      // Host olarak yeni bağlanana oyun ayarlarını gönder
      connection.send({ type: 'SET_MATCH_MODE', mode: matchMode });
      
      // Host olarak tüm oyuncuların listesini güncelle ve herkese dağıt
      roomPlayers[peer.id] = myProfile;
      broadcastPlayersList();
    }
  });

  connection.on('data', (data) => {
    handleIncomingData(data, connection);
  });

  connection.on('close', () => {
    handleConnectionClose(connection);
  });
}

function handleConnectionClose(closedConn) {
  if (isHost) {
    // Kapanan bağlantıyı listeden çıkar
    connections = connections.filter(c => c !== closedConn);
    // Hangi peer ayrıldı bulalım
    let leftPeerId = null;
    for (let peerId in roomPlayers) {
      if (peerId !== peer.id && !connections.some(c => c.peer === peerId)) {
        leftPeerId = peerId;
        break;
      }
    }
    if (leftPeerId) {
      delete roomPlayers[leftPeerId];
      delete playerProgress[leftPeerId];
      delete playerFinishData[leftPeerId];
      broadcastPlayersList();
      updateLobbyPlayersUI();
    }
  } else {
    // Client isek ve host ile bağlantı koptuysa lobiye dön
    if (isMultiplayer) {
      alert('Oda sahibi oyundan ayrıldı veya bağlantı koptu!');
      leaveToLobby();
    }
  }
}

// Sekme kapatılırken rakibe haber ver
window.addEventListener('beforeunload', () => {
  if (isMultiplayer) {
    sendPeerData({ type: 'LEAVE', peerId: peer.id });
  }
});

function leaveToLobby() {
  isMultiplayer = false;
  isHost = false;
  isGameActive = false;
  
  // Durumları sıfırla
  roomPlayers = {};
  playerProgress = {};
  playerFinishData = {};
  playerWins = {};
  playerNextRoundReady = {};
  
  connections = [];
  clearInterval(timerInterval);

  if (conn) {
    try { conn.close(); } catch (e) {}
    conn = null;
  }
  if (peer) {
    try { peer.destroy(); } catch (e) {}
    peer = null;
  }

  raceCard.classList.add('hidden');
  roomInfoCard.classList.add('hidden');
  resultCard.classList.add('hidden');
  lobbyCard.classList.remove('hidden');
  roomStatus.innerText = '';
  
  const note = document.getElementById('opponent-finished-note');
  if (note) note.classList.add('hidden');

  // URL'deki parametreyi temizle
  if (window.location.search) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

function handleIncomingData(data, senderConn) {
  switch (data.type) {
    case 'ROOM_FULL':
      alert('Oda dolu! (En fazla 5 kişi katılabilir)');
      leaveToLobby();
      break;

    case 'SET_MATCH_MODE':
      matchMode = data.mode;
      break;

    case 'SHARE_PROFILE':
      roomPlayers[data.peerId] = data.profile;
      if (isHost) {
        broadcastPlayersList();
      }
      updateLobbyPlayersUI();
      break;

    case 'ROOM_PLAYERS_UPDATE':
      roomPlayers = data.players;
      updateLobbyPlayersUI();
      break;

    case 'START_GAME':
      currentText = data.code;
      prepareMultiplayerRace();
      break;

    case 'COUNTDOWN':
      countdownOverlay.classList.remove('hidden');
      if (data.count > 0) {
        countdownNumber.innerText = data.count;
      } else if (data.count === 0) {
        countdownNumber.innerText = "BAŞLA! 🚀";
      } else {
        countdownOverlay.classList.add('hidden');
        codeInput.disabled = false;
        codeInput.focus();
      }
      break;

    case 'PROGRESS':
      // Host progress alırsa herkese dağıtır
      if (isHost) {
        playerProgress[data.peerId] = data.percent;
        sendPeerData({ type: 'PROGRESS_UPDATE', peerId: data.peerId, percent: data.percent });
        updateRaceProgressUI();
      }
      break;

    case 'PROGRESS_UPDATE':
      playerProgress[data.peerId] = data.percent;
      updateRaceProgressUI();
      break;

    case 'FINISHED':
      if (isHost) {
        playerFinishData[data.peerId] = { stats: data.stats, elapsedMs: data.elapsedMs };
        sendPeerData({ type: 'PLAYER_FINISHED', peerId: data.peerId, stats: data.stats, elapsedMs: data.elapsedMs });
        resolveMultiplayerOutcome();
      }
      break;

    case 'PLAYER_FINISHED':
      playerFinishData[data.peerId] = { stats: data.stats, elapsedMs: data.elapsedMs };
      resolveMultiplayerOutcome();
      break;

    case 'LEAVE':
      if (isHost) {
        handleConnectionClose(senderConn);
      } else {
        if (data.peerId === 'host') {
          alert('Oda sahibi odadan ayrıldı.');
          leaveToLobby();
        } else {
          delete roomPlayers[data.peerId];
          delete playerProgress[data.peerId];
          delete playerFinishData[data.peerId];
          updateLobbyPlayersUI();
        }
      }
      break;

    case 'ROUND_READY':
      playerNextRoundReady[data.peerId] = true;
      if (isHost) {
        checkNextRoundTransition();
      }
      break;

    case 'ROUND_TRANSITION':
      currentText = data.code;
      prepareMultiplayerRace();
      break;

    case 'REMATCH_REQUEST':
      rematchRequestBox.classList.remove('hidden');
      rematchRequestText.innerText = `Yarışmacılar rövanş yapmak istiyor! ⚔️`;
      break;

    case 'REMATCH_ANSWER':
      if (data.answer === 'accept') {
        startNewSeries();
      } else {
        alert('Rövanş teklifi reddedildi.');
        leaveToLobby();
      }
      break;
  }
}

// Host'un tüm client'lara veri göndermesi veya client'ın host'a göndermesi
function sendPeerData(data) {
  if (isHost) {
    connections.forEach(c => {
      if (c && c.open) {
        c.send(data);
      }
    });
  } else {
    if (conn && conn.open) {
      conn.send(data);
    }
  }
}

// Sadece Host tarafından oyuncu listesini herkese yayınlamak için kullanılır
function broadcastPlayersList() {
  if (isHost) {
    sendPeerData({
      type: 'ROOM_PLAYERS_UPDATE',
      players: roomPlayers
    });
  }
}
