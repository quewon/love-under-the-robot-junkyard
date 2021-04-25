window.onload = function() {
  sounds = {
    digs: [
      new Howl({src: "sounds/digs/1.wav"}),
      new Howl({src: "sounds/digs/2.wav"}),
      new Howl({src: "sounds/digs/3.wav"}),
      new Howl({src: "sounds/digs/4.wav"}),
    ],
    partstolen: new Howl({src: "sounds/ripout.wav"}),
    partgained: new Howl({src: "sounds/equip.wav"}),
    powerlost: new Howl({src: "sounds/powerlost.wav"}),
    powergained: new Howl({src: "sounds/powergained.wav"}),
    click: new Howl({src: "sounds/click.wav"}),
    atmosphere: new Howl({
      src: "sounds/atmosphere.wav",
      loop: true,
    }),
  };

  music = {
    1: [
      new Howl({src: "music/bell.wav"}),
      new Howl({src: "music/lowkey.wav"}),
    ],
    2: [
      new Howl({src: "music/pad.wav"}),
      new Howl({src: "music/perc.wav"}),
      new Howl({src: "music/bass.wav"}),
    ],
    3: [
      new Howl({src: "music/keys.wav"}),
      new Howl({src: "music/tuba.wav"}),
    ]
  };

  sounds.atmosphere.play();
};

var sounds;
var music;

function restart() {
  window.removeEventListener("keydown", keydown);
  window.removeEventListener("keyup", keyup);
  window.removeEventListener("blur", blur);

  document.getElementById("inventory_wrapper").classList.add("hidden");
  // ui.modWrapper.classList.add("hidden");

  for (let layer in music) {
    for (let track in music[layer]) {
      music[layer][track].stop();
    }
  }

  clearInterval(countdown);

  init();
}

function init() {
  init_diggables();
  init_robots();
  init_map();

  refresh();

  if (config.mode=="peaceful") {
    config.time_limit = "100";
  } else if (config.mode=="hard") {
    config.time_limit = Math.floor(minTime() / 2.5);
  }

  time = config.time_limit;
  ui.time.textContent = time;
  ui.distance.textContent = Math.abs(robots.player.y - robots["love"].y);

  menu_open = false;

  ui.mod.core[0].innerHTML = "C";
  ui.mod.movement[0].innerHTML = "m";
  ui.mod.movement[1].innerHTML = "m";
  ui.mod.digger[0].innerHTML = "D";
  ui.mod.digger[1].innerHTML = "D";

  let p = ui.main.getElementsByClassName("player")[0];
  let top = Math.round(p.offsetTop);

  ui.modWrapper.style.top = top+"px";
  ui.a.style.top = "calc(" + top+"px)";
}

var ui = {
  game: document.getElementById("game"),
  distance: document.getElementById("distance"),
  time: document.getElementById("time"),
  inventory: document.getElementById("inventory"),
  tooltip: document.getElementById("tooltip"),
  modWrapper: document.getElementById("mod_wrapper"),
  mod: {
    core: [document.getElementById("core_slot")],
    movement: [
      document.getElementById("movement_slot_1"),
      document.getElementById("movement_slot_2")
    ],
    digger: [
      document.getElementById("digger_slot_1"),
      document.getElementById("digger_slot_2"),
    ]
  },
  pause_menu: document.getElementById("pause_menu"),
  win_menu: document.getElementById("win_menu"),
  a: document.getElementById("a"),
  main: document.getElementById("main"),
};

window.onmousemove = function(e) {
  let x = e.clientX;
  let y = e.clientY;

  ui.tooltip.style.left = x + 'px';
  ui.tooltip.style.top = y + 'px';
};

var time;
var countdown;
function drainBattery() {
  if (menu_open) return

  time--;
  ui.time.textContent = time;

  if (time <= 0) {
    game_over();
  }

  let core = robots.player.parts.core[0];
  if (core != 0) {
    core.func();
  }
}

function updateDrainSpeed(speed) {
  clearInterval(countdown);
  countdown = setInterval(drainBattery, speed);
}

var timer;
function update() {
  if (menu_open) return

  let player = robots.player;
  const pressedkey = player.pressedkey;

  for (var i in pressedkey) {
    if (pressedkey[i]) key(i)
  }

  // if (!player.hasMods) {
  //   for (let type in player.parts) {
  //     for (let slot in player.parts[type]) {
  //       if (player.parts[type][slot] != 0) {
  //         player.hasMods = true;
  //         ui.modWrapper.classList.remove("hidden")
  //         break
  //       }
  //     }
  //   }
  // }

  refresh();
}

function updateMusicVolume() {
  let layer = robots.player.layer;
  let vol = robots.player.y / config.map_height;

  if (layer >= 1) {
    for (let track in music[1]) {
      music[1][track].volume(vol);
    }
  }

  if (layer >= 2) {
    for (let track in music[2]) {
      music[2][track].volume(vol);
    }
  }

  if (layer >= 3) {
    for (let track in music[3]) {
      music[3][track].volume(vol);
    }
  }

  sounds.atmosphere.volume(1 - vol);
}
