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
    var badge = document.getElementById('seat-info-badge');
    if (badge) badge.textContent = zone + '구역 ' + row + '열 ' + num + '번';

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
      document.querySelector('.ts-steps'),
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
    var badge = document.getElementById('seat-info-badge');
    if (badge) badge.textContent = zone + '구역 ' + row + '열 ' + num + '번';
    showScreen('team');
    animateTeamEntrance();
  }

  // 팀 정보 (선택한 팀에 점수를 적립하기 위해 사용)
  var TEAMS = {
    'ts-hanwha': { name: '한화 이글스',   logo: 'images/hanwha_eagles.png' },
    'ts-lotte':  { name: '롯데 자이언츠', logo: 'images/lotte_giants.png'  },
  };
  var selectedTeam = TEAMS['ts-hanwha'];

  // 팀 카드 클릭 → 촬영 화면으로
  ['ts-hanwha', 'ts-lotte'].forEach(function (id) {
    var card = document.getElementById(id);
    if (card) {
      card.addEventListener('click', function () {
        // 선택한 팀 저장
        selectedTeam = TEAMS[id];
        // 클릭 효과
        card.style.transform = 'scale(0.97)';
        setTimeout(function () {
          card.style.transform = '';
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

  // 촬영하기 버튼
  var camCaptureBtn = document.getElementById('cam-btn-capture');
  if (camCaptureBtn) {
    camCaptureBtn.addEventListener('click', function () {
      camCaptureBtn.disabled = true;
      camCaptureBtn.textContent = '인식 중…';
      camCaptureBtn.style.opacity = '0.7';

      // 단계 1 → 재질 판별 중
      setCamStatus(2);

      setTimeout(function () {
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

        // 버튼 텍스트 → 다음으로
        camCaptureBtn.disabled = false;
        camCaptureBtn.textContent = '다음으로 →';
        camCaptureBtn.style.opacity = '1';
        camCaptureBtn.style.background = 'linear-gradient(135deg, #43a047, #1b5e20)';

        // 다음 클릭 시 결과 화면으로
        camCaptureBtn.onclick = function () {
          showScreen('result');
          initResult();
          camCaptureBtn.onclick = null;
        };

      }, 1600);
    });
  }

  /* ==============================
     분리배출 안내 (결과) 화면
  ============================== */
  function initResult() {
    // 애니메이션 진입 효과
    var els = [
      document.querySelector('.result-left-card'),
      document.querySelector('.result-title'),
      document.querySelector('.result-steps'),
      document.querySelector('.result-disposal-guide'),
      document.querySelector('.result-done-btn'),
    ];
    els.forEach(function (el, i) {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      setTimeout(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
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

  /* ==============================
     완료 화면 (screen-complete)
  ============================== */
  function initComplete() {
    // 사용자가 선택한 팀의 로고/이름으로 표시
    var teamLogo = document.getElementById('complete-team-logo');
    var teamName = document.getElementById('complete-team-name');
    if (teamLogo) {
      teamLogo.src = selectedTeam.logo;
      teamLogo.alt = selectedTeam.name + ' 로고';
    }
    if (teamName) teamName.textContent = selectedTeam.name + '에';

    // 엘리먼트 애니메이션
    var els = [
      document.querySelector('.complete-left-card'),
      document.querySelector('.complete-right-card'),
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
  }

  // 홈으로 가기 버튼
  var completeBtnHome = document.getElementById('complete-btn-home');
  if (completeBtnHome) {
    completeBtnHome.addEventListener('click', function () {
      showScreen('home');
    });
  }

  // 다시 참여하기 버튼 → 홈스크맰으로
  var completeBtnRetry = document.getElementById('complete-btn-retry');
  if (completeBtnRetry) {
    completeBtnRetry.addEventListener('click', function () {
      showScreen('home');
      // 쏼 초기화
      setTimeout(function () { initHomeAnimation(); }, 50);
    });
  }

  /* ==============================
     초기 실행
  ============================== */
  initHomeAnimation();

})();
