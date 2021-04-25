var config = {
  map_height: 100,
  map_width: 20,
  gamescreen_height: 20,
  speed: 200,
  starting_level: 5,
  time_limit: undefined,
  drainSpeed: 1000,
  died: 0,
  partStolen: false,
  powerSucked: false,
  mode: "hard",
  discardedMovementPartFound: false,
  discardedDiggerPartFound: false,
};

function minTime() {
  return (config.speed * config.map_height) / config.drainSpeed;
}
