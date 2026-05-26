// ── Constants ──────────────────────────────────────────────
var COLORS = ['#f59e0b','#3b82f6','#22c55e','#ec4899','#a855f7','#14b8a6'];

// ── Map tile definitions ──────────────────────────────────
// type: sp=특별시/자치시, me=광역시, sc=특례시, re=도·지역
// grid row 8 = 22px gap, row 9 = 제주(섬)
var MAP_TILES = [
  {id:'서울',  label:'서울',    gc:'3/4', gr:'1/2', type:'sp',
   keys:['서울','홍대','이태원','신촌','강남','마포','합정','종로','혜화','건대','신림','잠실','성수','여의도','명동','인사동','연남','상수','을지로','용산','노원','망원','Seoul']},
  {id:'강원',  label:'강원도',  gc:'4/5', gr:'1/3', type:'re',
   keys:['강원','춘천','원주','강릉','동해','태백','속초','삼척','Chuncheon','Wonju','Gangneung']},
  {id:'인천',  label:'인천',    gc:'1/2', gr:'2/3', type:'me',
   keys:['인천','부평','송도','구월','계양','Incheon']},
  {id:'경기북', label:'경기북부', gc:'2/3', gr:'2/3', type:'re',
   keys:['의정부','동두천','양주','구리','남양주','포천','파주','고양','일산','덕양','화정','백마','Goyang','Uijeongbu']},
  {id:'경기남', label:'경기남부', gc:'3/4', gr:'2/3', type:'re',
   keys:['안양','부천','광명','군포','의왕','안산','시흥','오산','화성','평택','안성','하남','김포','성남','분당','판교','용인','수지','기흥','Anyang','Bucheon','Yongin','Seongnam']},
  {id:'수원',  label:'수원',    gc:'2/3', gr:'3/4', type:'sc',
   keys:['수원','영통','팔달','권선','장안','Suwon']},
  {id:'충북',  label:'충청북도', gc:'4/5', gr:'3/5', type:'re',
   keys:['충북','청주','충주','제천','청원','Cheongju','Chungju']},
  {id:'충남',  label:'충청남도', gc:'1/2', gr:'4/5', type:'re',
   keys:['충남','천안','공주','보령','아산','서산','논산','계룡','당진','Cheonan','Asan']},
  {id:'세종',  label:'세종',    gc:'2/3', gr:'4/5', type:'sp',
   keys:['세종','Sejong']},
  {id:'대전',  label:'대전',    gc:'3/4', gr:'4/5', type:'me',
   keys:['대전','유성','둔산','노은','Daejeon']},
  {id:'경북',  label:'경상북도', gc:'5/6', gr:'4/6', type:'re',
   keys:['경북','포항','경주','김천','안동','구미','영주','영천','상주','문경','경산','Pohang','Gyeongju','Gumi']},
  {id:'전북',  label:'전라북도', gc:'1/2', gr:'5/6', type:'re',
   keys:['전북','전주','군산','익산','정읍','남원','김제','Jeonju','Gunsan']},
  {id:'대구',  label:'대구',    gc:'3/4', gr:'5/6', type:'me',
   keys:['대구','동성로','수성','달서','칠곡','Daegu']},
  {id:'경남',  label:'경상남도', gc:'4/5', gr:'5/6', type:'re',
   keys:['경남','진주','통영','사천','김해','밀양','거제','양산','창원','마산','진해','울산','삼산','태화','언양','Changwon','Jinju','Ulsan']},
  {id:'광주',  label:'광주',    gc:'1/2', gr:'6/7', type:'me',
   keys:['광주','충장로','상무','첨단','광산','Gwangju']},
  {id:'전남',  label:'전라남도', gc:'2/3', gr:'6/8', type:'re',
   keys:['전남','목포','여수','순천','나주','광양','Mokpo','Yeosu']},
  {id:'부산',  label:'부산',    gc:'5/6', gr:'6/7', type:'me',
   keys:['부산','해운대','서면','광안','남포','센텀','동래','Busan']},
  {id:'제주',  label:'제주도',  gc:'1/2', gr:'9/10', type:'re',
   keys:['제주','서귀포','Jeju']},
];
var TILE_STYLE = {
  sp: {border:'#8b5cf6'},
  me: {border:'#3b82f6'},
  sc: {border:'#f59e0b'},
  re: {border:'#475569'}
};

var DEFAULT_PLAYERS = [
  {id:0, name:'황',    color:'#f59e0b', image:null},
  {id:1, name:'곤',    color:'#3b82f6', image:null},
  {id:2, name:'이셔뷩',color:'#22c55e', image:null},
  {id:3, name:'몽끼',  color:'#ec4899', image:null},
  {id:4, name:'짐서방',color:'#a855f7', image:null},
  {id:5, name:'뚜부',  color:'#14b8a6', image:null}
];
var PLAYERS_KEY = 'nairongbbong_players';
var STORAGE_KEY  = 'nairongbbong_v1';

// ── State ─────────────────────────────────────────────────
var G = null;
var setupSelected = [0,1,2,3,4,5];
var historyTab = 'list';
var mapActiveTile = null;
var openHistoryMenu = null;

// ── Cloud / Admin constants ────────────────────────────────
var API_URL = '/api/games';
var ADMIN_PIN_KEY = 'nrbAdminPin';

// ── Navigation ────────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById('screen-' + name).classList.add('active');
  window.scrollTo(0, 0);
}
function goSetup() {
  document.getElementById('setup-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('setup-location').value = '';
  document.getElementById('setup-rounds').value = '';
  setupSelected = getPlayers().map(function(_, i) { return i; });
  renderSetupPlayerSelect();
  showScreen('setup');
  autoFillLocation();
}
function goHistory() {
  historyTab = 'list';
  mapActiveTile = null;
  renderHistoryList();
  showScreen('history');
  var tl = document.getElementById('tab-list');
  var tm = document.getElementById('tab-map');
  if (tl) tl.classList.add('tab-active');
  if (tm) tm.classList.remove('tab-active');
  var hl = document.getElementById('history-list');
  var ms = document.getElementById('map-section');
  if (hl) hl.style.display = 'block';
  if (ms) ms.style.display = 'none';
}
function switchHistoryTab(tab) {
  historyTab = tab;
  var tl = document.getElementById('tab-list');
  var tm = document.getElementById('tab-map');
  var hl = document.getElementById('history-list');
  var ms = document.getElementById('map-section');
  if (tab === 'list') {
    tl.classList.add('tab-active'); tm.classList.remove('tab-active');
    hl.style.display = 'block'; ms.style.display = 'none';
  } else {
    tm.classList.add('tab-active'); tl.classList.remove('tab-active');
    hl.style.display = 'none'; ms.style.display = 'block';
    mapActiveTile = null;
    renderHistoryMap();
  }
}
function goSettings() { loadOpacitySlider(); renderPlayersScreen(); showScreen('settings'); }
function goPlayers() { goSettings(); }

// ── Cloud Sync ─────────────────────────────────────────────
function syncFromCloud() {
  fetch(API_URL)
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(data) {
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    })
    .catch(function() {});
}
function pushToCloud(games) {
  var pin = sessionStorage.getItem(ADMIN_PIN_KEY);
  if (!pin) return;
  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Pin': pin },
    body: JSON.stringify(games)
  })
    .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function() { showToast('☁️ 클라우드 저장 완료'); })
    .catch(function() { showToast('⚠️ 클라우드 저장 실패'); });
}

// ── Admin Mode ─────────────────────────────────────────────
function isAdminMode() { return !!sessionStorage.getItem(ADMIN_PIN_KEY); }
function toggleAdminMode() {
  if (isAdminMode()) {
    sessionStorage.removeItem(ADMIN_PIN_KEY);
    updateAdminBtn();
    showToast('관리자 모드 해제');
  } else {
    openPinOverlay();
  }
}
function openPinOverlay() {
  var el = document.getElementById('pin-overlay');
  if (el) el.style.display = 'flex';
  var inp = document.getElementById('pin-input');
  if (inp) { inp.value = ''; inp.style.borderColor = '#334155'; setTimeout(function(){ inp.focus(); }, 80); }
  var err = document.getElementById('pin-error');
  if (err) err.textContent = '';
}
function closePinOverlay() {
  var el = document.getElementById('pin-overlay');
  if (el) el.style.display = 'none';
}
function confirmPin() {
  var inp = document.getElementById('pin-input');
  var pin = inp ? inp.value.trim() : '';
  if (!pin) return;
  var err = document.getElementById('pin-error');
  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Pin': pin },
    body: 'null'
  })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d && d.verified) {
        sessionStorage.setItem(ADMIN_PIN_KEY, pin);
        closePinOverlay();
        updateAdminBtn();
        showToast('✅ 관리자 모드 활성화');
      } else {
        if (err) err.textContent = '❌ PIN이 올바르지 않습니다';
        if (inp) inp.style.borderColor = '#ef4444';
      }
    })
    .catch(function() {
      if (err) err.textContent = '❌ 서버 연결 실패';
    });
}
function syncToCloud() {
  if (!isAdminMode()) return;
  var list = loadHistory();
  if (list.length === 0) { showToast('업로드할 게임 기록이 없습니다'); return; }
  pushToCloud(list);
}
function updateAdminBtn() {
  var btn = document.getElementById('admin-btn');
  var syncBtn = document.getElementById('sync-btn');
  if (!btn) return;
  if (isAdminMode()) {
    btn.textContent = '🔓 관리자 ON';
    btn.style.borderColor = '#22c55e';
    btn.style.color = '#22c55e';
    if (syncBtn) syncBtn.style.display = 'block';
  } else {
    btn.textContent = '🔒 관리자';
    btn.style.borderColor = '';
    btn.style.color = '';
    if (syncBtn) syncBtn.style.display = 'none';
  }
}
function showToast(msg) {
  var el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(el._tid);
  el._tid = setTimeout(function() { el.style.opacity = '0'; }, 2800);
}

// ── IP Location Auto-fill ──────────────────────────────────
function autoFillLocation() {
  var el = document.getElementById('setup-location');
  if (!el || el.value) return;
  fetch('https://ipinfo.io/json')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d && d.city && el.value === '') {
        el.value = d.city;
        el.style.color = 'var(--sub)';
        el.addEventListener('input', function clearStyle() {
          el.style.color = '';
          el.removeEventListener('input', clearStyle);
        });
      }
    })
    .catch(function() {});
}

// ── Player Storage ─────────────────────────────────────────
function getPlayers() {
  try {
    var s = JSON.parse(localStorage.getItem(PLAYERS_KEY));
    if (s && s.length === 6) return s;
  } catch (e) {}
  return DEFAULT_PLAYERS.map(function(p) { return Object.assign({}, p); });
}
function storePlayers(pl) { localStorage.setItem(PLAYERS_KEY, JSON.stringify(pl)); }

// ── Player Rank Stats ──────────────────────────────────────
function calcPlayerRankStats() {
  var list = loadHistory();
  var stats = {};
  getPlayers().forEach(function(p) { stats[p.name] = {r1:0, r2:0, r3:0}; });
  list.forEach(function(g) {
    g.rounds.forEach(function(r) {
      var arr = g.players.map(function(p) {
        return {name: p.name, score: (r.scores && r.scores[p.name] !== undefined) ? r.scores[p.name] : 0};
      }).sort(function(a, b) { return a.score - b.score; });
      arr.forEach(function(ps, idx) {
        if (!stats[ps.name]) stats[ps.name] = {r1:0, r2:0, r3:0};
        if (idx === 0) stats[ps.name].r1++;
        else if (idx === 1) stats[ps.name].r2++;
        else if (idx === 2) stats[ps.name].r3++;
      });
    });
  });
  return stats;
}

// ── Player Management ──────────────────────────────────────
function triggerUpload(idx) {
  document.getElementById('file-' + idx).click();
}
function renderPlayersScreen() {
  var pl = getPlayers();
  var stats = calcPlayerRankStats();
  var html = '';
  pl.forEach(function(p, i) {
    var hasImg = !!p.image;
    var st = stats[p.name] || {r1:0, r2:0, r3:0};
    html += '<div class="player-card">';
    html += '<div class="avatar-box' + (hasImg ? ' has-img' : '') + '" id="av-box-' + i + '" onclick="triggerUpload(' + i + ')" style="background:' + p.color + '22">';
    html += '<div class="av-bg" style="background:' + p.color + '44"></div>';
    html += '<span class="av-initial" id="av-init-' + i + '"' + (hasImg ? ' style="display:none"' : '') + '>' + esc(p.name.slice(0,2)) + '</span>';
    html += '<img class="av-img" id="av-img-' + i + '" src="' + (hasImg ? p.image : '') + '" alt=""' + (hasImg ? '' : ' style="display:none"') + '>';
    html += '<div class="av-edit">&#9998;</div>';
    html += '</div>';
    html += '<input type="file" id="file-' + i + '" accept="image/*" style="display:none" onchange="handleImgUpload(' + i + ',event)">';
    html += '<input class="player-name-edit" type="text" id="pname-' + i + '" value="' + esc(p.name) + '" maxlength="6" placeholder="이름">';
    html += '<div class="player-rank-bar">🥇' + st.r1 + ' 🥈' + st.r2 + ' 🥉' + st.r3 + '</div>';
    html += '</div>';
  });
  document.getElementById('player-grid').innerHTML = html;
}
function handleImgUpload(idx, event) {
  var file = event.target.files[0];
  if (!file) return;
  compressImage(file, function(dataUrl) {
    document.getElementById('av-img-' + idx).src = dataUrl;
    document.getElementById('av-img-' + idx).style.display = 'block';
    document.getElementById('av-init-' + idx).style.display = 'none';
    document.getElementById('av-box-' + idx).classList.add('has-img');
  });
}
function compressImage(file, cb) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var MAX = 300, w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else       { w = Math.round(w * MAX / h); h = MAX; }
      }
      var c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      cb(c.toDataURL('image/jpeg', 0.78));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
function savePlayerEdits() {
  var pl = getPlayers();
  pl.forEach(function(p, i) {
    var ne = document.getElementById('pname-' + i);
    var ie = document.getElementById('av-img-' + i);
    if (ne) { var n = ne.value.trim(); if (n) p.name = n; }
    if (ie && ie.src && ie.style.display !== 'none' && ie.src.startsWith('data:')) p.image = ie.src;
  });
  storePlayers(pl);
  alert('저장됐습니다!');
  showScreen('settings');
}

// ── Opacity / Settings ────────────────────────────────────
function setOpacity(val) {
  var v = Math.max(10, Math.min(95, parseInt(val)));
  document.documentElement.style.setProperty('--panel-alpha', (v / 100).toFixed(2));
  var el = document.getElementById('opacity-val');
  if (el) el.textContent = v + '%';
  localStorage.setItem('panelOpacity', v);
}
function loadOpacity() {
  var saved = localStorage.getItem('panelOpacity');
  if (saved) {
    var v = parseInt(saved);
    document.documentElement.style.setProperty('--panel-alpha', (v / 100).toFixed(2));
  }
}
function loadOpacitySlider() {
  var saved = parseInt(localStorage.getItem('panelOpacity') || '82');
  var sl = document.getElementById('opacity-slider');
  if (sl) sl.value = saved;
  var vl = document.getElementById('opacity-val');
  if (vl) vl.textContent = saved + '%';
}

// ── Setup: Player Selection ────────────────────────────────
function togglePlayerSelect(idx) {
  var pos = setupSelected.indexOf(idx);
  if (pos >= 0) {
    if (setupSelected.length <= 2) { alert('최소 2명 이상이어야 합니다.'); return; }
    setupSelected.splice(pos, 1);
  } else {
    setupSelected.push(idx);
  }
  renderSetupPlayerSelect();
}
function renderSetupPlayerSelect() {
  var pl = getPlayers();
  var html = '';
  pl.forEach(function(p, i) {
    var sel = setupSelected.indexOf(i) >= 0;
    html += '<div class="player-sel-card' + (sel ? ' sel-on' : ' sel-off') + '" onclick="togglePlayerSelect(' + i + ')">';
    html += avatarSm(p, 52);
    html += '<span class="player-sel-name">' + esc(p.name) + '</span>';
    if (sel) html += '<span class="sel-check">✓</span>';
    html += '</div>';
  });
  document.getElementById('setup-player-select').innerHTML = html;
  var countEl = document.getElementById('setup-sel-count');
  if (countEl) countEl.textContent = setupSelected.length + '명 참석';
}

// ── Start Game ────────────────────────────────────────────
function startGame() {
  var dateVal = document.getElementById('setup-date').value;
  if (!dateVal) { alert('날짜를 입력해주세요.'); return; }
  if (setupSelected.length < 2) { alert('최소 2명을 선택해주세요.'); return; }
  var allPl = getPlayers();
  var sorted = setupSelected.slice().sort(function(a,b){ return a-b; });
  var pl = sorted.map(function(i) { return allPl[i]; });
  var rl = parseInt(document.getElementById('setup-rounds').value) || null;
  var totals = {};
  pl.forEach(function(p) { totals[p.name] = 0; });
  var locEl = document.getElementById('setup-location');
  locEl.style.color = '';
  G = {
    id: Date.now(), date: dateVal,
    location: locEl.value.trim() || '장소 미입력',
    players: pl, roundLimit: rl, currentRound: 1, rounds: [], totals: totals, finished: false
  };
  document.getElementById('score-card').style.display = 'block';
  document.getElementById('history-card').style.display = 'none';
  document.getElementById('end-btn').style.display = 'block';
  var ex = document.getElementById('result-card'); if (ex) ex.remove();
  showScreen('game');
  renderGameScreen();
}

// ── Game Screen ───────────────────────────────────────────
function renderGameScreen() {
  document.getElementById('game-info-bar').innerHTML =
    '<span>📅 ' + fmtDate(G.date) + '</span>' +
    '<span>📍 ' + esc(G.location) + '</span>' +
    (G.roundLimit ? '<span>총 ' + G.roundLimit + '라운드</span>' : '');
  renderRankingRow();
  renderScoreInputs();
}

// ── Ranking Row (상단 순위) ────────────────────────────────
function sortedPlayers() {
  return G.players.slice().sort(function(a, b) {
    var d = G.totals[a.name] - G.totals[b.name];
    if (d !== 0) return d;
    return G.players.indexOf(a) - G.players.indexOf(b);
  });
}
function renderRankingRow() {
  var sorted = sortedPlayers();
  var medals = ['🥇','🥈','🥉','4위','5위','6위'];
  var html = '';
  sorted.forEach(function(p, i) {
    var t = G.totals[p.name];
    html += '<div class="rank-chip">';
    html += '<div class="rank-chip-medal">' + (medals[i] || (i+1)+'위') + '</div>';
    html += avatarSm(p, 42);
    html += '<div class="rank-chip-name">' + esc(p.name) + '</div>';
    html += '<div class="rank-chip-score ' + scoreClass(t) + '">' + fmtScore(t) + '</div>';
    html += '</div>';
  });
  document.getElementById('ranking-row').innerHTML = html;
  document.getElementById('round-done-label').textContent =
    G.rounds.length > 0 ? G.rounds.length + 'R 완료' : '시작 전';
}

// ── Score Input (2열 카드형) ──────────────────────────────
function renderScoreInputs() {
  document.getElementById('round-badge').textContent = G.currentRound + 'R';
  var stats = calcPlayerRankStats();
  var html = '';
  G.players.forEach(function(p, i) {
    var t = G.totals[p.name];
    var st = stats[p.name] || {r1:0, r2:0, r3:0};
    html += '<div class="score-card" style="border-top:3px solid ' + p.color + '">';
    html += '<div class="score-card-top">';
    html += avatarSm(p, 44);
    html += '<div class="score-card-info">';
    html += '<div class="score-card-name">' + esc(p.name) + '</div>';
    html += '<div class="score-card-ranks">🥇' + st.r1 + ' 🥈' + st.r2 + ' 🥉' + st.r3 + '</div>';
    html += '<div class="score-card-total ' + scoreClass(t) + '">' + fmtScore(t) + '</div>';
    html += '</div>';
    html += '</div>';
    html += '<input class="score-input-field score-card-input" type="number" id="si-' + i + '" placeholder="0" inputmode="decimal">';
    html += '</div>';
  });
  document.getElementById('score-inputs').innerHTML = html;
  setTimeout(function() { var el = document.getElementById('si-0'); if (el) el.focus(); }, 80);
}

function submitRound() {
  var scores = {}, allFilled = true;
  G.players.forEach(function(p, i) {
    var el = document.getElementById('si-' + i);
    if (!el || el.value.trim() === '') { allFilled = false; return; }
    scores[p.name] = parseInt(el.value) || 0;
  });
  if (!allFilled) { alert('모든 플레이어의 점수를 입력해주세요.'); return; }
  G.rounds.push({ round: G.currentRound, scores: scores });
  G.players.forEach(function(p) { G.totals[p.name] += scores[p.name]; });
  G.currentRound++;
  if (G.roundLimit && G.currentRound > G.roundLimit) { endGame(); return; }
  renderRankingRow();
  renderScoreInputs();
  renderRoundTable();
  document.getElementById('history-card').style.display = 'block';
}

function confirmEnd() {
  if (G.rounds.length === 0) {
    if (confirm('아직 기록된 라운드가 없습니다. 종료할까요?')) showScreen('home');
    return;
  }
  if (confirm(G.rounds.length + '라운드까지의 기록을 저장하고 종료할까요?')) endGame();
}
function endGame() {
  G.finished = true;
  saveGame(G);
  document.getElementById('score-card').style.display = 'none';
  document.getElementById('end-btn').style.display = 'none';
  renderRankingRow();
  var sorted = sortedPlayers();
  var medals = ['🥇','🥈','🥉'];
  var html = '<div class="card" id="result-card"><div class="section-label" style="margin-bottom:12px">🏆 최종 결과</div>';
  sorted.forEach(function(p, i) {
    var t = G.totals[p.name];
    html += '<div class="rank-row"><div class="rank-num">' + (medals[i] || (i+1)+'위') + '</div>';
    html += avatarSm(p, 34);
    html += '<div class="rank-name">' + esc(p.name) + '</div>';
    html += '<div class="rank-score ' + scoreClass(t) + '">' + fmtScore(t) + '</div></div>';
  });
  html += '<div class="flex-row" style="margin-top:14px">';
  html += '<button class="btn btn-primary" data-scr="home" onclick="showScreen(this.dataset.scr)">홈으로</button>';
  html += '<button class="btn btn-secondary" onclick="goHistory()">이력 보기</button>';
  html += '</div></div>';
  document.getElementById('history-card').insertAdjacentHTML('afterend', html);
  renderRoundTable();
  document.getElementById('history-card').style.display = 'block';
}

// ── Round Table ────────────────────────────────────────────
function renderRoundTable() {
  if (G.rounds.length === 0) return;
  var tbl = document.getElementById('round-table');
  var th = '<thead><tr><th style="color:#64748b">R</th>';
  G.players.forEach(function(p) { th += '<th style="color:' + p.color + '">' + esc(p.name) + '</th>'; });
  th += '</tr></thead>';
  var tb = '<tbody>';
  G.rounds.forEach(function(r) {
    tb += '<tr><td style="color:#64748b;font-weight:700">' + r.round + '</td>';
    G.players.forEach(function(p) { var s = r.scores[p.name]; tb += '<td class="' + scoreClass(s) + '">' + fmtScore(s) + '</td>'; });
    tb += '</tr>';
  });
  tb += '<tr class="total-row"><td style="color:#94a3b8">합</td>';
  G.players.forEach(function(p) { var t = G.totals[p.name]; tb += '<td class="' + scoreClass(t) + '">' + fmtScore(t) + '</td>'; });
  tb += '</tr></tbody>';
  tbl.innerHTML = th + tb;
}

// ── History ────────────────────────────────────────────────
function saveComment(idx, value) {
  var list = loadHistory();
  var i = parseInt(idx);
  if (!list[i]) return;
  list[i].comment = value.trim();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  if (isAdminMode()) pushToCloud(list);
}
function saveGame(g) {
  var l = loadHistory();
  l.unshift(g);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(l));
  if (isAdminMode()) pushToCloud(l);
}
function loadHistory() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { return []; } }

// ── Map ────────────────────────────────────────────────────
function tileMatchCount(tileId, list) {
  var tile = MAP_TILES.find(function(t){ return t.id === tileId; });
  if (!tile) return 0;
  return list.filter(function(g) {
    var loc = (g.location || '').toLowerCase();
    return tile.keys.some(function(k){ return loc.includes(k.toLowerCase()); });
  }).length;
}
function renderHistoryMap() {
  var list = loadHistory();
  var html = '';
  MAP_TILES.forEach(function(t) {
    var cnt = tileMatchCount(t.id, list);
    var st = TILE_STYLE[t.type];
    var isActive = mapActiveTile === t.id;
    var isZero = cnt === 0;
    var borderColor = isActive ? 'var(--accent)' : st.border;
    var bgColor = isActive ? 'rgba(245,158,11,0.35)' : 'rgba(15,20,35,0.9)';
    var cls = 'map-tile' + (isActive ? ' map-tile-active' : '') + (isZero ? ' map-tile-zero' : '');
    html += '<div class="' + cls + '"'
      + ' style="grid-column:' + t.gc + ';grid-row:' + t.gr
      + ';border-color:' + borderColor + ';background:' + bgColor + '"'
      + ' data-tile="' + t.id + '" onclick="selectMapTile(this.dataset.tile)">';
    html += '<div class="map-tile-label">' + t.label + '</div>';
    if (cnt > 0) html += '<div class="map-tile-count">' + cnt + '게임</div>';
    html += '</div>';
  });
  document.getElementById('map-container').innerHTML = html;
  if (mapActiveTile) renderTileGameList(mapActiveTile, list);
}
function selectMapTile(tileId) {
  if (mapActiveTile === tileId) {
    mapActiveTile = null;
    document.getElementById('map-game-list').innerHTML = '';
    renderHistoryMap();
    return;
  }
  mapActiveTile = tileId;
  renderHistoryMap();
  var gl = document.getElementById('map-game-list');
  if (gl) setTimeout(function(){ gl.scrollIntoView({behavior:'smooth',block:'nearest'}); }, 80);
}
function renderTileGameList(tileId, list) {
  var tile = MAP_TILES.find(function(t){ return t.id === tileId; });
  if (!tile) return;
  if (!list) list = loadHistory();
  var filtered = [], fullIdxs = [];
  list.forEach(function(g, i) {
    var loc = (g.location || '').toLowerCase();
    if (tile.keys.some(function(k){ return loc.includes(k.toLowerCase()); })) {
      filtered.push(g); fullIdxs.push(i);
    }
  });
  var box = document.getElementById('map-game-list');
  if (filtered.length === 0) {
    box.innerHTML = '<div style="text-align:center;padding:28px;color:var(--sub);font-size:14px">'
      + tile.label + ' 지역 게임 기록 없음</div>';
    return;
  }
  box.innerHTML = '<div style="font-size:12px;font-weight:700;color:var(--sub);margin:4px 0 10px">'
    + tile.label + ' · ' + filtered.length + '게임</div>'
    + filtered.map(function(g, i) {
      var idx = fullIdxs[i];
      var sorted = g.players.slice().sort(function(a,b){ return g.totals[a.name]-g.totals[b.name]; });
      var w = sorted[0];
      return '<div class="history-item" data-idx="' + idx + '" onclick="showDetail(this.dataset.idx)">'
        + '<div class="history-date">' + fmtDate(g.date) + '</div>'
        + '<div class="history-title">📍 ' + esc(g.location) + '</div>'
        + '<div class="history-meta">' + g.rounds.length + '라운드 · ' + g.players.length + '명 · 🥇 '
        + esc(w.name) + ' (' + fmtScore(g.totals[w.name]) + ')</div>'
        + '</div>';
    }).join('');
}
function renderHistoryList() {
  var list = loadHistory();
  var box = document.getElementById('history-list');
  if (list.length === 0) {
    box.innerHTML = '<div class="empty-state"><div class="empty-icon">🃏</div><div>저장된 게임이 없습니다</div></div>';
    return;
  }
  box.innerHTML = list.map(function(g, idx) {
    var sorted = g.players.slice().sort(function(a,b){ return g.totals[a.name]-g.totals[b.name]; });
    var w = sorted[0];
    return '<div class="history-item" data-idx="' + idx + '" onclick="showDetail(this.dataset.idx)">'
      + '<div class="history-item-hdr">'
      + '<span class="history-date">' + fmtDate(g.date) + '</span>'
      + '<button class="history-menu-btn" data-idx="' + idx + '" onclick="toggleHistoryMenu(this.dataset.idx,event)">···</button>'
      + '</div>'
      + '<div id="hmenu-' + idx + '" class="history-menu-drop" style="display:none">'
      + '<button data-idx="' + idx + '" onclick="deleteGame(this.dataset.idx,event)">🗑 삭제</button>'
      + '</div>'
      + '<div class="history-title">📍 ' + esc(g.location) + '</div>'
      + '<div class="history-meta">' + g.rounds.length + '라운드 · ' + g.players.length + '명 · 🥇 ' + esc(w.name) + ' (' + fmtScore(g.totals[w.name]) + ')</div>'
      + '<input class="game-comment-input" type="text" maxlength="60" placeholder="✏️ 한 줄 게임평..." value="' + esc(g.comment || '') + '" data-idx="' + idx + '" onclick="event.stopPropagation()" onkeydown="if(event.key===\'Enter\'){this.blur()}" onblur="saveComment(this.dataset.idx,this.value)">'
      + '</div>';
  }).join('');
}

function toggleHistoryMenu(idx, e) {
  e.stopPropagation();
  var id = 'hmenu-' + idx;
  if (openHistoryMenu && openHistoryMenu !== id) {
    var prev = document.getElementById(openHistoryMenu);
    if (prev) prev.style.display = 'none';
  }
  var drop = document.getElementById(id);
  if (!drop) return;
  var isOpen = drop.style.display !== 'none';
  drop.style.display = isOpen ? 'none' : 'block';
  openHistoryMenu = isOpen ? null : id;
}

function deleteGame(idx, e) {
  e.stopPropagation();
  if (!confirm('이 게임 기록을 삭제할까요?')) return;
  var list = loadHistory();
  list.splice(parseInt(idx), 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  openHistoryMenu = null;
  if (isAdminMode()) pushToCloud(list);
  renderHistoryList();
}
function showDetail(idx) {
  var g = loadHistory()[parseInt(idx)]; if (!g) return;
  var sorted = g.players.slice().sort(function(a,b){ return g.totals[a.name]-g.totals[b.name]; });
  var medals = ['🥇','🥈','🥉'];
  function avD(p) {
    var h = '<div class="avatar-sm" style="width:28px;height:28px">';
    h += '<div class="av-bg" style="background:' + (p.color||'#64748b') + '"></div>';
    h += '<span class="av-initial"' + (p.image?' style="display:none"':'') + '>' + esc((p.name||'').slice(0,1)) + '</span>';
    if (p.image) h += '<img class="av-img" src="' + p.image + '" alt="" style="object-fit:contain">';
    h += '</div>';
    return h;
  }
  var html = '<div class="card"><div class="section-label" style="margin-bottom:10px">게임 정보</div>'
    + '<div style="font-size:15px;margin-bottom:6px">📅 ' + fmtDate(g.date) + '</div>'
    + '<div style="font-size:15px">📍 ' + esc(g.location) + '</div>'
    + (g.comment ? '<div style="font-size:13px;color:var(--sub);margin-top:8px">💬 ' + esc(g.comment) + '</div>' : '')
    + '</div>'
    + '<div class="card"><div class="section-label" style="margin-bottom:12px">🏆 최종 순위</div>';
  sorted.forEach(function(p,i){
    var t = g.totals[p.name];
    html += '<div class="rank-row"><div class="rank-num">' + (medals[i]||(i+1)+'위') + '</div>'
      + avD(p) + '<div class="rank-name">' + esc(p.name) + '</div>'
      + '<div class="rank-score ' + scoreClass(t) + '">' + fmtScore(t) + '</div></div>';
  });
  html += '</div>';
  if (g.rounds.length > 0) {
    html += '<div class="card"><div class="section-label" style="margin-bottom:10px">라운드별 기록</div><div style="overflow-x:auto"><table class="round-table"><thead><tr><th style="color:#64748b">R</th>';
    g.players.forEach(function(p){ html += '<th style="color:' + p.color + '">' + esc(p.name) + '</th>'; });
    html += '</tr></thead><tbody>';
    g.rounds.forEach(function(r){
      html += '<tr><td style="color:#64748b;font-weight:700">' + r.round + '</td>';
      g.players.forEach(function(p){ var s=r.scores[p.name]; html+='<td class="'+scoreClass(s)+'">'+fmtScore(s)+'</td>'; });
      html += '</tr>';
    });
    html += '<tr class="total-row"><td style="color:#94a3b8">합</td>';
    g.players.forEach(function(p){ var t=g.totals[p.name]; html+='<td class="'+scoreClass(t)+'">'+fmtScore(t)+'</td>'; });
    html += '</tr></tbody></table></div></div>';
  }
  document.getElementById('detail-content').innerHTML = html;
  showScreen('detail');
}

// ── Shared Avatar Helper ───────────────────────────────────
function avatarSm(p, sz) {
  var s = sz || 34;
  var h = '<div class="avatar-sm" style="width:' + s + 'px;height:' + s + 'px">';
  h += '<div class="av-bg" style="background:' + p.color + '"></div>';
  h += '<span class="av-initial"' + (p.image ? ' style="display:none"' : '') + '>' + esc((p.name||'').slice(0,1)) + '</span>';
  if (p.image) h += '<img class="av-img" src="' + p.image + '" alt="" style="object-fit:contain">';
  h += '</div>';
  return h;
}

// ── Utils ─────────────────────────────────────────────────
function fmtScore(n) { return n > 0 ? '+' + n : String(n); }
function scoreClass(n) { return n > 0 ? 's-pos' : n < 0 ? 's-neg' : 's-zero'; }
function fmtDate(s) {
  if (!s) return '';
  var d = new Date(s + 'T00:00:00');
  return d.getFullYear() + '.' + pad(d.getMonth()+1) + '.' + pad(d.getDate());
}
function pad(n) { return String(n).padStart(2, '0'); }
function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Boot ──────────────────────────────────────────────────
if (!localStorage.getItem(PLAYERS_KEY)) {
  storePlayers(DEFAULT_PLAYERS.map(function(p){ return Object.assign({}, p); }));
}
loadOpacity();
syncFromCloud();
updateAdminBtn();
document.addEventListener('click', function() {
  if (openHistoryMenu) {
    var el = document.getElementById(openHistoryMenu);
    if (el) el.style.display = 'none';
    openHistoryMenu = null;
  }
});
