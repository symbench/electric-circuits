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
    let circuitContainer;
    let circuitPaper;
    let circuitGraph;
    let zoomValues, currentZoomLevel;
    let dashboardTitle;
    let paperBoundingBox;


    export function initialize(jointInstance, dagreInstance, graphlibInstance, ELK) {
        joint = jointInstance;
        dagre = dagreInstance;
        graphlib = graphlibInstance;
        elk = new ELK();
        addedCellIds = [];
        wires = {};
        currentZoomLevel = 1.0;
        zoomValues = [1.0, 1.5, 2, 2.5, 3];
        dashboardTitle = '';
        paperBoundingBox = {};
        defineElectricCircuitsDomain(joint);
    }

    export function render(width, height) {
        circuitGraph = new joint.dia.Graph();

        circuitPaper = new joint.dia.Paper({
            el: jq(circuitContainer),
            model: circuitGraph,
            width: width,
            height: height,
            gridSize: 5,
            drawGrid: {name: 'fixedDot'},
            interactive: false,
            async: false,
            frozen: false,
            sorting: joint.dia.Paper.sorting.APPROX,
            background: {color: '#F3F7F6'},
            snapLinks: false,
            allowLink: () => false,
        });
    }

    export function adjustPaperDimensions(width, height) {
        const navBarHeight = jq(navBar).height();
        const navBarWidth = jq(navBar).width();
        if (navBarWidth < width) {
            width = navBarWidth;
        }
        circuitPaper.setDimensions(width, height - navBarHeight);
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
            circuitPaper.scale(zoomLevel);
            circuitPaper.fitToContent({
                useModelGeometry: true,
                padding: 100 * zoomLevel,
                allowNewOrigin: 'any',
                minWidth: circuitPaper.options.width,
                minHeight: circuitPaper.options.height
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
        if(elk){
            circuitPaper.freeze();
            joint.layout.elk.layoutLayered(circuitGraph, circuitPaper, elk);
            circuitPaper.unfreeze();
            adjustPaperDimensions(2500, 2000);
            zoom(1.0);
        }

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
            <div class="col-md-12" id="jointContainer" style="overflow: scroll">
                <div class="paper-div" bind:this={circuitContainer}></div>
            </div>
        </div>
    </div>
</main>

<style>
    main {
        align: center;
        position: relative;
    }
</style>
