var lib = {
  unbreakable: ["<p class='lastrow'>#</p>"],
  robots: {},
  diggables: [],
  robotspawner: "robotspawner",
};

var main = document.getElementById("main");
var whitespace = "&nbsp;";

var map = [];
var gamescreen = [];

var layers = {};

function init_map() {
  var range = {
    1: {},
    2: {},
    3: {},
  };
  let lvl;
  for (lvl=1; lvl<=3; lvl++) {
    var r = range[lvl];
    r.freqsum = 0;
    r.freqs = {};

    // for each diggable in layer
    for (let diggable in layers.diggables[lvl]) {
      let d = diggables[layers.diggables[lvl][diggable]]; //diggable info

      for (let i=0; i<d.frequency; i++) {
        r.freqs[r.freqsum + i] = d;
      }
      r.freqsum += d.frequency;
    }
  }

  var botRange = {
    1: {},
    2: {},
    3: {},
  };

  lvl = 1;
  for (lvl=1; lvl<=3; lvl++) {
    var r = botRange[lvl];
    r.freqsum = 0;
    r.freqs = {};

    for (let bot in layers.robots[lvl]) {
      let d = robots[layers.robots[lvl][bot]];

      for (let i=0; i<d.frequency; i++) {
        r.freqs[r.freqsum + i] = d;
      }
      r.freqsum += d.frequency;
    }
  }

  // fill map with diggables and robots
  lvl = 1;
  for (var y=0; y<config.map_height; y++) {
    map[y] = [];

    if (lvl==1) {
      if (y >= Math.floor(config.map_height/3)) {
        lvl++
      }
    } else if (lvl==2) {
      if (y >= Math.floor(config.map_height/3) * 2) {
        lvl++
      }
    }

    for (let x=0; x<config.map_width; x++) {
      let random = Math.floor(Math.random() * range[lvl].freqsum);

      let d = range[lvl].freqs[random];

      // robots
      if (d.name == lib.robotspawner) {
        random = Math.floor(Math.random() * botRange[lvl].freqsum);

        let r = botRange[lvl].freqs[random];

        // r.spawn(x, y);
        map[y][x] = r.display;
        r.x = x;
        r.y = y;
      } else { //diggables
        map[y][x] = "<span onmouseover='tooltip(`" + d.mapTooltip + "`)' onmouseout='tooltip()'>" + d.name + "</span>";
      }
    }
  }

  // the first few lines will be whitespace
  for (let x=0; x<config.starting_level; x++) {
    map[x] = [];
    for (let y=0; y<config.map_width; y++) {
      map[x][y] = whitespace;
    }
  }

  // last layer
  for (let y=0; y<config.map_width; y++) {
    map[config.map_height-1][y] = lib.unbreakable[0];
  }

  robots["love"].spawn(
    Math.floor(Math.random() * (config.map_width-1)),
    config.map_height-1
  );

  // layer above love should be empty
  let tt = diggables.bedrock.mapTooltip;
  let n = diggables.bedrock.name;
  for (let x=0; x<config.map_width; x++) {
    map[robots.love.y-1][x] = "<span onmouseover='tooltip(`" + tt + "`)' onmouseout='tooltip()'>" + n + "</span>";
  }

  robots.player.spawn(
    2, config.starting_level-1
  );
}

function refresh() {
  gamescreen = [];

  const player = robots.player;
  const offset = Math.floor(config.gamescreen_height/2);
  if (player.y > offset) {
    if (player.y > config.map_height-offset) {
      let i = 0;
      for (let x=config.map_height-config.gamescreen_height; x<config.map_height; x++) {
        gamescreen[i] = map[x];
        i++;
      }
    } else {
      let i = 0;
      for (let x=player.y-offset; x<config.gamescreen_height+player.y-offset; x++) {
        gamescreen[i] = map[x];
        i++;
      }
    }
  } else {
    for (let x=0; x<config.gamescreen_height; x++) {
      gamescreen[x] = map[x];
    }
  }

  let text = "";

  for (let x=0; x<gamescreen.length; x++) {
    for (let y=0; y<gamescreen[x].length; y++) {
      text += gamescreen[x][y];
    }
    text += "<br />"
  }

  main.innerHTML = text;
}

function clear(x, y) {
  map[y][x] = whitespace;
  refresh();
}
