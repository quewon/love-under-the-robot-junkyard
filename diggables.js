var diggables = {};

function init_diggables() {
  diggables["L1_1"] = new Diggable(
    "<p class='ground1_1'>#</p>",
    "$ bit(s) of trash",
    "trash",
    1000);
  diggables["L1_2"] = new Diggable(
    "<p class='ground1_2'>#</p>",
    "$ bit(s) of rubble",
    "rubble",
    1000);
  diggables["L2_1"] = new Diggable(
      "<p class='ground2_1'>#</p>",
      "$ bit(s) of compact trash",
      "compact trash",
      1500);
  diggables["L2_2"] = new Diggable(
      "<p class='ground2_2'>#</p>",
      "$ bit(s) of compact rubble",
      "compact rubble",
      1500);
  diggables["bedrock"] = new Diggable(
      "<p class='bedrock'>#</p>",
      "$ bit(s) of bedrock",
      "bedrock",
      1000);
  diggables["P1"] = new Diggable(
    "<p class='powerbank1'>P</p>",
    null,
    "powerbank",
    1,
    function() {
      powerPlayer(5 + Math.floor(Math.random() * 5));
      a(d.powerbank);
    }
  );
  diggables["p1"] = new Diggable(
    "<p class='powerbank1'>p</p>",
    null,
    "powerbank",
    4,
    function() {
      powerPlayer(1 + Math.floor(Math.random() * 2));
      a(d.powerbank);
    }
  );
  diggables["R1"] = new Diggable(
    "robotspawner",
    null,
    "robotspawner",
    35
  );
  diggables["R2"] = new Diggable(
    "robotspawner",
    null,
    "robotspawner",
    25
  );
  diggables["R3"] = new Diggable(
    "robotspawner",
    null,
    "robotspawner",
    35
  );

  diggables["movement_parts"] = new Diggable(
    "<p class='robot parts movement'>r</p>",
    null,
    "discarded robot parts",
    10,
    function() {
      robots.player.gainPart("movement");
      a(d.movementfound);
      sounds.partgained.play();
    },
  );

  diggables["digger_parts"] = new Diggable(
    "<p class='robot parts digger'>r</p>",
    null,
    "discarded robot parts",
    5,
    function() {
      robots.player.gainPart("digger");
      a(d.diggerfound);
      sounds.partgained.play();
    },
  );

  layers.diggables = {};
  let l = layers.diggables;

  l[1] = ["L1_1", "L1_2", "P1", "p1", "R1", "movement_parts"];
  l[2] = ["L2_1", "L2_2", "R2", "p1", "digger_parts"];
  l[3] = ["bedrock", "P1", "R3", "movement_parts", "digger_parts"];

  if (config.discardedDiggerPartFound) {
    diggables["digger_partrs"].mapTooltip = "drills"
  }
  if (config.discardedMovementPartFound) {
    diggables["movement_parts"].mapTooltip = "boosters"
  }
}

class Diggable {
  constructor(name, tooltip, mapTooltip, frequency, func) {
    this.name = name;
    this.frequency = frequency;
    lib.diggables.push(name);
    this.tooltip = tooltip;
    this.mapTooltip = mapTooltip || "";
    this.ondig = func || this.addToInventory;
  }
  addToInventory(robot) {
    let inv = robot.inventory;

    if (!inv[this.name]) {
      inv[this.name] = {};
      inv[this.name].name = this.name;
      inv[this.name].count = 1;
      inv[this.name].tooltip = this.tooltip;
    } else {
      inv[this.name].count++
    }
  }
}
