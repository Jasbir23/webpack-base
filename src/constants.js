const {
    innerHeight: h,
    innerWidth: w
} = window;
export const
    GRAVITY = 0.0013 * h,
    getUserURL = "https://d1wrkhocqf21ah.cloudfront.net/api/gamePind",
    postResURL = "https://d1wrkhocqf21ah.cloudfront.net/api/gamePind/result",
    INFINITE_MASS_RADIUS = w / 84,
    BALL_POSITION_CHECK_THRES = 80,
    ROTATION_FAC = 4,
    RIM_HEIGHT = 0.14 * h,
    RANDOM_VX_FAC = 1.2,
    RIM_WIDTH = 0.22 * w + 2 * INFINITE_MASS_RADIUS,
    RIM_LEFT = 0.4 * w,
    RIM_TOP = 0.32 * h,
    BOARD_WIDTH = w * 0.5,
    BOARD_HEIGHT = h * 0.2;