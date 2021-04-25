var menu_open = false;

function game_over() {
  config.died++;
  restart();
  tooltip();
  a("you die")
}

function game_win() {
  menu_open = true;
  tooltip();
  clearInterval(countdown);
  ui.game.classList.add("hidden");
  ui.win_menu.classList.remove("hidden");

  if (config.mode == "hard") {
    ui.win_menu.innerHTML = `<h1><span class="love">love</span> under the robot junkyard</h1>
    <p>
      reunited at last.<br /><br />
      you were <em>`+ time +`%</em> away from losing them.<br />
      you died <em>` + config.died + `</em> times to get to them.
      <br /><br />
      <button onclick="sounds.click.play();ui.game.classList.remove('hidden');ui.win_menu.classList.add('hidden');restart()">replay</button>
    </p>`;
  } else {
    ui.win_menu.innerHTML = `<h1><span class="love">love</span> under the robot junkyard</h1>
    <p>
      reunited at last.`+`
      <br /><br />
      <button onclick="sounds.click.play();ui.win_menu.classList.add('hidden');pause();">back to main menu</button>
    </p>`;
  }

  config.died = 0;
}

function pause() {
  if (ui.pause_menu.classList.contains("hidden")) {
    menu_open = true;
    ui.game.classList.add("hidden");
    ui.pause_menu.classList.remove("hidden");
  } else {
    menu_open = false;
    ui.game.classList.remove("hidden");
    ui.pause_menu.classList.add("hidden");
  }
}
