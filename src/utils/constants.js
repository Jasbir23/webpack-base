const {
    innerHeight: h,
    innerWidth: w
} = window;
export const defaultCategory = 0x0001,
    redCategory = 0x0002,
    THREE_D_X_SHIFT = -w / 2,
    THREE_D_Y_SHIFT = h / 2,
    BLOCK_WIDTH = 0.1 * w,
    CAR_WIDTH = 6,
    CAR_HEIGHT = 8,
    ANGLE_FACTOR = 0.00094,
    POWER_FAC = 0.000012,
    REVERSE_FAC = 0.000006,
    MAX_REVERSE = 0.00047,
    MAX_POWER = 0.00094;