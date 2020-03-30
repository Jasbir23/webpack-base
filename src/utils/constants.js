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
    TORQUE = 0.0016,
    FORCE_CONSTANT = 0.00000036,