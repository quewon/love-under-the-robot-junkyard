var robots = {};
var parts = {
  core: [],
  digger: [],
  movement: [],
};

function init_robots() {
  robots["love"] =
  new Robot(
    "<span class='love'>♥</span>",
    game_win,
    1,
    "<3"
  );

  robots["partstealer1"] = new Robot(
    "<p class='partstealer one'>R</p>",
    function(subject, object) {
      object.fightForParts(subject);
    },
    1,
    "discarded robot",
  );
  robots["partstealer2"] = new Robot(
    "<p class='partstealer two'>R</p>",
    function(subject, object) {
      object.fightForParts(subject);
    },
    1,
    "discarded robot",
    2
  );
  robots["partstealer3"] = new Robot(
    "<p class='partstealer three'>R</p>",
    function(subject, object) {
      object.fightForParts(subject);
    },
    1,
    "discarded robot",
    3
  );
  robots["powersuck1"] = new Robot(
    "<p class='powersuck'>R</p>",
    function(subject, object) {
      let gamble = Math.floor(1 + Math.random() * 3);
      object.fightForPower(subject, gamble);
    },
    1,
    "discarded robot",
    1
  );
  robots["powersuck2"] = new Robot(
    "<p class='powersuck'>R</p>",
    function(subject, object) {
      let gamble = Math.floor(1 + Math.random() * 7);
      object.fightForPower(subject, gamble);
    },
    1,
    "discarded robot",
    3
  );

  if (config.partStolen) {
    robots["partstealer1"].updateTooltip("partstealer");
    robots["partstealer2"].updateTooltip("partstealer");
    robots["partstealer3"].updateTooltip("partstealer");
  }
  if (config.powerSucked) {
    robots["powersuck1"].updateTooltip("powersuck");
    robots["powersuck2"].updateTooltip("powersuck");
  }

  layers.robots = {};
  let l = layers.robots;
  l[1] = ["partstealer1", "powersuck1"];
  l[2] = ["partstealer2", "powersuck1"];
  l[3] = ["partstealer3", "powersuck2"];

  init_player();

  // parts
  parts.core["rubbleconsumer"] = new Part(
    "core",
    "<span class='core new'>X</span>",
    3,
    function(subject) {
      if (subject == robots.player) {
        updateDrainSpeed(config.drainSpeed * 3);
      }
    },
    null,
    "core 2.0",
    // "like new - converts rubble & trash into energy"
    "like new - doesn't do anything particularly special, though"
  );
  parts.core["oldcore"] = new Part(
    "core",
    "<span class='core old'>C</span>",
    1,
    function(subject) {
      if (subject == robots.player) {
        updateDrainSpeed(config.drainSpeed * 1.5);
      }
    },
    null,
    "old core",
    "old - battery drains slower"
  );
  parts.movement["oldbooster"] = new Part(
    "movement",
    "<span class='movement old'>m</span>",
    0,
    function(subject) {
      if (subject == robots.player) {
        addPlayerSpeed(config.speed / 5);
      }
    },
    null,
    "boosters",
    "delicate"
  );
  // parts.movement["newbooster"] = new Part(
  //   "movement",
  //   "<span class='movement old'>m</span>",
  //   1,
  //   function(subject) {
  //     if (subject == robots.player) {
  //       addPlayerSpeed(config.speed / 10);
  //     }
  //   },
  //   null,
  //   "boosters",
  //   "reliable"
  // );
  parts.digger["bigdigger"] = new Part(
    "digger",
    "<span class='movement old'>D</span>",
    2,
    function(subject) {
      subject.digSize += 2;
    },
    null,
    "drill",
    "great - dig wider"
  );

  layers.parts = {};
  l = layers.parts;
  l[1] = {
    core: ["oldcore"],
    digger: ["bigdigger"],
    movement: ["oldbooster"],
  };
  l[2] = {
    core: ["oldcore"],
    digger: ["bigdigger"],
    movement: ["oldbooster"],
  };
  l[3] = {
    core: ["oldcore", "rubbleconsumer"],
    digger: ["bigdigger"],
    movement: ["oldbooster"],
  };

  robots["partstealer1"].gainPart("movement");
  robots["partstealer2"].gainPart("digger");
  robots["partstealer3"].gainPart("core");
  robots["powersuck1"].gainPart("core");
  robots["powersuck2"].gainPart("core");
}

class Robot {
  constructor(name, oncollision, freq, tooltip, layer) {
    this.name = "<p>" + name + "</p>" || "<p>R</p>";
    this.tooltip = tooltip || "";
    this.updateTooltip();

    this.x = 0;
    this.y = 0;
    this.oncollision = oncollision;

    this.inventory = [];
    this.frequency = freq || 1;

    this.layer = layer || 1;

    this.parts = {
      core: [0],
      digger: [0, 0],
      movement: [0, 0],
    };
    this.integrity = 0;
    this.updateIntegrity();

    this.digSize = 1;
  }
  updateTooltip(tooltip) {
    this.tooltip = tooltip || this.tooltip;
    this.display = `<span class='robot' onmouseout='tooltip()' onmouseover='tooltip("` + this.tooltip + `")'>` + this.name + `</span>`;
    lib.robots[this.display] = this;
  }
  spawn(x, y) {
    map[y][x] = this.display;
    this.y = y;
    this.x = x;
  }
  move(dir) {
    let x = this.x;
    let y = this.y;

    if (dir == "left") {
      if (x > 0) {
         x--;
      } else {
        x = config.map_width - 1
      }
    } else if (dir == "right") {
      if (x < config.map_width - 1) {
        x++;
      } else {
        x = 0
      }
    } else if (dir == "down") {
      y++;
    }

    if (this.digSize > 1) {
      let dug = false;

      map[this.y][this.x] = whitespace;
      for (let i=0; i<this.digSize; i++) {
        let newy = y;
        let newx = x;
        let offset = i - Math.floor(this.digSize/2);

        if (dir != "down") {
          newy = y + offset;
        } else {
          newx = x + offset;
        }

        if (newx > config.map_width - 1) {
          newx = 0;
        } else if (newx < 0) {
          newx = config.map_width - 1
        }

        if (newy >= config.map_height - 2) {
          if (newx == robots.love.x && offset == 0) {
            newy = config.map_height - 1
          } else {
            newy = config.map_height - 2
          }
        }

        let candig = this.dig(newx, newy);

        if (typeof candig !== 'boolean') {
          if (candig=="ondig") {
            dug = true;
          } else {
            if (offset == 0) {
              map[this.y][this.x] = this.display;
              candig.oncollision(this, candig);
            }
          }
        }

        if (typeof candig !== 'object' && candig) {
          map[newy][newx] = whitespace;
          if (offset == 0) {
            this.x = newx;
            this.y = newy;
            map[newy][newx] = this.display;
          }
          if (this.layer == 1) {
            if (this.y >= Math.floor(config.map_height/3)) {
              this.layer++;
            }
          } else if (this.layer == 2) {
            if (this.y >= Math.floor(config.map_height/3) * 2) {
              this.layer++;
            }
          }
        } else {
          if (offset == 0) {
            map[this.y][this.x] = this.display;
          }
          continue;
        }
      }

      if (dug) {
        sounds.digs[Math.floor(Math.random() * sounds.digs.length)].play();
      }
    } else {
      let candig = this.dig(x, y);
      if (typeof candig !== 'boolean') {
        if (candig=="ondig") {
          sounds.digs[Math.floor(Math.random() * sounds.digs.length)].play();
        } else {
          candig.oncollision(this, candig);
        }
      }
      if (typeof candig !== 'object' && candig) {
        map[this.y][this.x] = whitespace;
        this.x = x;
        this.y = y;
        map[y][x] = this.display;
        if (this.layer == 1) {
          if (this.y >= Math.floor(config.map_height/3)) {
            this.layer++;
          }
        } else if (this.layer == 2) {
          if (this.y >= Math.floor(config.map_height/3) * 2) {
            this.layer++;
          }
        }
      }
    }
  }
  dig(x, y) {
    if (
      y < config.map_height && y >= 0 &&
      x < config.map_width && x >= 0
    ) {

      let obj = map[y][x];
      if (lib.unbreakable.includes(obj)) {
        return false
      }
      if (obj in lib.robots) {
        return lib.robots[obj];
      }
      obj = obj.replace(/<span(.*?)>/g, "").replace("</span>", "");
      if (lib.diggables.includes(obj)) {
        let d;
        for (let diggable in diggables) {
          if (diggables[diggable].name == obj) {
            d = diggables[diggable];
            break;
          }
        }

        if (d.ondig) {
          d.ondig(this);
          return "ondig"
        }
      } else {
        // sounds.walks[Math.floor(Math.random() * sounds.walks.length)].play();
      }

    } else {
      return false
    }

    return true
  }
  gainPart(type, specific_part) {
    if (specific_part) {
      for (let slot in this.parts[type]) {
        if (this.parts[type][slot] == 0) {
          let options = layers.parts[this.layer][type];
          let random = Math.floor(Math.random() * options.length);

          let part = parts[type][options[random]];
          if (part.ongain) part.ongain(this);
          this.parts[type][slot] = part;

          // put part in mod menu
          if (this == robots.player) {
            ui.mod[type][slot].innerHTML = part.name;
            sounds.partgained.play();
          }

          this.updateIntegrity();
          return
        }
      }
    } else {
      for (let slot in this.parts[type]) {
        if (this.parts[type][slot] == 0) {
          let options = layers.parts[this.layer][type];
          let random = Math.floor(Math.random() * options.length);

          let part = parts[type][options[random]];
          if (part.ongain) part.ongain(this);
          this.parts[type][slot] = part;

          // put part in mod menu
          if (this == robots.player) {
            ui.mod[type][slot].innerHTML = part.name;
            sounds.partgained.play();
          }

          this.updateIntegrity();

          if (!config.discardedDiggerPartFound) {
            if (type=="digger") {
              config.discardedDiggerPartFound = true
            }
          }
          if (!config.discardedMovementPartFound) {
            if (type=="movement") {
              config.discardedMovementPartFound = true
            }
          }
          return
        }
      }
    }
  }
  losePart(type) {
    for (let slot in this.parts[type]) {
      if (this.parts[type][slot] != 0) {
        let partlost = this.parts[type][slot];
        this.parts[type][slot] = 0;

        let icon;
        if (type == "movement") icon = "m";
        else if (type == "digger") icon = "D";
        else if (type == "core") icon = "C";

        ui.mod[type][slot].innerHTML = icon;

        if (this == robots.player) {
          sounds.partstolen.play();
        }

        if (type=="digger") {
          this.digSize -= 2;
        }

        return partlost
      }
    }
  }
  updateIntegrity() {
    let sum = 0;
    let parts = this.parts;
    for (let type in parts) {
      let t = parts[type];
      for (let slot in t) {
        let s = t[slot];
        if (s == 0) {
          sum += -1;
        } else {
          sum += s.integrity;
        }
      }
    }

    this.integrity = sum;

    if (this == robots.player) {
      let player = robots.player;
      let core = player.parts.core[0];
      if (core == 0) {
        ui.mod.core[0].onmouseover = function() {
          tooltip('core //<br/> status: failing<br />integrity: ' + player.integrity)
        };
      } else {
        ui.mod.core[0].onmouseover = function() {
          tooltip(core.ttname + ' //<br/>status: ' + core.tooltip + '<br />integrity: ' + player.integrity)
        }
      }
    }
  }
  fightForParts(robot) {
    if (robot == robots.player) {
      if (!config.partStolen) {
        config.partStolen = true;
      }
    }

    let type;
    if (this.layer >= 1) { type = "movement" }
    if (this.layer >= 2) { type = "digger" }
    if (this.layer >= 3) { type = "core" }

    if (this.integrity >= robot.integrity) {
      // steal a part
      let partlost = robot.losePart(type);

      if (partlost == undefined) {
        a(d.partstealerwithnoparts);
      } else {
        this.gainPart(partlost.type, partlost);
        this.updateIntegrity();
        robot.updateIntegrity();
        a(d.partlost);
      }
    } else {
      let partlost = this.losePart(type);

      if (partlost == undefined) {
        a(d.partstealingwithnoparts);
      } else {
        if (robot == robots.player) {
          robot.gainPart(partlost.type, partlost);
          a(d.takeparts)
          // q(d.takeparts, {
          //   "take its parts": function() {
          //     robot.gainPart(partlost.type, partlost);
          //   },
          //   "offer up a part": function() {
          //
          //   }
          // });
        } else {
          robot.gainPart(partlost.type, partlost);
        }
      }
    }
  }
  fightForPower(subject, gamble) {
    if (subject == robots.player) {
      if (!config.powerSucked) {
        config.powerSucked = true;
      }

      if (this.integrity >= subject.integrity) {
        // suck power
        powerPlayer(-1 * gamble);
        if (subject == robots.player) a(d.powerlost);
      } else {
        powerPlayer(gamble);
        if (subject == robots.player) a(d.powergained);
        map[this.y][this.x] = whitespace;
        refresh();
      }
    }
  }
}

class Part {
  constructor(type, name, integrity, ongain, func, ttname, status) {
    this.type = type;

    this.status = status || "functional";
    this.ttname = ttname || type;
    this.name = `<span onmouseout="tooltip()" onmouseover="tooltip('` + this.ttname + " //<br />status: " + status + `')">` + name + "</span>";
    this.integrity = integrity || 0;
    this.ongain = ongain || null;
    this.func = func || null;
  }
}
