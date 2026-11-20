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
  if (screens.home) {
    screens.home.addEventListener('click', function (e) {
      if (!screens.home.classList.contains('active')) return;
      if (e.target.closest('.header-logo')) return;   // 로고는 기존대로 새로 고침
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

      // 인식 완료 후 자동으로 결과 화면으로 이동 (인식된 쓰레기 종류의 안내 표시)
      camTimer = setTimeout(function () {
        camTimer = null;
        var wasteType = getRecognizedType();
        showScreen('result');
        initResult(wasteType);
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

  /* ---------- 쓰레기 종류별 안내 내용 ---------- */
  var INK = '#1c2a3a';

  // 물방울 (종이 안내 1번 그림과 같은 모양)
  function drop(x, y, color) {
    return '<path d="M' + x + ' ' + y + ' q-5 8 0 11 q5 -3 0 -11z" fill="' + color + '"/>';
  }

  // 3번 그림 공통: 위쪽 물건 → 점선 화살표 → 투입구 통 (모두 가로 중앙 정렬)
  function binIll(item) {
    return '<svg viewBox="0 0 172 172" aria-hidden="true">' + item +
      '<path d="M86 59 V74" stroke="#2f9c4c" stroke-width="3.5" fill="none" stroke-dasharray="5 6" stroke-linecap="round"/>' +
      '<path d="M79 73 L86 80 L93 73" stroke="#2f9c4c" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M51 95 L121 95 L117 147 Q116 151 112 151 L60 151 Q56 151 55 147 Z" fill="#2f9c4c" stroke="#1f3a28" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<rect x="47" y="85" width="78" height="12" rx="3" fill="#2f9c4c" stroke="#1f3a28" stroke-width="3.5"/>' +
      '<path d="M86 135 L86 111 M78 119 L86 111 L94 119" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M79 143 L93 143" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>' +
      '</svg>';
  }

  function svg(inner) {
    return '<svg viewBox="0 0 172 172" aria-hidden="true">' + inner + '</svg>';
  }

  var GUIDES = {
    /* 일반 쓰레기 */
    general: {
      title: '<em>일반 쓰레기</em> 이렇게 버려 주세요',
      steps: [
        {
          t: '재활용 안 되는 것 모으기',
          s: '휴지·나무젓가락·오염된 포장재 등',
          ill: svg(
            // 구겨진 휴지 + 나무젓가락
            '<path d="M48 92 Q44 74 60 68 Q68 56 84 62 Q100 60 104 76 Q116 86 108 102 Q106 118 88 116 Q74 126 62 114 Q44 110 48 92 Z" fill="#fff" stroke="' + INK + '" stroke-width="3.8" stroke-linejoin="round"/>' +
            '<path d="M62 84 L76 92 L70 104 M84 76 L92 90 L102 92" stroke="' + INK + '" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M118 42 L134 126 M130 40 L146 120" stroke="#c9985a" stroke-width="6" stroke-linecap="round"/>'
          )
        },
        {
          t: '음식물·액체 비우기',
          s: '남은 음식과 음료는 따로 버려 주세요',
          ill: svg(
            // 기울인 일회용 용기 + 쏟아지는 부스러기·물방울
            '<g transform="rotate(-28 86 86)">' +
              '<path d="M44 70 L128 70 L118 102 Q117 106 113 106 L59 106 Q55 106 54 102 Z" fill="#fff" stroke="' + INK + '" stroke-width="3.8" stroke-linejoin="round"/>' +
              '<path d="M40 70 L132 70" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>' +
              '<path d="M50 82 L124 82" stroke="#2fa24b" stroke-width="5"/>' +
            '</g>' +
            '<circle cx="40" cy="110" r="4" fill="#c9985a"/>' +
            '<circle cx="50" cy="124" r="3.5" fill="#d9ad72"/>' +
            drop(34, 120, '#c9985a') + drop(56, 104, '#d9ad72')
          )
        },
        {
          t: '부피 줄여 넣기',
          s: '오른쪽 <b>일반 투입구</b>에 넣어요',
          ill: binIll(
            // 묶은 쓰레기 봉투
            '<path d="M72 56 Q62 56 64 44 Q66 34 78 30 L75 22 L86 27 L97 22 L94 30 Q106 34 108 44 Q110 56 100 56 Z" fill="#cfd6dd" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
            '<path d="M78 30 Q86 34 94 30" stroke="' + INK + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
          )
        }
      ]
    },

    /* 종이 */
    paper: {
      title: '<em>종이</em> 이렇게 버려 주세요',
      steps: [
        {
          t: '음식물 깨끗이 비우기',
          s: '남은 음식과 음료를 깨끗이 비워 주세요',
          ill: svg(
            '<g transform="translate(14 -22) rotate(-110 88 84)"><path d="M60 46 L116 46 L107 116 Q106 122 100 122 L76 122 Q70 122 69 116 Z" fill="#fff" stroke="#1c2a3a" stroke-width="3.8" stroke-linejoin="round"/><path d="M63 70 L113 70" stroke="#2fa24b" stroke-width="5" stroke-linecap="butt"/><path d="M56 46 L120 46" stroke="#1c2a3a" stroke-width="4.5" stroke-linecap="round"/></g><path d="M75 107 Q68 120 71 140" stroke="#c9985a" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="72" cy="147" rx="17" ry="4.5" fill="#d9ad72"/><path d="M56 136 q-3.5 6 0 8 q3.5 -2 0 -8z" fill="#c9985a"/><path d="M88 134 q-3.5 6 0 8 q3.5 -2 0 -8z" fill="#d9ad72"/>'
          )
        },
        {
          t: '비닐·테이프 떼어 내기',
          s: '코팅 비닐과 테이프는 떼어 내 주세요',
          ill: svg(
            '<g transform="translate(0 -4)"><path d="M34 92 L60 66 L146 66 L120 92 Z" fill="#f7e3bb" stroke="#1c2a3a" stroke-width="3.8" stroke-linejoin="round"/><path d="M120 92 L146 66 L146 120 L120 146 Z" fill="#e6c48d" stroke="#1c2a3a" stroke-width="3.8" stroke-linejoin="round"/><rect x="34" y="92" width="86" height="54" rx="2" fill="#f3d9a8" stroke="#1c2a3a" stroke-width="3.8" stroke-linejoin="round"/><path d="M47 79 L133 79" stroke="#1c2a3a" stroke-width="2.5" stroke-linecap="round" opacity=".5"/><path d="M53 73 L96 73 L96 85 L41 85 Z" fill="#8ec5ee" stroke="#1c2a3a" stroke-width="3" stroke-linejoin="round"/><path d="M53 77 L94 77" stroke="#d3ebfa" stroke-width="2.5" stroke-linecap="round"/><path d="M96 73 C106 69 112 56 110 42 L113 38 L116 42 L119 37 L122 41 L124 39 C128 58 118 79 96 85 Z" fill="#8ec5ee" stroke="#1c2a3a" stroke-width="3" stroke-linejoin="round"/><path d="M102 76 C110 70 116 59 116 46" stroke="#d3ebfa" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M132 46 L144 42 M134 58 L148 60" stroke="#2fa24b" stroke-width="3.5" stroke-linecap="round"/></g>'
          )
        },
        {
          t: '납작하게 접어 넣기',
          s: '오른쪽 <b>종이 투입구</b>에 넣어요',
          ill: binIll(
            '<g transform="rotate(-18 86 38)">' +
              '<rect x="63" y="24" width="46" height="28" rx="3" fill="#f3d9a8" stroke="' + INK + '" stroke-width="3.5"/>' +
              '<path d="M69 38 H103" stroke="' + INK + '" stroke-width="2.5" stroke-dasharray="4 3" stroke-linecap="round"/>' +
            '</g>'
          )
        }
      ]
    },

    /* 캔 */
    can: {
      title: '<em>캔</em> 이렇게 버려 주세요',
      steps: [
        {
          t: '내용물 비우기',
          s: '남은 음료를 깨끗이 비워 주세요',
          ill: svg(
            // 기울인 캔 + 떨어지는 음료
            '<g transform="rotate(-110 92 72)">' +
              '<rect x="72" y="42" width="40" height="60" rx="6" fill="#d5dde4" stroke="' + INK + '" stroke-width="3.8"/>' +
              '<path d="M72 52 H112 M72 92 H112" stroke="' + INK + '" stroke-width="3"/>' +
              '<path d="M76 70 H108" stroke="#2fa24b" stroke-width="6"/>' +
            '</g>' +
            drop(68, 114, '#c9985a') + drop(80, 128, '#c9985a') + drop(62, 132, '#d9ad72')
          )
        },
        {
          t: '이물질 넣지 않기',
          s: '담배꽁초 등 이물질을 넣지 말아 주세요',
          ill: svg(
            // 캔 + 담배꽁초 + 금지 표시
            '<rect x="46" y="66" width="44" height="72" rx="7" fill="#d5dde4" stroke="' + INK + '" stroke-width="3.8"/>' +
            '<path d="M46 78 H90 M46 126 H90" stroke="' + INK + '" stroke-width="3"/>' +
            '<path d="M50 100 H86" stroke="#2fa24b" stroke-width="6"/>' +
            '<rect x="58" y="69" width="20" height="5" rx="2.5" fill="' + INK + '"/>' +
            '<g transform="rotate(-30 112 48)">' +
              '<rect x="94" y="43" width="36" height="10" rx="3" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
              '<rect x="94" y="43" width="12" height="10" rx="3" fill="#e8a35a" stroke="' + INK + '" stroke-width="3"/>' +
            '</g>' +
            '<circle cx="124" cy="100" r="16" fill="#fff" stroke="#e5534b" stroke-width="4"/>' +
            '<path d="M117 93 L131 107 M131 93 L117 107" stroke="#e5534b" stroke-width="4" stroke-linecap="round"/>'
          )
        },
        {
          t: '납작하게 눌러 넣기',
          s: '오른쪽 <b>캔 투입구</b>에 넣어요',
          ill: binIll(
            // 찌그러뜨린 캔
            '<rect x="72" y="24" width="28" height="32" rx="5" fill="#d5dde4" stroke="' + INK + '" stroke-width="3.5"/>' +
            '<path d="M72 31 H100 M72 49 H100" stroke="' + INK + '" stroke-width="2.5"/>' +
            '<path d="M72 40 L79 36 L86 42 L93 36 L100 40" stroke="' + INK + '" stroke-width="2.5" fill="none" stroke-linejoin="round"/>'
          )
        }
      ]
    },

    /* 플라스틱 */
    plastic: {
      title: '<em>플라스틱</em> 이렇게 버려 주세요',
      steps: [
        {
          t: '내용물 비우기',
          s: '남은 음료와 얼음을 비워 주세요',
          ill: svg(
            // 기울인 플라스틱 컵 + 물방울·얼음
            '<g transform="rotate(-110 88 84)">' +
              '<path d="M60 46 L116 46 L107 116 Q106 122 100 122 L76 122 Q70 122 69 116 Z" fill="#e3f3fc" stroke="' + INK + '" stroke-width="3.8" stroke-linejoin="round"/>' +
              '<path d="M56 46 L120 46" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>' +
              '<path d="M63 70 L113 70" stroke="#2fa24b" stroke-width="5"/>' +
            '</g>' +
            drop(62, 132, '#8ec5ee') + drop(74, 142, '#8ec5ee') +
            '<rect x="40" y="128" width="12" height="12" rx="2.5" fill="#fff" stroke="#8ec5ee" stroke-width="3" transform="rotate(18 46 134)"/>'
          )
        },
        {
          t: '라벨·뚜껑 분리하기',
          s: '비닐 라벨을 떼고 뚜껑은 분리해 주세요',
          ill: svg(
            // 페트병 + 떼어 내는 라벨 + 분리한 뚜껑
            '<path d="M68 52 L84 52 L84 60 Q100 66 100 80 L100 140 Q100 148 92 148 L60 148 Q52 148 52 140 L52 80 Q52 66 68 60 Z" fill="#d6ecf8" stroke="' + INK + '" stroke-width="3.8" stroke-linejoin="round"/>' +
            '<rect x="52" y="96" width="30" height="26" fill="#9fd4a8" stroke="' + INK + '" stroke-width="3"/>' +
            '<path d="M82 96 Q102 90 118 104 L112 126 Q98 116 82 122 Z" fill="#9fd4a8" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
            '<rect x="106" y="30" width="22" height="16" rx="3" fill="#2f9c4c" stroke="#1f3a28" stroke-width="3.5" transform="rotate(20 117 38)"/>' +
            '<path d="M90 46 L100 40 M136 58 L148 62" stroke="#2fa24b" stroke-width="3.5" stroke-linecap="round"/>'
          )
        },
        {
          t: '찌그러뜨려 넣기',
          s: '오른쪽 <b>플라스틱 투입구</b>에 넣어요',
          ill: binIll(
            // 뚜껑 뺀 페트병
            '<path d="M80 20 L92 20 L92 27 Q102 31 102 40 L102 52 Q102 56 98 56 L74 56 Q70 56 70 52 L70 40 Q70 31 80 27 Z" fill="#d6ecf8" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
            '<path d="M75 46 L81 41 M91 50 L97 45" stroke="#8ec5ee" stroke-width="3" stroke-linecap="round"/>'
          )
        }
      ]
    }  // 음식물 쓰레기 안내 화면은 사용하지 않음 (오른쪽 음식물 통은 그대로 표시)
  };

  var GUIDE_TYPES = ['general', 'paper', 'can', 'plastic'];

  /**
   * AI 인식 결과(쓰레기 종류)를 돌려줌.
   * TODO: 인식 시스템이 만들어지면 실제 인식 결과('general'|'paper'|'can'|'plastic')를 반환하도록 교체
   * 지금은 인식 시스템이 없으므로 랜덤으로 선택
   */
  function getRecognizedType() {
    return GUIDE_TYPES[Math.floor(Math.random() * GUIDE_TYPES.length)];
  }

  /** 안내 화면 내용을 쓰레기 종류에 맞게 바꿈 */
  function renderGuide(type) {
    var guide = GUIDES[type] || GUIDES.paper;
    var stage = document.getElementById('g-stage');
    if (!stage) return;

    var title = stage.querySelector('.g-title');
    if (title) title.innerHTML = guide.title;

    ['.g-c1', '.g-c2', '.g-c3'].forEach(function (sel, i) {
      var card = stage.querySelector(sel);
      var step = guide.steps[i];
      if (!card || !step) return;
      var ill = card.querySelector('.g-ill');
      var t = card.querySelector('.g-t');
      var s = card.querySelector('.g-s');
      if (ill) ill.innerHTML = step.ill;
      if (t) t.textContent = step.t;
      if (s) s.innerHTML = step.s;
    });

    // 해당 투입구 강조
    var bins = stage.querySelectorAll('.g-bin');
    Array.prototype.forEach.call(bins, function (bin) {
      bin.classList.toggle('g-active', bin.dataset.bin === type);
    });

    placeGuideTip();
  }

  /** "여기에 넣어요!" 말풍선·화살표를 강조된 통 위 가운데로 */
  function placeGuideTip() {
    var binsWrap = document.querySelector('#screen-result .g-bins');
    var active = binsWrap && binsWrap.querySelector('.g-bin.g-active');
    var tip = document.querySelector('#screen-result .g-tip');
    var arrow = document.querySelector('#screen-result .g-tip-arrow');
    if (!active) return;
    var cx = binsWrap.offsetLeft + active.offsetLeft + active.offsetWidth / 2;
    if (tip)   tip.style.left   = (cx - 205 / 2) + 'px';
    if (arrow) arrow.style.left = (cx - 34 / 2) + 'px';
  }

  renderGuide('paper');

  function initResult(type) {
    renderGuide(type);
    fitGuideStage();
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

  // 모든 화면 상단 홈 버튼 → 처음 시작 화면으로 (새로 고침)
  var navHomeBtns = document.querySelectorAll('.nav-home-btn');
  Array.prototype.forEach.call(navHomeBtns, function (btn) {
    btn.addEventListener('click', function () {
      if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
      window.location.reload();
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
