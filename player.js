function keydown(e) {
  if (e.repeat) { return }

  keyupdate(e);
  robots.player.keyhistory.unshift(e.keyCode);
  clearInterval(timer);
  update();
  timer = setInterval(update, robots.player.speed);
}

function keyup(e) {
  if (e.keyCode == robots.player.keyhistory[0]) {
    robots.player.keyhistory.shift();
  }
  keyupdate(e)
}

function blur() {
  const pressedkey = robots.player.pressedkey;
  for (var i in pressedkey) {
    pressedkey[i] = false;
  }
}

function keyupdate(e) {
  const k = e.keyCode;
  robots.player.pressedkey[k] = e.type == 'keydown';
}

function addPlayerSpeed(value) {
  robots.player.speed -= value;
  if (robots.player.speed < 0) {
    robots.player.speed = 0;
  }
}

function init_player() {
  robots.player = new Robot(
    `<p class='player'>U</p>`,
    null,
    null,
    d.you);

  let player = robots.player;

  // player controls
  player.speed = config.speed;
  player.pressedkey = {};
  player.keymap = {
    left: "65",
    right: "68",
    down: "83",
  };
  player.keyhistory = [];
  window.addEventListener("keydown", keydown);
  window.addEventListener("keyup", keyup);
  window.addEventListener("blur", blur);

  player.startedMoving = false;
  player.startedDigging = false;
  player.hasMods = false;
}

function key(k) {
  const player = robots.player;
  const map = robots.player.keymap;

  switch (""+k) {
    case map.down:
      ui.distance.textContent = Math.abs(player.y - robots["love"].y);
      player.move("down");
      updateMusicVolume();
      if (!player.startedMoving) startCountdown();
      if (!player.startedDigging) {
        player.startedDigging = true;
        document.getElementById("inventory_wrapper").classList.remove("hidden");
      }
      break;
    case map.left:
      if (player.keyhistory[0] != map.right) {
        player.move("left");
        if (!player.startedMoving) startCountdown();
      }
      break;
    case map.right:
      if (player.keyhistory[0] != map.left) {
        player.move("right");
        if (!player.startedMoving) startCountdown();
      }
      break;
  }

  function startCountdown() {
    player.startedMoving = true;
    for (let layer in music) {
      for (let track in music[layer]) {
        music[layer][track].volume(0);
        music[layer][track].loop(true);
        music[layer][track].play();
      }
    }
    updateMusicVolume();
    countdown = setInterval(drainBattery, config.drainSpeed);
  }

  // update inventory
  ui.inventory.innerHTML = "";
  for (let obj in player.inventory) {
    let tooltip;

    let o = player.inventory[obj];

    if ('tooltip' in o) {
      tooltip = o.tooltip.replace("$", o.count);
    }

    ui.inventory.innerHTML += "<span onmouseover='tooltip(`" + tooltip + "`)' onmouseout='tooltip()'>" + o.name + "</span>";
  }

  // update position of mod and a
  let p = ui.main.getElementsByClassName("player")[0];
  let top = Math.round(p.offsetTop);

  ui.modWrapper.style.top = top+"px";
  ui.a.style.top = "calc(" + top+"px)";
}

function tooltip(text) {
  text = text || "";

  ui.tooltip.innerHTML = text;
}

function powerPlayer(value) {
  time += value;
  if (time > 100) { time = 100 }
  if (time < 0) {
    time = 0;
    game_over();
  }
  ui.time.textContent = time;

  if (value > 0) {
    sounds.powergained.play()
  } else {
    sounds.powerlost.play()
  }
}

function a(text) {
  ui.a.classList.remove("hidden");
  ui.a.innerHTML = text;
}
