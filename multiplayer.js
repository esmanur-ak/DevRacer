// OYUN VE PEERJS DURUM DEĞİŞKENLERİ
let peer = null;
let conn = null;
let isHost = false;
let isMultiplayer = false;

// Multiplayer bitiş anlaşmazlığını (race condition) çözmek için:
// her iki oyuncu da bitirene kadar kazananı KESİNLEŞTİRMİYORUZ.
let myFinishData = null;
let opponentFinishData = null;

// SERİ VE RÖVANŞ DURUMLARI
let matchMode = 'single'; // 'single', 'bo3', 'bo5'
let myWins = 0;
let opponentWins = 0;
let myNextRoundReady = false;
let opponentNextRoundReady = false;

// 10. PEERJS VE MULTIPLAYER MANTIĞI
function initPeer(customId = null) {
  const peerId = customId || 'csr-' + Math.random().toString(36).substring(2, 8);
  peer = new Peer(peerId);

  peer.on('error', (err) => {
    console.error('PeerJS Hata:', err);
    if (roomStatus) roomStatus.innerText = 'Bağlantı hatası oluştu! Tekrar deneyin.';
  });

  return peerId;
}

function setupConnectionListeners() {
  conn.on('open', () => {
    // Send my profile details immediately upon connection
    sendPeerData({ type: 'SHARE_PROFILE', profile: myProfile });
    if (isHost) {
      matchMode = selectSeries.value;
      sendPeerData({ type: 'SET_MATCH_MODE', mode: matchMode });
    }
    if (!isHost) {
      prepareMultiplayerRace();
    }
  });

  conn.on('data', (data) => {
    handleIncomingData(data);
  });

  conn.on('close', () => {
    if (isMultiplayer) {
      alert('Rakip oyundan ayrıldı!');
      leaveToLobby();
    }
  });
}

// Sekme kapatılırken/refresh edilirken rakibe haber ver (mümkün olduğunca).
window.addEventListener('beforeunload', () => {
  if (isMultiplayer) sendPeerData({ type: 'LEAVE' });
});

// Odayı/oyunu tamamen terk et: PeerJS bağlantısını kapat, tüm durumu sıfırla, lobiye dön.
function leaveToLobby() {
  isMultiplayer = false;
  isHost = false;
  isGameActive = false;
  myFinishData = null;
  opponentFinishData = null;
  clearInterval(timerInterval);

  // Seri ve rövanş durumlarını sıfırla
  myWins = 0;
  opponentWins = 0;
  myNextRoundReady = false;
  opponentNextRoundReady = false;

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

  // Katılma alanındaki URL'i temizle ki tekrar aynı odaya otomatik girmeye çalışmasın.
  if (window.location.search) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

function handleIncomingData(data) {
  switch (data.type) {
    case 'SET_MATCH_MODE':
      matchMode = data.mode;
      break;

    case 'REMATCH_REQUEST':
      rematchRequestBox.classList.remove('hidden');
      rematchRequestText.innerText = `${opponentProfile.name} seninle rövanş yapmak istiyor! ⚔️`;
      break;

    case 'REMATCH_ANSWER':
      if (data.answer === 'accept') {
        startNewSeries();
      } else {
        alert('Rakip rövanş teklifini reddetti.');
        leaveToLobby();
      }
      break;

    case 'ROUND_READY':
      opponentNextRoundReady = true;
      checkNextRoundTransition();
      break;

    case 'SHARE_PROFILE':
      opponentProfile = data.profile;
      updateOpponentUIProfile();
      break;

    case 'INIT_GAME':
      currentText = data.code;
      renderCodeDisplay();
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
      opponentProgressBar.style.width = `${data.percent}%`;
      break;

    case 'FINISHED':
      opponentFinishData = { stats: data.stats, elapsedMs: data.elapsedMs };
      resolveMultiplayerOutcome();
      break;

    case 'LEAVE':
      handleOpponentLeft();
      break;
  }
}

function handleOpponentLeft() {
  if (!isMultiplayer) return;
  alert('Rakip odadan ayrıldı.');
  leaveToLobby();
}

function sendPeerData(data) {
  if (conn && conn.open) {
    conn.send(data);
  }
}

function checkNextRoundTransition() {
  if (myNextRoundReady && opponentNextRoundReady) {
    prepareMultiplayerRace();
  }
}

function startNewSeries() {
  myWins = 0;
  opponentWins = 0;
  myNextRoundReady = false;
  opponentNextRoundReady = false;
  prepareMultiplayerRace();
}
