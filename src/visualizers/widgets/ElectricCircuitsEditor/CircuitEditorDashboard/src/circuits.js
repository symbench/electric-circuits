const defineElectricCircuitsDomain = function (joint) {
    const Generic = joint.shapes.basic.Generic;

    const Component = Generic.define('circuit.Component', {
        size: {width: 80, height: 40},
        attrs: {
            '.': {magnet: false},
            '.body': {width: 100, height: 50, align: 'center'},
            circle: {r: 5, stroke: '#000090', fill: '#C0C0C0', 'stroke-width': 1},
            text: {
                fill: 'black',
                ref: '.body',
                'ref-x': '50%',
                'ref-y': '110%',
                'y-alignment': 'middle',
                'text-anchor': 'middle',
                'font-weight': 'bold',
                'font-size': '14px'
            }
        },
    }, {}, {
        toELKJSON: component => {
            return {
                id: component.id,
                name: component.get('attrs').text.text,
                width: component.get('size').width,
                height: component.get('size').height,
                layoutOptions: {
                    portConstraints: 'FIXED_SIDE'
                },
                labels: [{
                    text: component.get('attrs').text.text,
                    layoutOptions: {
                        'nodeLabels.placement': '[H_CENTER, V_BOTTOM, OUTSIDE]'
                    },
                    width: 150,
                    height: 20
                }]
            };
        }
    });

    const Pin = Component.define('circuit.Pin', {
        size: {width: 30, height: 30},
        attrs: {
            '.body': {width: 30, height: 30, fill: 'transparent', magnet: true, stroke: 'black', 'stroke-width': 3},
            text: {
                text: 'Pin',
                ref: '.body',
                'ref-y': 0.5
            }
        }

    }, {
        markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><text/></g>'
    }, {
        toELKJSON: pin => {
            return Component.toELKJSON(pin);
        }
    });

    const SinglePinComponent = Component.define('circuit.SinglePinComponent', {
        attrs: {
            '.pin': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.2, magnet: true, port: 'p', portid: 'p'}
        }
    }, {
        markup: '<g class="rotatable"><g class="scalable"><image class="body"/></g><circle class="pin"/><text/></g>'
    }, {
        toELKJSON: el => {
            const elkJSON = Component.toELKJSON(el);
            elkJSON.ports = [{
                id: el.get('attrs')['.pin'].port,
                layoutOptions: {
                    'port.side': 'NORTH',
                    'port.index': '0'
                },
                width: 7,
                height: 7
            }];
            return elkJSON;
        }
    });

    const TwoPinComponentHorizontal = Component.define('circuit.TwoPinComponentHorizontal', {
        attrs: {
            '.pinp': {ref: '.body', 'ref-x': '5%', 'ref-y': '50%', magnet: true, port: 'p', portid: 'p'},
            '.pinn': {ref: '.body', 'ref-x': '95%', 'ref-y': '50%', magnet: true, port: 'n', portid: 'n'}
        }
    }, {
        markup: '<g class="rotatable"><g class="scalable"><image class="body"/></g><circle class="pinn"/><circle class="pinp"/><text/></g>'
    }, {
        toELKJSON: el => {
            const elkJSON = Component.toELKJSON(el);
            elkJSON.ports = [{
                id: el.get('attrs')['.pinp'].port,
                layoutOptions: {
                    'port.side': 'WEST',
                    'port.index': '0'
                },
                width: 7,
                height: 7,
            }, {
                id: el.get('attrs')['.pinn'].port,
                layoutOptions: {
                    'port.side': 'EAST',
                    'port.index': '1'
                },
                'width': 7,
                'height': 7,
            }];

            return elkJSON;
        }
    });

    const TwoPinComponentVertical = Component.define('circuit.TwoPinComponentVertical', {
        size: {width: 50, height: 100},
        attrs: {
            '.pinp': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.1, magnet: true, port: 'p', portid: 'p'},
            '.pinn': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.9, magnet: true, port: 'n', portid: 'n'},
            '.body': {width: 40, height: 80},
            text: {
                'ref-x': 0.5,
                'ref-y': '110%',
                'y-alignment': 'middle'
            }
        }
    }, {
        markup: '<g class="rotatable"><g class="scalable"><image class="body"/></g><circle class="pinn"/><circle class="pinp"/><text/></g>'
    }, {
        toELKJSON: el => {
            const elkJSON = Component.toELKJSON(el);
            elkJSON.ports = [{
                id: el.get('attrs')['.pinp'].port,
                layoutOptions: {
                    'port.side': 'NORTH',
                    'port.index': '0'
                },
                width: 7,
                height: 7,
            }, {
                id: el.get('attrs')['.pinn'].port,
                layoutOptions: {
                    'port.side': 'SOUTH',
                    'port.index': '1'
                },
                'width': 7,
                'height': 7,
            }];

            return elkJSON;
        }
    });

    const ThreePinComponent = Component.define('circuit.ThreePinComponent', {
        size: {width: 80, height: 80},
        attrs: {
            '.pin1': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.5, magnet: true, port: 'p1', portid: 'p1'},
            '.pin2': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.5, magnet: true, port: 'p2', portid: 'p2'},
            '.pin3': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.5, magnet: true, port: 'p3', portid: 'p3'},
            '.body': {width: 80, height: 80, align: 'center'},
            text: {
                'ref-x': '50%',
                'ref-y': '110%',
                'y-alignment': 'middle'
            }
        }
    }, {
        markup: '<g class="rotatable"><g class="scalable"><image class="body"/></g><circle class="pin1"/><circle class="pin2"/><circle class="pin3"/><text/></g>'
    });

    const FourTerminalComponent = Component.define('circuit.FourTerminalComponent', {
        size: {width: 80, height: 80},
        attrs: {
            '.pin1': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.5, magnet: 'passive', port: 'p1', portid: 'p1'},
            '.pin2': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.5, magnet: 'passive', port: 'n1', portid: 'n1'},
            '.pin3': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.5, magnet: 'passive', port: 'p2', portid: 'p2'},
            '.pin4': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.5, magnet: 'passive', port: 'n2', portid: 'n2'},
            '.body': {width: 80, height: 80, align: 'center'},
            text: {
                'ref-x': 0.5,
                'ref-y': '110%',
                'y-alignment': 'middle'
            }
        }
    }, {
        markup: '<g class="rotatable"><g class="scalable"><image class="body"/></g><circle class="pin1"/><circle class="pin2"/><circle class="pin3"/><circle class="pin4"/><text/></g>'
    });

    const FiveTerminalComponent = Component.define('circuit.FiveTerminalComponent', {
        size: {width: 80, height: 80},
        attrs: {
            '.pin1': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.5, magnet: 'passive', port: 'p1', portid: 'p1'},
            '.pin2': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.5, magnet: 'passive', port: 'p2', portid: 'p2'},
            '.pin3': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.5, magnet: 'passive', port: 'p3', portid: 'p3'},
            '.pin4': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.5, magnet: 'passive', port: 'p4', portid: 'p4'},
            '.pin5': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.5, magnet: 'passive', port: 'p5', portid: 'p5'},
            '.body': {width: 80, height: 80, align: 'center'},
            text: {
                'ref-x': 0.5,
                'ref-y': 0.875,
                'y-alignment': 'middle'
            }
        }
    }, {
        markup: '<g class="rotatable"><g class="scalable"><image class="body"/></g><circle class="pin1"/><circle class="pin2"/><circle class="pin3"/><circle class="pin4"/><circle class="pin5"/><text/></g>'
    });

    const Ground = SinglePinComponent.define('circuit.Ground', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiB4MT0iMTUiIHkxPSIzMCIgeDI9IjQ1IiB5Mj0iMzAiIGlkPSJzdmdfMSIKICAgICAgICAgICAgICBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHgxPSIyMCIgeTE9IjM0IiB4Mj0iNDAiIHkyPSIzNCIgaWQ9InN2Z18zIgogICAgICAgICAgICAgIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgeDE9IjI1IiB5MT0iMzgiIHgyPSIzNiIgeTI9IjM4IiBpZD0ic3ZnXzQiCiAgICAgICAgICAgICAgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z181IiB5Mj0iMzAiIHgyPSIzMCIgeTE9IjEwIiB4MT0iMzAiCiAgICAgICAgICAgICAgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgPC9nPgogICAgPGcgY2xhc3M9InBvcnRzIj4KICAgICAgICA8ZyBjbGFzcz0icG9ydCI+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4K'},
            text: {text: 'Ground'}
        }
    });

    const Resistor = TwoPinComponentHorizontal.define('circuit.Resistor', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI0MCI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z18xIiB5Mj0iMjAiIHgyPSIyMCIgeTE9IjIwIiB4MT0iMTAiCiAgICAgICAgICAgICAgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzIiIHkyPSIyMCIgeDI9IjcwIiB5MT0iMjAiIHgxPSI2MCIKICAgICAgICAgICAgICBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlPSIjMDAwIiB0cmFuc2Zvcm09InJvdGF0ZSgtMTUuOTUxNjMyNDk5Njk0ODI0IDIwLjc4OTQ2NDk1MDU2MTUxNiwxNi42OTQwNzY1MzgwODU5MzgpICIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfNSIgeTI9IjE5LjgyNTM1IiB4Mj0iMTguMTM1NiIgeTE9IjEzLjU2MjgiIHgxPSIyMy40NDMzNCIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzYiIHkyPSIyNCIgeDI9IjI1LjI2MzE2IiB5MT0iMTMiIHgxPSIyMS45NzM2OCIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzciIHkyPSIxMy4wMDk4NyIgeDI9IjI4LjIxMDUzIiB5MT0iMjMuNTM2MTgiIHgxPSIyNS4yMTA1MyIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzE5IiB5Mj0iMjQiIHgyPSIzMS4wNTI2MyIgeTE9IjEzIiB4MT0iMjcuNzYzMTYiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z18yMCIgeTI9IjEzLjAwOTg3IiB4Mj0iMzQiIHkxPSIyMy41MzYxOCIgeDE9IjMxIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfMjEiIHkyPSIyNCIgeDI9IjM3LjEwNTI2IiB5MT0iMTMiIHgxPSIzMy44MTU3OSIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzIyIiB5Mj0iMTMuMDA5ODciIHgyPSI0MC4wNTI2MyIgeTE9IjIzLjUzNjE4IiB4MT0iMzcuMDUyNjMiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z18yMyIgeTI9IjI0IiB4Mj0iNDIuODk0NzQiIHkxPSIxMyIgeDE9IjM5LjYwNTI2IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfMjQiIHkyPSIxMy4wMDk4NyIgeDI9IjQ1Ljg0MjEiIHkxPSIyMy41MzYxOCIgeDE9IjQyLjg0MjEiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z18yNSIgeTI9IjI0IiB4Mj0iNDkuMjEwNTIiIHkxPSIxMyIgeDE9IjQ1LjkyMTA1IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfMjYiIHkyPSIxMy4wMDk4NyIgeDI9IjUyLjE1Nzg5IiB5MT0iMjMuNTM2MTgiIHgxPSI0OS4xNTc4OSIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzI3IiB5Mj0iMjQiIHgyPSI1NSIgeTE9IjEzIiB4MT0iNTEuNzEwNTIiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z18yOCIgeTI9IjEzLjAwOTg3IiB4Mj0iNTcuOTQ3MzciIHkxPSIyMy41MzYxOCIgeDE9IjU0Ljk0NzM3IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgdHJhbnNmb3JtPSJyb3RhdGUoLTYyLjgwOTM0OTA2MDA1ODU5NCA1OS4yMTA1MTc4ODMzMDA3OCwxNi42OTQwNzY1MzgwODU5MzQpICIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfMjkiIHkyPSIxOS44MjUzNSIgeDI9IjU2LjU1NjY0IiB5MT0iMTMuNTYyOCIgeDE9IjYxLjg2NDM5IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgogICAgPC9nPgogICAgPGcgY2xhc3M9InBvcnRzIj4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1wIi8+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtbiIvPgogICAgPC9nPgo8L3N2Zz4K'},
            text: {text: 'Resistor'},
        }
    });

    const VariableResistor = TwoPinComponentHorizontal.define('circuit.VariableResistor', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI0MCI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiB4MT0iMTAiIHkxPSIyMCIgeDI9IjIwIiB5Mj0iMjAiIGlkPSJzdmdfMSIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiB4MT0iNjAiIHkxPSIyMCIgeDI9IjcwIiB5Mj0iMjAiIGlkPSJzdmdfMiIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjIzLjQ0MzM0IiB5MT0iMTMuNTYyOCIgeDI9IjE4LjEzNTYiIHkyPSIxOS44MjUzNSIgaWQ9InN2Z181IiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgdHJhbnNmb3JtPSJyb3RhdGUoLTE1Ljk1MTYzMjQ5OTY5NDgyNCAyMC43ODk0NjQ5NTA1NjE1MTYsMTYuNjk0MDc2NTM4MDg1OTM4KSAiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjEuOTczNjgiIHkxPSIxMyIgeDI9IjI1LjI2MzE2IiB5Mj0iMjQiIGlkPSJzdmdfNiIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjUuMjEwNTMiIHkxPSIyMy41MzYxOCIgeDI9IjI4LjIxMDUzIiB5Mj0iMTMuMDA5ODciIGlkPSJzdmdfNyIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjcuNzYzMTYiIHkxPSIxMyIgeDI9IjMxLjA1MjYzIiB5Mj0iMjQiIGlkPSJzdmdfMTkiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2U9IiMwMDAiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjMxIiB5MT0iMjMuNTM2MTgiIHgyPSIzNCIgeTI9IjEzLjAwOTg3IiBpZD0ic3ZnXzIwIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlPSIjMDAwIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSIzMy44MTU3OSIgeTE9IjEzIiB4Mj0iMzcuMTA1MjYiIHkyPSIyNCIgaWQ9InN2Z18yMSIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMzcuMDUyNjMiIHkxPSIyMy41MzYxOCIgeDI9IjQwLjA1MjYzIiB5Mj0iMTMuMDA5ODciIGlkPSJzdmdfMjIiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2U9IiMwMDAiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjM5LjYwNTI2IiB5MT0iMTMiIHgyPSI0Mi44OTQ3NCIgeTI9IjI0IiBpZD0ic3ZnXzIzIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlPSIjMDAwIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSI0Mi44NDIxIiB5MT0iMjMuNTM2MTgiIHgyPSI0NS44NDIxIiB5Mj0iMTMuMDA5ODciIGlkPSJzdmdfMjQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2U9IiMwMDAiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjQ1LjkyMTA1IiB5MT0iMTMiIHgyPSI0OS4yMTA1MiIgeTI9IjI0IiBpZD0ic3ZnXzI1IiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlPSIjMDAwIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSI0OS4xNTc4OSIgeTE9IjIzLjUzNjE4IiB4Mj0iNTIuMTU3ODkiIHkyPSIxMy4wMDk4NyIgaWQ9InN2Z18yNiIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iNTEuNzEwNTIiIHkxPSIxMyIgeDI9IjU1IiB5Mj0iMjQiIGlkPSJzdmdfMjciIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2U9IiMwMDAiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjU0Ljk0NzM3IiB5MT0iMjMuNTM2MTgiIHgyPSI1Ny45NDczNyIgeTI9IjEzLjAwOTg3IiBpZD0ic3ZnXzI4IiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlPSIjMDAwIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSI2MS44NjQzOSIgeTE9IjEzLjU2MjgiIHgyPSI1Ni41NTY2NCIgeTI9IjE5LjgyNTM1IiBpZD0ic3ZnXzI5IiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgdHJhbnNmb3JtPSJyb3RhdGUoLTYyLjgwOTM0OTA2MDA1ODU5NCA1OS4yMTA1MTc4ODMzMDA3OCwxNi42OTQwNzY1MzgwODU5MzQpICIgc3Ryb2tlPSIjMDAwIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z18zIiB5Mj0iMTEuODMxNjgiIHgyPSI2Mi4yNzcyMyIgeTE9IjI0LjkwMDk5IiB4MT0iMTkuMTA4OTEiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfNCIgeTI9IjEyLjAyOTciIHgyPSI2Mi4yNzcyMyIgeTE9IjEwLjg0MTU4IiB4MT0iNTguOTEwODkiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSB0cmFuc2Zvcm09InJvdGF0ZSgxMDQuNzE5NzExMzAzNzEwOTQgNjEuMTg4MTE3OTgwOTU3MDMsMTIuODIxNzgyMTEyMTIxNTgpICIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfOSIgeTI9IjEzLjQxNTg0IiB4Mj0iNjIuODcxMjkiIHkxPSIxMi4yMjc3MiIgeDE9IjU5LjUwNDk1IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICA8L2c+CiAgICA8ZyBjbGFzcz0icG9ydHMiPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LXAiLz4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1uIi8+CiAgICA8L2c+Cjwvc3ZnPgo='},
            text: {text: 'VariableResistor'},
        }
    });

    const Capacitor = TwoPinComponentHorizontal.define('circuit.Capacitor', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8cGF0aCBpZD0ic3ZnXzEiIGQ9Im0xLDI4MC4zNzVsMTQ5LC0yNjAuNzVsMTQ5LDI2MC43NWwtMjk4LDB6IiBmaWxsLW9wYWNpdHk9IjAiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPHBhdGggaWQ9InN2Z18yIiBkPSJtMSwyODAuMzc1bDE0OSwtMjYwLjc1bDE0OSwyNjAuNzVsLTI5OCwweiIgZmlsbC1vcGFjaXR5PSIwIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49Im51bGwiIGlkPSJzdmdfOCIgeTI9IjM1IiB4Mj0iMzAiIHkxPSI1IiB4MT0iMzAiIGZpbGwtb3BhY2l0eT0iMCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzkiIHkyPSIzNSIgeDI9IjUwIiB5MT0iNSIgeDE9IjUwIiBmaWxsLW9wYWNpdHk9IjAiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z18xMCIgeTI9IjIwIiB4Mj0iMzAuMTc4NTciIHkxPSIyMCIgeDE9IjUiIGZpbGwtb3BhY2l0eT0iMCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzExIiB5Mj0iMjAiIHgyPSI3NS4xNzg1NyIgeTE9IjIwIiB4MT0iNTAiIGZpbGwtb3BhY2l0eT0iMCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8dGV4dCBmb250LXdlaWdodD0ibm9ybWFsIiB4bWw6c3BhY2U9InByZXNlcnZlIiB0ZXh0LWFuY2hvcj0ic3RhcnQiIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBpZD0ic3ZnXzEyIiB5PSIxMy4wMTMzOSIgeD0iMjIuMzIxNDMiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjAiIHN0cm9rZT0iIzAwMCIgZmlsbD0iIzAwMDAwMCI+KzwvdGV4dD4KICAgIDwvZz4KICAgIDxnIGNsYXNzPSJwb3J0cyI+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtcCIvPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LW4iLz4KICAgIDwvZz4KPC9zdmc+Cg=='},
            text: {text: 'Capacitor'},
        }
    });

    const VariableCapacitor = TwoPinComponentHorizontal.define('circuit.VariableCapacitor', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSIwIiBkPSJtMSwyODAuMzc1bDE0OSwtMjYwLjc1bDE0OSwyNjAuNzVsLTI5OCwweiIgaWQ9InN2Z18xIi8+CiAgICAgICAgPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0iMCIgZD0ibTEsMjgwLjM3NWwxNDksLTI2MC43NWwxNDksMjYwLjc1bC0yOTgsMHoiIGlkPSJzdmdfMiIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9IjAiIHgxPSIzMCIgeTE9IjUiIHgyPSIzMCIgeTI9IjM1IiBpZD0ic3ZnXzgiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSIwIiB4MT0iNTAiIHkxPSI1IiB4Mj0iNTAiIHkyPSIzNSIgaWQ9InN2Z185IiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0iMCIgeDE9IjUiIHkxPSIyMCIgeDI9IjMwLjE3ODU3IiB5Mj0iMjAiIGlkPSJzdmdfMTAiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSIwIiB4MT0iNTAiIHkxPSIyMCIgeDI9Ijc1LjE3ODU3IiB5Mj0iMjAiIGlkPSJzdmdfMTEiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiLz4KICAgICAgICA8bGluZSBzdHJva2U9IiMwMDAiIHRyYW5zZm9ybT0icm90YXRlKDguMDE3OTk5NjQ5MDQ3ODUyIDM5Ljk5OTk5NjE4NTMwMjczNCwxOS4xNzc5MjEyOTUxNjYwMTIpICIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfMyIgeTI9IjQuNTM5NzMiIHgyPSI1Ni43OTY2NiIgeTE9IjMzLjgxNjEyIiB4MT0iMjMuMjAzMzMiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfNCIgeTI9IjcuMzI0MjciIHgyPSI1OC4zNjQ3NSIgeTE9IjYuNDIzMzciIHgxPSI1My40OTk4OSIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgdHJhbnNmb3JtPSJyb3RhdGUoLTkwIDU3LjcwOTk5NTI2OTc3NTM5LDkuNTMyNzg5MjMwMzQ2Njc0KSAiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzUiIHkyPSI5Ljk4MzI0IiB4Mj0iNjAuMTQyNDMiIHkxPSI5LjA4MjM0IiB4MT0iNTUuMjc3NTYiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICA8L2c+CiAgICA8ZyBjbGFzcz0icG9ydHMiPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LXAiLz4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1uIi8+CiAgICA8L2c+Cjwvc3ZnPgo='},
            text: {text: 'VariableCapacitor'},
        }
    });

    const Inductor = TwoPinComponentHorizontal.define('circuit.Inductor', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzEiIHkyPSIyMCIgeDI9IjI1IiB5MT0iMjAiIHgxPSI1IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z18yIiB5Mj0iMjAiIHgyPSI3NSIgeTE9IjIwIiB4MT0iNTQuNTM4NDYiCiAgICAgICAgICAgICAgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxwYXRoIGQ9Ik0yNSAyMCBBIDAuMSAwLjEgMCAwIDEgMzUgMjAgTSAzNSAyMCBBIDAuMSAwLjEgMCAwIDEgNDUgMjAgTSA0NSAyMCBBIDAuMSAwLjEgMCAwIDEgNTUgMjAiCiAgICAgICAgICAgICAgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIvPgogICAgPC9nPgogICAgPGcgY2xhc3M9InBvcnRzIj4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1wIi8+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtbiIvPgogICAgPC9nPgo8L3N2Zz4K'},
            text: {text: 'Inductor'}
        }
    });

    const SaturatingInductor = Inductor.define('circuit.SaturatingInductor', {
        attrs: {
            text: {text: 'SaturatingInductor'}
        }
    });

    const VariableInductor = TwoPinComponentHorizontal.define('circuit.VariableInductor', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8bGluZSBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzMiIHkyPSIxMS44MzE2OCIgeDI9IjYyLjI3NzIzIiB5MT0iMjQuOTAwOTkiIHgxPSIxOS4xMDg5MSIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z180IiB5Mj0iMTIuMDI5NyIgeDI9IjYyLjI3NzIzIiB5MT0iMTAuODQxNTgiIHgxPSI1OC45MTA4OSIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHRyYW5zZm9ybT0icm90YXRlKDEwNC43MTk3MTEzMDM3MTA5NCA2MS4xODgxMTc5ODA5NTcwMywxMi44MjE3ODIxMTIxMjE1OCkgIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z185IiB5Mj0iMTMuNDE1ODQiIHgyPSI2Mi44NzEyOSIgeTE9IjEyLjIyNzcyIiB4MT0iNTkuNTA0OTUiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iNSIgeTE9IjIwIiB4Mj0iMjUiIHkyPSIyMCIgaWQ9InN2Z18xIiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjU0LjUzODQ2IiB5MT0iMjAiIHgyPSI3NSIgeTI9IjIwIiBpZD0ic3ZnXzIiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiLz4KICAgICAgICA8cGF0aCBpZD0ic3ZnXzUiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiIGQ9Im0yNSwyMGEwLjEsMC4xIDAgMCAxIDEwLDBtMCwwYTAuMSwwLjEgMCAwIDEgMTAsMG0wLDBhMC4xLDAuMSAwIDAgMSAxMCwwIi8+CiAgICA8L2c+CiAgICA8ZyBjbGFzcz0icG9ydHMiPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LXAiLz4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1uIi8+CiAgICA8L2c+Cjwvc3ZnPgo='},
            text: {text: 'VariableInductor'}
        }
    });

    const Conductor = TwoPinComponentHorizontal.define('circuit.Conductor', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KCiAgICA8Zz4KICAgICAgICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgeDE9IjEwIiB5MT0iMjAiIHgyPSIyMCIgeTI9IjIwIiBpZD0ic3ZnXzEiCiAgICAgICAgICAgICAgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiB4MT0iNjAiIHkxPSIyMCIgeDI9IjcwIiB5Mj0iMjAiIGlkPSJzdmdfMiIKICAgICAgICAgICAgICBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIvPgogICAgICAgIDxyZWN0IGlkPSJzdmdfOSIgaGVpZ2h0PSIxMi4wOTg3NiIgd2lkdGg9IjM5Ljk5OTk5IiB5PSIxNC4wMTIzNSIgeD0iMTkuNjI5NjQiIGZpbGwtb3BhY2l0eT0ibnVsbCIKICAgICAgICAgICAgICBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgPC9nPgoKICAgIDxnIGlkPSJzdmdfMyIgY2xhc3M9InBvcnRzIj4KICAgICAgICA8ZyBpZD0ic3ZnXzQiIGNsYXNzPSJwb3J0LXAiLz4KICAgICAgICA8ZyBpZD0ic3ZnXzgiIGNsYXNzPSJwb3J0LW4iLz4KICAgIDwvZz4KCjwvc3ZnPgo='},
            text: {text: 'Conductor'}
        }
    });

    const VariableConductor = TwoPinComponentHorizontal.define('circuit.VariableConductor', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KCiAgICA8Zz4KICAgICAgICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgeDE9IjEwIiB5MT0iMjAiIHgyPSIyMCIgeTI9IjIwIiBpZD0ic3ZnXzEiCiAgICAgICAgICAgICAgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiB4MT0iNjAiIHkxPSIyMCIgeDI9IjcwIiB5Mj0iMjAiIGlkPSJzdmdfMiIKICAgICAgICAgICAgICBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIvPgogICAgICAgIDxyZWN0IGlkPSJzdmdfOSIgaGVpZ2h0PSIxMi4wOTg3NiIgd2lkdGg9IjM5Ljk5OTk5IiB5PSIxNC4wMTIzNSIgeD0iMTkuNjI5NjQiIGZpbGwtb3BhY2l0eT0ibnVsbCIKICAgICAgICAgICAgICBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgdHJhbnNmb3JtPSJyb3RhdGUoOC4wMTc5OTk2NDkwNDc4NTIgMzkuOTk5OTk2MTg1MzAyNzM0LDE5LjE3NzkyMTI5NTE2NjAxMikgIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z18zIiB5Mj0iNC41Mzk3MyIgeDI9IjU2Ljc5NjY2IiB5MT0iMzMuODE2MTIiIHgxPSIyMy4yMDMzMyIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z180IiB5Mj0iNy4zMjQyNyIgeDI9IjU4LjM2NDc1IiB5MT0iNi40MjMzNyIgeDE9IjUzLjQ5OTg5IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlPSIjMDAwIiB0cmFuc2Zvcm09InJvdGF0ZSgtOTAgNTcuNzA5OTk1MjY5Nzc1MzksOS41MzI3ODkyMzAzNDY2NzQpICIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfNSIgeTI9IjkuOTgzMjQiIHgyPSI2MC4xNDI0MyIgeTE9IjkuMDgyMzQiIHgxPSI1NS4yNzc1NiIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz4KICAgIDwvZz4KCiAgICA8ZyBpZD0ic3ZnXzMiIGNsYXNzPSJwb3J0cyI+CiAgICAgICAgPGcgaWQ9InN2Z180IiBjbGFzcz0icG9ydC1wIi8+CiAgICAgICAgPGcgaWQ9InN2Z184IiBjbGFzcz0icG9ydC1uIi8+CiAgICA8L2c+Cgo8L3N2Zz4K'},
            text: {text: 'VariableConductor'}
        }
    });

    const Diode = TwoPinComponentHorizontal.define('circuit.Diode', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8bGluZSBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzEiIHkyPSIyMCIgeDI9IjI4IiB5MT0iMjAiIHgxPSI1IiBmaWxsLW9wYWNpdHk9IjAiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfMiIgeTI9IjIwLjE3MTU3IiB4Mj0iNzUiIHkxPSIyMCIgeDE9IjUyIiBmaWxsLW9wYWNpdHk9IjAiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxwYXRoIHN0cm9rZT0iIzAwMCIgdHJhbnNmb3JtPSJyb3RhdGUoOTAgMzkuNDMxMTg2Njc2MDI1NCwxOS44MjEwNzczNDY4MDE3NikgIiBpZD0ic3ZnXzQiIGQ9Im0yOC41Nzg5NCwzMS4xNTQzNWwxMC44NTIyNCwtMjIuNjY2NTVsMTAuODUyMjQsMjIuNjY2NTVsLTIxLjcwNDQ5LDB6IiBmaWxsLW9wYWNpdHk9IjAiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49Im51bGwiIGlkPSJzdmdfNyIgeTI9IjMwIiB4Mj0iNTEuOTYwNzMiIHkxPSI5LjU4MzM4IiB4MT0iNTEuNTY4NTciIGZpbGwtb3BhY2l0eT0iMCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzgiIHkyPSIyNC44Nzc0MyIgeDI9IjExMy41MjkwNiIgeTE9IjI0Ljg3NzQzIiB4MT0iMTEzLjkyMTIxIiBmaWxsLW9wYWNpdHk9IjAiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICA8L2c+CiAgICA8ZyBjbGFzcz0icG9ydHMiPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LXAiLz4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1uIi8+CiAgICA8L2c+Cjwvc3ZnPgo='},
            text: {text: 'Diode'},
        }
    });

    const ZDiode = TwoPinComponentHorizontal.define('circuit.ZDiode', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0iMCIgeDE9IjUiIHkxPSIyMCIgeDI9IjI4IiB5Mj0iMjAiIGlkPSJzdmdfMSIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSIwIiB4MT0iNTIiIHkxPSIyMCIgeDI9Ijc1IiB5Mj0iMjAuMTcxNTciIGlkPSJzdmdfMiIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSIwIiBkPSJtMjguNTc4OTQsMzEuMTU0MzVsMTAuODUyMjQsLTIyLjY2NjU1bDEwLjg1MjI0LDIyLjY2NjU1bC0yMS43MDQ0OSwwbDAuMDAwMDEsMHoiIGlkPSJzdmdfNCIgdHJhbnNmb3JtPSJyb3RhdGUoOTAgMzkuNDMxMTg2Njc2MDI1NCwxOS44MjEwNzczNDY4MDE3NikgIiBzdHJva2U9IiMwMDAiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSIwIiB4MT0iNTEuNTY4NTciIHkxPSI5LjU4MzM4IiB4Mj0iNTEuOTYwNzMiIHkyPSIzMCIgaWQ9InN2Z183IiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0iMCIgeDE9IjExMy45MjEyMSIgeTE9IjI0Ljg3NzQzIiB4Mj0iMTEzLjUyOTA2IiB5Mj0iMjQuODc3NDMiIGlkPSJzdmdfOCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBzdHJva2UtbGluZWNhcD0ibnVsbCIvPgogICAgICAgIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzkiIHkyPSIxMCIgeDI9IjUyIiB5MT0iMyIgeDE9IjQ0IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfMTAiIHkyPSIzNyIgeDI9IjYwIiB5MT0iMzAiIHgxPSI1MiIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgPC9nPgogICAgPGcgY2xhc3M9InBvcnRzIj4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1wIi8+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtbiIvPgogICAgPC9nPgo8L3N2Zz4K'},
            text: {text: 'ZDiode'},
        }
    });

    const SchottkyDiode = TwoPinComponentHorizontal.define('circuit.SchottkyDiode', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0iMCIgeDE9IjUiIHkxPSIyMCIgeDI9IjI4IiB5Mj0iMjAiIGlkPSJzdmdfMSIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSIwIiB4MT0iNTIiIHkxPSIyMCIgeDI9Ijc1IiB5Mj0iMjAuMTcxNTciIGlkPSJzdmdfMiIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSIwIiBkPSJtMjguNTc4OTQsMzEuMTU0MzVsMTAuODUyMjQsLTIyLjY2NjU1bDEwLjg1MjI0LDIyLjY2NjU1bC0yMS43MDQ0OSwwbDAuMDAwMDEsMHoiIGlkPSJzdmdfNCIgdHJhbnNmb3JtPSJyb3RhdGUoOTAgMzkuNDMxMTc1MjMxOTMzNiwxOS44MjEwNzU0Mzk0NTMxMykgIiBzdHJva2U9IiMwMDAiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSIwIiB4MT0iNTEuNTY4NTciIHkxPSI5LjU4MzM4IiB4Mj0iNTEuOTYwNzMiIHkyPSIzMCIgaWQ9InN2Z183IiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0iMCIgeDE9IjExMy45MjEyMSIgeTE9IjI0Ljg3NzQzIiB4Mj0iMTEzLjUyOTA2IiB5Mj0iMjQuODc3NDMiIGlkPSJzdmdfOCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBzdHJva2UtbGluZWNhcD0ibnVsbCIvPgogICAgICAgIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49Im51bGwiIGlkPSJzdmdfNSIgeTI9IjkuMjA5NzUiIHgyPSItMjEuODU0MDEiIHkxPSI5LjUxMzciIHgxPSItMjIuMTU3OTYiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzE2IiB5Mj0iMTAiIHgyPSI1NS45MTE4NSIgeTE9IjEwIiB4MT0iNTAuOTExODUiIGZpbGwtb3BhY2l0eT0iMCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzE3IiB5Mj0iMjkuNDUyODYiIHgyPSI1Mi41NjgzOSIgeTE9IjI5LjQ1Mjg2IiB4MT0iNDcuNTY4MzkiIGZpbGwtb3BhY2l0eT0iMCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSB0cmFuc2Zvcm09InJvdGF0ZSg5MCA1NS4yMzU1NTc1NTYxNTIzNDQsMTIuMTI3NjU0MDc1NjIyNTY0KSAiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49Im51bGwiIGlkPSJzdmdfMTgiIHkyPSIxMi4xMjc2NiIgeDI9IjU3LjczNTU2IiB5MT0iMTIuMTI3NjYiIHgxPSI1Mi43MzU1NiIgZmlsbC1vcGFjaXR5PSIwIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHRyYW5zZm9ybT0icm90YXRlKDkwIDQ4LjI0NDY3ODQ5NzMxNDQ2LDI3LjYyOTE2NzU1Njc2MjcpICIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z18xOSIgeTI9IjI3LjYyOTE1IiB4Mj0iNTAuNzQ0NjkiIHkxPSIyNy42MjkxNSIgeDE9IjQ1Ljc0NDY5IiBmaWxsLW9wYWNpdHk9IjAiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICA8L2c+CiAgICA8ZyBjbGFzcz0icG9ydHMiPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LXAiLz4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1uIi8+CiAgICA8L2c+Cjwvc3ZnPgo='},
            text: {text: 'SchottkyDiode'},
        }
    });

    const LED = TwoPinComponentHorizontal.define('circuit.LED', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0iMCIgeDE9IjUiIHkxPSIyMCIgeDI9IjI4IiB5Mj0iMjAiIGlkPSJzdmdfMSIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSIwIiB4MT0iNTIiIHkxPSIyMCIgeDI9Ijc1IiB5Mj0iMjAuMTcxNTciIGlkPSJzdmdfMiIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxwYXRoIGNsYXNzPSJmaWxsLWNvbG9yIiBmaWxsPSJyZWQiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSIxIgogICAgICAgICAgICAgIGQ9Im0yOC41Nzg5NCwzMS4xNTQzNWwxMC44NTIyNCwtMjIuNjY2NTVsMTAuODUyMjQsMjIuNjY2NTVsLTIxLjcwNDQ5LDBsMC4wMDAwMSwweiIgaWQ9InN2Z180IiB0cmFuc2Zvcm09InJvdGF0ZSg5MCAzOS40MzExNzUyMzE5MzM2LDE5LjgyMTA3NTQzOTQ1MzEzKSAiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9IjAiIHgxPSI1MS41Njg1NyIgeTE9IjkuNTgzMzgiIHgyPSI1MS45NjA3MyIgeTI9IjMwIiBpZD0ic3ZnXzciIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSIwIiB4MT0iMTEzLjkyMTIxIiB5MT0iMjQuODc3NDMiIHgyPSIxMTMuNTI5MDYiIHkyPSIyNC44Nzc0MyIgaWQ9InN2Z184IiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z181IiB5Mj0iOS4yMDk3NSIgeDI9Ii0yMS44NTQwMSIgeTE9IjkuNTEzNyIgeDE9Ii0yMi4xNTc5NiIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49Im51bGwiIGlkPSJzdmdfMTAiIHkyPSI3LjA4MjA5IiB4Mj0iNDguOTY2NTUiIHkxPSIxMy4xNjExMSIgeDE9IjQzLjQ5NTQ0IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z18xMSIgeTI9IjcuMDgyMDkiIHgyPSI0OS4yNzA1IiB5MT0iNy42ODk5OSIgeDE9IjQ0LjQwNzI5IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgdHJhbnNmb3JtPSJyb3RhdGUoLTg4LjMxNTM1MzM5MzU1NDY5IDQ4Ljk2NjU1MjczNDM3NTAxLDkuMjA5NzQ1NDA3MTA0NDkyKSAiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49Im51bGwiIGlkPSJzdmdfMTIiIHkyPSI4LjkwNTc5IiB4Mj0iNTEuMzk4MTYiIHkxPSI5LjUxMzciIHgxPSI0Ni41MzQ5NCIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49Im51bGwiIGlkPSJzdmdfMyIgeTI9IjMuNDM0NjgiIHgyPSI0Mi41ODM1OCIgeTE9IjkuNTEzNyIgeDE9IjM3LjExMjQ3IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z182IiB5Mj0iMy40MzQ2OCIgeDI9IjQyLjg4NzUzIiB5MT0iNC4wNDI1OCIgeDE9IjM4LjAyNDMyIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgdHJhbnNmb3JtPSJyb3RhdGUoLTg4LjMxNTM1MzM5MzU1NDY5IDQyLjU4MzU4MDAxNzA4OTg0NCw1LjU2MjMzNTAxNDM0MzI2MzUpICIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z185IiB5Mj0iNS4yNTgzOCIgeDI9IjQ1LjAxNTE5IiB5MT0iNS44NjYyOSIgeDE9IjQwLjE1MTk4IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICA8L2c+CiAgICA8ZyBjbGFzcz0icG9ydHMiPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LXAiLz4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1uIi8+CiAgICA8L2c+Cjwvc3ZnPgo='},
            text: {text: 'LED'},
        }
    });

    const Voltage = TwoPinComponentVertical.define('circuit.Voltage', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzOS45OTk5OTk5OTk5OTk5OSIgaGVpZ2h0PSI3OS45OTk5OTk5OTk5OTk5OSI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSByeT0iMTUiIHJ4PSIxNSIgaWQ9InN2Z18zMCIgY3k9IjM5LjczNjg0IiBjeD0iMjAiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z18zMSIgeTI9IjEwIiB4Mj0iMjAiIHkxPSIyNC42MzE1OCIgeDE9IjIwIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPHRleHQgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdGV4dC1hbmNob3I9InN0YXJ0IiBmb250LWZhbWlseT0iSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgaWQ9InN2Z18zNCIgeT0iNDEuMTY3NzciIHg9IjEzLjAyNjMxIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjAiIHN0cm9rZT0iIzAwMCIgZmlsbD0iIzAwMDAwMCI+KzwvdGV4dD4KICAgICAgICA8dGV4dCBzdHJva2U9IiMwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiIHRleHQtYW5jaG9yPSJzdGFydCIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzIiIGlkPSJzdmdfMzUiIHk9IjU5LjA2MjUiIHg9IjE0LjYwNTI2IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjAiIGZpbGw9IiMwMDAwMDAiPi08L3RleHQ+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfMzgiIHkyPSI1NC44NDIxMSIgeDI9IjIwIiB5MT0iNzAiIHgxPSIyMCIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgPC9nPgogICAgPGcgY2xhc3M9InBvcnRzIj4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1wIi8+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtbiIvPgogICAgPC9nPgo8L3N2Zz4K'},
            text: {text: 'Voltage'},
        }
    });

    const Current = TwoPinComponentVertical.define('circuit.Current', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSByeT0iMTUiIHJ4PSIxNSIgaWQ9InN2Z18zMCIgY3k9IjM5LjczNjg0IiBjeD0iMjAiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiCiAgICAgICAgICAgICAgICAgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzMxIiB5Mj0iMTAiIHgyPSIyMCIgeTE9IjI1IgogICAgICAgICAgICAgIHgxPSIyMCIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzM4IiB5Mj0iNTQuODQyMTEiIHgyPSIyMCIgeTE9IjcwIgogICAgICAgICAgICAgIHgxPSIyMCIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSIyMCIKICAgICAgICAgICAgICB5MT0iMzMuMzgwMjciIHgyPSIyMCIgeTI9IjQ4LjM4MDI1IiBpZD0ic3ZnXzIiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiLz4KICAgICAgICA8cGF0aCBmaWxsPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiCiAgICAgICAgICAgICAgZD0ibTE2LDM5LjMxMTE2bDQuMzY2MTgsLTkuODU5MTJsNC4zNjYxOCw5Ljg1OTEybC04LjczMjM2LDB6IiBpZD0ic3ZnXzMiIHN0cm9rZT0iIzAwMCIvPgogICAgPC9nPgogICAgPGcgY2xhc3M9InBvcnRzIj4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1wIi8+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtbiIvPgogICAgPC9nPgo8L3N2Zz4K'},
            text: {text: 'Current'},
        }
    });

    const PulseVoltageSource = TwoPinComponentVertical.define('circuit.PulseVoltageSource', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiBjeD0iMjAiIGN5PSIzOS43MzY4NCIgaWQ9InN2Z18zMCIgcng9IjE1IiByeT0iMTUiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjAiIHkxPSIyNC42MzE1OCIgeDI9IjIwIiB5Mj0iMTAiIGlkPSJzdmdfMzEiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIi8+PHRleHQgZmlsbD0iIzAwMDAwMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHg9IjEzLjAyNjMxIiB5PSI0MS4xNjc3NyIgaWQ9InN2Z18zNCIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIHRleHQtYW5jaG9yPSJzdGFydCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+KzwvdGV4dD4KICAgICAgICA8dGV4dCBmaWxsPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjAiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHg9IjE0LjYwNTI2IiB5PSI1OS4wNjI1IiBpZD0ic3ZnXzM1IiBmb250LXNpemU9IjMyIiBmb250LWZhbWlseT0iSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgdGV4dC1hbmNob3I9InN0YXJ0IiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHJva2U9IiMwMDAiPi08L3RleHQ+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjIwIiB5MT0iNzAiIHgyPSIyMCIgeTI9IjU0Ljg0MjExIiBpZD0ic3ZnXzM4IiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMTAuMjcyMzgiIHkxPSI0MC4yOTgxNiIgeDI9IjEwLjI3MjM4IiB5Mj0iNDQuNzMzOTYiIGlkPSJzdmdfMSIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlPSIjMDAwIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSIxMy42MTg2OCIgeTE9IjQwLjM3NTk4IiB4Mj0iMTMuNjE4NjgiIHkyPSI0NC44MTE3OCIgaWQ9InN2Z180IiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2U9IiMwMDAiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjEwLjE5NDU2IiB5MT0iNDEuMDc2MzciIHgyPSIxNC4zOTY4OSIgeTI9IjQwLjk5ODU1IiBpZD0ic3ZnXzYiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMTguMDU0NDgiIHkxPSI0MC4zNzU5OCIgeDI9IjE4LjA1NDQ4IiB5Mj0iNDQuODExNzgiIGlkPSJzdmdfOCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlPSIjMDAwIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSIyMS40MDA3OCIgeTE9IjQwLjI5ODE2IiB4Mj0iMjEuNDAwNzgiIHkyPSI0NC43MzM5NiIgaWQ9InN2Z185IiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2U9IiMwMDAiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjE3Ljk3NjY1IiB5MT0iNDEuMTU0MTkiIHgyPSIyMi4xNzg5OSIgeTI9IjQxLjA3NjM3IiBpZD0ic3ZnXzEwIiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2U9IiMwMDAiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjI1LjY4MDkzIiB5MT0iNDAuMjk4MTYiIHgyPSIyNS42ODA5MyIgeTI9IjQ0LjczMzk2IiBpZD0ic3ZnXzExIiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2U9IiMwMDAiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjI5LjAyNzIzIiB5MT0iNDAuMzc1OTgiIHgyPSIyOS4wMjcyMyIgeTI9IjQ0LjgxMTc4IiBpZD0ic3ZnXzEyIiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2U9IiMwMDAiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjI1LjYwMzExIiB5MT0iNDEuMDc2MzciIHgyPSIyOS44MDU0NCIgeTI9IjQwLjk5ODU1IiBpZD0ic3ZnXzEzIiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2U9IiMwMDAiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjEzLjIyOTU4IiB5MT0iNDQuMDMzNTciIHgyPSIxOC4xMzIzIiB5Mj0iNDQuMDMzNTciIGlkPSJzdmdfMTQiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjEuMDExNjciIHkxPSI0My45NTU3NSIgeDI9IjI1LjkxNDM5IiB5Mj0iNDMuOTU1NzUiIGlkPSJzdmdfMTUiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjkuNjQ5OCIgeTE9IjQ0LjAzMzU3IiB4Mj0iMzAuODk0OTQiIHkyPSI0NC4wMzM1NyIgaWQ9InN2Z18xNiIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlPSIjMDAwIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSI4LjYzODE0IiB5MT0iNDMuOTU1NzUiIHgyPSI5Ljg4MzI3IiB5Mj0iNDMuOTU1NzUiIGlkPSJzdmdfMTciIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZT0iIzAwMCIvPgogICAgPC9nPgogICAgPGcgY2xhc3M9InBvcnRzIj4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1wIi8+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtbiIvPgogICAgPC9nPgo8L3N2Zz4K'},
            text: {text: 'PulseVoltageSource'},
        }
    });

    const PulseCurrentSource = TwoPinComponentVertical.define('circuit.PulseCurrentSource', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiBjeD0iMjAiIGN5PSIzOS43MzY4NCIgaWQ9InN2Z18zMCIgcng9IjE1IiByeT0iMTUiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjAiIHkxPSIyNSIgeDI9IjIwIiB5Mj0iMTAiIGlkPSJzdmdfMzEiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjIwIiB5MT0iNzAiIHgyPSIyMCIgeTI9IjU0Ljg0MjExIiBpZD0ic3ZnXzM4IiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z18yIiB5Mj0iNDEuOTk4OTMiIHgyPSIxOS43NjY1NCIgeTE9IjMwLjY1NjU0IiB4MT0iMTkuNzY2NTQiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPHBhdGggc3Ryb2tlPSIjMDAwIiBpZD0ic3ZnXzMiIGQ9Im0xNi4zODkxLDM1LjgwOTIybDMuNDMyMzMsLTguMzgwNTJsMy40MzIzMyw4LjM4MDUybC02Ljg2NDY2LDB6IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0iYmxhY2siLz4KICAgICAgICA8bGluZSBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49Im51bGwiIGlkPSJzdmdfMSIgeTI9IjQ3LjcwNDI2IiB4Mj0iMTAuMjcyMzgiIHkxPSI0My4yNjg0NiIgeDE9IjEwLjI3MjM4IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z180IiB5Mj0iNDcuNzgyMDgiIHgyPSIxMy42MTg2OCIgeTE9IjQzLjM0NjI4IiB4MT0iMTMuNjE4NjgiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzYiIHkyPSI0My45Njg4NSIgeDI9IjE0LjM5Njg5IiB5MT0iNDQuMDQ2NjciIHgxPSIxMC4xOTQ1NiIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49Im51bGwiIGlkPSJzdmdfOCIgeTI9IjQ3Ljc4MjA4IiB4Mj0iMTguMDU0NDgiIHkxPSI0My4zNDYyOCIgeDE9IjE4LjA1NDQ4IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z185IiB5Mj0iNDcuNzA0MjYiIHgyPSIyMS40MDA3OCIgeTE9IjQzLjI2ODQ2IiB4MT0iMjEuNDAwNzgiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzEwIiB5Mj0iNDQuMDQ2NjciIHgyPSIyMi4xNzg5OSIgeTE9IjQ0LjEyNDQ5IiB4MT0iMTcuOTc2NjUiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzExIiB5Mj0iNDcuNzA0MjYiIHgyPSIyNS42ODA5MyIgeTE9IjQzLjI2ODQ2IiB4MT0iMjUuNjgwOTMiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzEyIiB5Mj0iNDcuNzgyMDgiIHgyPSIyOS4wMjcyMyIgeTE9IjQzLjM0NjI4IiB4MT0iMjkuMDI3MjMiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzEzIiB5Mj0iNDMuOTY4ODUiIHgyPSIyOS44MDU0NCIgeTE9IjQ0LjA0NjY3IiB4MT0iMjUuNjAzMTEiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzE0IiB5Mj0iNDcuMDAzODciIHgyPSIxOC4xMzIzIiB5MT0iNDcuMDAzODciIHgxPSIxMy4yMjk1OCIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49Im51bGwiIGlkPSJzdmdfMTUiIHkyPSI0Ni45MjYwNSIgeDI9IjI1LjkxNDM5IiB5MT0iNDYuOTI2MDUiIHgxPSIyMS4wMTE2NyIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49Im51bGwiIGlkPSJzdmdfMTYiIHkyPSI0Ny4wMDM4NyIgeDI9IjMwLjg5NDk0IiB5MT0iNDcuMDAzODciIHgxPSIyOS42NDk4IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z18xNyIgeTI9IjQ2LjkyNjA1IiB4Mj0iOS44ODMyNyIgeTE9IjQ2LjkyNjA1IiB4MT0iOC42MzgxNCIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz4KICAgIDwvZz4KICAgIDxnIGNsYXNzPSJwb3J0cyI+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtcCIvPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LW4iLz4KICAgIDwvZz4KPC9zdmc+Cg=='},
            text: {text: 'PulseCurrentSource'},
        }
    });

    const PieceWiseLinearVoltageSource = TwoPinComponentVertical.define('circuit.PieceWiseLinearVoltageSource', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiBjeD0iMjAiIGN5PSIzOS43MzY4NCIgaWQ9InN2Z18zMCIgcng9IjE1IiByeT0iMTUiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjAiIHkxPSIyNC42MzE1OCIgeDI9IjIwIiB5Mj0iMTAiIGlkPSJzdmdfMzEiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIi8+PHRleHQgZmlsbD0iIzAwMDAwMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHg9IjEzLjAyNjMxIiB5PSI0MS4xNjc3NyIgaWQ9InN2Z18zNCIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIHRleHQtYW5jaG9yPSJzdGFydCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+KzwvdGV4dD4KICAgICAgICA8dGV4dCBmaWxsPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjAiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHg9IjE0LjYwNTI2IiB5PSI1OS4wNjI1IiBpZD0ic3ZnXzM1IiBmb250LXNpemU9IjMyIiBmb250LWZhbWlseT0iSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgdGV4dC1hbmNob3I9InN0YXJ0IiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHJva2U9IiMwMDAiPi08L3RleHQ+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjIwIiB5MT0iNzAiIHgyPSIyMCIgeTI9IjU0Ljg0MjExIiBpZD0ic3ZnXzM4IiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIvPgogICAgICAgIDx0ZXh0IGZpbGw9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeD0iMTIuNjA1MjYiIHk9IjQ3IiBpZD0ic3ZnXzM1IiBmb250LXNpemU9IjYiIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ic3RhcnQiIHhtbDpzcGFjZT0icHJlc2VydmUiIHN0cm9rZT0iIzAwMCI+MSwyIC4uLjwvdGV4dD4KICAgIDwvZz4KICAgIDxnIGNsYXNzPSJwb3J0cyI+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtcCIvPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LW4iLz4KICAgIDwvZz4KPC9zdmc+Cg=='},
            text: {text: 'PieceWiseLinearVoltageSource'},
        }
    });

    const PieceWiseLinearCurrentSource = TwoPinComponentVertical.define('circuit.PieceWiseLinearCurrentSource', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiBjeD0iMjAiIGN5PSIzOS43MzY4NCIgaWQ9InN2Z18zMCIgcng9IjE1IiByeT0iMTUiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjAiIHkxPSIyNSIgeDI9IjIwIiB5Mj0iMTAiIGlkPSJzdmdfMzEiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjIwIiB5MT0iNzAiIHgyPSIyMCIgeTI9IjU0Ljg0MjExIiBpZD0ic3ZnXzM4IiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z18yIiB5Mj0iNDEuOTk4OTMiIHgyPSIxOS43NjY1NCIgeTE9IjMwLjY1NjU0IiB4MT0iMTkuNzY2NTQiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPHBhdGggc3Ryb2tlPSIjMDAwIiBpZD0ic3ZnXzMiIGQ9Im0xNi4zODkxLDM1LjgwOTIybDMuNDMyMzMsLTguMzgwNTJsMy40MzIzMyw4LjM4MDUybC02Ljg2NDY2LDB6IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0iYmxhY2siLz4KICAgICAgICA8dGV4dCBmaWxsPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjAiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHg9IjEyLjYwNTI2IiB5PSI0NyIgaWQ9InN2Z18zNSIgZm9udC1zaXplPSI2IiBmb250LWZhbWlseT0iSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgdGV4dC1hbmNob3I9InN0YXJ0IiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHJva2U9IiMwMDAiPjEsMiAuLi48L3RleHQ+CiAgICA8L2c+CiAgICA8ZyBjbGFzcz0icG9ydHMiPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LXAiLz4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1uIi8+CiAgICA8L2c+Cjwvc3ZnPgo='},
            text: {text: 'PieceWiseLinearCurrentSource'},
        }
    });

    const SinusoidalVoltageSource = TwoPinComponentVertical.define('circuit.SinusoidalVoltageSource', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzOS45OTk5OTk5OTk5OTk5OSIgaGVpZ2h0PSI3OS45OTk5OTk5OTk5OTk5OSI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSByeT0iMTUiIHJ4PSIxNSIgaWQ9InN2Z18zMCIgY3k9IjM5LjczNjg0IiBjeD0iMjAiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z18zMSIgeTI9IjEwIiB4Mj0iMjAiIHkxPSIyNC42MzE1OCIgeDE9IjIwIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPHRleHQgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdGV4dC1hbmNob3I9InN0YXJ0IiBmb250LWZhbWlseT0iSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgaWQ9InN2Z18zNCIgeT0iNDEuMTY3NzciIHg9IjEzLjAyNjMxIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjAiIHN0cm9rZT0iIzAwMCIgZmlsbD0iIzAwMDAwMCI+KzwvdGV4dD4KICAgICAgICA8dGV4dCBzdHJva2U9IiMwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiIHRleHQtYW5jaG9yPSJzdGFydCIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzIiIGlkPSJzdmdfMzUiIHk9IjU5LjA2MjUiIHg9IjE0LjYwNTI2IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjAiIGZpbGw9IiMwMDAwMDAiPi08L3RleHQ+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfMzgiIHkyPSI1NC44NDIxMSIgeDI9IjIwIiB5MT0iNzAiIHgxPSIyMCIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxwYXRoIGQ9Ik0gMTAgNDUgQyAxNSA0MCwgMTUgNDAsIDIwIDQ1IFMgMzAgNDAgMzAgNDAiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiLz4KICAgIDwvZz4KICAgIDxnIGNsYXNzPSJwb3J0cyI+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtcCIvPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LW4iLz4KICAgIDwvZz4KPC9zdmc+Cg=='},
            text: {text: 'SinusoidalVoltageSource'},
        }
    });

    const SinusoidalCurrentSource = TwoPinComponentVertical.define('circuit.SinusoidalCurrentSource', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiBjeD0iMjAiIGN5PSIzOS43MzY4NCIgaWQ9InN2Z18zMCIgcng9IjE1IiByeT0iMTUiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjAiIHkxPSIyNSIgeDI9IjIwIiB5Mj0iMTAiIGlkPSJzdmdfMzEiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjIwIiB5MT0iNzAiIHgyPSIyMCIgeTI9IjU0Ljg0MjExIiBpZD0ic3ZnXzM4IiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z18yIiB5Mj0iNDEuOTk4OTMiIHgyPSIxOS43NjY1NCIgeTE9IjMwLjY1NjU0IiB4MT0iMTkuNzY2NTQiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPHBhdGggc3Ryb2tlPSIjMDAwIiBpZD0ic3ZnXzMiIGQ9Im0xNi4zODkxLDM1LjgwOTIybDMuNDMyMzMsLTguMzgwNTJsMy40MzIzMyw4LjM4MDUybC02Ljg2NDY2LDB6IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0iYmxhY2siLz4KICAgICAgICA8cGF0aCBkPSJNIDEwIDQ1IEMgMTUgNDAsIDE1IDQwLCAyMCA0NSBTIDMwIDQwIDMwIDQwIiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIi8+CiAgICA8L2c+CiAgICA8ZyBjbGFzcz0icG9ydHMiPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LXAiLz4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1uIi8+CiAgICA8L2c+Cjwvc3ZnPgo='},
            text: {text: 'SinusoidalCurrentSource'},
        }
    });

    const RandomVoltageSource = TwoPinComponentVertical.define('circuit.RandomVoltageSource', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzOS45OTk5OTk5OTk5OTk5OSIgaGVpZ2h0PSI3OS45OTk5OTk5OTk5OTk5OSI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSByeT0iMTUiIHJ4PSIxNSIgaWQ9InN2Z18zMCIgY3k9IjM5LjczNjg0IiBjeD0iMjAiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z18zMSIgeTI9IjEwIiB4Mj0iMjAiIHkxPSIyNC42MzE1OCIgeDE9IjIwIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPHRleHQgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdGV4dC1hbmNob3I9InN0YXJ0IiBmb250LWZhbWlseT0iSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgaWQ9InN2Z18zNCIgeT0iNDEuMTY3NzciIHg9IjEzLjAyNjMxIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjAiIHN0cm9rZT0iIzAwMCIgZmlsbD0iIzAwMDAwMCI+KzwvdGV4dD4KICAgICAgICA8dGV4dCBzdHJva2U9IiMwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiIHRleHQtYW5jaG9yPSJzdGFydCIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzIiIGlkPSJzdmdfMzUiIHk9IjU5LjA2MjUiIHg9IjE0LjYwNTI2IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjAiIGZpbGw9IiMwMDAwMDAiPi08L3RleHQ+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfMzgiIHkyPSI1NC44NDIxMSIgeDI9IjIwIiB5MT0iNzAiIHgxPSIyMCIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDx0ZXh0IGZpbGw9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeD0iOCIgeT0iNDciIGlkPSJzdmdfMzUiIGZvbnQtc2l6ZT0iNiIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIHRleHQtYW5jaG9yPSJzdGFydCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgc3Ryb2tlPSIjMDAwIj5SYW5kb208L3RleHQ+CiAgICA8L2c+CiAgICA8ZyBjbGFzcz0icG9ydHMiPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LXAiLz4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1uIi8+CiAgICA8L2c+Cjwvc3ZnPgo='},
            text: {text: 'RandomVoltageSource'},
        }
    });

    const RandomCurrentSource = TwoPinComponentVertical.define('circuit.RandomCurrentSource', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiBjeD0iMjAiIGN5PSIzOS43MzY4NCIgaWQ9InN2Z18zMCIgcng9IjE1IiByeT0iMTUiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjAiIHkxPSIyNSIgeDI9IjIwIiB5Mj0iMTAiIGlkPSJzdmdfMzEiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjIwIiB5MT0iNzAiIHgyPSIyMCIgeTI9IjU0Ljg0MjExIiBpZD0ic3ZnXzM4IiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z18yIiB5Mj0iNDEuOTk4OTMiIHgyPSIxOS43NjY1NCIgeTE9IjMwLjY1NjU0IiB4MT0iMTkuNzY2NTQiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPHBhdGggc3Ryb2tlPSIjMDAwIiBpZD0ic3ZnXzMiIGQ9Im0xNi4zODkxLDM1LjgwOTIybDMuNDMyMzMsLTguMzgwNTJsMy40MzIzMyw4LjM4MDUybC02Ljg2NDY2LDB6IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0iYmxhY2siLz4KICAgICAgICA8dGV4dCBmaWxsPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjAiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHg9IjgiIHk9IjQ3IiBpZD0ic3ZnXzM1IiBmb250LXNpemU9IjYiIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ic3RhcnQiIHhtbDpzcGFjZT0icHJlc2VydmUiIHN0cm9rZT0iIzAwMCI+UmFuZG9tPC90ZXh0PgogICAgPC9nPgogICAgPGcgY2xhc3M9InBvcnRzIj4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1wIi8+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtbiIvPgogICAgPC9nPgo8L3N2Zz4K'},
            text: {text: 'RandomCurrentSource'},
        }
    });

    const ExponentialVoltageSource = TwoPinComponentVertical.define('circuit.ExponentialVoltageSource', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzOS45OTk5OTk5OTk5OTk5OSIgaGVpZ2h0PSI3OS45OTk5OTk5OTk5OTk5OSI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSByeT0iMTUiIHJ4PSIxNSIgaWQ9InN2Z18zMCIgY3k9IjM5LjczNjg0IiBjeD0iMjAiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z18zMSIgeTI9IjEwIiB4Mj0iMjAiIHkxPSIyNC42MzE1OCIgeDE9IjIwIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPHRleHQgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdGV4dC1hbmNob3I9InN0YXJ0IiBmb250LWZhbWlseT0iSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgaWQ9InN2Z18zNCIgeT0iNDEuMTY3NzciIHg9IjEzLjAyNjMxIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjAiIHN0cm9rZT0iIzAwMCIgZmlsbD0iIzAwMDAwMCI+KzwvdGV4dD4KICAgICAgICA8dGV4dCBzdHJva2U9IiMwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiIHRleHQtYW5jaG9yPSJzdGFydCIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzIiIGlkPSJzdmdfMzUiIHk9IjU5LjA2MjUiIHg9IjE0LjYwNTI2IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjAiIGZpbGw9IiMwMDAwMDAiPi08L3RleHQ+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfMzgiIHkyPSI1NC44NDIxMSIgeDI9IjIwIiB5MT0iNzAiIHgxPSIyMCIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxwYXRoIGQ9Ik0gMTAgNDUgQyAyNCA0NyAzMCA0MCAzMCAzNSIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIvPgogICAgPC9nPgogICAgPGcgY2xhc3M9InBvcnRzIj4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1wIi8+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtbiIvPgogICAgPC9nPgo8L3N2Zz4K'},
            text: {text: 'ExponentialVoltageSource'},
        }
    });

    const ExponentialCurrentSource = TwoPinComponentVertical.define('circuit.ExponentialCurrentSource', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiBjeD0iMjAiIGN5PSIzOS43MzY4NCIgaWQ9InN2Z18zMCIgcng9IjE1IiByeT0iMTUiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjAiIHkxPSIyNSIgeDI9IjIwIiB5Mj0iMTAiIGlkPSJzdmdfMzEiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjIwIiB5MT0iNzAiIHgyPSIyMCIgeTI9IjU0Ljg0MjExIiBpZD0ic3ZnXzM4IiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z18yIiB5Mj0iNDEuOTk4OTMiIHgyPSIxOS43NjY1NCIgeTE9IjMwLjY1NjU0IiB4MT0iMTkuNzY2NTQiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPHBhdGggc3Ryb2tlPSIjMDAwIiBpZD0ic3ZnXzMiIGQ9Im0xNi4zODkxLDM1LjgwOTIybDMuNDMyMzMsLTguMzgwNTJsMy40MzIzMyw4LjM4MDUybC02Ljg2NDY2LDB6IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0iYmxhY2siLz4KICAgICAgICA8cGF0aCBkPSJNIDEwIDQ1IEMgMjQgNDcgMzAgNDAgMzAgMzUiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiLz4KICAgIDwvZz4KICAgIDxnIGNsYXNzPSJwb3J0cyI+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtcCIvPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LW4iLz4KICAgIDwvZz4KPC9zdmc+Cg=='},
            text: {text: 'ExponentialCurrentSource'},
        }
    });

    const AmplitudeModulatedVoltageSource = TwoPinComponentVertical.define('circuit.AmplitudeModulatedVoltageSource', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzOS45OTk5OTk5OTk5OTk5OSIgaGVpZ2h0PSI3OS45OTk5OTk5OTk5OTk5OSI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSByeT0iMTUiIHJ4PSIxNSIgaWQ9InN2Z18zMCIgY3k9IjM5LjczNjg0IiBjeD0iMjAiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z18zMSIgeTI9IjEwIiB4Mj0iMjAiIHkxPSIyNC42MzE1OCIgeDE9IjIwIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPHRleHQgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdGV4dC1hbmNob3I9InN0YXJ0IiBmb250LWZhbWlseT0iSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgaWQ9InN2Z18zNCIgeT0iNDEuMTY3NzciIHg9IjEzLjAyNjMxIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjAiIHN0cm9rZT0iIzAwMCIgZmlsbD0iIzAwMDAwMCI+KzwvdGV4dD4KICAgICAgICA8dGV4dCBzdHJva2U9IiMwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiIHRleHQtYW5jaG9yPSJzdGFydCIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzIiIGlkPSJzdmdfMzUiIHk9IjU5LjA2MjUiIHg9IjE0LjYwNTI2IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjAiIGZpbGw9IiMwMDAwMDAiPi08L3RleHQ+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfMzgiIHkyPSI1NC44NDIxMSIgeDI9IjIwIiB5MT0iNzAiIHgxPSIyMCIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDx0ZXh0IGZpbGw9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeD0iOSIgeT0iNDgiIGlkPSJzdmdfMzUiIGZvbnQtc2l6ZT0iOCIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIHRleHQtYW5jaG9yPSJzdGFydCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgc3Ryb2tlPSIjMDAwIj5BTVZTPC90ZXh0PgogICAgPC9nPgogICAgPGcgY2xhc3M9InBvcnRzIj4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1wIi8+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtbiIvPgogICAgPC9nPgo8L3N2Zz4K'},
            text: {text: 'AmplitudeModulatedVoltageSource'},
        }
    });

    const AmplitudeModulatedCurrentSource = TwoPinComponentVertical.define('circuit.AmplitudeModulatedCurrentSource', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiBjeD0iMjAiIGN5PSIzOS43MzY4NCIgaWQ9InN2Z18zMCIgcng9IjE1IiByeT0iMTUiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjAiIHkxPSIyNSIgeDI9IjIwIiB5Mj0iMTAiIGlkPSJzdmdfMzEiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjIwIiB5MT0iNzAiIHgyPSIyMCIgeTI9IjU0Ljg0MjExIiBpZD0ic3ZnXzM4IiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z18yIiB5Mj0iNDEuOTk4OTMiIHgyPSIxOS43NjY1NCIgeTE9IjMwLjY1NjU0IiB4MT0iMTkuNzY2NTQiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPHBhdGggc3Ryb2tlPSIjMDAwIiBpZD0ic3ZnXzMiIGQ9Im0xNi4zODkxLDM1LjgwOTIybDMuNDMyMzMsLTguMzgwNTJsMy40MzIzMyw4LjM4MDUybC02Ljg2NDY2LDB6IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0iYmxhY2siLz4KICAgICAgICA8dGV4dCBmaWxsPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjAiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHg9IjkiIHk9IjQ5IiBpZD0ic3ZnXzM1IiBmb250LXNpemU9IjgiIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ic3RhcnQiIHhtbDpzcGFjZT0icHJlc2VydmUiIHN0cm9rZT0iIzAwMCI+QU1DUzwvdGV4dD4KICAgIDwvZz4KICAgIDxnIGNsYXNzPSJwb3J0cyI+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtcCIvPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LW4iLz4KICAgIDwvZz4KPC9zdmc+Cg=='},
            text: {text: 'AmplitudeModulatedCurrentSource'},
        }
    });

    const SingleFrequencyFMVoltageSource = TwoPinComponentVertical.define('circuit.SingleFrequencyFMVoltageSource', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzOS45OTk5OTk5OTk5OTk5OSIgaGVpZ2h0PSI3OS45OTk5OTk5OTk5OTk5OSI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSByeT0iMTUiIHJ4PSIxNSIgaWQ9InN2Z18zMCIgY3k9IjM5LjczNjg0IiBjeD0iMjAiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z18zMSIgeTI9IjEwIiB4Mj0iMjAiIHkxPSIyNC42MzE1OCIgeDE9IjIwIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPHRleHQgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdGV4dC1hbmNob3I9InN0YXJ0IiBmb250LWZhbWlseT0iSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgaWQ9InN2Z18zNCIgeT0iNDEuMTY3NzciIHg9IjEzLjAyNjMxIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjAiIHN0cm9rZT0iIzAwMCIgZmlsbD0iIzAwMDAwMCI+KzwvdGV4dD4KICAgICAgICA8dGV4dCBzdHJva2U9IiMwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiIHRleHQtYW5jaG9yPSJzdGFydCIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzIiIGlkPSJzdmdfMzUiIHk9IjU5LjA2MjUiIHg9IjE0LjYwNTI2IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjAiIGZpbGw9IiMwMDAwMDAiPi08L3RleHQ+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfMzgiIHkyPSI1NC44NDIxMSIgeDI9IjIwIiB5MT0iNzAiIHgxPSIyMCIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDx0ZXh0IGZpbGw9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeD0iOSIgeT0iNDciIGlkPSJzdmdfMzUiIGZvbnQtc2l6ZT0iNy41IiBmb250LWZhbWlseT0iSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgdGV4dC1hbmNob3I9InN0YXJ0IiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHJva2U9IiMwMDAiPlNGRlZTPC90ZXh0PgogICAgPC9nPgogICAgPGcgY2xhc3M9InBvcnRzIj4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1wIi8+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtbiIvPgogICAgPC9nPgo8L3N2Zz4K'},
            text: {text: 'SingleFrequencyFMVoltageSource'},
        }
    });

    const SingleFrequencyFMCurrentSource = TwoPinComponentVertical.define('circuit.SingleFrequencyFMCurrentSource', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiBjeD0iMjAiIGN5PSIzOS43MzY4NCIgaWQ9InN2Z18zMCIgcng9IjE1IiByeT0iMTUiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjAiIHkxPSIyNSIgeDI9IjIwIiB5Mj0iMTAiIGlkPSJzdmdfMzEiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjIwIiB5MT0iNzAiIHgyPSIyMCIgeTI9IjU0Ljg0MjExIiBpZD0ic3ZnXzM4IiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z18yIiB5Mj0iNDEuOTk4OTMiIHgyPSIxOS43NjY1NCIgeTE9IjMwLjY1NjU0IiB4MT0iMTkuNzY2NTQiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPHBhdGggc3Ryb2tlPSIjMDAwIiBpZD0ic3ZnXzMiIGQ9Im0xNi4zODkxLDM1LjgwOTIybDMuNDMyMzMsLTguMzgwNTJsMy40MzIzMyw4LjM4MDUybC02Ljg2NDY2LDB6IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0iYmxhY2siLz4KICAgICAgICA8dGV4dCBmaWxsPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjAiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHg9IjkiIHk9IjQ5IiBpZD0ic3ZnXzM1IiBmb250LXNpemU9IjYuNSIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIHRleHQtYW5jaG9yPSJzdGFydCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgc3Ryb2tlPSIjMDAwIj5TRk1DQzwvdGV4dD4KICAgIDwvZz4KICAgIDxnIGNsYXNzPSJwb3J0cyI+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtcCIvPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LW4iLz4KICAgIDwvZz4KPC9zdmc+Cg=='},
            text: {text: 'SingleFrequencyFMCurrentSource'},
        }
    });


    const AcLine = TwoPinComponentVertical.define('circuit.AcLine', {
        attrs: {
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzOS45OTk5OTk5OTk5OTk5OSIgaGVpZ2h0PSI3OS45OTk5OTk5OTk5OTk5OSI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSByeT0iMTUiIHJ4PSIxNSIgaWQ9InN2Z18zMCIgY3k9IjM5LjczNjg0IiBjeD0iMjAiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z18zMSIgeTI9IjEwIiB4Mj0iMjAiIHkxPSIyNC42MzE1OCIgeDE9IjIwIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfMzgiIHkyPSI1NC44NDIxMSIgeDI9IjIwIiB5MT0iNzAiIHgxPSIyMCIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxwYXRoIGQ9Ik0gMTAgNDUgQyAxNSA0MCwgMTUgNDAsIDIwIDQ1IFMgMzAgNDAgMzAgNDAiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiLz4KICAgICAgICA8dGV4dCBmaWxsPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjAiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHg9IjguNSIgeT0iMzgiIGlkPSJzdmdfMzUiIGZvbnQtc2l6ZT0iNi41IiBmb250LWZhbWlseT0iSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgdGV4dC1hbmNob3I9InN0YXJ0IiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHJva2U9IiMwMDAiPkFDIExpbmU8L3RleHQ+CgogICAgPC9nPgogICAgPGcgY2xhc3M9InBvcnRzIj4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1wIi8+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtbiIvPgogICAgPC9nPgo8L3N2Zz4K'},
            text: {text: 'AcLine'},
        }
    });

    const Transistor = ThreePinComponent.define('circuit.Transistor', {
        attrs: {
            '.pin1': {ref: '.body', 'ref-x': 0.625, 'ref-y': 0.125, magnet: true, port: 'C', portid: 'C'},
            '.pin2': {ref: '.body', 'ref-x': 0.0625, 'ref-y': 0.5, magnet: true, port: 'B', portid: 'B'},
            '.pin3': {ref: '.body', 'ref-x': 0.625, 'ref-y': 0.875, magnet: true, port: 'E', portid: 'E'}
        }
    });

    const Potentiometer = ThreePinComponent.define('circuit.Potentiometer', {
        size: {width: 80, height: 40},
        attrs: {
            text: {
                'ref-x': 0.5,
                'ref-y': '100%',
                'y-alignment': 'middle',
                text: 'Potentiometer'
            },
            '.body': {width: 80, height: 40},
            '.pin1': {ref: '.body', 'ref-x': 0.0625, 'ref-y': 0.5, magnet: true, port: 'pin_p', portid: 'pin_p'},
            '.pin2': {ref: '.body', 'ref-x': 0.9375, 'ref-y': 0.5, magnet: true, port: 'pin_n', portid: 'pin_n'},
            '.pin3': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.125, magnet: true, port: 'contact', portid: 'contact'},
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3OS45OTk5OTk5OTk5OTk5OSIgaGVpZ2h0PSIzOS45OTk5OTk5OTk5OTk5OSI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiB4MT0iNSIgeTE9IjIwIiB4Mj0iMjAiIHkyPSIyMCIgaWQ9InN2Z18xIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHgxPSI2MCIgeTE9IjIwIiB4Mj0iNzUiIHkyPSIyMCIgaWQ9InN2Z18yIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjMuNDQzMzQiIHkxPSIxMy41NjI4IiB4Mj0iMTguMTM1NiIgeTI9IjE5LjgyNTM1IiBpZD0ic3ZnXzUiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiB0cmFuc2Zvcm09InJvdGF0ZSgtMTUuOTUxNjMyNDk5Njk0ODI0IDIwLjc4OTQ2NDk1MDU2MTUxNiwxNi42OTQwNzY1MzgwODU5MzgpICIgc3Ryb2tlPSIjMDAwIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSIyMS45NzM2OCIgeTE9IjEzIiB4Mj0iMjUuMjYzMTYiIHkyPSIyNCIgaWQ9InN2Z182IiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlPSIjMDAwIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSIyNS4yMTA1MyIgeTE9IjIzLjUzNjE4IiB4Mj0iMjguMjEwNTMiIHkyPSIxMy4wMDk4NyIgaWQ9InN2Z183IiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlPSIjMDAwIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSIyNy43NjMxNiIgeTE9IjEzIiB4Mj0iMzEuMDUyNjMiIHkyPSIyNCIgaWQ9InN2Z18xOSIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMzEiIHkxPSIyMy41MzYxOCIgeDI9IjM0IiB5Mj0iMTMuMDA5ODciIGlkPSJzdmdfMjAiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2U9IiMwMDAiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjMzLjgxNTc5IiB5MT0iMTMiIHgyPSIzNy4xMDUyNiIgeTI9IjI0IiBpZD0ic3ZnXzIxIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlPSIjMDAwIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSIzNy4wNTI2MyIgeTE9IjIzLjUzNjE4IiB4Mj0iNDAuMDUyNjMiIHkyPSIxMy4wMDk4NyIgaWQ9InN2Z18yMiIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMzkuNjA1MjYiIHkxPSIxMyIgeDI9IjQyLjg5NDc0IiB5Mj0iMjQiIGlkPSJzdmdfMjMiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2U9IiMwMDAiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjQyLjg0MjEiIHkxPSIyMy41MzYxOCIgeDI9IjQ1Ljg0MjEiIHkyPSIxMy4wMDk4NyIgaWQ9InN2Z18yNCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iNDUuOTIxMDUiIHkxPSIxMyIgeDI9IjQ5LjIxMDUyIiB5Mj0iMjQiIGlkPSJzdmdfMjUiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2U9IiMwMDAiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjQ5LjE1Nzg5IiB5MT0iMjMuNTM2MTgiIHgyPSI1Mi4xNTc4OSIgeTI9IjEzLjAwOTg3IiBpZD0ic3ZnXzI2IiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlPSIjMDAwIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSI1MS43MTA1MiIgeTE9IjEzIiB4Mj0iNTUiIHkyPSIyNCIgaWQ9InN2Z18yNyIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iNTQuOTQ3MzciIHkxPSIyMy41MzYxOCIgeDI9IjU3Ljk0NzM3IiB5Mj0iMTMuMDA5ODciIGlkPSJzdmdfMjgiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2U9IiMwMDAiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjYxLjg2NDM5IiB5MT0iMTMuNTYyOCIgeDI9IjU2LjU1NjY0IiB5Mj0iMTkuODI1MzUiIGlkPSJzdmdfMjkiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiB0cmFuc2Zvcm09InJvdGF0ZSgtNjIuODA5MzQ5MDYwMDU4NTk0IDU5LjIxMDUxNzg4MzMwMDc4LDE2LjY5NDA3NjUzODA4NTkzNCkgIiBzdHJva2U9IiMwMDAiLz4KICAgICAgICA8bGluZSBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49Im51bGwiIGlkPSJzdmdfMyIgeTI9IjE4LjQzNzUiIHgyPSIzOS41IiB5MT0iNSIgeDE9IjM5LjUiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICA8L2c+CiAgICA8ZyBjbGFzcz0icG9ydHMiPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LXAiLz4KICAgICAgICA8ZyBjbGFzcz0icG9ydC1uIi8+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtb3V0Ii8+CiAgICA8L2c+Cjwvc3ZnPgo='}
        }
    }, {}, {
        toELKJSON: potentiometer => {
            const elkJSON = Component.toELKJSON(potentiometer);
            elkJSON.ports = [{
                id: potentiometer.get('attrs')['.pin1'].port,
                layoutOptions: {
                    'port.side': 'WEST',
                    'port.index': '0'
                },
                width: 7,
                height: 7
            }, {
                id: potentiometer.get('attrs')['.pin2'].port,
                layoutOptions: {
                    'port.side': 'EAST',
                    'port.index': '1'
                },
                width: 7,
                height: 7,
            }, {
                id: potentiometer.get('attrs')['.pin3'].port,
                layoutOptions: {
                    'port.side': 'NORTH',
                    'port.index': '2'
                },
                width: 7,
                height: 7
            }];
            return elkJSON;
        },
    });

    const NPN = Transistor.define('circuit.NPN', {
        attrs: {
            text: {text: 'NPN'},
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgY3g9IjQwIiBjeT0iNDAiIGlkPSJzdmdfMSIgcng9IjIwIiByeT0iMjAiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSIzMCIgeTE9IjIzIiB4Mj0iMzAiIHkyPSI1NyIgaWQ9InN2Z18yIiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIi8+CiAgICAgICAgPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgZD0ibTYuMDkwOTEsMjg0LjczODYzbDE0OSwtMjYwLjc1bDE0OSwyNjAuNzVsLTI5OCwweiIgaWQ9InN2Z18xMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSIxMCIgeTE9IjQwIiB4Mj0iMzAiIHkyPSI0MCIgaWQ9InN2Z18xMSIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBzdHJva2UtbGluZWNhcD0ibnVsbCIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z180IiB5Mj0iNTcuNDA4MTYiIHgyPSI0OS45OTk5OSIgeTE9IjQ4LjQ2OTM4IiB4MT0iMjkuNjkzODgiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z182IiB5Mj0iMjIuNzU1MTEiIHgyPSI0OS41OTE4MyIgeTE9IjMxLjMyNjUzIiB4MT0iMjkuNTkxODMiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzciIHkyPSI2NSIgeDI9IjUwIiB5MT0iNTciIHgxPSI1MCIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49Im51bGwiIGlkPSJzdmdfOCIgeTI9IjIzIiB4Mj0iNTAiIHkxPSIxNSIgeDE9IjUwIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPHBhdGggdHJhbnNmb3JtPSJyb3RhdGUoMTIwIDM4LjczNTEyMjY4MDY2NDA2LDUyLjI3OTI4MTYxNjIxMDk0KSAiIGlkPSJzdmdfOSIgZD0ibTM3LjEwMjQ0LDUzLjkxMTg5bDEuNjMyNjUsLTMuMjY1M2wxLjYzMjY1LDMuMjY1M2wtMy4yNjUzLDB6IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICA8L2c+CiAgICA8ZyBjbGFzcz0icG9ydHMiPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LTEiLz4KICAgICAgICA8ZyBjbGFzcz0icG9ydC0yIi8+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtMyIvPgogICAgPC9nPgo8L3N2Zz4K'},
            '.pin1': {port: 'C', portid: 'C'},
            '.pin3': {port: 'E', portid: 'E'}
        }
    }, {}, {
        toELKJSON: npn => {
            const elkJSON = Component.toELKJSON(npn);
            elkJSON.ports = [{
                id: npn.get('attrs')['.pin1'].port,
                layoutOptions: {
                    'port.side': 'NORTH',
                    'port.index': '0',
                },
                x: 0.625 * elkJSON.width,
                y: 0.125 * elkJSON.height,
            }, {
                id: npn.get('attrs')['.pin2'].port,
                layoutOptions: {
                    'port.side': 'WEST',
                    'port.index': '1',
                },
                x: 0.0625 * elkJSON.width,
                y: 0.5 * elkJSON.height,
            }, {
                id: npn.get('attrs')['.pin3'].port,
                layoutOptions: {
                    'port.side': 'SOUTH',
                    'port.index': '2',
                },
                x: 0.625 * elkJSON.width,
                y: 0.875 * elkJSON.height,
            }];
            elkJSON.layoutOptions.portConstraints = 'FIXED_POS';
            return elkJSON;
        },
    });

    const PNP = Transistor.define('circuit.PNP', {
        attrs: {
            text: {text: 'PNP'},
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgY3g9IjQwIiBjeT0iNDAiIGlkPSJzdmdfMSIgcng9IjIwIiByeT0iMjAiIHN0cm9rZT0iIzAwMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSIzMCIgeTE9IjIzIiB4Mj0iMzAiIHkyPSI1NyIgaWQ9InN2Z18yIiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIi8+CiAgICAgICAgPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgZD0ibTYuMDkwOTEsMjg0LjczODYzbDE0OSwtMjYwLjc1bDE0OSwyNjAuNzVsLTI5OCwweiIgaWQ9InN2Z18xMCIvPgogICAgICAgIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSIxMCIgeTE9IjQwIiB4Mj0iMzAiIHkyPSI0MCIgaWQ9InN2Z18xMSIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBzdHJva2UtbGluZWNhcD0ibnVsbCIvPgogICAgICAgIDxsaW5lIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z180IiB5Mj0iNTcuNDA4MTYiIHgyPSI0OS45OTk5OSIgeTE9IjQ4LjQ2OTM4IiB4MT0iMjkuNjkzODgiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z182IiB5Mj0iMjIuNzU1MTEiIHgyPSI0OS41OTE4MyIgeTE9IjMxLjMyNjUzIiB4MT0iMjkuNTkxODMiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzciIHkyPSI2NSIgeDI9IjUwIiB5MT0iNTciIHgxPSI1MCIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49Im51bGwiIGlkPSJzdmdfOCIgeTI9IjIzIiB4Mj0iNTAiIHkxPSIxNSIgeDE9IjUwIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPHBhdGggdHJhbnNmb3JtPSJyb3RhdGUoLTEyMCAzOC43MzUwOTIxNjMwODU5NDUsMjcuNTg1Mjk2NjMwODU5MzgpICIgaWQ9InN2Z185IiBkPSJtMzcuMTAyNDQsMjkuMjE4MDJsMS42MzI2NSwtMy4yNjUzbDEuNjMyNjUsMy4yNjUzbC0zLjI2NTMsMHoiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgIDwvZz4KICAgIDxnIGNsYXNzPSJwb3J0cyI+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtMSIvPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LTIiLz4KICAgICAgICA8ZyBjbGFzcz0icG9ydC0zIi8+CiAgICA8L2c+Cjwvc3ZnPgo='},
            '.pin1': {port: 'E', portid: 'E'},
            '.pin3': {port: 'C', portid: 'C'}
        }
    }, {}, {
        toELKJSON: pnp => {
            const elkJSON = Component.toELKJSON(pnp);
            elkJSON.ports = [{
                id: pnp.get('attrs')['.pin1'].port,
                layoutOptions: {
                    'port.side': 'NORTH',
                    'port.index': '2',
                },
                x: 0.625 * elkJSON.width,
                y: 0.875 * elkJSON.height,
            }, {
                id: pnp.get('attrs')['.pin2'].port,
                layoutOptions: {
                    'port.side': 'WEST',
                    'port.index': '1',
                },
                x: 0.0625 * elkJSON.width,
                y: 0.5 * elkJSON.height,
            }, {
                id: pnp.get('attrs')['.pin3'].port,
                layoutOptions: {
                    'port.side': 'SOUTH',
                    'port.index': '0',
                },
                x: 0.625 * elkJSON.width,
                y: 0.125 * elkJSON.height,
            }];
            elkJSON.layoutOptions.portConstraints = 'FIXED_POS';
            return elkJSON;
        },
    });

    const MOSFET = FourTerminalComponent.define('circuit.MOSFET', {
        attrs: {
            '.pin1': {ref: '.body', 'ref-x': 0.625, 'ref-y': 0.0625, magnet: true, port: 'D', portid: 'D'},
            '.pin2': {ref: '.body', 'ref-x': 0.0625, 'ref-y': 0.5, magnet: true, port: 'G', portid: 'G'},
            '.pin3': {ref: '.body', 'ref-x': 0.9375, 'ref-y': 0.5, magnet: true, port: 'B', portid: 'B'},
            '.pin4': {ref: '.body', 'ref-x': 0.625, 'ref-y': 0.9375, magnet: true, port: 'S', portid: 'S'}
        }
    }, {}, {
        toELKJSON: mos => {
            const elkJSON = Component.toELKJSON(mos);
            elkJSON.ports = [{
                id: mos.get('attrs')['.pin1'].port,
                layoutOptions: {
                    'port.side': 'NORTH',
                    'port.index': '2',
                },
                x: 0.625 * elkJSON.width,
                y: 0.0625 * elkJSON.height,
            }, {
                id: mos.get('attrs')['.pin2'].port,
                layoutOptions: {
                    'port.side': 'WEST',
                    'port.index': '1',
                },
                x: 0.0625 * elkJSON.width,
                y: 0.5 * elkJSON.height,
            }, {
                id: mos.get('attrs')['.pin3'].port,
                layoutOptions: {
                    'port.side': 'EAST',
                    'port.index': '0',
                },
                x: 0.9375 * elkJSON.width,
                y: 0.5 * elkJSON.height,
            }, {
                id: mos.get('attrs')['.pin4'].port,
                layoutOptions: {
                    'port.side': 'SOUTH',
                    'port.index': '0',
                },
                x: 0.625 * elkJSON.width,
                y: 0.9375 * elkJSON.height,
            }];
            elkJSON.layoutOptions.portConstraints = 'FIXED_POS';
            return elkJSON;
        },
    });

    const Junction = FourTerminalComponent.define('circuit.Junction', {
        attrs: {
            '.pin1': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.5, magnet: true, port: 'p1', portid: 'p1'},
            '.pin2': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.5, magnet: true, port: 'p2', portid: 'p2'},
            '.pin3': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.5, magnet: true, port: 'p3', portid: 'p3'},
            '.pin4': {ref: '.body', 'ref-x': 0.5, 'ref-y': 0.5, magnet: true, port: 'p4', portid: 'p4'},
            'text': {
                text: 'Junction'
            }
        }
    }, {}, {
        toELKJSON: junction => {
            const elkJSON = Component.toELKJSON(junction);
            elkJSON.ports = [];
            const portDirections = ['NORTH', 'SOUTH', 'WEST', 'EAST'];
            for (let j = 1; j < 5; j++) {
                elkJSON.ports.push({
                    id: junction.get('attrs')[`.pin${j}`].port,
                    layoutOptions: {
                        'port.side': portDirections[j],
                        'port.index': `${j-1}`,
                    },
                    x: 0.5 * elkJSON.width,
                    y: 0.5 * elkJSON.height,
                });
            }
            elkJSON.layoutOptions.portConstraints = 'FIXED_POS';

            return elkJSON;
        },
    });

    const NMOS = MOSFET.define('circuit.NMOS', {
        attrs: {
            text: {text: 'NMOS'},
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiBjeD0iNDAiIGN5PSI0MCIgaWQ9InN2Z18xMyIgcng9IjIwIiByeT0iMjAiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjUiIHkxPSIyNi40ODcxOCIgeDI9IjI1IiB5Mj0iNTMuNDg3MTgiIGlkPSJzdmdfMTQiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjUuNjE4OTEiIHkxPSIyNi42OTY2MSIgeDI9IjUwIiB5Mj0iMjYuNjk2NjEiIGlkPSJzdmdfMTUiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMTAiIHkxPSI0MCIgeDI9IjI1IiB5Mj0iNDAiIGlkPSJzdmdfMTciIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiLz4KICAgICAgICA8cGF0aCBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiBkPSJtMzcuNDk3MjIsNTUuNDI5MzNsMS43ODExOCwtNC42ODg0MmwxLjc4MTE4LDQuNjg4NDJsLTMuNTYyMzUsMHoiIGlkPSJzdmdfMTgiIHRyYW5zZm9ybT0icm90YXRlKC05MC4zMzk4ODE4OTY5NzI2NiAzOS4yNzgzOTY2MDY0NDUzMSw1My4wODUxMjg3ODQxNzk2OSkgIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjUwIiB5MT0iMTAuNDM5NTYiIHgyPSI1MCIgeTI9IjI3LjQzOTU2IiBpZD0ic3ZnXzE5IiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjMwIiB5MT0iMzUiIHgyPSIzMCIgeTI9IjQ1IiBpZD0ic3ZnXzIxIiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjUwIiB5MT0iNTIuMjgwMjIiIHgyPSI1MCIgeTI9IjY5Ljc4MDIyIiBpZD0ic3ZnXzEiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjUuNzY1NDMiIHkxPSI1Mi45ODA2MSIgeDI9IjUwLjUiIHkyPSI1Mi45ODA2MSIgaWQ9InN2Z18yIiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjMwIiB5MT0iNDAiIHgyPSI3MCIgeTI9IjQwIiBpZD0ic3ZnXzMiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiLz4KICAgIDwvZz4KICAgIDxnIGNsYXNzPSJwb3J0cyI+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtMSIvPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LTIiLz4KICAgICAgICA8ZyBjbGFzcz0icG9ydC0zIi8+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtNCIvPgogICAgPC9nPgo8L3N2Zz4K'}
        }
    });

    const PMOS = MOSFET.define('circuit.PMOS', {
        attrs: {
            text: {text: 'PMOS'},
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KICAgIDxnPgogICAgICAgIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICAgICAgICA8ZWxsaXBzZSBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiBjeD0iNDAiIGN5PSI0MCIgaWQ9InN2Z18xMyIgcng9IjIwIiByeT0iMjAiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjUiIHkxPSIyNi40ODcxOCIgeDI9IjI1IiB5Mj0iNTMuNDg3MTgiIGlkPSJzdmdfMTQiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjUuNjE4OTEiIHkxPSIyNi42OTY2MSIgeDI9IjUwIiB5Mj0iMjYuNjk2NjEiIGlkPSJzdmdfMTUiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMTAiIHkxPSI0MCIgeDI9IjI1IiB5Mj0iNDAiIGlkPSJzdmdfMTciIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiLz4KICAgICAgICA8cGF0aCBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiBkPSJtMzcuNDk3MjIsMjkuMDU1N2wxLjc4MTE4LC00LjY4ODQybDEuNzgxMTgsNC42ODg0MmwtMy41NjIzNSwweiIgaWQ9InN2Z18xOCIgdHJhbnNmb3JtPSJyb3RhdGUoLTkwLjMzOTg4MTg5Njk3MjY2IDM5LjI3ODQwMDQyMTE0MjU4LDI2LjcxMTQ5MDYzMTEwMzUxNikgIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjUwIiB5MT0iMTAuNDM5NTYiIHgyPSI1MCIgeTI9IjI3LjQzOTU2IiBpZD0ic3ZnXzE5IiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjMwIiB5MT0iMzUiIHgyPSIzMCIgeTI9IjQ1IiBpZD0ic3ZnXzIxIiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjUwIiB5MT0iNTIuMjgwMjIiIHgyPSI1MCIgeTI9IjY5Ljc4MDIyIiBpZD0ic3ZnXzEiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiLz4KICAgICAgICA8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMjUuNzY1NDMiIHkxPSI1Mi45ODA2MSIgeDI9IjUwLjUiIHkyPSI1Mi45ODA2MSIgaWQ9InN2Z18yIiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIi8+CiAgICAgICAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjMwIiB5MT0iNDAiIHgyPSI3MCIgeTI9IjQwIiBpZD0ic3ZnXzMiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiLz4KICAgIDwvZz4KICAgIDxnIGNsYXNzPSJwb3J0cyI+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtMSIvPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LTIiLz4KICAgICAgICA8ZyBjbGFzcz0icG9ydC0zIi8+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtNCIvPgogICAgPC9nPgo8L3N2Zz4K'}
        }
    });

    const Source = FourTerminalComponent.define('circuit.Source', {
        attrs: {
            '.pin1': {'ref-x': 0, 'ref-y': 0.3125, magnet: true, port: 'p1', portid: 'p1'},
            '.pin2': {'ref-x': 0, 'ref-y': 0.68, magnet: true, port: 'n1', portid: 'n1'},
            '.pin3': {'ref-x': '100%', 'ref-y': 0.3125, magnet: true, port: 'p2', portid: 'p2'},
            '.pin4': {'ref-x': '100%', 'ref-y': 0.68, magnet: true, port: 'n2', portid: 'n2'},
            text: {'ref-y': '110%'}
        }
    }, {}, {
        toELKJSON: source => {
            const elkJSON = Component.toELKJSON(source);
            elkJSON.ports = [{
                id: source.get('attrs')['.pin1'].port,
                layoutOptions: {
                    'port.side': 'WEST',
                    'port.index': '0',
                },
                x: 0,
                y: 0.3125 * elkJSON.height,
            }, {
                id: source.get('attrs')['.pin2'].port,
                layoutOptions: {
                    'port.side': 'WEST',
                    'port.index': '1',
                },
                x: 0,
                y: 0.68 * elkJSON.height,
            }, {
                id: source.get('attrs')['.pin3'].port,
                layoutOptions: {
                    'port.side': 'EAST',
                    'port.index': '2',
                },
                x: elkJSON.width,
                y: 0.3125 * elkJSON.height,
            }, {
                id: source.get('attrs')['.pin4'].port,
                layoutOptions: {
                    'port.side': 'EAST',
                    'port.index': '3',
                },
                x: elkJSON.width,
                y: 0.68 * elkJSON.height,
            }];
            elkJSON.layoutOptions.portConstraints = 'FIXED_POS';

            return elkJSON;
        }
    });

    const CCC = Source.define('circuit.CCC', {
        attrs: {
            text: {text: 'CCC'},
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KCiA8Zz4KICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+CiAgPHJlY3QgaWQ9InN2Z18xIiBoZWlnaHQ9IjUwIiB3aWR0aD0iNTAiIHk9IjE1IiB4PSIxNSIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgZD0ibTQzLDM5Ljc3Nzc2bDcuNTU1NTQsLTkuNzc3NzZsNy41NTU1NCw5Ljc3Nzc2bC03LjU1NTU0LDkuNzc3NzZsLTcuNTU1NTQsLTkuNzc3NzZ6IiBpZD0ic3ZnXzExIi8+CiAgPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiBkPSJtLTM5LjEzMTUsMjUuMjY1NzNsMC43NDUsLTAuNzQ1bDAuNzQ1LDAuNzQ1bC0wLjc0NSwwLjc0NWwtMC43NDUsLTAuNzQ1eiIgaWQ9InN2Z18xMiIvPgogIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjUwLjg4ODg2IiB5MT0iMzYuMTk0NDUiIHgyPSI1MC44ODg4NiIgeTI9IjQyLjg2MTEiIGlkPSJzdmdfMTMiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiLz4KICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjUxLjQyMTg2IiB5MT0iMzYuMDE0NzgiIHgyPSI0OC45Nzc0NSIgeTI9IjM4LjIzNjk5IiBpZD0ic3ZnXzE1IiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2U9IiMwMDAiLz4KICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjUyLjg0MzA2IiB5MT0iMzYuMTIzMzMiIHgyPSI1MC4zOTg2NSIgeTI9IjM4LjM0NTU1IiBpZD0ic3ZnXzE2IiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2U9IiMwMDAiIHRyYW5zZm9ybT0icm90YXRlKDkwIDUxLjYyMDg0MTk3OTk4MDQ3LDM3LjIzNDQ0NzQ3OTI0ODA1NCkgIi8+CiAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjMyIiB5MT0iMjUiIHgyPSIzMS44MjUwOSIgeTI9IjU1IiBpZD0ic3ZnXzE3IiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIi8+CiAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSIzMS45MDEzMSIgeTE9IjM5Ljc4MTkiIHgyPSIyOS40NTY5IiB5Mj0iNDIuMDA0MTIiIGlkPSJzdmdfMTkiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZT0iIzAwMCIvPgogIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMzQuMzQ5OSIgeTE9IjM5Ljg5MDQ1IiB4Mj0iMzEuOTA1NDkiIHkyPSI0Mi4xMTI2NyIgaWQ9InN2Z18yMCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlPSIjMDAwIiB0cmFuc2Zvcm09InJvdGF0ZSg5MCAzMy4xMjc2Nzc5MTc0ODA0Nyw0MS4wMDE1NTYzOTY0ODQzOCkgIi8+CiAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfOCIgeTI9IjI1IiB4Mj0iMTQuNTkxODIiIHkxPSIyNSIgeDE9IjUuMDY4MDIiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICA8bGluZSBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z185IiB5Mj0iNTQuNTIzODEiIHgyPSIxNC41OTE4MiIgeTE9IjU0LjUyMzgxIiB4MT0iNS4wNjgwMiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzEwIiB5Mj0iMjUiIHgyPSI3NC45MDkyOSIgeTE9IjI1IiB4MT0iNjUuMzg1NDgiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICA8bGluZSBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z18xNCIgeTI9IjU0LjY4MjU0IiB4Mj0iNzQuOTA5MjkiIHkxPSI1NC42ODI1NCIgeDE9IjY1LjM4NTQ4IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiA8L2c+CiA8Zz4KICA8dGl0bGU+TGF5ZXIgMjwvdGl0bGU+CiAgPGcgaWQ9InN2Z18yIiBjbGFzcz0icG9ydHMiPgogICA8ZyBpZD0ic3ZnXzMiIGNsYXNzPSJwb3J0LTEiLz4KICAgPGcgaWQ9InN2Z180IiBjbGFzcz0icG9ydC0yIi8+CiAgIDxnIGlkPSJzdmdfNSIgY2xhc3M9InBvcnQtMyIvPgogICA8ZyBpZD0ic3ZnXzYiIGNsYXNzPSJwb3J0LTQiLz4KICA8L2c+CiAgPGcgaWQ9InN2Z183IiBjbGFzcz0icGluLW5hbWVzIi8+CiA8L2c+CiA8Zz4KICA8dGl0bGU+YmFja2dyb3VuZDwvdGl0bGU+CiAgPHJlY3QgZmlsbD0ibm9uZSIgaWQ9ImNhbnZhc19iYWNrZ3JvdW5kIiBoZWlnaHQ9IjYwMiIgd2lkdGg9IjgwMiIgeT0iLTEiIHg9Ii0xIi8+CiA8L2c+Cjwvc3ZnPg=='},
        }
    });

    const CCV = Source.define('circuit.CCV', {
        attrs: {
            text: {text: 'CCV'},
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KCiA8Zz4KICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+CiAgPHJlY3QgaWQ9InN2Z18xIiBoZWlnaHQ9IjUwIiB3aWR0aD0iNTAiIHk9IjE1IiB4PSIxNSIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgZD0ibTQzLDM5Ljc3Nzc2bDcuNTU1NTQsLTkuNzc3NzZsNy41NTU1NCw5Ljc3Nzc2bC03LjU1NTU0LDkuNzc3NzVsLTcuNTU1NTQsLTkuNzc3NzV6IiBpZD0ic3ZnXzExIi8+CiAgPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiBkPSJtLTM5LjEzMTUsMjUuMjY1NzNsMC43NDUsLTAuNzQ1bDAuNzQ1LDAuNzQ1bC0wLjc0NSwwLjc0NWwtMC43NDUsLTAuNzQ1eiIgaWQ9InN2Z18xMiIvPgogIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSIzMiIgeTE9IjI1IiB4Mj0iMzEuODI1MDkiIHkyPSI1NSIgaWQ9InN2Z18xNyIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBzdHJva2UtbGluZWNhcD0ibnVsbCIvPgogIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMzEuOTAxMzEiIHkxPSIzOS43ODE5IiB4Mj0iMjkuNDU2OSIgeTI9IjQyLjAwNDEyIiBpZD0ic3ZnXzE5IiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2U9IiMwMDAiLz4KICA8bGluZSBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjM0LjM0OTkiIHkxPSIzOS44OTA0NSIgeDI9IjMxLjkwNTQ5IiB5Mj0iNDIuMTEyNjciIGlkPSJzdmdfMjAiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZT0iIzAwMCIgdHJhbnNmb3JtPSJyb3RhdGUoOTAgMzMuMTI3Njk2OTkwOTY2OCw0MS4wMDE1NjQwMjU4Nzg5MSkgIi8+CiAgPHRleHQgZmlsbD0iIzAwMDAwMCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIwIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4PSI0Ny43MDU0OCIgeT0iMzkuMTIyNDMiIGlkPSJzdmdfMjIiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ic3RhcnQiIHhtbDpzcGFjZT0icHJlc2VydmUiPis8L3RleHQ+CiAgPHRleHQgZmlsbD0iIzAwMDAwMCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIwIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4PSI0OS4wNzUzNCIgeT0iNDYuMzE0MjEiIGlkPSJzdmdfMjMiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ic3RhcnQiIHhtbDpzcGFjZT0icHJlc2VydmUiPi08L3RleHQ+CiAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z184IiB5Mj0iMjUiIHgyPSIxNSIgeTE9IjI1IiB4MT0iNSIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSJudWxsIiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIi8+CiAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z185IiB5Mj0iNTUiIHgyPSIxNSIgeTE9IjU1IiB4MT0iNSIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSJudWxsIiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIi8+CiAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z18xMCIgeTI9IjI1IiB4Mj0iNzUiIHkxPSIyNSIgeDE9IjY1IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9Im51bGwiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiLz4KICA8bGluZSBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzEzIiB5Mj0iNTUiIHgyPSI3NSIgeTE9IjU1IiB4MT0iNjUiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0ibnVsbCIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIvPgogPC9nPgogPGc+CiAgPHRpdGxlPkxheWVyIDI8L3RpdGxlPgogIDxnIGlkPSJzdmdfMiIgY2xhc3M9InBvcnRzIj4KICAgPGcgaWQ9InN2Z18zIiBjbGFzcz0icG9ydC0xIi8+CiAgIDxnIGlkPSJzdmdfNCIgY2xhc3M9InBvcnQtMiIvPgogICA8ZyBpZD0ic3ZnXzUiIGNsYXNzPSJwb3J0LTMiLz4KICAgPGcgaWQ9InN2Z182IiBjbGFzcz0icG9ydC00Ii8+CiAgPC9nPgogIDxnIGlkPSJzdmdfNyIgY2xhc3M9InBpbi1uYW1lcyIvPgogPC9nPgogPGc+CiAgPHRpdGxlPmJhY2tncm91bmQ8L3RpdGxlPgogIDxyZWN0IGZpbGw9Im5vbmUiIGlkPSJjYW52YXNfYmFja2dyb3VuZCIgaGVpZ2h0PSI2MDIiIHdpZHRoPSI4MDIiIHk9Ii0xIiB4PSItMSIvPgogPC9nPgo8L3N2Zz4='}
        }
    });

    const VCV = Source.define('circuit.VCV', {
        attrs: {
            text: {text: 'VCV'},
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KCiA8Zz4KICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+CiAgPHJlY3QgaWQ9InN2Z18xIiBoZWlnaHQ9IjUwIiB3aWR0aD0iNTAiIHk9IjE1IiB4PSIxNSIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgZD0ibTI0LjE2NDM4LDM5Ljc3Nzc2bDcuNTU1NTQsLTkuNzc3NzZsNy41NTU1NCw5Ljc3Nzc2bC03LjU1NTU0LDkuNzc3NzVsLTcuNTU1NTQsLTkuNzc3NzV6IiBpZD0ic3ZnXzExIi8+CiAgPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiBkPSJtLTM5LjEzMTUsMjUuMjY1NzNsMC43NDUsLTAuNzQ1bDAuNzQ1LDAuNzQ1bC0wLjc0NSwwLjc0NWwtMC43NDUsLTAuNzQ1eiIgaWQ9InN2Z18xMiIvPgogIDx0ZXh0IGZpbGw9IiMwMDAwMDAiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeD0iMjguODY5ODYiIHk9IjM5LjEyMjQzIiBpZD0ic3ZnXzIyIiBmb250LXNpemU9IjEwIiBmb250LWZhbWlseT0iSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgdGV4dC1hbmNob3I9InN0YXJ0IiB4bWw6c3BhY2U9InByZXNlcnZlIj4rPC90ZXh0PgogIDx0ZXh0IGZpbGw9IiMwMDAwMDAiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeD0iMzAuMjM5NzMiIHk9IjQ1Ljk3MTc1IiBpZD0ic3ZnXzIzIiBmb250LXNpemU9IjEwIiBmb250LWZhbWlseT0iSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgdGV4dC1hbmNob3I9InN0YXJ0IiB4bWw6c3BhY2U9InByZXNlcnZlIj4tPC90ZXh0PgogIDxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgZD0ibTQyLjA0NTE3LDM5Ljc3Nzc2bDcuNTU1NTQsLTkuNzc3NzZsNy41NTU1NCw5Ljc3Nzc2bC03LjU1NTU0LDkuNzc3NzVsLTcuNTU1NTQsLTkuNzc3NzV6IiBpZD0ic3ZnXzI0Ii8+CiAgPHRleHQgZmlsbD0iIzAwMDAwMCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIwIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4PSI0Ni43NTA2NiIgeT0iMzkuMTIyNDMiIGlkPSJzdmdfMjUiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ic3RhcnQiIHhtbDpzcGFjZT0icHJlc2VydmUiPis8L3RleHQ+CiAgPHRleHQgZmlsbD0iIzAwMDAwMCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIwIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4PSI0OC4xMjA1MiIgeT0iNDUuOTcxNzUiIGlkPSJzdmdfMjYiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ic3RhcnQiIHhtbDpzcGFjZT0icHJlc2VydmUiPi08L3RleHQ+CiAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z184IiB5Mj0iMjUiIHgyPSIxNS40MzA4NyIgeTE9IjI1IiB4MT0iNSIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSJudWxsIiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIi8+CiAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z185IiB5Mj0iNTUiIHgyPSIxNS40MzA4NyIgeTE9IjU1IiB4MT0iNSIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSJudWxsIiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIi8+CiAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z18xMCIgeTI9IjU1IiB4Mj0iNzUiIHkxPSI1NSIgeDE9IjY1IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9Im51bGwiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiLz4KICA8bGluZSBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzEzIiB5Mj0iMjUiIHgyPSI3NSIgeTE9IjI1IiB4MT0iNjUiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0ibnVsbCIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIvPgogPC9nPgogPGc+CiAgPHRpdGxlPkxheWVyIDI8L3RpdGxlPgogIDxnIGlkPSJzdmdfMiIgY2xhc3M9InBvcnRzIj4KICAgPGcgaWQ9InN2Z18zIiBjbGFzcz0icG9ydC0xIi8+CiAgIDxnIGlkPSJzdmdfNCIgY2xhc3M9InBvcnQtMiIvPgogICA8ZyBpZD0ic3ZnXzUiIGNsYXNzPSJwb3J0LTMiLz4KICAgPGcgaWQ9InN2Z182IiBjbGFzcz0icG9ydC00Ii8+CiAgPC9nPgogIDxnIGlkPSJzdmdfNyIgY2xhc3M9InBpbi1uYW1lcyIvPgogPC9nPgogPGc+CiAgPHRpdGxlPmJhY2tncm91bmQ8L3RpdGxlPgogIDxyZWN0IGZpbGw9Im5vbmUiIGlkPSJjYW52YXNfYmFja2dyb3VuZCIgaGVpZ2h0PSI2MDIiIHdpZHRoPSI4MDIiIHk9Ii0xIiB4PSItMSIvPgogPC9nPgo8L3N2Zz4='}
        }
    });

    const VCC = Source.define('circuit.VCC', {
        attrs: {
            text: {text: 'VCC'},
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KCiA8Zz4KICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+CiAgPHJlY3QgaWQ9InN2Z18xIiBoZWlnaHQ9IjUwIiB3aWR0aD0iNTAiIHk9IjE1IiB4PSIxNC42Njg4NyIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgZD0ibTI0LjE2NDM4LDM5Ljc3Nzc2bDcuNTU1NTQsLTkuNzc3NzZsNy41NTU1NCw5Ljc3Nzc2bC03LjU1NTU0LDkuNzc3NzVsLTcuNTU1NTQsLTkuNzc3NzV6IiBpZD0ic3ZnXzExIi8+CiAgPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiBkPSJtLTM5LjEzMTUsMjUuMjY1NzNsMC43NDUsLTAuNzQ1bDAuNzQ1LDAuNzQ1bC0wLjc0NSwwLjc0NWwtMC43NDUsLTAuNzQ1eiIgaWQ9InN2Z18xMiIvPgogIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iNDguNTc0NDQiIHkxPSIyNSIgeDI9IjQ4LjM5OTUzIiB5Mj0iNTUiIGlkPSJzdmdfMTciIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZT0iIzAwMCIvPgogIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iNDguNDc1NzUiIHkxPSIzOS43ODE5IiB4Mj0iNDYuMDMxMzQiIHkyPSI0Mi4wMDQxMiIgaWQ9InN2Z18xOSIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlPSIjMDAwIi8+CiAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBmaWxsLW9wYWNpdHk9Im51bGwiIHgxPSI1MC45MjQzNCIgeTE9IjM5Ljg5MDQ1IiB4Mj0iNDguNDc5OTMiIHkyPSI0Mi4xMTI2NyIgaWQ9InN2Z18yMCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlPSIjMDAwIiB0cmFuc2Zvcm09InJvdGF0ZSg5MCA0OS43MDIxMjkzNjQwMTM2Nyw0MS4wMDE1NjQwMjU4Nzg5MSkgIi8+CiAgPHRleHQgZmlsbD0iIzAwMDAwMCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIwIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4PSIyOC44Njk4NiIgeT0iMzkuMTIyNDMiIGlkPSJzdmdfMjIiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ic3RhcnQiIHhtbDpzcGFjZT0icHJlc2VydmUiPis8L3RleHQ+CiAgPHRleHQgZmlsbD0iIzAwMDAwMCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIwIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4PSIzMC4yMzk3MyIgeT0iNDUuOTcxNzUiIGlkPSJzdmdfMjMiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ic3RhcnQiIHhtbDpzcGFjZT0icHJlc2VydmUiPi08L3RleHQ+CiAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z184IiB5Mj0iMjUiIHgyPSIxNSIgeTE9IjI1IiB4MT0iNSIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSJudWxsIiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIi8+CiAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z185IiB5Mj0iNTUiIHgyPSIxNSIgeTE9IjU1IiB4MT0iNSIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSJudWxsIiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIi8+CiAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z18xMCIgeTI9IjU1IiB4Mj0iNzUiIHkxPSI1NSIgeDE9IjY1IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9Im51bGwiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiLz4KICA8bGluZSBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzEzIiB5Mj0iMjUiIHgyPSI3NSIgeTE9IjI1IiB4MT0iNjUiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0ibnVsbCIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIvPgogPC9nPgogPGc+CiAgPHRpdGxlPkxheWVyIDI8L3RpdGxlPgogIDxnIGlkPSJzdmdfMiIgY2xhc3M9InBvcnRzIj4KICAgPGcgaWQ9InN2Z18zIiBjbGFzcz0icG9ydC0xIi8+CiAgIDxnIGlkPSJzdmdfNCIgY2xhc3M9InBvcnQtMiIvPgogICA8ZyBpZD0ic3ZnXzUiIGNsYXNzPSJwb3J0LTMiLz4KICAgPGcgaWQ9InN2Z182IiBjbGFzcz0icG9ydC00Ii8+CiAgPC9nPgogIDxnIGlkPSJzdmdfNyIgY2xhc3M9InBpbi1uYW1lcyIvPgogPC9nPgogPGc+CiAgPHRpdGxlPmJhY2tncm91bmQ8L3RpdGxlPgogIDxyZWN0IGZpbGw9Im5vbmUiIGlkPSJjYW52YXNfYmFja2dyb3VuZCIgaGVpZ2h0PSI2MDIiIHdpZHRoPSI4MDIiIHk9Ii0xIiB4PSItMSIvPgogPC9nPgo8L3N2Zz4='}
        }
    });

    const Transformer = Source.define('circuit.Transformer', {
        attrs: {
            text: {text: 'Transformer'},
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KCiA8Zz4KICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+CiAgPHJlY3QgaWQ9InN2Z18xIiBoZWlnaHQ9IjUwIiB3aWR0aD0iNTAiIHk9IjE1IiB4PSIxNSIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Im0yMC40MDc0Miw0MC43NDA2OWEwLjA3NjMsMC4wNzYzIDAgMCAxIDcuNjI5NjMsMG0wLDBhMC4wNzYzLDAuMDc2MyAwIDAgMSA3LjYyOTYzLDBtMCwwYTAuMDc2MywwLjA3NjMgMCAwIDEgNy42Mjk2MywwIiBmaWxsPSJub25lIiBpZD0ic3ZnXzIiIHRyYW5zZm9ybT0icm90YXRlKDkwIDMxLjg1MTg2NTc2ODQzMjYxNCwzOC44MzMyNzg2NTYwMDU4NykgIiBzdHJva2U9ImJsYWNrIi8+CiAgPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgZmlsbC1vcGFjaXR5PSJudWxsIiB4MT0iMzcuMTExMTEiIHkxPSIyNS45NzIyNSIgeDI9IjM3LjU1NTU1IiB5Mj0iNTEuNzQ5OTciIGlkPSJzdmdfNCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBzdHJva2UtbGluZWNhcD0ibnVsbCIvPgogIDxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIGZpbGwtb3BhY2l0eT0ibnVsbCIgeDE9IjQzLjMzMzMyIiB5MT0iMjUuOTcyMjUiIHgyPSI0My43Nzc3NiIgeTI9IjUxLjc0OTk3IiBpZD0ic3ZnXzUiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiLz4KICA8cGF0aCBkPSJtMzcuMjk2MjcsNDAuNzQwNjlhMC4wNzYzLDAuMDc2MyAwIDAgMSA3LjYyOTY0LDBtMCwwYTAuMDc2MywwLjA3NjMgMCAwIDEgNy42Mjk2MywwbTAsMGEwLjA3NjMsMC4wNzYzIDAgMCAxIDcuNjI5NjQsMCIgZmlsbD0ibm9uZSIgaWQ9InN2Z182IiB0cmFuc2Zvcm09InJvdGF0ZSgtOTAgNDguNzQwNzIyNjU2MjUwMDEsMzguODMzMjg2Mjg1NDAwMzkpICIgc3Ryb2tlPSJibGFjayIvPgogIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzEyIiB5Mj0iMjUiIHgyPSIxNSIgeTE9IjI1IiB4MT0iNSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzEzIiB5Mj0iNTUiIHgyPSIxNSIgeTE9IjU1IiB4MT0iNSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzE0IiB5Mj0iNTUiIHgyPSI3NSIgeTE9IjU1IiB4MT0iNjUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICA8bGluZSBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z18xNSIgeTI9IjI1IiB4Mj0iNzUiIHkxPSIyNSIgeDE9IjY1IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiA8L2c+CiA8Zz4KICA8dGl0bGU+TGF5ZXIgMjwvdGl0bGU+CiAgPGcgaWQ9InN2Z18zIiBjbGFzcz0icG9ydHMiPgogICA8ZyBpZD0ic3ZnXzciIGNsYXNzPSJwb3J0LTEiLz4KICAgPGcgaWQ9InN2Z184IiBjbGFzcz0icG9ydC0yIi8+CiAgIDxnIGlkPSJzdmdfOSIgY2xhc3M9InBvcnQtMyIvPgogICA8ZyBpZD0ic3ZnXzEwIiBjbGFzcz0icG9ydC00Ii8+CiAgPC9nPgogIDxnIGlkPSJzdmdfMTEiIGNsYXNzPSJwaW4tbmFtZXMiLz4KIDwvZz4KIDxnPgogIDx0aXRsZT5iYWNrZ3JvdW5kPC90aXRsZT4KICA8cmVjdCBmaWxsPSJub25lIiBpZD0iY2FudmFzX2JhY2tncm91bmQiIGhlaWdodD0iNjAyIiB3aWR0aD0iODAyIiB5PSItMSIgeD0iLTEiLz4KIDwvZz4KPC9zdmc+'}
        }
    });

    const Gyrator = Source.define('circuit.Transformer', {
        attrs: {
            text: {text: 'Transformer'},
            image: {'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiA8IS0tIENyZWF0ZWQgd2l0aCBNZXRob2QgRHJhdyAtIGh0dHA6Ly9naXRodWIuY29tL2R1b3BpeGVsL01ldGhvZC1EcmF3LyAtLT4KCiA8Zz4KICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+CiAgPHJlY3QgaWQ9InN2Z18xIiBoZWlnaHQ9IjUwIiB3aWR0aD0iNTAiIHk9IjE1IiB4PSIxNSIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogIDx0ZXh0IHhtbDpzcGFjZT0icHJlc2VydmUiIHRleHQtYW5jaG9yPSJzdGFydCIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGlkPSJzdmdfMiIgeT0iNDUuMiIgeD0iMTkuODAwMDEiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMCIgc3Ryb2tlPSIjMDAwIiBmaWxsPSIjMDAwMDAwIj7PgC1yYWRpYW5zPC90ZXh0PgogIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49Im51bGwiIGlkPSJzdmdfNCIgeTI9IjMyLjE3NSIgeDI9IjYwIiB5MT0iMzIuMTc1IiB4MT0iMjAuMjAwMDEiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICA8bGluZSBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzUiIHkyPSIzMi41NzUiIHgyPSI2MC4xOTk5OSIgeTE9IjI5LjM3NTAxIiB4MT0iNTYuNTk5OTkiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICA8bGluZSB0cmFuc2Zvcm09InJvdGF0ZSg5MCA1OC4zOTk5OTAwODE3ODcxMSwzMy4zNzUwMDAwMDAwMDAwMSkgIiBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzciIHkyPSIzNC45NzUiIHgyPSI2MC4xOTk5OSIgeTE9IjMxLjc3NTAxIiB4MT0iNTYuNTk5OTkiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICA8bGluZSBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z184IiB5Mj0iMjUiIHgyPSIxNC41OTE4MiIgeTE9IjI1IiB4MT0iNS4wNjgwMiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzkiIHkyPSI1NC41MjM4MSIgeDI9IjE0LjU5MTgyIiB5MT0iNTQuNTIzODEiIHgxPSI1LjA2ODAyIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9InVuZGVmaW5lZCIgc3Ryb2tlLWxpbmVqb2luPSJ1bmRlZmluZWQiIGlkPSJzdmdfMTAiIHkyPSIyNSIgeDI9Ijc0LjkwOTI5IiB5MT0iMjUiIHgxPSI2NS4zODU0OCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0ibm9uZSIvPgogIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzE0IiB5Mj0iNTQuNjgyNTQiIHgyPSI3NC45MDkyOSIgeTE9IjU0LjY4MjU0IiB4MT0iNjUuMzg1NDgiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KIDwvZz4KIDxnPgogIDx0aXRsZT5MYXllciAyPC90aXRsZT4KICA8ZyBjbGFzcz0icG9ydHMiIGlkPSJzdmdfMyI+CiAgIDxnIGNsYXNzPSJwb3J0LTEiIGlkPSJzdmdfNiIvPgogICA8ZyBjbGFzcz0icG9ydC0yIiBpZD0ic3ZnXzgiLz4KICAgPGcgY2xhc3M9InBvcnQtMyIgaWQ9InN2Z185Ii8+CiAgIDxnIGNsYXNzPSJwb3J0LTQiIGlkPSJzdmdfMTAiLz4KICA8L2c+CiAgPGcgY2xhc3M9InBpbi1uYW1lcyIgaWQ9InN2Z18xMSIvPgogPC9nPgo8L3N2Zz4='}
        }
    });

    const OpAmp = FiveTerminalComponent.define('circuit.OpAmp', {
        attrs: {
            '.pin1': {'ref-x': 0.5, 'ref-y': 0.25, magnet: true, port: 'VMax', portid: 'VMax'},
            '.pin2': {'ref-x': 0.5, 'ref-y': 0.75, magnet: true, port: 'VMin', portid: 'VMin'},
            '.pin3': {'ref-x': 0.125, 'ref-y': 0.375, magnet: true, port: 'in_p', portid: 'in_p'},
            '.pin4': {'ref-x': 0.125, 'ref-y': 0.625, magnet: true, port: 'in_n', portid: 'in_n'},
            '.pin5': {'ref-x': 0.875, 'ref-y': 0.5, magnet: true, port: 'out', portid: 'out'},
            text: {text: 'OpAmp', 'ref-y': '100%'},
            image: {'xlink:href': 'data:image/svg+xml;base64,Cjxzdmcgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgPCEtLSBDcmVhdGVkIHdpdGggTWV0aG9kIERyYXcgLSBodHRwOi8vZ2l0aHViLmNvbS9kdW9waXhlbC9NZXRob2QtRHJhdy8gLS0+CiAgICA8Zz4KICAgICAgICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+CiAgICAgICAgPHBhdGggc3Ryb2tlPSIjMDAwIiB0cmFuc2Zvcm09InJvdGF0ZSg5MCA0MC4wNDkwOTEzMzkxMTEzMywzOS45NTU1ODkyOTQ0MzM2KSAiIGlkPSJzdmdfNCIgZD0ibTIzLjY5Mzk1LDYwLjUxNjM0bDE2LjM1NTE0LC00MS4xMjE1bDE2LjM1NTE0LDQxLjEyMTVsLTMyLjcxMDI4LDB6IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49Im51bGwiIGlkPSJzdmdfNyIgeTI9IjMyIiB4Mj0iNDAiIHkxPSIyNSIgeDE9IjQwIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z184IiB5Mj0iNTUiIHgyPSI0MCIgeTE9IjQ4IiB4MT0iNDAiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzEwIiB5Mj0iMzAiIHgyPSIyMCIgeTE9IjMwIiB4MT0iMTUiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzExIiB5Mj0iNTAiIHgyPSIyMCIgeTE9IjUwIiB4MT0iMTUiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzEyIiB5Mj0iNDAiIHgyPSI2NSIgeTE9IjQwIiB4MT0iNjAiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8dGV4dCB4bWw6c3BhY2U9InByZXNlcnZlIiB0ZXh0LWFuY2hvcj0ic3RhcnQiIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBpZD0ic3ZnXzEzIiB5PSIzMy44MzE3OCIgeD0iMjAuMTg2OTIiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMCIgc3Ryb2tlPSIjMDAwIiBmaWxsPSIjMDAwMDAwIj4rPC90ZXh0PgogICAgICAgIDx0ZXh0IHhtbDpzcGFjZT0icHJlc2VydmUiIHRleHQtYW5jaG9yPSJzdGFydCIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGlkPSJzdmdfMTQiIHk9IjUzLjI3MTAzIiB4PSIyMS42ODIyNCIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIwIiBzdHJva2U9IiMwMDAiIGZpbGw9IiMwMDAwMDAiPi08L3RleHQ+CiAgICA8L2c+CiAgICA8ZyBjbGFzcz0icG9ydHMiPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LTEiLz4KICAgICAgICA8ZyBjbGFzcz0icG9ydC0yIi8+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtMyIvPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LTQiLz4KICAgICAgICA8ZyBjbGFzcz0icG9ydC01Ii8+CiAgICA8L2c+Cjwvc3ZnPgo='}
        }
    }, {}, {
        toELKJSON: opAmp => {
            const elkJSON = Component.toELKJSON(opAmp);
            elkJSON.ports = [{
                id: opAmp.get('attrs')['.pin1'].port,
                layoutOptions: {
                    'port.side': 'NORTH',
                    'port.index': '0',
                },
                x: 0.5 * elkJSON.width,
                y: 0.25 * elkJSON.height,
            }, {
                id: opAmp.get('attrs')['.pin2'].port,
                layoutOptions: {
                    'port.side': 'SOUTH',
                    'port.index': '1',
                },
                x: 0.5 * elkJSON.width,
                y: 0.75 * elkJSON.height,
            }, {
                id: opAmp.get('attrs')['.pin3'].port,
                layoutOptions: {
                    'port.side': 'WEST',
                    'port.index': '2',
                },
                x: 0.125 * elkJSON.width,
                y: 0.375 * elkJSON.height,
            }, {
                id: opAmp.get('attrs')['.pin4'].port,
                layoutOptions: {
                    'port.side': 'WEST',
                    'port.index': '3',
                },
                x: 0.125 * elkJSON.width,
                y: 0.625 * elkJSON.height,
            }, {
                id: opAmp.get('attrs')['.pin5'].port,
                layoutOptions: {
                    'port.side': 'EAST',
                    'port.index': '4',
                },
                x: 0.875 * elkJSON.width,
                y: 0.5 * elkJSON.height,
            }];
            elkJSON.layoutOptions.portConstraints = 'FIXED_POS';

            return elkJSON;
        }
    });

    const OpAmpDetailed = OpAmp.define('circuit.OpAmpDetailed', {
        attrs: {
            '.pin1': {'ref-x': 0.5, 'ref-y': 0.25, magnet: true, port: 'p_supply', portid: 'p_supply'},
            '.pin2': {'ref-x': 0.5, 'ref-y': 0.75, magnet: true, port: 'm_supply', portid: 'm_supply'},
            '.pin3': {'ref-x': 0.125, 'ref-y': 0.375, magnet: true, port: 'm', portid: 'm'},
            '.pin4': {'ref-x': 0.125, 'ref-y': 0.625, magnet: true, port: 'p', portid: 'p'},
            '.pin5': {'ref-x': 0.875, 'ref-y': 0.5, magnet: true, port: 'outp', portid: 'outp'},
            text: {text: 'OpAmpDetailed', 'ref-y': '100%'},
            image: {'xlink:href': 'data:image/svg+xml;base64,Cjxzdmcgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgPCEtLSBDcmVhdGVkIHdpdGggTWV0aG9kIERyYXcgLSBodHRwOi8vZ2l0aHViLmNvbS9kdW9waXhlbC9NZXRob2QtRHJhdy8gLS0+CiAgICA8Zz4KICAgICAgICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+CiAgICAgICAgPHBhdGggc3Ryb2tlPSIjMDAwIiB0cmFuc2Zvcm09InJvdGF0ZSg5MCA0MC4wNDkwOTEzMzkxMTEzMywzOS45NTU1ODkyOTQ0MzM2KSAiIGlkPSJzdmdfNCIgZD0ibTIzLjY5Mzk1LDYwLjUxNjM0bDE2LjM1NTE0LC00MS4xMjE1bDE2LjM1NTE0LDQxLjEyMTVsLTMyLjcxMDI4LDB6IiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgogICAgICAgIDxsaW5lIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49Im51bGwiIGlkPSJzdmdfNyIgeTI9IjMyIiB4Mj0iNDAiIHkxPSIyNSIgeDE9IjQwIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgICAgICAgPGxpbmUgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgaWQ9InN2Z184IiB5Mj0iNTUiIHgyPSI0MCIgeTE9IjQ4IiB4MT0iNDAiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzEwIiB5Mj0iMzAiIHgyPSIyMCIgeTE9IjMwIiB4MT0iMTUiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzExIiB5Mj0iNTAiIHgyPSIyMCIgeTE9IjUwIiB4MT0iMTUiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8bGluZSBzdHJva2UtbGluZWNhcD0ibnVsbCIgc3Ryb2tlLWxpbmVqb2luPSJudWxsIiBpZD0ic3ZnXzEyIiB5Mj0iNDAiIHgyPSI2NSIgeTE9IjQwIiB4MT0iNjAiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz4KICAgICAgICA8dGV4dCB4bWw6c3BhY2U9InByZXNlcnZlIiB0ZXh0LWFuY2hvcj0ic3RhcnQiIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBpZD0ic3ZnXzEzIiB5PSIzMy44MzE3OCIgeD0iMjAuMTg2OTIiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMCIgc3Ryb2tlPSIjMDAwIiBmaWxsPSIjMDAwMDAwIj4rPC90ZXh0PgogICAgICAgIDx0ZXh0IHhtbDpzcGFjZT0icHJlc2VydmUiIHRleHQtYW5jaG9yPSJzdGFydCIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGlkPSJzdmdfMTQiIHk9IjUzLjI3MTAzIiB4PSIyMS42ODIyNCIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIwIiBzdHJva2U9IiMwMDAiIGZpbGw9IiMwMDAwMDAiPi08L3RleHQ+CiAgICA8L2c+CiAgICA8ZyBjbGFzcz0icG9ydHMiPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LTEiLz4KICAgICAgICA8ZyBjbGFzcz0icG9ydC0yIi8+CiAgICAgICAgPGcgY2xhc3M9InBvcnQtMyIvPgogICAgICAgIDxnIGNsYXNzPSJwb3J0LTQiLz4KICAgICAgICA8ZyBjbGFzcz0icG9ydC01Ii8+CiAgICA8L2c+Cjwvc3ZnPgo='}
        }
    });

    const Wire = joint.shapes.standard.Link.define('circuit.Wire', {
        attrs: {
            line: {
                targetMarker: {
                    d: ''
                },
                strokeWidth: 1.0,
                stroke: '#0000FF'
            },
        }
    });

    const ELKWire = joint.dia.Link.define('circuit.ELKWire', {
        z: 2,
        attrs: {
            root: {
                cursor: 'pointer'
            },
            line: {
                fill: 'none',
                connection: true,
                stroke: '#0000FF',
                strokeWidth: 1,
                targetMarker: {'d': ''}
            }
        }
    }, {
        markup: [{
            tagName: 'path',
            selector: 'line'
        }]
    });


    const Circuit = joint.shapes.standard.Rectangle.define('circuit.Circuit', {
        size: {width: 100, height: 100},
        ports: {
            groups: {
                'leftPorts': {
                    position: {
                        name: 'left'
                    },
                    label: {
                        position: 'right',
                    },
                    attrs: {
                        circle: {
                            magnet: true,
                            port: 'port'
                        }
                    },
                    markup: '<circle r="5" stroke="#000090" stroke-width="2" fill="#C0C0C0"/>',
                },
                'rightPorts': {
                    position: {
                        name: 'right'
                    },
                    label: {
                        position: 'left',
                    },
                    attrs: {
                        circle: {
                            magnet: true,
                            port: 'port'
                        }
                    },
                    markup: '<circle r="5" stroke="#000090" stroke-width="2" fill="#C0C0C0"/>',
                },
            },
            items: []
        },
        attrs: {
            text: {text: 'Circuit', 'ref-y': '60%', fontWeight: 'bold', fontSize: 14},
            body: {fill: '#CECECE'}
        }
    }, {}, {
        addLeftPort: (circuit, portId, portLabel) => {
            circuit.addPort({
                group: 'leftPorts',
                attrs: {
                    text: {
                        text: portLabel
                    },
                    circle: {
                        port: portId
                    }
                }
            });
        },

        addRightPort: (circuit, portId, portLabel) => {
            circuit.addPort({
                group: 'rightPorts',
                attrs: {
                    text: {
                        text: portLabel
                    },
                    circle: {
                        port: portId
                    }
                }
            });
        },

        build: (ports) => {
            let height = 100;
            if (ports.length > 10) {
                height += ((ports.length % 2 === 0 ? ports.length : ports.length + 1) - 10) * 20;
            }
            const circuit = new Circuit({
                size: {width: 100, height: height}
            });

            for (let j = 0; j < ports.length; j++) {
                if (j % 2 === 0) {
                    Circuit.addRightPort(circuit, ports[j].id, ports[j].label);
                } else {
                    Circuit.addLeftPort(circuit, ports[j].id, ports[j].label);
                }
            }
            return circuit;
        },

        toELKJSON: (circuit) => {
            const portPositions = circuit.getPortsPositions('leftPorts');
            Object.assign(portPositions, circuit.getPortsPositions('rightPorts'));
            const elkJSON = Component.toELKJSON(circuit);
            elkJSON.ports = [];
            circuit.get('ports').items.forEach((port, index) => {
                const portId = port.attrs.circle.port;
                const {x, y} = portPositions[portId];
                elkJSON.ports.push({
                    id: portId,
                    radius: 5,
                    x: x,
                    y: y,
                    layoutOptions: {
                        'port.side': port.group === 'leftPorts' ? 'WEST' : 'EAST',
                        'port.index': `${index}`,
                    }
                });
            });

            elkJSON['layoutOptions']['portConstraints'] = 'FIXED_POS';
            return elkJSON;
        }
    });

    const applyTransition = function (paper, element, x, y) {
        element.transition('position/x', x, {
            delay: 100,
            duration: 100,
            timingFunction: function (t) {
                return t * t;
            },
            valueFunction: function (a, b) {
                return function (t) {
                    return a + (b - a) * t;
                };
            }
        });

        element.transition('position/y', y, {
            delay: 100,
            duration: 100,
            timingFunction: function (t) {
                return t * t;
            },
            valueFunction: function (a, b) {
                return function (t) {
                    return a + (b - a) * t;
                };
            }
        });

        const elementView = element.findView(paper);
        elementView.highlight();
        setTimeout(() => elementView.unhighlight(), 1000);
    };

    joint.layout.elk = {};

    joint.layout.elk.layoutLayered = function (graph, paper, elk, animate = true) {
        const elkJSON = {
            id: 'jointGraph',
            width: paper.options.width,
            height: paper.options.height,
            layoutOptions: {
                'elk.algorithm': 'layered',
                'org.eclipse.elk.edgeRouting': 'ORTHOGONAL',
                'org.eclipse.elk.direction': 'DOWN',
                'org.eclipse.elk.spacing.nodeNode': 30,
                'org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers': 30,
                'org.eclipse.elk.layered.spacing.edgeEdgeBetweenLayers': 30,
                'org.eclipse.elk.spacing.edgeNode': 30,
                'org.eclipse.elk.spacing.edgeEdge': 30,
            },
            children: [],
            edges: [],
        };

        const elements = graph.getElements();
        elements.forEach(element => {
            const elementType = joint.shapes.circuit[element.get('type')];
            if(elementType) {
                elkJSON.children.push(elementType.toELKJSON(element));
            } else {
                element.remove();
            }
        });

        const links = graph.getLinks();
        links.forEach(link => {
            elkJSON.edges.push({
                id: link.id,
                source: link.source().id,
                target: link.target().id,
                sourcePort: link.source().port,
                targetPort: link.target().port
            });
        });

        elk.layout(elkJSON).then(elkJSONWithCoordinates => {
            elkJSONWithCoordinates.children.forEach(child => {
                const element = graph.getCell(child.id);
                if (!animate) {
                    element.position(child.x, child.y);
                } else {
                    applyTransition(paper, element, child.x, child.y);
                }

                graph.removeLinks(element);
            });

            elkJSONWithCoordinates.edges.forEach(link => {
                const {bendPoints = []} = link.sections[0];
                const junctionPoints = link.junctionPoints || [];

                junctionPoints.forEach(point => {
                    const SIZE = 10;
                    const position = {
                        x: point.x - SIZE / 2,
                        y: point.y - SIZE / 2
                    };
                    const junctionPoint = new joint.shapes.standard.Circle({
                        size: {height: SIZE, width: SIZE},
                        attrs: {
                            body: {
                                stroke: '#000090',
                                fill: '#C0C0C0',
                                'stroke-width': 1
                            }
                        }
                    });
                    junctionPoint.addTo(graph);
                    if (!animate) {
                        junctionPoint.position(position.x, position.y);
                    } else {
                        applyTransition(paper, junctionPoint, position.x, position.y);
                    }
                });

                const source = link.source;
                const target = link.target;
                const sourcePort = link.sourcePort;
                const targetPort = link.targetPort;

                const shape = new joint.shapes.circuit.ELKWire({
                    source: {
                        id: source,
                        port: sourcePort
                    },
                    target: {
                        id: target,
                        port: targetPort,
                    },
                    vertices: bendPoints,
                });

                shape.addTo(graph);
            });
        });
    };

    joint.shapes.circuit = {
        Pin: Pin,
        Ground: Ground,
        Resistor: Resistor,
        Potentiometer: Potentiometer,
        VariableResistor: VariableResistor,
        Capacitor: Capacitor,
        VariableCapacitor: VariableCapacitor,
        Inductor: Inductor,
        SaturatingInductor: SaturatingInductor,
        VariableInductor: VariableInductor,
        Conductor: Conductor,
        VariableConductor: VariableConductor,
        Diode: Diode,
        ZDiode: ZDiode,
        SchottkyDiode: SchottkyDiode,
        LED: LED,
        Voltage: Voltage,
        Current: Current,
        PulseVoltageSource: PulseVoltageSource,
        PulseCurrentSource: PulseCurrentSource,
        PieceWiseLinearVoltageSource: PieceWiseLinearVoltageSource,
        PieceWiseLinearCurrentSource: PieceWiseLinearCurrentSource,
        SinusoidalVoltageSource: SinusoidalVoltageSource,
        SinusoidalCurrentSource: SinusoidalCurrentSource,
        RandomVoltageSource: RandomVoltageSource,
        RandomCurrentSource: RandomCurrentSource,
        ExponentialVoltageSource: ExponentialVoltageSource,
        ExponentialCurrentSource: ExponentialCurrentSource,
        AmplitudeModulatedVoltageSource: AmplitudeModulatedVoltageSource,
        AmplitudeModulatedCurrentSource: AmplitudeModulatedCurrentSource,
        SingleFrequencyFMVoltageSource: SingleFrequencyFMVoltageSource,
        SingleFrequencyFMCurrentSource: SingleFrequencyFMCurrentSource,
        AcLine: AcLine,
        NPN: NPN,
        PNP: PNP,
        Junction: Junction,
        NMOS: NMOS,
        PMOS: PMOS,
        CCC: CCC,
        CCV: CCV,
        VCV: VCV,
        VCC: VCC,
        Transformer: Transformer,
        Gyrator: Gyrator,
        OpAmp: OpAmp,
        OpAmpDetailed: OpAmpDetailed,
        Wire: Wire,
        ELKWire: ELKWire,
        Circuit: Circuit,
    };
};

module.exports = {
    defineElectricCircuitsDomain: defineElectricCircuitsDomain,
};
