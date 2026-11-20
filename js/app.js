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
     홈 — 시작하기 버튼 클릭
  ============================== */
  var btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', function () {
      btnStart.style.transform = 'scale(0.96)';
      setTimeout(function () {
        btnStart.style.transform = '';
        showScreen('seat');
        initSeat();
      }, 120);
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

  function initResult() {
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
