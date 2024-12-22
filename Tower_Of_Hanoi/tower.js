const TowersOfHanoi = () => {
    // State
    let stacks = [[], [], []];
    let moves = [];
    let legs = [];
    let legStartTime = 0;
    let timerID = 0;
    let baseTime = 0;
    let isRunning = false;
    let finishTimeoutID = 0;
  
    // DOM Elements
    const status = document.getElementById("status");
    const container = document.getElementById("content");
    const toggleBtn = document.querySelector(".toggle-btn");
  
    // Constants
    const POLE_CONFIG = {
      midPoints: [150, 350, 550],
      top: 70,
      get bottom() {
        return this.top + 15 * 11;
      },
    };
  
    const getTime = () => {
      const now = Date.now();
      if (!baseTime) baseTime = now;
      return (now - baseTime) / 1000;
    };
  
    const createLeg = (
      element,
      { startX, startY, endX, endY, controlX, controlY, duration }
    ) => ({
      element,
      startX,
      startY,
      endX,
      endY,
      controlX,
      controlY,
      duration,
    });
  
    const animate = () => {
      if (!legs.length) {
        nextMove();
        legStartTime = getTime();
      }
  
      if (!legs.length) {
        finish();
        return;
      }
  
      const leg = legs[0];
      const t = Math.min((getTime() - legStartTime) / leg.duration, 1.0);
  
      const { startX, startY, endX, endY, element } = leg;
      const curX = startX + (endX - startX) * t;
      const curY = startY + (endY - startY) * t;
  
      element.style.left = `${Math.round(curX)}px`;
      element.style.top = `${Math.round(curY)}px`;
  
      if (t === 1.0) {
        legs.shift();
        legStartTime = getTime();
      }
    };
  
    const nextMove = () => {
      if (!moves.length) {
        status.textContent = "Finished";
        finish();
        return;
      }
  
      status.textContent = `${moves.length} moves remaining`;
  
      const { from, to } = moves.shift();
      const disk = stacks[from].pop();
      stacks[to].push(disk);
  
      const speed = parseFloat(document.getElementById("speed").value);
      const pixelSpeed = 450.0 * speed;
      const diskWidth = parseInt(disk.style.width);
      const startX = parseInt(disk.style.left);
      const startY = parseInt(disk.style.top);
      const topPosition = POLE_CONFIG.top - 60;
  
      const paths = [
        {
          startX: startX,
          startY: startY,
          endX: startX,
          endY: topPosition,
          controlX: startX,
          controlY: topPosition,
          duration: Math.abs(topPosition - startY) / pixelSpeed,
        },
        {
          startX: startX,
          startY: topPosition,
          endX: POLE_CONFIG.midPoints[to] - diskWidth / 2,
          endY: topPosition,
          controlX: POLE_CONFIG.midPoints[to] - diskWidth / 2,
          controlY: topPosition,
          duration:
            Math.abs(POLE_CONFIG.midPoints[to] - diskWidth / 2 - startX) /
            pixelSpeed,
        },
        {
          startX: POLE_CONFIG.midPoints[to] - diskWidth / 2,
          startY: topPosition,
          endX: POLE_CONFIG.midPoints[to] - diskWidth / 2,
          endY: POLE_CONFIG.bottom - (stacks[to].length -1) * 20 - 20,
          controlX: POLE_CONFIG.midPoints[to] - diskWidth / 2,
          controlY: POLE_CONFIG.bottom - (stacks[to].length - 1) * 20 - 20,
          duration:
            Math.abs(
              POLE_CONFIG.bottom - (stacks[to].length - 1) * 20 - 20 - topPosition
            ) / pixelSpeed,
        },
      ];
  
      paths.forEach((path) => {
        legs.push(createLeg(disk, path));
      });
    };
  
    const moveStack = (n, from, to) => {
      if (n <= 0) return;
      const other = 3 - (from + to);
      moveStack(n - 1, from, other);
      moves.push({ from, to });
      moveStack(n - 1, other, to);
    };
  
    const createPole = (index) => {
      const pole = document.createElement("div");
      pole.className = "pole";
      Object.assign(pole.style, {
        width: "20px",
        height: `${POLE_CONFIG.bottom - POLE_CONFIG.top}px`,
        left: `${POLE_CONFIG.midPoints[index] - 10}px`,
        top: `${POLE_CONFIG.top}px`,
      });
      container.appendChild(pole);
    };
  
    const createBase = () => {
      const base = document.createElement("div");
      base.className = "base";
      Object.assign(base.style, {
        height: "20px",
        left: `${POLE_CONFIG.midPoints[0] - 100}px`,
        width: `${POLE_CONFIG.midPoints[2] - POLE_CONFIG.midPoints[0] + 200}px`,
        top: `${POLE_CONFIG.bottom}px`,
      });
      container.appendChild(base);
    };
  
    const setupPoles = () => {
      POLE_CONFIG.midPoints.forEach((_, index) => createPole(index));
      createBase();
    };
  
    const createDisks = () => {
      stacks.forEach((stack) => {
        stack.forEach((disk) => disk.remove());
      });
  
      stacks = [[], [], []];
      const nDisks = parseInt(document.getElementById("number").value);
      let width = 190;
  
      for (let i = 0; i < nDisks && width > 20; i++) {
        const disk = document.createElement("div");
        disk.className = "disk";
        Object.assign(disk.style, {
          width: `${width}px`,
          left: `${Math.round(POLE_CONFIG.midPoints[0] - width / 2)}px`,
          top: `${Math.round(
            POLE_CONFIG.bottom - (stacks[0].length+1) * 20
          )}px`,
        });
        container.appendChild(disk);
        stacks[0].push(disk);
        width -= 30;
      }
    };
  
    const start = () => {
      if (!timerID) {
        isRunning = true;
        toggleBtn.textContent = "Stop";
        toggleBtn.classList.add("stop");
        timerID = setInterval(animate, 50);
        legStartTime += getTime();
      }
    };
  
    const stop = () => {
      if (timerID) {
        isRunning = false;
        toggleBtn.textContent = "Start";
        toggleBtn.classList.remove("stop");
        clearInterval(timerID);
        legStartTime -= getTime();
        timerID = 0;
      }
    };
  
    const finish = () => {
      stop();
      status.textContent = "Finished - Resetting in 3 seconds...";
      finishTimeoutID = setTimeout(reset, 3000);
    };
  
    const reset = () => {
      clearTimeout(finishTimeoutID);
      moves = [];
      legs = [];
      legStartTime = 0;
      createDisks();
      moveStack(stacks[0].length, 0, 2);
      status.textContent = "";
    };
  
    const toggleStartStop = () => {
      if (isRunning) {
        stop();
        reset();
      } else {
        start();
      }
    };
  
    setupPoles();
    reset();
  
    return {
      toggleStartStop,
      setNumber: () => {
        stop();
        reset();
      },
      setSpeed: () => {},
    };
  };
  
  const hanoi = TowersOfHanoi();