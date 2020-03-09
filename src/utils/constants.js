const {
    innerHeight: h,
    innerWidth: w
} = window;
export const defaultCategory = 0x0001,
    redCategory = 0x0002,
    BLOCK_WIDTH = 0.1 * w,
    CAR_WIDTH = 12,
    CAR_HEIGHT = 16,
    ANGLE_FACTOR = 0.001,
    POWER_FAC = 0.00004,
    REVERSE_FAC = 0.00003,
    MAX_REVERSE = 0.001,
    MAX_POWER = 0.0012;