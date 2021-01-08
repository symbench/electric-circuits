/*
 * Copyright (C) 2020 Vanderbilt University, All rights reserved.
 *
 * Authors:
 * Umesh Timalsina
 */
/* globals define */
/* eslint-env browser */
define([], function () {
    const DecoratorUtils = {};
    DecoratorUtils.getAbbrName = function (name, maxLen=4) {
        if(name.length <= maxLen) {
            return name;
        } else {
            return name.substring(0, maxLen) + '..';
        }
    };
    return DecoratorUtils;
});
