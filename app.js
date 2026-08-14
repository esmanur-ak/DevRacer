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
  document.getElementById('opponent-progress-box').classList.add('hidden');
  
  lobbyCard.classList.add('hidden');
  resultCard.classList.add('hidden');
  raceCard.classList.remove('hidden');

  // Set my profile info on badge
  document.getElementById('my-avatar-display').innerText = myProfile.avatar;
  document.getElementById('my-avatar-display').style.background = myProfile.bg;
  document.getElementById('my-name-display').innerText = myProfile.name;

  resetRaceState();
  codeInput.disabled = false;
  codeInput.focus();
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
  myProgressBar.style.width = "0%";
  if (opponentProgressBar) opponentProgressBar.style.width = "0%";
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
  myProgressBar.style.width = `${progressPercent}%`;

  if (isMultiplayer) {
    sendPeerData({ type: 'PROGRESS', percent: progressPercent });
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

// 10. MULTIPLAYER BAĞLANTI VE ODA KATILIM BUTONLARI (multiplayer.js dosyasındaki PeerJS fonksiyonlarını tetikler)

btnCreateRoom.addEventListener('click', () => {
  isHost = true;
  isMultiplayer = true;

  const roomId = initPeer();

  lobbyCard.classList.add('hidden');
  roomInfoCard.classList.remove('hidden');
  displayRoomId.value = roomId;

  peer.on('connection', (connection) => {
    conn = connection;
    setupConnectionListeners();
    setTimeout(prepareMultiplayerRace, 1000);
  });
});

btnJoinRoom.addEventListener('click', () => {
  let targetRoomId = inputRoomId.value.trim();

  // Eğer kullanıcı tam davet linkini yapıştırdıysa, oda ID'sini otomatik ayıkla
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

  initPeer();

  peer.on('open', () => {
    roomStatus.innerText = 'Odaya bağlanılıyor...';
    conn = peer.connect(targetRoomId);
    setupConnectionListeners();
  });
});

// Bağlantı dinleyicileri, ayrılma ve tur geçiş fonksiyonları multiplayer.js içerisindedir.

function prepareMultiplayerRace() {
  roomInfoCard.classList.add('hidden');
  lobbyCard.classList.add('hidden');
  raceCard.classList.remove('hidden');

  document.getElementById('opponent-progress-box').classList.remove('hidden');

  // Sonraki raunt hazır durumlarını sıfırla
  myNextRoundReady = false;
  opponentNextRoundReady = false;

  resetRaceState();

  // Seri skor tabelasını ayarla
  if (matchMode !== 'single') {
    seriesScoreBox.classList.remove('hidden');
    scoreModeLabel.innerText = matchMode === 'bo3' ? 'BEST OF 3' : 'BEST OF 5';
    myScoreDisplay.innerText = myWins;
    opponentScoreDisplay.innerText = opponentWins;
  } else {
    seriesScoreBox.classList.add('hidden');
  }

  // Set my name and avatar on badge
  document.getElementById('my-avatar-display').innerText = myProfile.avatar;
  document.getElementById('my-avatar-display').style.background = myProfile.bg;
  document.getElementById('my-name-display').innerText = myProfile.name;

  // Set opponent's name and avatar on badge
  updateOpponentUIProfile();

  if (isHost) {
    // resetRaceState() zaten currentText'i rastgele seçti; host bunu rakiple paylaşır.
    sendPeerData({ type: 'INIT_GAME', code: currentText });
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
    }
  }, 1000);
}

// Veri paketleri alımı ve yardımcı gönderme/kontrol fonksiyonları multiplayer.js içerisindedir.

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
      preview.innerText = myProfile.avatar;
      preview.style.background = myProfile.bg;
      
      saveProfile();
    });
  });

  document.getElementById('player-name').addEventListener('input', () => {
    saveProfile();
  });

  // Rövanş ve sonraki raunt buton dinleyicileri
  btnNextRound.addEventListener('click', () => {
    btnNextRound.innerText = "Hazır! ⏳";
    btnNextRound.disabled = true;
    myNextRoundReady = true;
    sendPeerData({ type: 'ROUND_READY' });
    checkNextRoundTransition();
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