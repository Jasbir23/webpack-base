let { innerHeight, innerWidth } = window;

export function getConstants(height = innerHeight, width = innerWidth) {
  innerHeight = height;
  innerWidth = width;
  const GRAVITY = innerHeight / 110,
    SLOW_VEL_FAC = 0.04,
    getUserURL = "https://api.ewar.in/api/gamePind",
    postResURL = "https://api.ewar.in/api/gamePind/result",
    INFINITE_MASS_RADIUS = innerWidth / 84,
    BALL_POSITION_CHECK_THRES = 80,
    ROTATION_FAC = 4,
    RIM_HEIGHT = 0.14 * innerHeight - (innerHeight / innerWidth) * 10,
    RANDOM_VX_FAC = 0,
    RIM_WIDTH = 0.22 * innerWidth + 2 * INFINITE_MASS_RADIUS,
    RIM_LEFT = 0.4 * innerWidth,
    RIM_TOP = 0.32 * innerHeight,
    BOARD_WIDTH = innerWidth * 0.5,
    SPEED_Y_FACTOR = -13,
    GAME_INTERVAL = 60,
    BOARD_HEIGHT = innerHeight * 0.2,
    WALL_WIDTH_FACTOR = 0.06,
    BALL_RADIUS_FACTOR = innerWidth / 13,
    forceFactor = 0.1,
    BALL_COLLISION_CATEGORY = 1,
    NO_COLLISION_CATEGORY = -1,
    STILL_BALL_STATE = "STILL_BALL_STATE",
    MOVING_BALL_STATE = "MOVING_BALL_STATE",
    COLLIDING_BALL_STATE = "COLLIDING_BALL_STATE",
    DELTA = 20,
    scaleFactor = 0.01,
    largeYForce = -0.065 * innerHeight,
    lessYForce = largeYForce / 2;
  return {
    GRAVITY,
    SLOW_VEL_FAC,
    getUserURL,
    postResURL,
    INFINITE_MASS_RADIUS,
    BALL_POSITION_CHECK_THRES,
    ROTATION_FAC,
    RIM_HEIGHT,
    RANDOM_VX_FAC,
    RIM_WIDTH,
    RIM_LEFT,
    RIM_TOP,
    BOARD_WIDTH,
    SPEED_Y_FACTOR,
    GAME_INTERVAL,
    BOARD_HEIGHT,
    WALL_WIDTH_FACTOR,
    BALL_RADIUS_FACTOR,
    forceFactor,
    BALL_COLLISION_CATEGORY,
    NO_COLLISION_CATEGORY,
    STILL_BALL_STATE,
    MOVING_BALL_STATE,
    COLLIDING_BALL_STATE,
    DELTA,
    scaleFactor,
    largeYForce,
    lessYForce
  };
}
