/* ===================================================
   그린 매치 — 전체 화면 통합 JavaScript
   index.js
   =================================================== */

(function () {
  'use strict';

  /* ==============================
     화면 전환 관리
  ============================== */
  var screens = {
    home:     document.getElementById('screen-home'),
    seat:     document.getElementById('screen-seat'),
    team:     document.getElementById('screen-team'),
    camera:   document.getElementById('screen-camera'),
    result:   document.getElementById('screen-result'),
    complete: document.getElementById('screen-complete'),
  };

  /**
   * 지정한 화면을 보여주고 나머지를 숨김
   * @param {'home'|'seat'|'team'|'camera'} screenKey
   */
  function showScreen(screenKey) {
    Object.keys(screens).forEach(function (key) {
      if (screens[key]) {
        screens[key].classList.remove('active');
      }
    });
    if (screens[screenKey]) {
      screens[screenKey].classList.add('active');
    }
  }

  /* ==============================
     홈 화면 진입 애니메이션
  ============================== */
  function initHomeAnimation() {
    var elements = [
      document.querySelector('.home-header'),
      document.querySelector('.catchphrase'),
      document.querySelector('.main-title'),
      document.querySelector('.title-en'),
      document.querySelector('.subtitle'),
      document.querySelector('.teams-section'),
      document.querySelector('.btn-wrapper'),
      document.querySelector('.guide-text'),
    ];

    elements.forEach(function (el, index) {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

      setTimeout(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 100 + index * 80);
    });
  }

  /* ==============================
     홈 — 화면 아무 곳이나 터치하면 시작
  ============================== */
  var homeScreen = document.getElementById('screen-home');
  if (homeScreen) {
    homeScreen.addEventListener('click', function (e) {
      // 왼쪽 위 로고(처음 화면으로)를 누른 경우는 제외
      if (e.target.closest('.header-logo')) return;
      if (!homeScreen.classList.contains('active')) return;
      showScreen('seat');
      initSeat();
    });
  }

  /* ==============================
     좌석번호 입력 화면
  ============================== */
  var seatData = { zone: '', row: '', num: '' };
  var seatText = '— 구역 — 열 — 번';   // 완료 화면에 표시할 좌석번호
  var activeField = 'zone';
  var fieldOrder = ['zone', 'row', 'num'];

  function initSeat() {
    seatData = { zone: '', row: '', num: '' };
    activeField = 'zone';
    updateSeatDisplay();
    focusField('zone');
  }

  function updateSeatDisplay() {
    fieldOrder.forEach(function (field) {
      var valEl    = document.getElementById('val-' + field);
      var cursorEl = document.getElementById('cursor-' + field);
      var boxEl    = document.getElementById('field-' + field);
      if (valEl)    valEl.textContent = seatData[field];
      if (cursorEl) cursorEl.style.display = (field === activeField) ? 'inline-block' : 'none';
      if (boxEl) {
        if (field === activeField) {
          boxEl.classList.add('focused');
        } else {
          boxEl.classList.remove('focused');
        }
      }
    });
  }

  function focusField(field) {
    activeField = field;
    updateSeatDisplay();
  }

  // 필드 클릭 시 포커스 이동
  fieldOrder.forEach(function (field) {
    var boxEl = document.getElementById('field-' + field);
    if (boxEl) {
      boxEl.addEventListener('click', function () { focusField(field); });
    }
  });

  // 숫자 패드 클릭
  var keypad = document.querySelector('.keypad');
  if (keypad) {
    keypad.addEventListener('click', function (e) {
      var btn = e.target.closest('.key-btn');
      if (!btn) return;
      var key = btn.dataset.key;

      if (key === 'del') {
        seatData[activeField] = seatData[activeField].slice(0, -1);
        updateSeatDisplay();
      } else if (key === 'confirm') {
        handleSeatConfirm();
      } else {
        if (seatData[activeField].length < 3) {
          seatData[activeField] += key;
          updateSeatDisplay();

          // 자동으로 다음 필드로 이동
          var idx = fieldOrder.indexOf(activeField);
          if (seatData[activeField].length >= 3 && idx < fieldOrder.length - 1) {
            focusField(fieldOrder[idx + 1]);
          }
        }
      }
    });
  }

  function handleSeatConfirm() {
    var zone = seatData.zone.trim();
    var row  = seatData.row.trim();
    var num  = seatData.num.trim();

    if (!zone || !row || !num) {
      // 빈 필드 강조
      fieldOrder.forEach(function (field) {
        if (!seatData[field]) {
          var boxEl = document.getElementById('field-' + field);
          if (boxEl) {
            boxEl.style.borderColor = '#e53935';
            setTimeout(function () {
              boxEl.style.borderColor = '';
            }, 800);
          }
        }
      });
      return;
    }

    // 팀 선택 화면으로 이동
    seatText = zone + '구역 ' + row + '열 ' + num + '번';
    var badge = document.getElementById('seat-info-badge');
    if (badge) badge.textContent = seatText;

    showScreen('team');
    animateTeamEntrance();
  }

  /* ==============================
     팀 선택 화면
  ============================== */
  function animateTeamEntrance() {
    var elements = [
      document.querySelector('.seat-info-badge'),
      document.querySelector('.team-sel-title'),
      document.querySelector('.ts-cards'),
    ];

    elements.forEach(function (el, index) {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

      setTimeout(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 80 + index * 100);
    });
  }

  /** 좌석 확인 후 팀 선택 화면으로 이동 */
  function showSeatResult(zone, row, num) {
    seatText = zone + '구역 ' + row + '열 ' + num + '번';
    var badge = document.getElementById('seat-info-badge');
    if (badge) badge.textContent = seatText;
    showScreen('team');
    animateTeamEntrance();
  }

  // 팀 정보 (선택한 팀에 점수를 적립하기 위해 사용)
  var TEAMS = {
    'ts-hanwha': { name: '한화 이글스',   logo: 'images/hanwha_eagles.png', en: 'HANWHA EAGLES', cls: 'team-hanwha', mascot: 'images/hanwha_eagles_suri.png', trash: 'images/hanwha_suri_trash.png' },
    'ts-lotte':  { name: '롯데 자이언츠', logo: 'images/lotte_giants.png',  en: 'LOTTE GIANTS',  cls: 'team-lotte',  mascot: 'images/lotte_giants_nuri.png',  trash: 'images/lotte_nuri_trash.png'  },
  };
  var selectedTeam = TEAMS['ts-hanwha'];

  // 팀 카드 클릭 → 촬영 화면으로
  ['ts-hanwha', 'ts-lotte'].forEach(function (id) {
    var card = document.getElementById(id);
    if (card) {
      card.addEventListener('click', function () {
        // 선택한 팀 저장
        selectedTeam = TEAMS[id];
        // 팀 버튼 선택 효과 + 선택 팀 저장
        var teamBtn = card.querySelector('.team-btn');
        if (teamBtn) {
          teamBtn.classList.remove('selected');
          void teamBtn.offsetWidth;
          teamBtn.classList.add('selected');
          try { localStorage.setItem('selectedTeam', teamBtn.dataset.team); } catch (e) {}
        }
        // 클릭 효과
        card.style.transform = 'scale(0.97)';
        setTimeout(function () {
          card.style.transform = '';
          // 이전 참여에서 '다음으로'(비활성) 상태로 남은 촬영 화면을 초기화
          resetCamera();
          showScreen('camera');
          initCamera();
        }, 150);
      });
    }
  });

  /* ==============================
     촬영(AI 인식) 화면
  ============================== */
  var camStream = null;
  var camTimer = null;

  function initCamera() {
    // 카메라 접근 시도
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(function (stream) {
          camStream = stream;
          var video = document.getElementById('cam-video');
          var placeholder = document.getElementById('cam-placeholder');
          if (video) {
            video.srcObject = stream;
            video.classList.add('active');
          }
          if (placeholder) placeholder.style.display = 'none';
        })
        .catch(function () {
          // 카메라 없으면 안내 텍스트 유지
        });
    }

    // 인식 상태 초기화: 촬영완료(done), 재질판별중(active), 안내준비(pending)
    setCamStatus(1);

    // 촬영하기 버튼 없이 자동으로 인식 시작
    scheduleRecognition();
  }

  /** 촬영 화면 진입 후 잠시 뒤 자동으로 인식 시작 */
  function scheduleRecognition() {
    if (camTimer) clearTimeout(camTimer);
    camTimer = setTimeout(startRecognition, 2500);
  }

  /**
   * 촬영 상태 업데이트
   * @param {number} activeIdx - 1, 2, 3
   */
  function setCamStatus(activeIdx) {
    for (var i = 1; i <= 3; i++) {
      var item = document.getElementById('cstatus-' + i);
      var dot  = document.getElementById('cdot-' + i);
      if (!item || !dot) continue;

      // 클래스 초기화
      item.classList.remove('cam-status-pending');
      dot.className = 'cam-dot';

      if (i < activeIdx) {
        // 완료
        dot.classList.add('cam-dot-done');
      } else if (i === activeIdx) {
        // 진행 중
        dot.classList.add('cam-dot-active');
      } else {
        // 대기
        item.classList.add('cam-status-pending');
        dot.classList.add('cam-dot-empty');
      }
    }
  }

  /** AI 인식 진행 → 완료 후 결과 화면으로 자동 이동 */
  function startRecognition() {
    // 단계 1 → 재질 판별 중
    setCamStatus(2);

    camTimer = setTimeout(function () {
      // 단계 2 → 안내 준비
      setCamStatus(3);

      // AI 배지 텍스트 변경
      var badge = document.getElementById('cam-ai-badge');
      if (badge) {
        var dot = badge.querySelector('.cam-ai-dot');
        var textNode = badge.lastChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          textNode.textContent = ' 인식 완료!';
        }
        if (dot) dot.style.background = '#43a047';
      }

      // 스캔 라인 정지
      var scanline = document.getElementById('cam-scanline');
      if (scanline) {
        scanline.style.animationPlayState = 'paused';
        scanline.style.opacity = '0';
      }

      // 인식 완료 후 자동으로 결과 화면으로 이동
      camTimer = setTimeout(function () {
        camTimer = null;
        showScreen('result');
        initResult();
      }, 800);

    }, 1600);
  }

  /* ==============================
     분리배출 안내 (결과) 화면
  ============================== */
  // 1920x1080 안내 스테이지를 화면 크기에 맞춰 비율 유지하며 확대/축소
  var GUIDE_W = 1920, GUIDE_H = 1080;
  function fitGuideStage() {
    var st = document.getElementById('g-stage');
    if (!st) return;
    var sc = Math.min(window.innerWidth / GUIDE_W, window.innerHeight / GUIDE_H);
    st.style.transform = 'translate(' + (-GUIDE_W * sc / 2) + 'px, ' + (-GUIDE_H * sc / 2) + 'px) scale(' + sc + ')';
  }
  window.addEventListener('resize', fitGuideStage);
  fitGuideStage();

  /* 분리배출 안내 데이터 — 쓰레기 종류별 제목·3단계 안내·일러스트·투입구 */
  var GUIDES = {
    general: {
      name: "일반 쓰레기",
      steps: [
        { t: "재활용 표시 확인하기", s: "재활용 표시가 없는 쓰레기만 버려 주세요",
          svg: "<path d=\"M40 58 L50 54 L58 58 L66 54 L74 58 L74 128 L66 124 L58 128 L50 124 L40 128 Z\" fill=\"#f3d9a8\" stroke=\"#1c2a3a\" stroke-width=\"3.6\" stroke-linejoin=\"round\"/><path d=\"M48 80 H66 M48 92 H62\" stroke=\"#1c2a3a\" stroke-width=\"3\" stroke-linecap=\"round\"/><circle cx=\"104\" cy=\"88\" r=\"24\" fill=\"#fff\" fill-opacity=\".85\" stroke=\"#1c2a3a\" stroke-width=\"4\"/><path d=\"M121 105 L138 122\" stroke=\"#1c2a3a\" stroke-width=\"7\" stroke-linecap=\"round\"/><path d=\"M94 88 L101 95 L114 80\" stroke=\"#2fa24b\" stroke-width=\"4.5\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>" },
        { t: "내용물 비우기", s: "남은 음식과 음료는 먼저 비워 주세요",
          svg: "<g transform=\"rotate(38 88 84)\"><path d=\"M60 46 L116 46 L107 116 Q106 122 100 122 L76 122 Q70 122 69 116 Z\" fill=\"#fff\" stroke=\"#1c2a3a\" stroke-width=\"3.8\" stroke-linejoin=\"round\"/><path d=\"M63 70 L113 70\" stroke=\"#2fa24b\" stroke-width=\"5\" stroke-linecap=\"butt\"/><path d=\"M56 46 L120 46\" stroke=\"#1c2a3a\" stroke-width=\"4.5\" stroke-linecap=\"round\"/></g><path d=\"M52 112 q-5 8 0 11 q5 -3 0 -11z\" fill=\"#c9985a\"/><path d=\"M64 126 q-4.5 7 0 10 q4.5 -3 0 -10z\" fill=\"#c9985a\"/><path d=\"M56 96 q-3.5 6 0 8 q3.5 -2 0 -8z\" fill=\"#d9ad72\"/>" },
        { t: "작게 뭉쳐 넣기", s: "오른쪽 <b>일반 투입구</b>에 넣어요",
          svg: "<path d=\"M66 34 Q64 22 76 20 Q84 14 92 21 Q102 22 100 33 Q104 44 93 48 Q84 54 75 48 Q64 46 66 34 Z\" fill=\"#fff\" stroke=\"#1c2a3a\" stroke-width=\"3.5\" stroke-linejoin=\"round\"/><path d=\"M74 30 L82 36 L90 28 M78 42 L86 38\" stroke=\"#1c2a3a\" stroke-width=\"2.2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M96 54 Q104 66 90 78\" stroke=\"#2f9c4c\" stroke-width=\"3.5\" fill=\"none\" stroke-dasharray=\"5 6\" stroke-linecap=\"round\"/><path d=\"M79 78 L86 86 L93 78\" stroke=\"#2f9c4c\" stroke-width=\"4.5\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><rect x=\"47\" y=\"94\" width=\"78\" height=\"12\" rx=\"3\" fill=\"#2f9c4c\" stroke=\"#1f3a28\" stroke-width=\"3.5\"/><path d=\"M51 104 L121 104 L117 152 Q116 156 112 156 L60 156 Q56 156 55 152 Z\" fill=\"#2f9c4c\" stroke=\"#1f3a28\" stroke-width=\"3.5\" stroke-linejoin=\"round\"/><path d=\"M86 140 L86 118 M78 126 L86 118 L94 126\" stroke=\"#fff\" stroke-width=\"4\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M79 148 L93 148\" stroke=\"#fff\" stroke-width=\"3.5\" stroke-linecap=\"round\"/>" }
      ]
    },
    paper: {
      name: "종이",
      steps: [
        { t: "음식물 깨끗이 비우기", s: "남은 음식과 음료를 깨끗이 비워 주세요",
          svg: "<g transform=\"rotate(38 88 84)\"><path d=\"M60 46 L116 46 L107 116 Q106 122 100 122 L76 122 Q70 122 69 116 Z\" fill=\"#fff\" stroke=\"#1c2a3a\" stroke-width=\"3.8\" stroke-linejoin=\"round\"/><path d=\"M63 70 L113 70\" stroke=\"#2fa24b\" stroke-width=\"5\" stroke-linecap=\"butt\"/><path d=\"M56 46 L120 46\" stroke=\"#1c2a3a\" stroke-width=\"4.5\" stroke-linecap=\"round\"/></g><path d=\"M52 112 q-5 8 0 11 q5 -3 0 -11z\" fill=\"#c9985a\"/><path d=\"M64 126 q-4.5 7 0 10 q4.5 -3 0 -10z\" fill=\"#c9985a\"/><path d=\"M56 96 q-3.5 6 0 8 q3.5 -2 0 -8z\" fill=\"#d9ad72\"/>" },
        { t: "비닐·테이프 떼어 내기", s: "코팅 비닐과 테이프는 떼어 내 주세요",
          svg: "<path d=\"M44 88 L54 72 L126 72 L136 88 Z\" fill=\"#f3d9a8\" stroke=\"#1c2a3a\" stroke-width=\"3.8\" stroke-linejoin=\"round\"/><rect x=\"44\" y=\"88\" width=\"92\" height=\"58\" rx=\"4\" fill=\"#f3d9a8\" stroke=\"#1c2a3a\" stroke-width=\"3.8\"/><path d=\"M96 88 C96 70 100 60 122 54\" stroke=\"#8ec5ee\" stroke-width=\"14\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M126 44 L138 38 M132 56 L146 56\" stroke=\"#2fa24b\" stroke-width=\"3.5\" stroke-linecap=\"round\"/>" },
        { t: "납작하게 접어 넣기", s: "오른쪽 <b>종이 투입구</b>에 넣어요",
          svg: "<g transform=\"rotate(-18 80 36)\"><rect x=\"57\" y=\"22\" width=\"46\" height=\"28\" rx=\"3\" fill=\"#f3d9a8\" stroke=\"#1c2a3a\" stroke-width=\"3.5\"/><path d=\"M63 36 H97\" stroke=\"#1c2a3a\" stroke-width=\"2.5\" stroke-dasharray=\"4 3\" stroke-linecap=\"round\"/></g><path d=\"M96 54 Q104 66 90 78\" stroke=\"#2f9c4c\" stroke-width=\"3.5\" fill=\"none\" stroke-dasharray=\"5 6\" stroke-linecap=\"round\"/><path d=\"M79 78 L86 86 L93 78\" stroke=\"#2f9c4c\" stroke-width=\"4.5\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><rect x=\"47\" y=\"94\" width=\"78\" height=\"12\" rx=\"3\" fill=\"#2f9c4c\" stroke=\"#1f3a28\" stroke-width=\"3.5\"/><path d=\"M51 104 L121 104 L117 152 Q116 156 112 156 L60 156 Q56 156 55 152 Z\" fill=\"#2f9c4c\" stroke=\"#1f3a28\" stroke-width=\"3.5\" stroke-linejoin=\"round\"/><path d=\"M86 140 L86 118 M78 126 L86 118 L94 126\" stroke=\"#fff\" stroke-width=\"4\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M79 148 L93 148\" stroke=\"#fff\" stroke-width=\"3.5\" stroke-linecap=\"round\"/>" }
      ]
    },
    can: {
      name: "캔",
      steps: [
        { t: "남은 음료 비우기", s: "캔 안의 음료를 깨끗이 비워 주세요",
          svg: "<g transform=\"rotate(38 88 84)\"><rect x=\"66\" y=\"44\" width=\"44\" height=\"76\" rx=\"8\" fill=\"#cfd8e0\" stroke=\"#1c2a3a\" stroke-width=\"3.8\"/><path d=\"M70 44 L106 44\" stroke=\"#1c2a3a\" stroke-width=\"4.5\" stroke-linecap=\"round\"/><path d=\"M66 70 H110 M66 96 H110\" stroke=\"#2fa24b\" stroke-width=\"4\"/></g><path d=\"M52 112 q-5 8 0 11 q5 -3 0 -11z\" fill=\"#c9985a\"/><path d=\"M64 126 q-4.5 7 0 10 q4.5 -3 0 -10z\" fill=\"#c9985a\"/><path d=\"M56 96 q-3.5 6 0 8 q3.5 -2 0 -8z\" fill=\"#d9ad72\"/>" },
        { t: "물로 헹구기", s: "가볍게 물로 헹궈 주세요",
          svg: "<path d=\"M40 44 H86 Q98 44 98 56 V62\" stroke=\"#1c2a3a\" stroke-width=\"10\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><rect x=\"56\" y=\"34\" width=\"10\" height=\"10\" rx=\"2\" fill=\"#1c2a3a\"/><path d=\"M98 72 V86 M92 76 V90 M104 76 V90\" stroke=\"#8ec5ee\" stroke-width=\"4\" stroke-linecap=\"round\"/><rect x=\"78\" y=\"96\" width=\"40\" height=\"56\" rx=\"7\" fill=\"#cfd8e0\" stroke=\"#1c2a3a\" stroke-width=\"3.8\"/><path d=\"M78 116 H118 M78 134 H118\" stroke=\"#2fa24b\" stroke-width=\"3.5\"/>" },
        { t: "납작하게 눌러 넣기", s: "오른쪽 <b>캔 투입구</b>에 넣어요",
          svg: "<g transform=\"rotate(-18 82 36)\"><path d=\"M64 22 L100 22 L97 30 L101 36 L97 42 L100 50 L64 50 L67 42 L63 36 L67 30 Z\" fill=\"#cfd8e0\" stroke=\"#1c2a3a\" stroke-width=\"3.5\" stroke-linejoin=\"round\"/><path d=\"M70 36 H94\" stroke=\"#2fa24b\" stroke-width=\"4\" stroke-linecap=\"round\"/></g><path d=\"M96 54 Q104 66 90 78\" stroke=\"#2f9c4c\" stroke-width=\"3.5\" fill=\"none\" stroke-dasharray=\"5 6\" stroke-linecap=\"round\"/><path d=\"M79 78 L86 86 L93 78\" stroke=\"#2f9c4c\" stroke-width=\"4.5\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><rect x=\"47\" y=\"94\" width=\"78\" height=\"12\" rx=\"3\" fill=\"#2f9c4c\" stroke=\"#1f3a28\" stroke-width=\"3.5\"/><path d=\"M51 104 L121 104 L117 152 Q116 156 112 156 L60 156 Q56 156 55 152 Z\" fill=\"#2f9c4c\" stroke=\"#1f3a28\" stroke-width=\"3.5\" stroke-linejoin=\"round\"/><path d=\"M86 140 L86 118 M78 126 L86 118 L94 126\" stroke=\"#fff\" stroke-width=\"4\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M79 148 L93 148\" stroke=\"#fff\" stroke-width=\"3.5\" stroke-linecap=\"round\"/>" }
      ]
    },
    plastic: {
      name: "플라스틱",
      steps: [
        { t: "내용물 비우고 헹구기", s: "남은 음료를 비우고 물로 헹궈 주세요",
          svg: "<g transform=\"rotate(48 88 84)\"><rect x=\"80\" y=\"30\" width=\"16\" height=\"10\" rx=\"2\" fill=\"#8ec5ee\" stroke=\"#1c2a3a\" stroke-width=\"3.4\"/><path d=\"M78 40 L98 40 L104 56 L104 126 Q104 132 98 132 L78 132 Q72 132 72 126 L72 56 Z\" fill=\"#e6f3fc\" stroke=\"#1c2a3a\" stroke-width=\"3.8\" stroke-linejoin=\"round\"/><path d=\"M72 84 H104\" stroke=\"#2fa24b\" stroke-width=\"4\"/></g><path d=\"M52 112 q-5 8 0 11 q5 -3 0 -11z\" fill=\"#8ec5ee\"/><path d=\"M64 126 q-4.5 7 0 10 q4.5 -3 0 -10z\" fill=\"#8ec5ee\"/><path d=\"M56 96 q-3.5 6 0 8 q3.5 -2 0 -8z\" fill=\"#b5dbf5\"/>" },
        { t: "라벨 떼어 내기", s: "비닐 라벨은 떼어 내 주세요",
          svg: "<rect x=\"68\" y=\"26\" width=\"18\" height=\"12\" rx=\"2\" fill=\"#8ec5ee\" stroke=\"#1c2a3a\" stroke-width=\"3.4\"/><path d=\"M66 38 L88 38 L95 56 L95 140 Q95 147 88 147 L66 147 Q59 147 59 140 L59 56 Z\" fill=\"#e6f3fc\" stroke=\"#1c2a3a\" stroke-width=\"3.8\" stroke-linejoin=\"round\"/><path d=\"M59 84 L95 84 L95 108 L59 108 Z\" fill=\"#2fa24b\" fill-opacity=\".9\"/><path d=\"M95 96 C108 92 116 84 124 70\" stroke=\"#2fa24b\" stroke-width=\"16\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M128 56 L140 50 M134 68 L148 68\" stroke=\"#2fa24b\" stroke-width=\"3.5\" stroke-linecap=\"round\"/>" },
        { t: "찌그러뜨려 넣기", s: "오른쪽 <b>플라스틱 투입구</b>에 넣어요",
          svg: "<g transform=\"rotate(-70 82 36)\"><rect x=\"76\" y=\"10\" width=\"12\" height=\"7\" rx=\"2\" fill=\"#8ec5ee\" stroke=\"#1c2a3a\" stroke-width=\"3\"/><path d=\"M75 17 L89 17 L93 26 L89 34 L93 42 L90 58 Q89 61 86 61 L78 61 Q75 61 74 58 L71 42 L75 34 L71 26 Z\" fill=\"#e6f3fc\" stroke=\"#1c2a3a\" stroke-width=\"3.5\" stroke-linejoin=\"round\"/></g><path d=\"M96 54 Q104 66 90 78\" stroke=\"#2f9c4c\" stroke-width=\"3.5\" fill=\"none\" stroke-dasharray=\"5 6\" stroke-linecap=\"round\"/><path d=\"M79 78 L86 86 L93 78\" stroke=\"#2f9c4c\" stroke-width=\"4.5\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><rect x=\"47\" y=\"94\" width=\"78\" height=\"12\" rx=\"3\" fill=\"#2f9c4c\" stroke=\"#1f3a28\" stroke-width=\"3.5\"/><path d=\"M51 104 L121 104 L117 152 Q116 156 112 156 L60 156 Q56 156 55 152 Z\" fill=\"#2f9c4c\" stroke=\"#1f3a28\" stroke-width=\"3.5\" stroke-linejoin=\"round\"/><path d=\"M86 140 L86 118 M78 126 L86 118 L94 126\" stroke=\"#fff\" stroke-width=\"4\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M79 148 L93 148\" stroke=\"#fff\" stroke-width=\"3.5\" stroke-linecap=\"round\"/>" }
      ]
    }
  };

  var GUIDE_TYPES = ['general', 'paper', 'can', 'plastic'];   // 음식물 안내 화면은 없음 (음식물 투입구는 그대로 표시)

  // 쓰레기통 배치 값 (1920×1080 스테이지 기준)
  var BINS_W = 746, BIN_W = 108, BIN_ACTIVE_W = 156, BIN_GAP = 10, BINS_LEFT = 1055;

  /**
   * 인식 결과(쓰레기 종류)에 맞는 분리배출 안내 화면을 그림
   * @param {'general'|'paper'|'can'|'plastic'} type
   */
  function renderGuide(type) {
    var g = GUIDES[type];
    if (!g) return;

    // 제목
    var title = document.querySelector('#screen-result .g-title');
    if (title) title.innerHTML = '<em>' + g.name + '</em> 이렇게 버려 주세요';

    // 3단계 카드
    ['.g-c1', '.g-c2', '.g-c3'].forEach(function (sel, i) {
      var card = document.querySelector('#screen-result ' + sel);
      if (!card) return;
      var step = g.steps[i];
      card.querySelector('.g-ill').innerHTML = '<svg viewBox="0 0 172 172" aria-hidden="true">' + step.svg + '</svg>';
      card.querySelector('.g-t').textContent = step.t;
      card.querySelector('.g-s').innerHTML = step.s;
    });

    // 해당 투입구 강조 + 쓰레기통 가로 배치 (가운데 정렬)
    var bins = document.querySelectorAll('#screen-result .g-bin');
    var total = 0;
    Array.prototype.forEach.call(bins, function (bin) {
      total += (bin.dataset.bin === type ? BIN_ACTIVE_W : BIN_W);
    });
    total += BIN_GAP * (bins.length - 1);
    var x = (BINS_W - total) / 2;
    var activeCenter = null;
    Array.prototype.forEach.call(bins, function (bin) {
      var isActive = bin.dataset.bin === type;
      var w = isActive ? BIN_ACTIVE_W : BIN_W;
      bin.classList.toggle('g-active', isActive);
      bin.style.left = x + 'px';
      if (isActive) activeCenter = BINS_LEFT + x + w / 2;
      x += w + BIN_GAP;
    });

    // "여기에 넣어요!" 말풍선과 화살표를 강조된 투입구 위로
    if (activeCenter !== null) {
      var tip = document.querySelector('#screen-result .g-tip');
      var arrow = document.querySelector('#screen-result .g-tip-arrow');
      if (tip) tip.style.left = (activeCenter - 102.5) + 'px';
      if (arrow) arrow.style.left = (activeCenter - 17) + 'px';
    }
  }

  /**
   * 안내할 쓰레기 종류 결정
   * — 인식 시스템을 만들기 전까지는 무작위로 선택
   * — 인식 시스템 연동 후에는 recognizedType에 인식 결과('general'|'paper'|'can'|'plastic')를 넣으면 그 안내가 표시됨
   */
  var recognizedType = null;
  function pickGuideType() {
    if (recognizedType && GUIDES[recognizedType]) return recognizedType;
    return GUIDE_TYPES[Math.floor(Math.random() * GUIDE_TYPES.length)];
  }

  // 인식 시스템 연동용: 외부에서 인식 결과를 넘겨 안내 화면을 바로 바꿀 수 있음
  window.showRecycleGuide = function (type) {
    recognizedType = type;
    renderGuide(type);
  };

  function initResult() {
    fitGuideStage();
    renderGuide(pickGuideType());
    // 진입 효과 (위치는 그대로, 순서대로 나타남)
    var els = [
      document.querySelector('.g-title'),
      document.querySelector('.g-c1'),
      document.querySelector('.g-c2'),
      document.querySelector('.g-c3'),
      document.querySelector('.g-panel'),
      document.querySelector('.g-tip'),
      document.querySelector('.g-tip-arrow'),
      document.querySelector('.g-bins'),
    ];
    els.forEach(function (el, i) {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.5s ease';
      setTimeout(function () {
        el.style.opacity = '1';
      }, 60 + i * 90);
    });
  }

  // 분리배출 했어요 버튼 → 완료 화면으로
  var resultDoneBtn = document.getElementById('result-done-btn');
  if (resultDoneBtn) {
    resultDoneBtn.addEventListener('click', function () {
      resultDoneBtn.style.transform = 'scale(0.96)';
      setTimeout(function () {
        resultDoneBtn.style.transform = '';
        showScreen('complete');
        initComplete();
      }, 150);
    });
  }

  /**
   * 촬영 화면을 처음 상태로 되돌림 (다시 인식하기)
   */
  function resetCamera() {
    if (camTimer) { clearTimeout(camTimer); camTimer = null; }
    setCamStatus(1);

    var badge = document.getElementById('cam-ai-badge');
    if (badge) {
      var dot = badge.querySelector('.cam-ai-dot');
      var textNode = badge.lastChild;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        textNode.textContent = ' AI가 쓰레기를 인식하고 있어요…';
      }
      if (dot) dot.style.background = '';
    }

    var scanline = document.getElementById('cam-scanline');
    if (scanline) {
      scanline.style.animationPlayState = '';
      scanline.style.opacity = '';
    }
  }

  // 다시 인식하기 버튼 → 촬영 화면으로
  var resultRetryBtn = document.getElementById('result-retry-btn');
  if (resultRetryBtn) {
    resultRetryBtn.addEventListener('click', function () {
      resetCamera();
      showScreen('camera');
      if (!camStream) initCamera();
      else scheduleRecognition();
    });
  }

  /* ==============================
     완료 화면 (screen-complete)
  ============================== */
  function initComplete() {
    // 입력한 좌석번호 표시
    var seatBadge = document.getElementById('complete-seat-badge');
    if (seatBadge) seatBadge.textContent = seatText;

    // 선택한 팀의 마스코트 표시
    var mascot = document.getElementById('complete-mascot');
    if (mascot) {
      mascot.src = selectedTeam.trash;
      mascot.alt = selectedTeam.name + ' 마스코트';
    }

    // 선택한 팀 색상·배치 적용 (한화: 마스코트 왼쪽 / 롯데: 마스코트 오른쪽)
    var leftCard = document.getElementById('complete-left-card');
    if (leftCard) {
      leftCard.classList.remove('team-hanwha', 'team-lotte');
      leftCard.classList.add(selectedTeam.cls);
    }

    // 엘리먼트 애니메이션
    var els = [
      document.querySelector('.complete-info'),
      document.querySelector('.complete-mascot-wrap'),
    ];
    els.forEach(function (el, i) {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
      setTimeout(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 80 + i * 120);
    });

    startCompleteCountdown();
  }

  /**
   * 완료 화면 카운트다운: 10 → 9 → … → 1 후 처음 화면으로 (새로 고침)
   */
  var countdownTimer = null;
  function startCompleteCountdown() {
    var numEl = document.getElementById('complete-countdown-num');
    var count = 10;
    if (countdownTimer) clearInterval(countdownTimer);
    if (numEl) numEl.textContent = count;

    countdownTimer = setInterval(function () {
      count -= 1;
      if (count >= 1) {
        if (numEl) numEl.textContent = count;
      } else {
        clearInterval(countdownTimer);
        countdownTimer = null;
        window.location.reload();
      }
    }, 1000);
  }

  // 팀 선택 / 촬영 화면 상단 홈 버튼 → 홈 화면으로
  var navHomeBtns = document.querySelectorAll('.nav-home-btn');
  Array.prototype.forEach.call(navHomeBtns, function (btn) {
    btn.addEventListener('click', function () {
      resetCamera();
      showScreen('home');
      setTimeout(function () { initHomeAnimation(); }, 50);
    });
  });

  // 모든 화면 상단 그린매치 로고 → 처음 화면으로 (새로 고침)
  var headerLogos = document.querySelectorAll('.header-logo');
  Array.prototype.forEach.call(headerLogos, function (logo) {
    logo.setAttribute('role', 'button');
    logo.setAttribute('tabindex', '0');
    logo.setAttribute('aria-label', '처음 화면으로');
    logo.addEventListener('click', function () {
      window.location.reload();
    });
    logo.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.location.reload();
      }
    });
  });

  /* ==============================
     초기 실행
  ============================== */
  initHomeAnimation();

})();
