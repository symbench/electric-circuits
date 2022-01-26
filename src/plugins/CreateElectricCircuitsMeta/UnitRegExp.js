/*globals define*/
/*eslint-env node, browser*/

define([], function () {
    const SECOND = '<second>';
    const OHM = '<ohm>';
    const HERTZ = '<hertz>';
    const SIEMENS = '<siemens>';
    const HENRY = '<henry>';
    const VOLTS = '<volt>';
    const AMPERE = '<ampere>';
    const FARAD = '<farad>';

    // The PlaceHolders here are based on js-quantities.
    // Further details can be found at
    // https://github.com/gentooboontoo/js-quantities/blob/master/src/quantities/definitions.js

    const UNITS_TO_PLACEHOLDERS = {
        's': SECOND,
        'sec': SECOND,
        'Second': SECOND,
        'seconds': SECOND,
        'Ohm': OHM,
        'ohm': OHM,
        \u03A9: OHM,
        \u2126: OHM,
        'hz': HERTZ,
        'hertz': HERTZ,
        'Hertz': HERTZ,
        'S': SIEMENS,
        'Siemens': SIEMENS,
        'siemens': SIEMENS,
        'H': HENRY,
        'Henry': HENRY,
        'henry': HENRY,
        'V': VOLTS,
        'Volt': VOLTS,
        'volt': VOLTS,
        'volts': VOLTS,
        'A': AMPERE,
        'Ampere': AMPERE,
        'ampere': AMPERE,
        'amp': AMPERE,
        'amps': AMPERE,
        'F': FARAD,
        'farad': FARAD,
        'Farad': FARAD,

    };

    const PLACEHOLDER_TO_UNITS = {};

    Object.entries(UNITS_TO_PLACEHOLDERS).forEach(([k, v]) => {
        if (!PLACEHOLDER_TO_UNITS[v]) {
            PLACEHOLDER_TO_UNITS[v] = [k];
        } else {
            PLACEHOLDER_TO_UNITS[v].push(k);
        }
    });

    const getUnitRegExp = function (unit) {
        const placeHolder = UNITS_TO_PLACEHOLDERS[unit];
        if (placeHolder) {
            const unitsArray = PLACEHOLDER_TO_UNITS[placeHolder];
            return unitsArray.join('|');
        }
    };

    return getUnitRegExp;
});
