// DİLLERE GÖRE AYRILMIŞ KOD KÜTÜPHANESİ - database.js dosyasından yüklenir

// DOM ELEMANLARI
const lobbyCard = document.getElementById('lobby-card');
const roomInfoCard = document.getElementById('room-info-card');
const raceCard = document.getElementById('race-card');
const resultCard = document.getElementById('result-card');

const selectLanguage = document.getElementById('select-language');
const btnSolo = document.getElementById('btn-solo');
const btnRestartSolo = document.getElementById('btn-restart-solo');

const btnCreateRoom = document.getElementById('btn-create-room');
const btnJoinRoom = document.getElementById('btn-join-room');
const inputRoomId = document.getElementById('input-room-id');
const displayRoomId = document.getElementById('display-room-id');
const btnCopyId = document.getElementById('btn-copy-id');
const roomStatus = document.getElementById('room-status');
const btnChallengeFriend = document.getElementById('btn-challenge-friend');

const codeDisplay = document.getElementById('code-display');
const codeInput = document.getElementById('code-input');

const statWpm = document.getElementById('stat-wpm');
const statCpm = document.getElementById('stat-cpm');
const statErrors = document.getElementById('stat-errors');
const recordWpmDisplay = document.getElementById('record-wpm');

const myProgressBar = document.getElementById('my-progress');
const opponentProgressBar = document.getElementById('opponent-progress');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');

// SERİ / RÖVANŞ DOMELEMENTLERİ
const selectSeries = document.getElementById('select-series');
const seriesScoreBox = document.getElementById('series-score-box');
const scoreModeLabel = document.getElementById('score-mode-label');
const myScoreDisplay = document.getElementById('my-score-display');
const opponentScoreDisplay = document.getElementById('opponent-score-display');

const btnNextRound = document.getElementById('btn-next-round');
const btnRematch = document.getElementById('btn-rematch');
const rematchRequestBox = document.getElementById('rematch-request-box');
const rematchRequestText = document.getElementById('rematch-request-text');
const btnAcceptRematch = document.getElementById('btn-accept-rematch');
const btnDeclineRematch = document.getElementById('btn-decline-rematch');

// OYUN VE PROFILLER DURUM DEĞİŞKENLERİ
let currentText = "";
let startTime = null;
let timerInterval = null;
let isGameActive = false;

// PROFILLER
let myProfile = {
  name: "Yarışçı",
  avatar: "💻",
  bg: "linear-gradient(135deg, #0284c7, #2563eb)"
};
let opponentProfile = {
  name: "Rakip",
  avatar: "🤖",
  bg: "linear-gradient(135deg, #ef4444, #b91c1c)"
};

// PROFİLİ YÜKLE / KAYDET MANTIĞI
function loadProfile() {
  const savedProfile = localStorage.getItem('csr_profile');
  if (savedProfile) {
    try {
      myProfile = JSON.parse(savedProfile);
    } catch(e) {
      console.error(e);
    }
  }
  document.getElementById('player-name').value = myProfile.name;
  const preview = document.getElementById('current-avatar-preview');
  preview.innerText = myProfile.avatar;
  preview.style.background = myProfile.bg;

  document.querySelectorAll('.avatar-circle-option').forEach(opt => {
    if (opt.getAttribute('data-avatar') === myProfile.avatar) {
      opt.classList.add('selected');
    } else {
      opt.classList.remove('selected');
    }
  });

  updateLeaderboardPodium();
}

function saveProfile() {
  myProfile.name = document.getElementById('player-name').value.trim() || "Yarışçı";
  localStorage.setItem('csr_profile', JSON.stringify(myProfile));
  updateLeaderboardPodium();
}

function updateOpponentUIProfile() {
  document.getElementById('opponent-avatar-display').innerText = opponentProfile.avatar;
  document.getElementById('opponent-avatar-display').style.background = opponentProfile.bg;
  document.getElementById('opponent-name-display').innerText = opponentProfile.name;
}

function loadPersonalRecord() {
  const savedRecord = localStorage.getItem('csr_best_time');
  const displayVal = savedRecord ? parseFloat(savedRecord).toFixed(2) : "--";
  
  const recordWpmDisplay = document.getElementById('record-wpm');
  if (recordWpmDisplay) {
    recordWpmDisplay.innerText = displayVal;
  }
}

// 2. SEÇİLEN DİLE GÖRE RASTGELE KOD GETİRME
function getRandomCodeByLanguage() {
  const selectedLang = selectLanguage.value;
  if (selectedLang === 'ALL') {
    const allCodes = [
      ...CODE_DATABASE.JS,
      ...CODE_DATABASE.PY,
      ...CODE_DATABASE.CPP,
      ...CODE_DATABASE.HTML,
      ...CODE_DATABASE.CS,
      ...CODE_DATABASE.JAVA
    ];
    return allCodes[Math.floor(Math.random() * allCodes.length)];
  } else {
    const langCodes = CODE_DATABASE[selectedLang];
    return langCodes[Math.floor(Math.random() * langCodes.length)];
  }
}

// 3. SOLO OYUNU BAŞLAT
function startSoloGame() {
  isMultiplayer = false;
  
  lobbyCard.classList.add('hidden');
  resultCard.classList.add('hidden');
  raceCard.classList.remove('hidden');

  prepareSoloRaceUI();
  resetRaceState();
  codeInput.disabled = false;
  codeInput.focus();
}

function prepareSoloRaceUI() {
  const progressSection = document.getElementById('progress-section');
  if (progressSection) {
    progressSection.innerHTML = `
      <div class="progress-container">
        <div class="player-info-badge my-badge">
          <span class="player-avatar-mini" style="background: ${myProfile.bg};">${myProfile.avatar}</span>
          <span class="player-name-label">${myProfile.name} (Sen)</span>
        </div>
        <div class="progress-bar-bg">
          <div id="my-progress" class="progress-bar my-bar"></div>
        </div>
      </div>
    `;
  }
}

// 4. YARIŞ DURUMUNU SIFIRLA
function resetRaceState() {
  clearInterval(timerInterval);
  timerInterval = null;
  startTime = null;
  isGameActive = true;
  myFinishData = null;
  opponentFinishData = null;

  const note = document.getElementById('opponent-finished-note');
  if (note) note.classList.add('hidden');

  currentText = getRandomCodeByLanguage();
  
  codeInput.value = "";
  const myBar = document.getElementById('my-progress');
  if (myBar) myBar.style.width = "0%";
  statWpm.innerText = "0.0";
  statCpm.innerText = "0";
  statErrors.innerText = "0";

  renderCodeDisplay();
}

// 5. KOD METNİNİ RENDER ET
function renderCodeDisplay() {
  codeDisplay.innerHTML = "";
  const typedValue = codeInput.value;

  currentText.split('').forEach((char, index) => {
    const charSpan = document.createElement('span');
    charSpan.innerText = char;

    if (index < typedValue.length) {
      if (typedValue[index] === char) {
        charSpan.classList.add('char-correct');
      } else {
        charSpan.classList.add('char-incorrect');
      }
    } else if (index === typedValue.length) {
      charSpan.classList.add('char-current');
    }

    codeDisplay.appendChild(charSpan);
  });
}

// 6. YAZI İŞLEME VE İSTATİSTİK HESABI
codeInput.addEventListener('input', () => {
  if (!isGameActive) return;

  if (!startTime) {
    startTime = new Date();
    timerInterval = setInterval(updateStats, 200);
  }

  const typedValue = codeInput.value;
  renderCodeDisplay();

  const progressPercent = Math.min(
    100,
    Math.floor((typedValue.length / currentText.length) * 100)
  );
  
  const myBar = (isMultiplayer && peer) ? document.getElementById(`progress-bar-${peer.id}`) : document.getElementById('my-progress');
  if (myBar) myBar.style.width = `${progressPercent}%`;

  if (isMultiplayer) {
    sendPeerData({ type: 'PROGRESS', percent: progressPercent, peerId: peer.id });
  }

  if (typedValue === currentText) {
    finishRace();
  }
});

// 7. CANLI İSTATİSTİK HESAPLAMA
function updateStats() {
  if (!startTime) return { wpm: 0, cpm: 0, errors: 0, duration: "0.00" };

  const now = new Date();
  const elapsedSec = ((now - startTime) / 1000).toFixed(1);
  const timeElapsedInMinutes = (now - startTime) / 60000;

  const typedValue = codeInput.value;
  let errors = 0;
  let correctChars = 0;

  for (let i = 0; i < typedValue.length; i++) {
    if (typedValue[i] !== currentText[i]) {
      errors++;
    } else {
      correctChars++;
    }
  }

  // Sadece doğru yazılan karakterler hıza dahil edilir; yoksa çok hata yapan
  // biri sırf hızlı tuşladığı için yüksek WPM görebilirdi.
  const cpm = timeElapsedInMinutes > 0 ? Math.floor(correctChars / timeElapsedInMinutes) : 0;
  const wpm = Math.floor(cpm / 5);

  statWpm.innerText = elapsedSec;
  statCpm.innerText = cpm;
  statErrors.innerText = errors;

  return { wpm, cpm, errors, duration: parseFloat(elapsedSec).toFixed(2) };
}

// 8. YARIŞI BİTİRME
function finishRace() {
  isGameActive = false;
  clearInterval(timerInterval);
  codeInput.disabled = true;

  const finalStats = updateStats();
  const elapsedMs = new Date() - startTime;
  const elapsedSec = (elapsedMs / 1000).toFixed(2);
  finalStats.duration = elapsedSec;

  if (isMultiplayer) {
    myFinishData = { stats: finalStats, elapsedMs };
    sendPeerData({ type: 'FINISHED', stats: finalStats, elapsedMs });
    resolveMultiplayerOutcome();
  } else {
    const currentRecord = parseFloat(localStorage.getItem('csr_best_time') || '999999');
    const currentSecNum = parseFloat(elapsedSec);
    if (currentSecNum < currentRecord) {
      localStorage.setItem('csr_best_time', currentSecNum);
      loadPersonalRecord();
    }
    saveRunToHistory(finalStats);

    setTimeout(() => { showResults(finalStats); }, 300);
  }
}

// Kazananı SADECE her iki taraf da bitirdiğinde, süreleri kıyaslayarak belirler.
// Bu sayede iki oyuncu da neredeyse aynı anda bitirse bile (ağ gecikmesi
// yüzünden) ikisi de "kazandım" ekranı görmez — gerçekten kim önce bitirdiyse o kazanır.
function resolveMultiplayerOutcome() {
  if (!myFinishData) {
    // Ben henüz bitirmedim ama rakip bitirmiş olabilir — devam et, sadece bilgilendir.
    if (opponentFinishData) showOpponentFinishedBanner();
    return;
  }

  if (!opponentFinishData) {
    showWaitingForOpponent(myFinishData.stats);
    return;
  }

  const iWon = myFinishData.elapsedMs <= opponentFinishData.elapsedMs;
  if (iWon) {
    myWins++;
  } else {
    opponentWins++;
  }

  const targetWins = matchMode === 'bo3' ? 2 : (matchMode === 'bo5' ? 3 : 1);
  const isSeriesFinished = myWins >= targetWins || opponentWins >= targetWins;

  showMultiplayerResults(myFinishData.stats, iWon, opponentFinishData.stats, isSeriesFinished);
}

// 9. SONUÇ EKRANLARI
function showResults(stats) {
  raceCard.classList.add('hidden');
  resultCard.classList.remove('hidden');

  document.getElementById('result-title').innerText = "Tebrikler! 🎉";
  document.getElementById('result-title').style.color = "#f1f5f9";
  document.getElementById('res-wpm').innerText = stats.duration || stats.wpm;
  document.getElementById('res-cpm').innerText = stats.cpm;
  document.getElementById('res-errors').innerText = stats.errors;

  // Single player profile update in result showcase
  document.getElementById('res-my-avatar').innerText = myProfile.avatar;
  document.getElementById('res-my-avatar').style.background = myProfile.bg;
  document.getElementById('res-my-name').innerText = myProfile.name;
  
  document.getElementById('res-vs').classList.add('hidden');
  document.getElementById('res-opponent-profile').classList.add('hidden');
  document.getElementById('res-series-score').classList.add('hidden');

  // Solo modda rövanş butonlarını sakla
  btnNextRound.classList.add('hidden');
  btnRematch.classList.add('hidden');
  rematchRequestBox.classList.add('hidden');
}

function showMultiplayerResults(myStats, didIWin, opponentStats = null, isSeriesFinished = false) {
  raceCard.classList.add('hidden');
  resultCard.classList.remove('hidden');
  document.querySelector('.result-actions').classList.remove('hidden');

  btnNextRound.classList.add('hidden');
  btnRematch.classList.add('hidden');
  rematchRequestBox.classList.add('hidden');

  const resultTitle = document.getElementById('result-title');

  if (matchMode === 'single') {
    if (didIWin) {
      resultTitle.innerHTML = `Tebrikler, Kazandın! 🏆⚡`;
      resultTitle.style.color = "#22c55e";
    } else {
      resultTitle.innerHTML = `${opponentProfile.name} Kazandı! 🥈`;
      resultTitle.style.color = "#ef4444";
    }
    btnRematch.classList.remove('hidden');
    btnRematch.innerText = "🔥 RÖVANŞ TEKLİF ET";
    btnRematch.disabled = false;
  } else if (isSeriesFinished) {
    if (myWins > opponentWins) {
      resultTitle.innerHTML = `🏆 Seri Şampiyonu: ${myProfile.name}! 👑`;
      resultTitle.style.color = "#22c55e";
    } else {
      resultTitle.innerHTML = `🥈 Seri Şampiyonu: ${opponentProfile.name}!`;
      resultTitle.style.color = "#ef4444";
    }
    btnRematch.classList.remove('hidden');
    btnRematch.innerText = "🔥 RÖVANŞ TEKLİF ET";
    btnRematch.disabled = false;
  } else {
    if (didIWin) {
      resultTitle.innerHTML = `Raundu Kazandın! ⚡`;
      resultTitle.style.color = "#38bdf8";
    } else {
      resultTitle.innerHTML = `Raundu Rakip Kazandı! 🥈`;
      resultTitle.style.color = "#f87171";
    }
    btnNextRound.classList.remove('hidden');
    btnNextRound.innerText = "🎮 Sonraki Raundu Başlat";
    btnNextRound.disabled = false;
  }

  document.getElementById('res-wpm').innerText = myStats.duration || myStats.wpm;
  document.getElementById('res-cpm').innerText = myStats.cpm;
  document.getElementById('res-errors').innerText = myStats.errors;

  // Render both profiles side by side
  document.getElementById('res-my-avatar').innerText = myProfile.avatar;
  document.getElementById('res-my-avatar').style.background = myProfile.bg;
  document.getElementById('res-my-name').innerText = myProfile.name;

  document.getElementById('res-opponent-avatar').innerText = opponentProfile.avatar;
  document.getElementById('res-opponent-avatar').style.background = opponentProfile.bg;
  document.getElementById('res-opponent-name').innerText = opponentProfile.name;

  document.getElementById('res-vs').classList.remove('hidden');
  document.getElementById('res-opponent-profile').classList.remove('hidden');

  // Skor Gösterimi
  const scoreEl = document.getElementById('res-series-score');
  if (matchMode !== 'single') {
    scoreEl.innerText = `${myWins} - ${opponentWins}`;
    scoreEl.classList.remove('hidden');
  } else {
    scoreEl.classList.add('hidden');
  }
}

// Ben bitirdim ama rakip henüz bitirmedi — sonuç ekranını "bekleniyor" modunda göster.
function showWaitingForOpponent(myStats) {
  raceCard.classList.add('hidden');
  resultCard.classList.remove('hidden');
  document.querySelector('.result-actions').classList.add('hidden');

  btnNextRound.classList.add('hidden');
  btnRematch.classList.add('hidden');
  rematchRequestBox.classList.add('hidden');

  const resultTitle = document.getElementById('result-title');
  resultTitle.innerHTML = "Bitirdin! Rakip yazıyor... ⏳";
  resultTitle.style.color = "#38bdf8";

  document.getElementById('res-wpm').innerText = myStats.duration || myStats.wpm;
  document.getElementById('res-cpm').innerText = myStats.cpm;
  document.getElementById('res-errors').innerText = myStats.errors;

  // Render both profiles side by side
  document.getElementById('res-my-avatar').innerText = myProfile.avatar;
  document.getElementById('res-my-avatar').style.background = myProfile.bg;
  document.getElementById('res-my-name').innerText = myProfile.name;

  document.getElementById('res-opponent-avatar').innerText = opponentProfile.avatar;
  document.getElementById('res-opponent-avatar').style.background = opponentProfile.bg;
  document.getElementById('res-opponent-name').innerText = opponentProfile.name;

  document.getElementById('res-vs').classList.remove('hidden');
  document.getElementById('res-opponent-profile').classList.remove('hidden');

  // Skor Gösterimi
  const scoreEl = document.getElementById('res-series-score');
  if (matchMode !== 'single') {
    scoreEl.innerText = `${myWins} - ${opponentWins}`;
    scoreEl.classList.remove('hidden');
  } else {
    scoreEl.classList.add('hidden');
  }
}

// Rakip bitirdi ama ben hâlâ yazıyorum — yarış ekranında küçük bir uyarı göster.
function showOpponentFinishedBanner() {
  const note = document.getElementById('opponent-finished-note');
  if (note) note.classList.remove('hidden');
}

// 10. MULTIPLAYER BAĞLANTI VE ODA KATILIM BUTONLARI

btnCreateRoom.addEventListener('click', () => {
  isHost = true;
  isMultiplayer = true;

  const shortId = generateRoomId();
  const roomId = 'devracer-' + shortId;
  initPeer(roomId);

  lobbyCard.classList.add('hidden');
  roomInfoCard.classList.remove('hidden');
  displayRoomId.value = shortId;

  // Host kendini de odaya ekler
  roomPlayers[roomId] = myProfile;

  peer.on('open', () => {
    updateLobbyPlayersUI();
  });

  peer.on('connection', (connection) => {
    if (connections.length >= 4) {
      connection.on('open', () => {
        connection.send({ type: 'ROOM_FULL' });
        setTimeout(() => connection.close(), 500);
      });
      return;
    }
    connections.push(connection);
    setupConnectionListeners(connection);
  });
});

btnJoinRoom.addEventListener('click', () => {
  let targetRoomId = inputRoomId.value.trim();

  // Eğer URL kopyalandıysa parametreden ID'yi al
  if (targetRoomId.includes('?room=')) {
    try {
      const urlParams = new URLSearchParams(targetRoomId.split('?')[1]);
      const extractedRoom = urlParams.get('room');
      if (extractedRoom) {
        targetRoomId = extractedRoom;
      }
    } catch (e) {
      console.error('URL parse hatası:', e);
    }
  } else if (targetRoomId.includes('room=')) {
    const match = targetRoomId.match(/room=([^&]+)/);
    if (match && match[1]) {
      targetRoomId = match[1];
    }
  }

  if (!targetRoomId) {
    alert('Lütfen geçerli bir Oda ID girin!');
    return;
  }

  isHost = false;
  isMultiplayer = true;

  // Kendi peer'ımızı rastgele id ile oluşturalım
  initPeer();

  peer.on('open', () => {
    roomStatus.innerText = 'Odaya bağlanılıyor...';
    conn = peer.connect('devracer-' + targetRoomId);
    setupConnectionListeners(conn);
  });
});

// Host oyunu başlattığında tetiklenir
const btnStartGameMulti = document.getElementById('btn-start-multiplayer-game');
if (btnStartGameMulti) {
  btnStartGameMulti.addEventListener('click', () => {
    if (!isHost) return;
    
    // Rastgele metni seç
    currentText = getRandomCodeByLanguage();
    
    // Herkese oyunu başlatma emri gönder
    sendPeerData({ type: 'START_GAME', code: currentText });
    
    // Yarışı hazırla ve geri sayımı başlat
    prepareMultiplayerRace();
  });
}

function updateLobbyPlayersUI() {
  const playerListEl = document.getElementById('room-player-list');
  const countBadge = document.getElementById('player-count-badge');
  if (!playerListEl) return;
  
  playerListEl.innerHTML = '';
  const playerIds = Object.keys(roomPlayers);
  const totalCount = playerIds.length;
  countBadge.innerText = `${totalCount}/5`;

  playerIds.forEach(id => {
    const p = roomPlayers[id];
    const playerRow = document.createElement('div');
    playerRow.className = 'lobby-player-row';
    playerRow.style.display = 'flex';
    playerRow.style.alignItems = 'center';
    playerRow.style.gap = '0.75rem';
    playerRow.style.padding = '0.5rem';
    playerRow.style.borderRadius = '8px';
    playerRow.style.background = 'rgba(255, 255, 255, 0.05)';
    playerRow.style.border = '1px solid rgba(255, 255, 255, 0.05)';

    const isMe = id === peer.id;
    const isRoomHost = id.startsWith('devracer-');

    playerRow.innerHTML = `
      <div style="background: ${p.bg}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">${p.avatar}</div>
      <div style="font-weight: 700; flex: 1; color: #fff;">${p.name} ${isMe ? '<span style="color: #64748b; font-size: 0.8rem; font-weight: 500;">(SEN)</span>' : ''}</div>
      <div style="font-size: 0.8rem; font-weight: 800; color: #fbbf24;">${isRoomHost ? '👑 Oda Sahibi' : '🎮 Oyuncu'}</div>
    `;
    playerListEl.appendChild(playerRow);
  });

  const startBtn = document.getElementById('btn-start-multiplayer-game');
  const waitingText = document.getElementById('waiting-status-text');
  
  if (isHost) {
    if (waitingText) waitingText.classList.add('hidden');
    if (startBtn) {
      startBtn.classList.remove('hidden');
      startBtn.disabled = totalCount < 2;
      if (totalCount < 2) {
        startBtn.innerText = '⏳ Oyuncular Bekleniyor...';
        startBtn.style.opacity = '0.6';
      } else {
        startBtn.innerText = '🚀 Oyunu Başlat';
        startBtn.style.opacity = '1';
      }
    }
  } else {
    if (startBtn) startBtn.classList.add('hidden');
    if (waitingText) {
      waitingText.classList.remove('hidden');
      waitingText.innerText = '⏳ Oda sahibinin oyunu başlatması bekleniyor...';
    }
  }
}

function prepareMultiplayerRace() {
  roomInfoCard.classList.add('hidden');
  lobbyCard.classList.add('hidden');
  raceCard.classList.remove('hidden');

  // Skor / Hazır durumları
  playerProgress = {};
  playerFinishData = {};

  // İlerleme çubuklarını dinamik oluştur
  const progressSection = document.getElementById('progress-section');
  if (progressSection) {
    progressSection.innerHTML = '';
    const playerIds = Object.keys(roomPlayers);
    playerIds.forEach(id => {
      const p = roomPlayers[id];
      const isMe = id === peer.id;
      
      const container = document.createElement('div');
      container.className = 'progress-container';
      container.id = `progress-container-${id}`;
      
      container.innerHTML = `
        <div class="player-info-badge ${isMe ? 'my-badge' : 'opponent-badge'}">
          <span class="player-avatar-mini" style="background: ${p.bg};">${p.avatar}</span>
          <span class="player-name-label">${p.name} ${isMe ? '(Sen)' : ''}</span>
        </div>
        <div class="progress-bar-bg">
          <div id="progress-bar-${id}" class="progress-bar ${isMe ? 'my-bar' : 'opponent-bar'}"></div>
        </div>
      `;
      progressSection.appendChild(container);
    });
  }

  // Sonraki raunt hazır durumlarını temizle
  playerNextRoundReady = {};

  resetRaceState();

  // Skor tabelası
  if (matchMode !== 'single') {
    seriesScoreBox.classList.remove('hidden');
    scoreModeLabel.innerText = matchMode === 'bo3' ? 'BEST OF 3' : 'BEST OF 5';
    // Seride kimin kaç galibiyeti olduğunu yaz
    myScoreDisplay.innerText = playerWins[peer.id] || 0;
    
    // Rakiplerden en yüksek skora sahip olanı rakip skoru olarak göster
    let maxOpponentScore = 0;
    Object.keys(playerWins).forEach(id => {
      if (id !== peer.id && playerWins[id] > maxOpponentScore) {
        maxOpponentScore = playerWins[id];
      }
    });
    opponentScoreDisplay.innerText = maxOpponentScore;
  } else {
    seriesScoreBox.classList.add('hidden');
  }

  if (isHost) {
    setTimeout(startCountdown, 500);
  }
}

function startCountdown() {
  countdownOverlay.classList.remove('hidden');
  codeInput.disabled = true;

  let count = 3;
  countdownNumber.innerText = count;

  if (isHost) sendPeerData({ type: 'COUNTDOWN', count: count });

  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownNumber.innerText = count;
      if (isHost) sendPeerData({ type: 'COUNTDOWN', count: count });
    } else if (count === 0) {
      countdownNumber.innerText = "BAŞLA! 🚀";
      if (isHost) sendPeerData({ type: 'COUNTDOWN', count: 0 });
    } else {
      clearInterval(countdownInterval);
      countdownOverlay.classList.add('hidden');
      codeInput.disabled = false;
      codeInput.focus();
      // countdown bittiğinde -1 göndererek kapat
      if (isHost) sendPeerData({ type: 'COUNTDOWN', count: -1 });
    }
  }, 1000);
}

// Bitirme analizi ve sonuçlar (Multiplayer için özelleştirilmiş)
function resolveMultiplayerOutcome() {
  // Ben bitirdim mi?
  const myFinish = playerFinishData[peer.id];
  if (!myFinish) {
    // Henüz bitirmedim ama rakip bitirmiş olabilir
    showOpponentFinishedBanner();
    return;
  }

  const finishedIds = Object.keys(playerFinishData);
  const totalPlayers = Object.keys(roomPlayers).length;

  if (finishedIds.length < totalPlayers) {
    // Herkesin bitirmesi bekleniyor, ama benim sonucumu göster
    showWaitingForOpponents(myFinish.stats);
  } else {
    // Herkes bitirdi, genel sonuçları listele
    showMultiplayerResults();
  }
}

function showWaitingForOpponents(myStats) {
  raceCard.classList.add('hidden');
  resultCard.classList.remove('hidden');
  document.querySelector('.result-actions').classList.add('hidden');

  btnNextRound.classList.add('hidden');
  btnRematch.classList.add('hidden');
  rematchRequestBox.classList.add('hidden');

  const resultTitle = document.getElementById('result-title');
  resultTitle.innerHTML = "Bitirdin! Diğer oyuncular yazıyor... ⏳";
  resultTitle.style.color = "#38bdf8";

  document.getElementById('res-wpm').innerText = myStats.duration || myStats.wpm;
  document.getElementById('res-cpm').innerText = myStats.cpm;
  document.getElementById('res-errors').innerText = myStats.errors;
}

function showMultiplayerResults() {
  raceCard.classList.add('hidden');
  resultCard.classList.remove('hidden');
  document.querySelector('.result-actions').classList.remove('hidden');

  btnNextRound.classList.add('hidden');
  btnRematch.classList.add('hidden');
  rematchRequestBox.classList.add('hidden');

  const resultTitle = document.getElementById('result-title');
  resultTitle.innerHTML = `Yarış Sonuçları 🏁`;
  resultTitle.style.color = "#fbbf24";

  // Oyuncuları bitirme süresine göre sırala
  const sortedPlayers = Object.keys(playerFinishData)
    .map(id => ({
      id,
      profile: roomPlayers[id],
      stats: playerFinishData[id].stats,
      elapsedMs: playerFinishData[id].elapsedMs
    }))
    .sort((a, b) => a.elapsedMs - b.elapsedMs);

  // Sonuç alanını dinamik doldur
  const showcase = document.querySelector('.result-profiles-showcase');
  if (showcase) {
    showcase.innerHTML = '';
    showcase.style.flexDirection = 'column';
    showcase.style.gap = '0.75rem';
    showcase.style.alignItems = 'stretch';

    sortedPlayers.forEach((p, index) => {
      const isMe = p.id === peer.id;
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.justifyContent = 'space-between';
      item.style.background = isMe ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)';
      item.style.border = isMe ? '1px solid #38bdf8' : '1px solid #1e293b';
      item.style.padding = '0.75rem 1rem';
      item.style.borderRadius = '12px';
      
      let trophy = `${index + 1}.`;
      if (index === 0) trophy = '👑';
      else if (index === 1) trophy = '🥈';
      else if (index === 2) trophy = '🥉';

      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.2rem; font-weight: 800; width: 24px; text-align: center;">${trophy}</span>
          <div style="background: ${p.profile.bg}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">${p.profile.avatar}</div>
          <div style="text-align: left;">
            <div style="font-weight: 700; color: #fff;">${p.profile.name} ${isMe ? '(Sen)' : ''}</div>
            <div style="font-size: 0.75rem; color: #94a3b8;">CPM: ${p.stats.cpm} | Hata: ${p.stats.errors}</div>
          </div>
        </div>
        <div style="font-weight: 800; font-size: 1.2rem; color: #38bdf8;">${p.stats.duration} sn</div>
      `;
      showcase.appendChild(item);
    });
  }

  // Kendi detay kartlarımız
  const myFinish = playerFinishData[peer.id];
  if (myFinish) {
    document.getElementById('res-wpm').innerText = myFinish.stats.duration || myFinish.stats.wpm;
    document.getElementById('res-cpm').innerText = myFinish.stats.cpm;
    document.getElementById('res-errors').innerText = myFinish.stats.errors;
  }

  // Seri / Rövanş buton yönetimi
  if (isHost) {
    if (matchMode !== 'single') {
      // Raundun kazananını bulalım ve skorunu ekleyelim
      const roundWinnerId = sortedPlayers[0].id;
      playerWins[roundWinnerId] = (playerWins[roundWinnerId] || 0) + 1;

      // Seri galibi var mı?
      const targetWins = matchMode === 'bo3' ? 2 : 3;
      let seriesWinnerId = null;
      Object.keys(playerWins).forEach(id => {
        if (playerWins[id] >= targetWins) {
          seriesWinnerId = id;
        }
      });

      if (seriesWinnerId) {
        const winnerProfile = roomPlayers[seriesWinnerId];
        resultTitle.innerHTML = `🏆 Seri Şampiyonu: ${winnerProfile.name}! 👑`;
        resultTitle.style.color = "#fbbf24";
        btnRematch.classList.remove('hidden');
        btnRematch.disabled = false;
      } else {
        btnNextRound.classList.remove('hidden');
        btnNextRound.disabled = false;
      }
    } else {
      btnRematch.classList.remove('hidden');
      btnRematch.disabled = false;
    }
  } else {
    // Katılımcı için butonlar pasif durumdadır (Oda sahibinin aksiyonu beklenir)
    btnNextRound.classList.add('hidden');
    btnRematch.classList.add('hidden');
  }
}

// BUTON DİNLEYİCİLERİ
btnSolo.addEventListener('click', startSoloGame);

btnRestartSolo.addEventListener('click', () => {
  if (peer) leaveToLobby();
  else {
    resultCard.classList.add('hidden');
    lobbyCard.classList.remove('hidden');
  }
});

btnCopyId.addEventListener('click', () => {
  const baseUrl = window.location.href.split('?')[0];
  const shareUrl = `${baseUrl}?room=${displayRoomId.value}`;

  function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
    document.body.removeChild(textArea);
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(shareUrl).catch(() => {
      fallbackCopyText(shareUrl);
    });
  } else {
    fallbackCopyText(shareUrl);
  }

  btnCopyId.innerText = 'Link Kopyalandı! ✅';
  setTimeout(() => (btnCopyId.innerText = '📋 Davet Linkini Kopyala'), 2000);
});

btnChallengeFriend.addEventListener('click', () => {
  if (peer) leaveToLobby();
  resultCard.classList.add('hidden');
  lobbyCard.classList.remove('hidden');
  btnCreateRoom.click();
});

if (document.getElementById('btn-leave-room')) {
  document.getElementById('btn-leave-room').addEventListener('click', leaveToLobby);
}
if (document.getElementById('btn-leave-race')) {
  document.getElementById('btn-leave-race').addEventListener('click', () => {
    if (isMultiplayer && confirm('Yarıştan ayrılmak istediğine emin misin?')) {
      leaveToLobby();
    } else if (!isMultiplayer) {
      leaveToLobby();
    }
  });
}

// SAYFA YÜKLENDİĞİNDE
loadPersonalRecord();
renderRunHistory();
loadProfile();
initProfileEvents();

// Profil Yönetimi ve Etkinlikler
function initProfileEvents() {
  document.querySelectorAll('.avatar-circle-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.avatar-circle-option').forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      
      myProfile.avatar = option.getAttribute('data-avatar');
      myProfile.bg = option.getAttribute('data-bg');
      
      const preview = document.getElementById('current-avatar-preview');
      if (preview) {
        preview.innerText = myProfile.avatar;
        preview.style.background = myProfile.bg;
      }
      
      saveProfile();
    });
  });

  const nameInput = document.getElementById('player-name');
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      saveProfile();
    });
  }

  // Rövanş ve sonraki raunt buton dinleyicileri
  btnNextRound.addEventListener('click', () => {
    btnNextRound.innerText = "Hazır! ⏳";
    btnNextRound.disabled = true;
    
    if (isHost) {
      playerNextRoundReady[peer.id] = true;
      checkNextRoundTransition();
    } else {
      sendPeerData({ type: 'ROUND_READY', peerId: peer.id });
    }
  });

  btnRematch.addEventListener('click', () => {
    btnRematch.innerText = "Rövanş İstendi... ⏳";
    btnRematch.disabled = true;
    sendPeerData({ type: 'REMATCH_REQUEST' });
  });

  btnAcceptRematch.addEventListener('click', () => {
    rematchRequestBox.classList.add('hidden');
    sendPeerData({ type: 'REMATCH_ANSWER', answer: 'accept' });
    startNewSeries();
  });

  btnDeclineRematch.addEventListener('click', () => {
    rematchRequestBox.classList.add('hidden');
    sendPeerData({ type: 'REMATCH_ANSWER', answer: 'decline' });
    leaveToLobby();
  });
}

function checkNextRoundTransition() {
  const readyIds = Object.keys(playerNextRoundReady);
  const totalPlayers = Object.keys(roomPlayers).length;
  
  if (readyIds.length === totalPlayers) {
    // Yeni kelimeyi seçip herkese tura başla mesajı yollayalım
    currentText = getRandomCodeByLanguage();
    sendPeerData({ type: 'ROUND_TRANSITION', code: currentText });
    prepareMultiplayerRace();
  }
}

function startNewSeries() {
  playerWins = {};
  playerNextRoundReady = {};
  
  if (isHost) {
    currentText = getRandomCodeByLanguage();
    sendPeerData({ type: 'ROUND_TRANSITION', code: currentText });
    prepareMultiplayerRace();
  }
}

// Bir arkadaşın davet linkine tıklanarak gelindiyse (?room=ID), oda ID'sini
// otomatik doldur ki kullanıcı elle kopyalayıp yapıştırmak zorunda kalmasın.
(function autoFillRoomFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const roomFromUrl = params.get('room');
  if (roomFromUrl) {
    inputRoomId.value = roomFromUrl;
    roomStatus.innerText = 'Davet linkiyle geldin — katılmak için butona bas!';
  }
})();

// Son 5 solo denemeyi localStorage'da saklayıp göster (küçük bir motivasyon +
// ilerleme takibi; backend gerektirmez).
function saveRunToHistory(stats) {
  const history = JSON.parse(localStorage.getItem('csr_history') || '[]');
  history.unshift({ duration: stats.duration || "--", cpm: stats.cpm, errors: stats.errors, date: Date.now() });
  localStorage.setItem('csr_history', JSON.stringify(history.slice(0, 5)));
  renderRunHistory();
}

function renderRunHistory() {
  const el = document.getElementById('run-history');
  if (!el) return;
  const history = JSON.parse(localStorage.getItem('csr_history') || '[]');
  if (history.length === 0) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = '<span class="history-title">Son Denemelerin:</span>' +
    history.map(h => `<span class="history-chip">${h.duration || "--"} sn</span>`).join('');
}

// ALT BİLGİ DÖKÜMAN POPUP MANTIĞI
const footerModal = document.getElementById('footer-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

const modalContents = {
  privacy: {
    title: "Gizlilik Politikası 🔒",
    body: `
      <p>DevRacer platformu olarak gizliliğinize son derece önem veriyoruz. Sitemizi kullanırken verilerinizin nasıl işlendiği aşağıda açıklanmıştır:</p>
      <h3>1. Veri Depolama</h3>
      <p>Yarışçı adı, seçtiğiniz avatar ve en iyi tamamlama süresi (rekorunuz) gibi veriler tamamen tarayıcınızın yerel hafızasında (<b>LocalStorage</b>) saklanır. Sunucularımızda hiçbir kişisel bilginiz depolanmaz.</p>
      <h3>2. PeerJS Bağlantıları</h3>
      <p>Çok oyunculu yarışlar <b>Peer-to-Peer (P2P)</b> teknolojisiyle doğrudan iki oyuncu arasında kurulur. Bu bağlantı üzerinden aktarılan yarış verileri (isim, avatar ve klavye ilerleme yüzdesi) üçüncü şahıslarla paylaşılmaz ve herhangi bir aracı veritabanına kaydedilmez.</p>
    `
  },
  terms: {
    title: "Kullanıcı Sözleşmesi 📜",
    body: `
      <p>DevRacer web sitesini kullanarak aşağıdaki kuralları kabul etmiş sayılırsınız:</p>
      <h3>1. Adil Kullanım</h3>
      <p>DevRacer, yazılım geliştiricilerin klavye hızlarını adil bir şekilde yarıştırmaları için kurulmuştur. Makro yazılımları, otomatik kod yazan botlar veya diğer hile yöntemlerinin kullanılması yasaktır.</p>
      <h3>2. İçerik ve Paylaşım</h3>
      <p>Oda davet linkleri ve yarış içerikleri yalnızca bireysel eğlence ve pratik amacıyla kullanılabilir. Sitedeki kod blokları eğitim amaçlıdır.</p>
    `
  },
  cookies: {
    title: "Çerez Politikası 🍪",
    body: `
      <p>DevRacer, kullanıcılara daha iyi bir deneyim sunmak için minimal veri depolama yöntemleri kullanır:</p>
      <h3>1. Kullanılan Çerezler</h3>
      <p>Sitemizde reklam veya üçüncü parti takip çerezleri (tracking cookies) <b>kesinlikle kullanılmamaktadır</b>.</p>
      <h3>2. Yerel Depolama (LocalStorage)</h3>
      <p>Platformda tercihlerinizi hatırlamak amacıyla tarayıcınızın kendi hafızası kullanılır:</p>
      <ul>
        <li>Kullanıcı profil isminiz ve seçilen avatarınız.</li>
        <li>Kişisel solo rekorlarınız (en iyi süreniz).</li>
        <li>Son 5 solo denemenizin istatistikleri.</li>
      </ul>
      <p>Tarayıcı geçmişinizi temizlediğinizde bu yerel veriler de silinecektir.</p>
    `
  },
  contact: {
    title: "İletişim ✉️",
    body: `
      <p>DevRacer platformu ile ilgili görüşlerinizi, geri bildirimlerinizi veya hata bildirimlerinizi bizimle paylaşabilirsiniz:</p>
      <h3>E-Posta</h3>
      <p>Destek ve işbirlikleri için: <a href="mailto:support@devracer.com" style="color: #38bdf8; text-decoration: underline;">support@devracer.com</a></p>
      <h3>Topluluk</h3>
      <p>Yazılımcı topluluğumuza katılmak, diğer yarışçılarla iletişim kurmak ve güncellemelerden haberdar olmak için Discord sunucumuzu ve GitHub projemizi ziyaret edebilirsiniz.</p>
    `
  }
};

function openFooterModal(type) {
  const content = modalContents[type];
  if (content) {
    modalTitle.innerText = content.title;
    modalBody.innerHTML = content.body;
    footerModal.classList.remove('hidden');
  }
}

function closeFooterModal() {
  footerModal.classList.add('hidden');
}

// Tıklama olayları
document.getElementById('link-privacy').addEventListener('click', (e) => { e.preventDefault(); openFooterModal('privacy'); });
document.getElementById('link-terms').addEventListener('click', (e) => { e.preventDefault(); openFooterModal('terms'); });
document.getElementById('link-cookies').addEventListener('click', (e) => { e.preventDefault(); openFooterModal('cookies'); });
document.getElementById('link-contact').addEventListener('click', (e) => { e.preventDefault(); openFooterModal('contact'); });

modalClose.addEventListener('click', closeFooterModal);

// Dışarı tıklanınca kapatma
footerModal.addEventListener('click', (e) => {
  if (e.target === footerModal) closeFooterModal();
});

// ESC tuşuna basınca kapatma
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeFooterModal();
});

// ÇEREZ BANNER KONTROLÜ
(function initCookieBanner() {
  const isAccepted = localStorage.getItem('csr_cookies_accepted');
  const banner = document.getElementById('cookie-consent-banner');
  const btnAccept = document.getElementById('btn-accept-cookies');
  const linkMore = document.getElementById('cookie-more-info');

  if (!isAccepted) {
    banner.classList.remove('hidden');
  }

  btnAccept.addEventListener('click', () => {
    localStorage.setItem('csr_cookies_accepted', 'true');
    banner.classList.add('hidden');
  });

  linkMore.addEventListener('click', (e) => {
    e.preventDefault();
    openFooterModal('cookies');
  });
})();

// OYUNCU PROFİLİ MODAL KONTROLÜ
const profileModal = document.getElementById('profile-modal');
const btnOpenProfile = document.getElementById('nav-btn-profile');
const btnOpenProfileHeader = document.getElementById('btn-settings');
const profileModalClose = document.getElementById('profile-modal-close');
const btnSaveProfileClose = document.getElementById('btn-save-profile-close');

function openProfileModal() {
  profileModal.classList.remove('hidden');
}

function closeProfileModal() {
  profileModal.classList.add('hidden');
}

if (btnOpenProfile) btnOpenProfile.addEventListener('click', openProfileModal);
if (btnOpenProfileHeader) btnOpenProfileHeader.addEventListener('click', openProfileModal);
if (profileModalClose) profileModalClose.addEventListener('click', closeProfileModal);
if (btnSaveProfileClose) btnSaveProfileClose.addEventListener('click', closeProfileModal);

// Dışarı tıklanınca kapatma
if (profileModal) {
  profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) closeProfileModal();
  });
}

// Alt gezinti çubuğu butonlarının durumu (active class)
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

function updateLeaderboardPodium() {
  const podium1Name = document.getElementById('podium-name-1');
  const podium1Avatar = document.getElementById('podium-avatar-1');
  
  if (podium1Name && podium1Avatar) {
    const savedRecord = localStorage.getItem('csr_best_time');
    if (savedRecord) {
      podium1Name.innerText = `${myProfile.name} (${parseFloat(savedRecord).toFixed(1)}s)`;
      podium1Avatar.innerText = myProfile.avatar;
      podium1Avatar.style.background = myProfile.bg;
    } else {
      podium1Name.innerText = "Şampiyon Adayı";
      podium1Avatar.innerText = "👑";
      podium1Avatar.style.background = "linear-gradient(135deg, #fbbf24, #ea580c)";
    }
  }
}