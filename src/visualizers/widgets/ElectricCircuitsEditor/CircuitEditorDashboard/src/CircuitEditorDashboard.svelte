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
    let showRecommendation, rotateCog;
    let recommenderConfig, recommendationAlg;


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
        showRecommendation = false;
        rotateCog = false;
        defineElectricCircuitsDomain(joint);
    }

    export function render(opts) {
        circuitGraph = new joint.dia.Graph();

        circuitPaper = new joint.dia.Paper({
            el: circuitContainer,
            model: circuitGraph,
            width: opts.width,
            height: opts.height,
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
            el: recommendationContainer,
            model: recommendationGraph,
            width: 200,
            height: 400,
            drawGrid: false,
            interactive: false,
            async: true,
            frozen: false,
            background: {color: '#6C757D'},
            sorting: joint.dia.Paper.sorting.APPROX,
            allowLink: () => false,
        });
        addRecommendationPaperEvents();
        if (opts.pluginMetadata) {
            recommenderConfig = opts.pluginMetadata.configStructure;
            console.log(recommenderConfig);
        }
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

    export function showRecommendationsSuccess(recommendations) {
        clearRecommendationGraph();
        recommendationPaper.freeze();
        addTopNToRecommendationGraph(recommendations, 3);
        recommendationPaper.unfreeze();
        showRecommendationContainer();
    }

    export function showRecommendationsFail(error) {

    }

    function clearRecommendationGraph() {
        recommendationGraph.clear();
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
        showRecommendation = false;
        rotateCog = false;
    }

    function showRecommendationContainer() {
        adjustRecommendationContainer();
        showRecommendation = true;
        rotateCog = false;
    }

    function adjustRecommendationContainer() {
        jq(recommendationContainer).css({
            left: jq('#dashboardNavbar').width() - 360,
            top: jq('#dashboardNavbar').height()
        });
    }

    function requestRecommendations() {
        const metadataValues = {};
        recommenderConfig.forEach(metadata => {
            metadataValues[metadata.name] = metadata.value
            recommendationAlg = metadata.value;
        });
        const event = new CustomEvent('recommendationRequested', {
            detail: {
                pluginMetadata: metadataValues
            }
        });
        eventElement.dispatchEvent(event);
        rotateCog = true;
    }

    function addTopNToRecommendationGraph(recommendations, n) {
        const text = new joint.shapes.standard.TextBlock();
        text.resize(200, 30);
        text.attr('label/text', `Results (${recommendationAlg})`);
        text.attr('body/fill', 'lightgray');
        text.addTo(recommendationGraph);
        const sorted = Object.entries(recommendations).sort((val1, val2) => {
            if (val1[1] < val2[1]) {
                return 1;
            }

            if (val1[1] > val2[1]) {
                return -1;
            }
            return 0;
        });
        let offsetY = 80;
        sorted.forEach(([component, confidence], index) => {
            if (index < n) {
                const cell = new joint.shapes.circuit[component]();
                cell.attr('text', {
                    fill: '#FFFFFF',
                    'font-weight': 'normal',
                    text: cell.attr('text').text +
                        `\n(${Math.round((parseFloat(confidence) * 100).toFixed(4), 3)}%)`
                });
                cell.position(100 - cell.get('size').width / 2, offsetY);
                offsetY += (cell.get('size').height + 50);
                recommendationGraph.addCell(cell);
            }
            recommendationPaper.setDimensions(recommendationPaper.options.width, offsetY + 50);
        });
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
                    ><i class="fa fa-cog" class:rotate={rotateCog}></i> Recommend Components Using <i
                            class="fa fa-arrow-circle-right"></i></button>
                    <form class="navbar-right navbar-form form-inline">
                        {#if recommenderConfig}
                            {#each recommenderConfig as config}
                                {#if Array.isArray(config.valueItems) && config.valueType === 'string'}
                                    <select id={config.name} bind:value={config.value} class="form-control form-inline">
                                        {#each config.valueItems as val}
                                            <option>{val}</option>
                                        {/each}
                                    </select>
                                    <span class="fa fa-info-circle" data-toggle="tooltip" title={config.description}></span>
                                {/if}
                            {/each}
                        {/if}
                    </form>
                </div>
            </div>
        </div>
    </nav>
    <div class="recommendation-div" class:shown={showRecommendation} bind:this={recommendationContainer}></div>
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
        opacity: 0.9;
        border: 5px solid #0E0E0E;
        display: none;
    }

    .shown {
        display: block;
    }

    .rotate {
        animation: spin 1s infinite linear;
    }

    @keyframes spin {
        0% {
            -webkit-transform: rotate(0deg) scale(1.25);
        }
        100% {
            -webkit-transform: rotate(360deg) scale(1.25);
        }
    }
</style>
