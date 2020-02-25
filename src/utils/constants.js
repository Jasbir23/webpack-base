const {
    innerHeight: h,
    innerWidth: w
} = window;
export const defaultCategory = 0x0001,
    redCategory = 0x0002,
    BLOCK_WIDTH = 0.1 * w,
    ANGLE_CHANGE_CONST = 0.05,
    CAR_WIDTH = 15,
    CAR_HEIGHT = 20,
    ANGULAR_VELOCITY_FACTOR = 0.006,
    POWER_FAC = 0.000014,
    REVERSE_FAC = 0.000007,
    MAX_REVERSE = 0.0014,
    MAX_POWER = 0.002;