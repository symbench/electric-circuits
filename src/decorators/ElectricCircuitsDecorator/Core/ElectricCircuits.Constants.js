/* globals define */
/* eslint-env browser */

define([], function () {
    let CONSTANTS = {};

    CONSTANTS.PORT_CLASS = '.port';

    CONSTANTS.TRANSFORMS = {
        PORT_RIGHT: 'translate(15, 10) rotate(180)',
        PORT_LEFT: '',
        PORT_BOTTOM: 'translate(0, 20) rotate(-90)',
        PORT_TOP:'translate(10, 0) rotate(90)',
        VERTICAL_W: '10',
        VERTICAL_H: '20',
        CONTAINER_ONE_TERM_T: 'translate(13.5, 0)',
        CONTAINER_TWO_TERM_T_V: 'translate(21.5, 0)',
        CONTAINER_TWO_TERM_L_H: 'translate(0, 12.7)',
        CONTAINER_TWO_TERM_B_V: 'translate(21.5, 55)',
        CONTAINER_TWO_TERM_R_H: 'translate(65, 12.7)',
        CONTAINER_THREE_TERM_L: 'translate(0, 26.5)',
        CONTAINER_THREE_TERM_T_V: 'translate(30, 0)',
        CONTAINER_THREE_TERM_B_V: 'translate(30, 43)',
    };

    CONSTANTS.POSITIONS = {
        TOP: 'top',
        BOTTOM: 'bottom',
        LEFT: 'left',
        RIGHT: 'right'
    };

    return CONSTANTS;
});
