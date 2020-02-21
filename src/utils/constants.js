const {
    innerHeight: h,
    innerWidth: w
} = window;
export const defaultCategory = 0x0001,
    redCategory = 0x0002,
    BLOCK_WIDTH = 0.1 * w,
    ANGLE_CHANGE_CONST = 0.05,
    CAR_WIDTH = 0.01 * w,
    CAR_HEIGHT = 0.04 * h,
    ANGULAR_VELOCITY_FACTOR = 0.04,
    BRAKE_CONST = 0.0000006 * w,
    REVERSE_CONST = 0.0000012 * w,
    FORCE_CONST = 0.0000024 * w;