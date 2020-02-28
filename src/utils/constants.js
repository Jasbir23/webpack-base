const {
    innerHeight: h,
    innerWidth: w
} = window;
export const defaultCategory = 0x0001,
    redCategory = 0x0002,
    BLOCK_WIDTH = 0.1 * w,
    CAR_WIDTH = 15,
    CAR_HEIGHT = 20,
    ANGULAR_VELOCITY_FACTOR = 0.001,
    POWER_FAC = 0.00002,
    REVERSE_FAC = 0.00001,
    MAX_REVERSE = 0.0007,
    MAX_POWER = 0.0014;