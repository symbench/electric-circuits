<script>
    import {defineElectricCircuitsDomain} from './circuits';

    const jq = window.$;

    let joint = null,
        dagre = null,
        graphlib = null,
        elk = null;
    let navBar;
    let addedCellIds = null;
    let wires = null;
    let eventElement;
    let circuitContainer,
        componentBrowserContainer;
    let circuitPaper,
        componentBrowserPaper;
    let circuitGraph,
        componentBrowserGraph;
    let zoomValues, currentZoomLevel;
    let dashboardTitle;
    let flyDragged;


    export function initialize(jointInstance, dagreInstance, graphlibInstance, ELK) {
        joint = jointInstance;
        dagre = dagreInstance;
        graphlib = graphlibInstance;
        elk = new ELK();
        addedCellIds = [];
        wires = {};
        currentZoomLevel = 1.0;
        zoomValues = [0.25, 0.5, 0.75, 1.0, 1.5, 2, 2.5, 3];
        dashboardTitle = '';
        flyDragged = false;
        defineElectricCircuitsDomain(joint);
    }

    export function render(opts) {
        renderCircuit(opts.width, opts.height);
        renderComponents(opts.validComponents);
    }

    export function adjustPaperDimensions(width, height) {
        const navBarHeight = jq(navBar).height();
        const navBarWidth = jq(navBar).width();
        if (navBarWidth < width) {
            width = navBarWidth;
        }
        circuitPaper.setDimensions(width * 10 / 12, height - navBarHeight);
        layoutComponentBrowser(width * 2 / 12, height);
        zoom(currentZoomLevel);
    }

    export function clearGraph() {
        circuitGraph.clear();
        addedCellIds = [];
        wires = {};
        layout();
    }

    export function destroyGraph() {
        clearGraph();
        circuitPaper.clear();
    }

    export function getZoomLevels() {
        return zoomValues;
    }

    export function zoom(zoomLevel) {
        if (circuitPaper) {
            currentZoomLevel = zoomLevel;
            circuitPaper.scale(zoomLevel * 0.75);
            circuitPaper.fitToContent({
                useModelGeometry: true,
                padding: {
                    horizontal: 100 * zoomLevel,
                    vertical: 30 * zoomLevel
                },
                allowNewOrigin: 'any',
                minWidth: circuitPaper.options.width,
                minHeight: circuitPaper.options.height
            });
        }
        if (circuitPaper && componentBrowserPaper) {
            jq("#componentBrowserContainer").css({
                height: circuitPaper.options.height
            });
        }
    }

    export function events() {
        return eventElement;
    }

    export function setTitle(title) {
        dashboardTitle = title;
    }

    export function updateCell(cellJSON) {
        const cell = circuitGraph.getCell(cellJSON.id);
        if (cell) {
            cell.set(cellJSON);
        }
    }

    export function addCell(cellJSON) {
        if (cellJSON.type === 'Wire') {
            wires[cellJSON.id] = cellJSON;
        } else {
            const cell = new joint.shapes[cellJSON.domainPrefix][cellJSON.type](cellJSON);
            circuitGraph.addCell(cell);
            addedCellIds.push(cellJSON.id);
        }

        Object.keys(wires).forEach(wireId => {
            const wireJSON = wires[wireId];
            if (addedCellIds.includes(wireJSON.source.id) && addedCellIds.includes(wireJSON.target.id)) {
                const wire = new joint.shapes.circuit.Wire(wireJSON);
                circuitGraph.addCell(wire);
            }
        });
    }

    export function layout() {
        if (elk) {
            circuitPaper.freeze();
            joint.layout.elk.layoutLayered(circuitGraph, circuitPaper, elk);
            circuitPaper.unfreeze();
            setTimeout(() => zoom(1.0), 1000);
        }
    }

    function renderCircuit(width, height) {
        circuitGraph = new joint.dia.Graph();

        circuitPaper = new joint.dia.Paper({
            el: jq(circuitContainer),
            model: circuitGraph,
            width: width,
            height: height,
            gridSize: 5,
            drawGrid: {name: 'fixedDot'},
            interactive: false,
            async: true,
            frozen: false,
            sorting: joint.dia.Paper.sorting.APPROX,
            background: {color: '#F3F7F6'},
            snapLinks: false,
            allowLink: () => false,
        });
    }

    function renderComponents(components) {
        componentBrowserGraph = new joint.dia.Graph();
        componentBrowserPaper = new joint.dia.Paper({
            el: jq(componentBrowserContainer),
            model: componentBrowserGraph,
            gridSize: 5,
            drawGrid: false,
            interactive: false,
            async: true,
            frozen: false,
            sorting: joint.dia.Paper.sorting.APPROX,
            background: {color: '#F3F7F6'},
            snapLinks: false,
            allowLink: () => false,
        });


        let offsetX = jq(componentBrowserContainer).width() / 2, offsetY = 100;
        componentBrowserPaper.freeze();
        components.forEach((component) => {
            if (!['Wire', 'ELKWire'].includes(component)) {
                const element = new joint.shapes.circuit[component]();
                element.position(offsetX - element.get('size').width / 2, offsetY)
                offsetY += element.get('size').height + 50;
                componentBrowserGraph.addCell(element);
            }
        });
        layoutComponentBrowser();
        componentBrowserPaper.unfreeze();
        addComponentsBrowserEvents();
    }

    function layoutComponentBrowser(width, height) {
        setTimeout(() => {
            componentBrowserPaper.scale(1.0);
            componentBrowserPaper.fitToContent({
                useModelGeometry: true,
                padding: (width / 2 - 60) || 100,
                allowNewOrigin: 'any',
                minWidth: componentBrowserPaper.options.width,
                minHeight: 4000
            });
        }, 1000);
    }

    function addComponentsBrowserEvents() {
        componentBrowserPaper.on('cell:pointerdown', function (cellView, e, x, y) {
            flyDragged = true;
            const flyGraph = new joint.dia.Graph();
            const flyPaper = new joint.dia.Paper({
                el: jq('#flyPaper'),
                model: flyGraph,
                width: 100,
                height: 100,
                interactive: false
            });

            const flyShape = cellView.model.clone();
            const pos = cellView.model.position();
            const offset = {
                x: x - pos.x,
                y: y - pos.y
            };

            flyShape.position(50, 0);
            flyGraph.addCell(flyShape);

            jq("#flyPaper").offset({
                left: e.pageX - offset.x,
                top: e.pageY - offset.y
            });

            jq(eventElement).on('mousemove.fly', function (e) {
                jq("#flyPaper").offset({
                    left: e.pageX - offset.x,
                    top: e.pageY - offset.y
                });
            });

            jq(eventElement).on('mouseup.fly', function (e) {
                const x = e.pageX;
                const y = e.pageY;
                const target = circuitPaper.$el.offset();

                if (x > target.left && x < target.left + circuitPaper.$el.width() &&
                    y > target.top && y < target.top + circuitPaper.$el.height()) {
                    const s = flyShape.clone();
                    const event = new CustomEvent('nodeCreated', {
                        detail: {
                            type: s.get('type'),
                            position: {
                                x: x - target.left - offset.x,
                                y: y - target.top - offset.y
                            }
                        }
                    });
                    eventElement.dispatchEvent(event);
                }
                jq(eventElement).off('mousemove.fly').off('mouseup.fly');
                flyShape.remove();
                flyDragged = false;
            });
        });
    }

</script>
<main bind:this={eventElement}>
    <nav bind:this={navBar} class="navbar navbar-default">
        <div class="container-fluid">
            <div class="navbar-header">
                <button type="button" class="navbar-brand btn-clear" style="color: black" disabled>Circuit Editor
                    Dashboard
                </button>
            </div>
            <div class="collapse navbar-collapse">
                <div class="navbar-left">
                    <ul class="nav navbar-nav">
                        <li role="separator" class="divider"></li>
                        <li class="nav-item">
                            <a href="#"
                               style="color: black;
                               font-size: 20px;
                               pointer-events: none">
                                {dashboardTitle}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>
    <div class="container-fluid">
        <div class="row row-list">
            <div class="col-md-2" id="componentBrowserContainer">
                <div class="text-center">
                    <h4>Component Browser</h4>
                </div>
                <div class="components-div" style="height: 4000px" bind:this={componentBrowserContainer}></div>
            </div>
            <div class="col-md-10" id="jointContainer">
                <div class="paper-div" bind:this={circuitContainer}></div>
            </div>
        </div>
    </div>

    <div id="flyPaper" style="display:{flyDragged ? 'block': 'none'}; position:fixed;z-index:100;opacity:.7;pointer-event:none;"></div>

</main>

<style>
    main {
        align: center;
        position: relative;
    }

    #componentBrowserContainer {
        overflow-x: hidden;
        overflow-y: scroll;
    }

    #jointContainer {
        overflow: scroll;
        /*margin-left: -5px;*/
    }
</style>
