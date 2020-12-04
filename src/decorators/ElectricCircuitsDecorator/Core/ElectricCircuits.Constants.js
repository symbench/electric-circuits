/*
 * Copyright (C) 2020 Vanderbilt University, All rights reserved.
 *
 * Authors:
 * Umesh Timalsina
 */
/* globals define */
/* eslint-env browser */

define([], function () {
    let CONSTANTS = {};

    CONSTANTS.PORT_CLASS = '.port';
    CONSTANTS.TWO_TERM_OFFSET = 5;
    CONSTANTS.ONE_TERM_OFFSET = 5;
    CONSTANTS.THREE_TERM_OFFSET = 5;
    CONSTANTS.JUNCTION_OFFSET = 5;
    CONSTANTS.TRANSFORMS = {
        PORT_RIGHT: 'translate(15, 10) rotate(180)',
        PORT_LEFT: '',
        PORT_BOTTOM: 'translate(0, 20) rotate(-90)',
        PORT_TOP:'translate(10, 0) rotate(90)',
        VERTICAL_W: '10',
        VERTICAL_H: '20'
    };

    CONSTANTS.POSITIONS = {
        TOP: 'top',
        BOTTOM: 'bottom',
        LEFT: 'left',
        RIGHT: 'right'
    };

    CONSTANTS.CONNECTION_ANGLES = {
        'top' : 270,
        'bottom': 90,
        'left': 180,
        'right': 0
    };

    return CONSTANTS;
});
