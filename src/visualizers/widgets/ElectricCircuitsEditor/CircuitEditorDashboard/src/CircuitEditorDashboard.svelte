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
        recommendationContainer;
    let circuitPaper,
        recommendationPaper;
    let circuitGraph,
        recommendationGraph;
    let zoomValues, currentZoomLevel;
    let dashboardTitle;
    let recommendNext;


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
        recommendNext = false;
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
            async: true,
            frozen: false,
            sorting: joint.dia.Paper.sorting.APPROX,
            background: {color: '#F3F7F6'},
            snapLinks: false,
            allowLink: () => false,
        });

        addCircuitPaperEvents();

        recommendationGraph = new joint.dia.Graph();

        recommendationPaper = new joint.dia.Paper({
            el: jq(recommendationContainer),
            model: recommendationGraph,
            width: 200,
            height: 400,
            gridSize: 5,
            drawGrid: {name: 'fixedDot'},
            interactive: true,
            async: true,
            frozen: false,
            background: {color: '#C0C0C0'},
            sorting: joint.dia.Paper.sorting.APPROX,
            allowLink: () => false,
        });
        addRecommendationPaperEvents();
        addCloseIconToRecommendationGraph();

    }

    export function adjustPaperDimensions(width, height) {
        const navBarHeight = jq(navBar).height();
        const navBarWidth = jq(navBar).width();
        if (navBarWidth < width) {
            width = navBarWidth;
        }
        circuitPaper.setDimensions(width, height - navBarHeight);
        zoom(currentZoomLevel);
        adjustRecommendationContainer();
    }

    export function clearCircuitGraph() {
        circuitGraph.clear();
        addedCellIds = [];
        wires = {};
        layout();
    }

    export function destroyCircuitGraph() {
        clearCircuitGraph();
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
        if (elk) {
            circuitPaper.freeze();
            joint.layout.elk.layoutLayered(circuitGraph, circuitPaper, elk);
            circuitPaper.unfreeze();
            setTimeout(() => zoom(1.0), 1000);
        }

    }

    function clearRecommendationGraph() {
        recommendationGraph.clear();
        addCloseIconToRecommendationGraph();
    }

    function addCloseIconToRecommendationGraph() {
        const closeIcon = new joint.shapes.standard.Circle({
            size: {height: 20, width: 20},
            attrs: {
                text: {
                    text: 'X'
                },
                body: {
                    fill: "#FF0000",
                    stroke: "#F0F0F0"
                },
            },
            isCloseIcon: true
        });
        closeIcon.position(170, 5);
        closeIcon.addTo(recommendationGraph);
    }

    function addRecommendationPaperEvents() {
        recommendationPaper.on('element:pointerclick', (elementView) => {
            const eventTarget = elementView.model;
            if (eventTarget.get('isCloseIcon')) {
                hideRecommendationContainer();
            }
        });

    }

    function addCircuitPaperEvents() {
        circuitPaper.on('blank:pointerclick', (elementView) => {
            hideRecommendationContainer();
        });
    }

    function hideRecommendationContainer() {
        jq(recommendationContainer).css({
            display: 'none'
        });
    }

    function showRecommendationContainer() {
        adjustRecommendationContainer();
        jq(recommendationContainer).css({
            display: 'block'
        });
    }

    function adjustRecommendationContainer() {
        jq(recommendationContainer).css({
            left: jq('#dashboardNavbar').width() - 210,
            top: jq('#dashboardNavbar').height()
        });
    }

    function requestRecommendations() {
        const event = new CustomEvent('recommendationRequested');
        eventElement.dispatchEvent(event);
    }

    export function showRecommendations(recommendations) {
        clearRecommendationGraph();
        circuitPaper.freeze();
        console.log(recommendations);
        showRecommendationContainer();
    }

</script>
<main bind:this={eventElement}>
    <nav bind:this={navBar} class="navbar navbar-default" id="dashboardNavbar">
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
                <div class="navbar-right">
                    <button
                            class="navbar-btn btn btn-primary"
                            on:click|stopPropagation|preventDefault={requestRecommendations}
                    ><i class="fa fa-cog"></i> Component Cooker <i class="fa fa-arrow-circle-down"></i></button>
                </div>
            </div>
        </div>
    </nav>
    <div class="recommendation-div" bind:this={recommendationContainer}></div>
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

    .recommendation-div {
        position: absolute;
        z-index: 1000;
        opacity: 0.7;
        border: 3px solid black;
        display: none;
    }
</style>
