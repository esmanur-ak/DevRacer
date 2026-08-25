// OYUN VE PEERJS DURUM DEĞİŞKENLERİ
// (Değişkenler app.js dosyasında global olarak tanımlanmıştır)

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
        roomStatus.innerText = translateText('idInUse');
      } else {
        roomStatus.innerText = translateText('connError');
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
        roomInfoTitleEl.innerText = translateText('roomJoined');
      }
    }

    // Profil bilgisini hemen gönder
    connection.send({ 
      type: 'SHARE_PROFILE', 
      profile: myProfile, 
      peerId: peer.id 
    });

    if (isHost) {
      // Host olarak yeni bağlanana oyun ayarlarını (mod ve zorluk) gönder
      connection.send({ type: 'SET_MATCH_MODE', mode: matchMode, difficulty: selectDifficulty.value });
      
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
      const leaverName = roomPlayers[leftPeerId] ? roomPlayers[leftPeerId].name : "Rakip";
      delete roomPlayers[leftPeerId];
      delete playerProgress[leftPeerId];
      delete playerFinishData[leftPeerId];
      
      // Oyun aktifken biri çıktıysa, oda sahibi ve diğer kalanlara haber verip sonlandır
      if (isGameActive) {
        alert(translateText('opponentLeft'));
        // Diğer oyunculara da bildir
        sendPeerData({ type: 'OPPONENT_LEFT_GAME', name: leaverName });
        leaveToLobby();
      } else {
        broadcastPlayersList();
        updateLobbyPlayersUI();
      }
    }
  } else {
    // Client isek ve host ile bağlantı koptuysa lobiye dön
    if (isMultiplayer) {
      alert(translateText('hostLeft'));
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

  // Seçicileri tekrar aktif hale getir
  selectLanguage.disabled = false;
  selectDifficulty.disabled = false;
  selectSeries.disabled = false;

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
      if (data.difficulty) {
        selectDifficulty.value = data.difficulty;
      }
      // Katılımcı için ayar alanlarını kilitle ki host yönetebilsin
      selectLanguage.disabled = true;
      selectDifficulty.disabled = true;
      selectSeries.disabled = true;
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
      } else {
        playerProgress[data.peerId] = data.percent;
        updateRaceProgressUI();
      }
      break;

    case 'PROGRESS_UPDATE':
      playerProgress[data.peerId] = data.percent;
      updateRaceProgressUI();
      break;

    case 'FINISHED':
      if (isHost) {
        const finishedPeerId = data.peerId || senderConn.peer;
        playerFinishData[finishedPeerId] = { stats: data.stats, elapsedMs: data.elapsedMs };
        sendPeerData({ type: 'PLAYER_FINISHED', peerId: finishedPeerId, stats: data.stats, elapsedMs: data.elapsedMs });
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
          alert(translateText('hostLeft'));
          leaveToLobby();
        } else {
          const leaverName = roomPlayers[data.peerId] ? roomPlayers[data.peerId].name : "Rakip";
          delete roomPlayers[data.peerId];
          delete playerProgress[data.peerId];
          delete playerFinishData[data.peerId];
          if (isGameActive) {
            alert(translateText('opponentLeft'));
            leaveToLobby();
          } else {
            updateLobbyPlayersUI();
          }
        }
      }
      break;

    case 'OPPONENT_LEFT_GAME':
      alert(translateText('opponentLeft'));
      leaveToLobby();
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
      if (data.peerId !== peer.id) {
        rematchRequestBox.classList.remove('hidden');
        rematchRequestText.innerText = translateText('rematchRequestText');
      }
      if (isHost) {
        // Oda sahibi ise diğer tüm oyunculara da duyur
        sendPeerData({ type: 'REMATCH_REQUEST', peerId: data.peerId });
      }
      break;

    case 'REMATCH_ANSWER':
      if (data.answer === 'accept') {
        startNewSeries();
      } else {
        alert(translateText('rematchRejected'));
        leaveToLobby();
      }
      break;

    case 'REACTION':
      showReactionBubble(data.peerId, data.text);
      showGlobalToast(data.peerId, data.text);
      if (isHost) {
        // Host ise diğer oyunculara da dağıt (broadcast)
        sendPeerData({ type: 'REACTION', text: data.text, peerId: data.peerId });
      }
      break;
  }
}

function showReactionBubble(senderPeerId, text) {
  const container = document.getElementById(`progress-container-${senderPeerId}`);
  if (!container) return;

  const existing = container.querySelector('.reaction-bubble');
  if (existing) existing.remove();

  const bubble = document.createElement('div');
  bubble.className = 'reaction-bubble';
  bubble.innerText = text;
  
  container.appendChild(bubble);
  
  setTimeout(() => {
    bubble.remove();
  }, 2000);
}

function showGlobalToast(senderPeerId, text) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.top = '24px';
    container.style.right = '24px';
    container.style.zIndex = '99999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '0.75rem';
    container.style.pointerEvents = 'none';
    container.style.maxWidth = '320px';
    document.body.appendChild(container);
  }

  const player = roomPlayers[senderPeerId] || myProfile;
  const toast = document.createElement('div');
  toast.className = 'reaction-toast';
  
  // Custom toast styling
  toast.style.background = 'rgba(9, 13, 22, 0.95)';
  toast.style.borderRadius = '16px';
  toast.style.padding = '0.8rem 1.2rem';
  toast.style.color = '#fff';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '0.75rem';
  toast.style.border = `2px solid #8b5cf6`;
  toast.style.backdropFilter = 'blur(10px)';
  toast.style.pointerEvents = 'auto';

  toast.innerHTML = `
    <div style="background: ${player.bg}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">${player.avatar}</div>
    <div style="text-align: left;">
      <span style="color: #64748b; font-size: 0.7rem; display: block; font-weight: 800; letter-spacing: 0.5px;">${player.name.toUpperCase()} ${translateText('says')}</span>
      <span style="font-size: 1rem; font-weight: 800; color: #fbbf24;">${text}</span>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
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

// Canlı ilerleme çubuklarını günceller
function updateRaceProgressUI() {
  Object.keys(playerProgress).forEach(id => {
    const percent = playerProgress[id];
    const bar = document.getElementById(`progress-bar-${id}`);
    if (bar) {
      bar.style.width = `${percent}%`;
    }
  });
}
