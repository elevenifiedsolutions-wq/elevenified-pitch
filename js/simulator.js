/* ==========================================================================
   Elevenified Vision — Interactive Workstation Simulation Engine
   Simulates Real-Time Edge Vision, Deterministic Rules, and SHA-256 Hashes
   ========================================================================== */

(function () {
  'use strict';

  // Scenario Definitions
  const SCENARIOS = {
    'ev-battery': {
      title: 'EV Battery Module Connection',
      partLabel: 'HV Battery Pack #EV-941',
      steps: [
        { id: 1, name: 'Align HV Terminal Plate', detail: 'ROI: Center Terminal [98.4% Conf]', box: { x: 0.35, y: 0.30, w: 0.30, h: 0.22 }, targetClass: 'terminal_plate' },
        { id: 2, name: 'Torque 4x Hex Bolts', detail: 'Sequence: [1→2→3→4] [Torque: 9.5Nm]', box: { x: 0.28, y: 0.55, w: 0.44, h: 0.28 }, targetClass: 'bolt_array' },
        { id: 3, name: 'Engage Safety Interlock', detail: 'Latching Pin Engaged [Hold 800ms]', box: { x: 0.42, y: 0.20, w: 0.16, h: 0.14 }, targetClass: 'interlock_clip' }
      ]
    },
    'aerospace-harness': {
      title: 'Aerospace Avionics Harness',
      partLabel: 'Avionics Bus Bay #AV-810',
      steps: [
        { id: 1, name: 'Insert 32-Pin Connector', detail: 'Keyway Aligned [Zero Pin Bend]', box: { x: 0.38, y: 0.35, w: 0.24, h: 0.25 }, targetClass: 'mil_spec_plug' },
        { id: 2, name: 'Quarter-Turn Lock Ring', detail: 'Index Line Verified Aligned', box: { x: 0.34, y: 0.30, w: 0.32, h: 0.35 }, targetClass: 'locking_collar' },
        { id: 3, name: 'Verify Strain Relief Dress', detail: 'Bend Radius > 35mm Verified', box: { x: 0.20, y: 0.62, w: 0.60, h: 0.24 }, targetClass: 'wire_bundle' }
      ]
    },
    'gearbox-assembly': {
      title: 'Precision Automotive Gearbox',
      partLabel: 'Planetary Gearcase #GB-402',
      steps: [
        { id: 1, name: 'Seat Input Shaft Bearing', detail: 'Flush Seating Verified [Depth: 0.0mm]', box: { x: 0.36, y: 0.32, w: 0.28, h: 0.30 }, targetClass: 'roller_bearing' },
        { id: 2, name: 'Place Compression Gasket', detail: '100% Boundary Alignment', box: { x: 0.24, y: 0.22, w: 0.52, h: 0.52 }, targetClass: 'silicone_gasket' },
        { id: 3, name: 'Align Housing Dowel Pins', detail: '2x Locating Pins Engaged', box: { x: 0.22, y: 0.40, w: 0.56, h: 0.18 }, targetClass: 'dowel_pin_pair' }
      ]
    }
  };

  // State Variables
  let currentScenarioKey = 'ev-battery';
  let activeStepIndex = 0;
  let simState = 'idle'; // 'idle', 'running', 'defect', 'occluded'
  let simTimer = null;
  let frameCount = 0;
  let canvas, ctx;

  // Utility: Generate fake deterministic SHA-256 hash
  function generateHash(inputStr) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < inputStr.length; i++) {
      hash ^= inputStr.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    const hex = ('0000000' + (hash >>> 0).toString(16)).substr(-8);
    const rand = ('0000000000000000' + Math.floor(Math.random() * 0xffffffffffffffff).toString(16)).substr(-16);
    return '0x' + hex + rand;
  }

  function initSimulator() {
    canvas = document.getElementById('simCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Resize canvas to match display resolution
    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio || 640;
      canvas.height = rect.height * window.devicePixelRatio || 380;
    }
    resize();
    window.addEventListener('resize', resize);

    // Setup Scenario Tabs
    const tabBtns = document.querySelectorAll('.sim-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentScenarioKey = btn.dataset.scenario;
        resetSimulation();
      });
    });

    // Setup Action Buttons
    const btnNominal = document.getElementById('simBtnNominal');
    const btnDefect = document.getElementById('simBtnDefect');
    const btnOcclude = document.getElementById('simBtnOcclude');
    const btnReset = document.getElementById('simBtnReset');

    if (btnNominal) btnNominal.addEventListener('click', runNominal);
    if (btnDefect) btnDefect.addEventListener('click', injectDefect);
    if (btnOcclude) btnOcclude.addEventListener('click', testOcclusion);
    if (btnReset) btnReset.addEventListener('click', resetSimulation);

    renderStepRail();
    startRenderLoop();
  }

  function renderStepRail() {
    const list = document.getElementById('stepRailList');
    if (!list) return;
    const scenario = SCENARIOS[currentScenarioKey];

    list.innerHTML = scenario.steps.map((step, idx) => {
      let stateClass = 'pending';
      let stateLabel = 'PENDING';

      if (simState === 'running') {
        if (idx < activeStepIndex) {
          stateClass = 'satisfied';
          stateLabel = 'SATISFIED';
        } else if (idx === activeStepIndex) {
          stateClass = 'active';
          stateLabel = 'ACTIVE';
        }
      } else if (simState === 'defect') {
        if (idx === 0) {
          stateClass = 'satisfied';
          stateLabel = 'SATISFIED';
        } else if (idx === 1) {
          stateClass = 'failed';
          stateLabel = 'VIOLATION';
        }
      } else if (simState === 'occluded') {
        if (idx === activeStepIndex) {
          stateClass = 'uncertain';
          stateLabel = 'UNCERTAIN';
        }
      }

      return `
        <li class="step-item ${stateClass}">
          <div class="step-info">
            <span class="step-name">${idx + 1}. ${step.name}</span>
            <span class="step-detail">${step.detail}</span>
          </div>
          <span class="step-state-tag ${stateClass}">${stateLabel}</span>
        </li>
      `;
    }).join('');
  }

  function logLedger(text, isAlert = false) {
    const stream = document.getElementById('simLedgerStream');
    if (!stream) return;
    const hash = generateHash(text + Date.now());
    const row = document.createElement('div');
    row.className = 'ledger-log-entry';
    row.innerHTML = `
      <span class="ledger-hash-prefix">${hash.substring(0, 10)}…</span>
      <span style="${isAlert ? 'color: var(--red-bright); font-weight:600;' : ''}">${text}</span>
    `;
    stream.prepend(row);

    // Limit stream items
    while (stream.children.length > 8) {
      stream.removeChild(stream.lastChild);
    }
  }

  function runNominal() {
    clearTimeout(simTimer);
    simState = 'running';
    activeStepIndex = 0;
    renderStepRail();
    logLedger(`CYCLE_START: ${SCENARIOS[currentScenarioKey].partLabel}`);

    function nextStep() {
      if (activeStepIndex < SCENARIOS[currentScenarioKey].steps.length) {
        const step = SCENARIOS[currentScenarioKey].steps[activeStepIndex];
        logLedger(`STEP_${step.id}_SATISFIED: ${step.name} [Confidence: 99.2%]`);
        activeStepIndex++;
        renderStepRail();
        if (activeStepIndex < SCENARIOS[currentScenarioKey].steps.length) {
          simTimer = setTimeout(nextStep, 1400);
        } else {
          logLedger(`CYCLE_COMPLETE: 100% Cryptographic Proof Verified`, false);
        }
      }
    }

    simTimer = setTimeout(nextStep, 1200);
  }

  function injectDefect() {
    clearTimeout(simTimer);
    simState = 'defect';
    activeStepIndex = 1;
    renderStepRail();
    logLedger(`ANOMALY_TRIGGERED: Step 2 Omission Detected (Bolt Missing)`, true);
    logLedger(`ANDON_ESCALATION: Supervisor Review Required [Station 04]`, true);
  }

  function testOcclusion() {
    clearTimeout(simTimer);
    simState = 'occluded';
    renderStepRail();
    logLedger(`ADVISORY_FAIL_OPEN: Optical Degradation / Partial Occlusion`, true);
    logLedger(`ESCALATING_TO_OPERATOR_VISUAL_CHECK: Line Continuing`, false);
  }

  function resetSimulation() {
    clearTimeout(simTimer);
    simState = 'idle';
    activeStepIndex = 0;
    renderStepRail();
    logLedger(`SYSTEM_READY: Workstation Initialized (${SCENARIOS[currentScenarioKey].title})`);
  }

  // 60FPS Canvas Animation Loop
  function startRenderLoop() {
    function draw() {
      if (!ctx || !canvas) return;
      frameCount++;

      const w = canvas.width;
      const h = canvas.height;

      // Clear with dark cybernetic gradient
      ctx.fillStyle = '#080a0d';
      ctx.fillRect(0, 0, w, h);

      // Draw Industrial Grid Lines
      ctx.strokeStyle = 'rgba(30, 35, 45, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 30 * window.devicePixelRatio;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw Workpiece Center Platform
      ctx.fillStyle = '#12151c';
      ctx.strokeStyle = '#232a36';
      ctx.lineWidth = 2;
      const pw = w * 0.7;
      const ph = h * 0.65;
      const px = (w - pw) / 2;
      const py = (h - ph) / 2 + 10;
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, 8);
      ctx.fill();
      ctx.stroke();

      // Draw Workpiece Inner Component Details (Technical CAD Blueprint)
      ctx.save();
      if (currentScenarioKey === 'ev-battery') {
        // EV Battery Module Blueprint
        ctx.strokeStyle = '#1e2838';
        ctx.fillStyle = '#0f131a';
        ctx.lineWidth = 1;

        // 4x2 Battery Cell Arrays
        const cellRows = 2;
        const cellCols = 4;
        const cellMarginX = pw * 0.12;
        const cellMarginY = ph * 0.28;
        const cellW = (pw - cellMarginX * 2) / cellCols;
        const cellH = (ph - cellMarginY * 2) / cellRows;

        for (let r = 0; r < cellRows; r++) {
          for (let c = 0; c < cellCols; c++) {
            const cx = px + cellMarginX + c * cellW + 4;
            const cy = py + cellMarginY + r * cellH + 4;
            ctx.beginPath();
            ctx.roundRect(cx, cy, cellW - 8, cellH - 8, 4);
            ctx.fill();
            ctx.stroke();

            // Polarity Markings
            ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(0, 229, 255, 0.4)' : 'rgba(245, 158, 11, 0.4)';
            ctx.font = `${9 * window.devicePixelRatio}px monospace`;
            ctx.fillText((r + c) % 2 === 0 ? '+' : '-', cx + cellW / 2 - 8, cy + cellH / 2 + 3);
            ctx.fillStyle = '#0f131a';
          }
        }

        // Copper Busbar Interconnects
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.lineWidth = 2;
        ctx.strokeRect(px + pw * 0.32, py + ph * 0.26, pw * 0.36, ph * 0.26);

        // 4x Hex Bolt Target Nodes
        const boltCoords = [
          { x: px + pw * 0.35, y: py + ph * 0.62 },
          { x: px + pw * 0.65, y: py + ph * 0.62 },
          { x: px + pw * 0.65, y: py + ph * 0.78 },
          { x: px + pw * 0.35, y: py + ph * 0.78 }
        ];
        boltCoords.forEach((bc, bIdx) => {
          ctx.beginPath();
          ctx.arc(bc.x, bc.y, 7, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
          ctx.font = `${8 * window.devicePixelRatio}px monospace`;
          ctx.fillText(`${bIdx + 1}`, bc.x - 2.5, bc.y + 3);
        });

      } else if (currentScenarioKey === 'aerospace-harness') {
        // Aerospace Avionics Circular MIL-Spec Connector Blueprint
        const ccx = px + pw * 0.5;
        const ccy = py + ph * 0.45;
        const outerR = Math.min(pw, ph) * 0.32;

        // Outer Locking Ring
        ctx.strokeStyle = '#293548';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ccx, ccy, outerR, 0, Math.PI * 2);
        ctx.stroke();

        // Index Alignment Keyway Notch
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ccx - 6, ccy - outerR);
        ctx.lineTo(ccx + 6, ccy - outerR);
        ctx.stroke();

        // Inner Contact Insert
        ctx.strokeStyle = '#1a222f';
        ctx.beginPath();
        ctx.arc(ccx, ccy, outerR * 0.75, 0, Math.PI * 2);
        ctx.fillStyle = '#0d1017';
        ctx.fill();
        ctx.stroke();

        // 32-Pin Gold Contact Grid
        for (let a = 0; a < 8; a++) {
          const ang = (a / 8) * Math.PI * 2;
          const pinR = outerR * 0.48;
          ctx.beginPath();
          ctx.arc(ccx + Math.cos(ang) * pinR, ccy + Math.sin(ang) * pinR, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
          ctx.fill();
        }

        // Strain Relief Conduit Harness Lines
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(ccx, ccy + outerR);
        ctx.quadraticCurveTo(ccx + 30, ccy + outerR + 40, px + pw * 0.7, py + ph * 0.85);
        ctx.stroke();

      } else if (currentScenarioKey === 'gearbox-assembly') {
        // Precision Automotive Gearbox Blueprint
        const gcx = px + pw * 0.5;
        const gcy = py + ph * 0.48;
        const gR = Math.min(pw, ph) * 0.36;

        // Central Input Shaft Bearing Race
        ctx.strokeStyle = '#293548';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(gcx, gcy, gR * 0.55, 0, Math.PI * 2);
        ctx.stroke();

        // Roller Bearings
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2;
          const br = gR * 0.38;
          ctx.beginPath();
          ctx.arc(gcx + Math.cos(ang) * br, gcy + Math.sin(ang) * br, 5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
          ctx.fill();
        }

        // Compression Gasket Boundary Channel (Dashed)
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(px + pw * 0.22, py + ph * 0.2, pw * 0.56, ph * 0.56);
        ctx.setLineDash([]);

        // 2x Locating Dowel Pins
        const dowel1 = { x: px + pw * 0.26, y: py + ph * 0.48 };
        const dowel2 = { x: px + pw * 0.74, y: py + ph * 0.48 };
        [dowel1, dowel2].forEach(dp => {
          ctx.beginPath();
          ctx.arc(dp.x, dp.y, 6, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
          ctx.stroke();
          ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
          ctx.fill();
        });
      }
      ctx.restore();

      // Scanning Beam
      const scanY = py + (Math.sin(frameCount * 0.04) * 0.5 + 0.5) * ph;
      const grad = ctx.createLinearGradient(px, scanY - 15, px, scanY + 15);
      grad.addColorStop(0, 'rgba(0, 229, 255, 0)');
      grad.addColorStop(0.5, 'rgba(0, 229, 255, 0.25)');
      grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(px, scanY - 15, pw, 30);

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, scanY);
      ctx.lineTo(px + pw, scanY);
      ctx.stroke();

      // Render Active Scenario Bounding Boxes
      const scenario = SCENARIOS[currentScenarioKey];
      scenario.steps.forEach((step, idx) => {
        const bx = px + step.box.x * pw;
        const by = py + step.box.y * ph;
        const bw = step.box.w * pw;
        const bh = step.box.h * ph;

        let boxColor = '#3e485c';
        let statusText = 'TRACKING';
        let conf = '98.7%';

        if (simState === 'running') {
          if (idx < activeStepIndex) {
            boxColor = '#10b981'; // Green (Satisfied)
            statusText = 'SATISFIED';
            conf = '99.4%';
          } else if (idx === activeStepIndex) {
            boxColor = '#00e5ff'; // Cyan (Active)
            statusText = 'EVALUATING';
            conf = '98.9%';
          }
        } else if (simState === 'defect') {
          if (idx === 1) {
            boxColor = '#ef4444'; // Red (Violation)
            statusText = 'DEFECT: MISSING';
            conf = 'ANOMALY';
          } else if (idx === 0) {
            boxColor = '#10b981';
            statusText = 'SATISFIED';
          }
        } else if (simState === 'occluded') {
          if (idx === activeStepIndex) {
            boxColor = '#f59e0b'; // Amber (Uncertain)
            statusText = 'OCCLUDED (FAIL-OPEN)';
            conf = '42.1%';
          }
        }

        // Draw Bounding Box with Corner Brackets
        ctx.strokeStyle = boxColor;
        ctx.lineWidth = (boxColor === '#00e5ff' || boxColor === '#ef4444') ? 2.5 : 1.5;
        ctx.strokeRect(bx, by, bw, bh);

        // Bounding Box Label Pill
        ctx.fillStyle = boxColor;
        ctx.font = `600 ${10 * window.devicePixelRatio}px 'JetBrains Mono', monospace`;
        const labelStr = ` ${step.targetClass} [${statusText} ${conf}] `;
        const textWidth = ctx.measureText(labelStr).width;
        
        ctx.fillRect(bx, by - 16 * window.devicePixelRatio, textWidth, 16 * window.devicePixelRatio);
        ctx.fillStyle = '#050709';
        ctx.fillText(labelStr, bx, by - 4 * window.devicePixelRatio);
      });

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimulator);
  } else {
    initSimulator();
  }
})();
