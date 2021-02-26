<script>
    import {defineElectricCircuitShapes} from './circuits';

    const jq = window.$;

    let joint = null,
        dagre = null,
        graphlib = null;
    let navBar;
    let addedCellIds = null;
    let wires = null;
    let eventElement;
    let contextMenuAttrs = null;
    let attrDivTop = null;
    let attrDivLeft = null;
    let circuitContainer;
    let circuitPaper;
    let circuitGraph;
    let componentAttributes;
    let currentComponentId;
    let zoomValues, currentZoomLevel;
    let rankDirOpts, rankDir;
    let alignOpts;


    export function initialize(jointInstance, dagreInstance, graphlibInstance) {
        joint = jointInstance;
        dagre = dagreInstance;
        graphlib = graphlibInstance;
        addedCellIds = [];
        wires = {};
        contextMenuAttrs = {};
        currentZoomLevel = 1.0;
        zoomValues = [1.0, 1.5, 2, 2.5, 3];
        rankDirOpts = ['TB', 'BT', 'LR', 'RL'];
        rankDir = 'LR';
        defineElectricCircuitShapes(joint);
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
            snapLinks: true,
            allowLink: () => false,
            defaultLink: new joint.shapes.circuit.Wire,
            defaultRouter: {name: 'manhattan', args: {padding: 100, elementPadding: 30, perpendicular: false}}
        });
        initializePaperEvents(circuitPaper);
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
        relayoutGraph();
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
            circuitPaper.scale(zoomLevel, zoomLevel, circuitPaper.options.width / 8, circuitPaper.options.height / 8);
            circuitPaper.fitToContent({
                minWidth: circuitPaper.options.width,
                minHeight: circuitPaper.options.height,
            });
            scaleCircuitPaperToFitContent(zoomLevel);
        }
    }

    export function events() {
        return eventElement;
    }

    export function updateCell(cellJSON) {
        const cell = circuitGraph.getCells()
            .find(elem => elem.id === cellJSON.id);

        if (cell) {
            setCellAttributes(cell, cellJSON);
        }
    }

    let rectAdded;

    export function addCell(cellJSON) {
        const cell = new joint.shapes[cellJSON.domainPrefix][cellJSON.type](cellJSON);
        console.log(cellJSON);
        circuitGraph.addCell(cell);
        relayoutGraph();
    }

    function initializePaperEvents(paper) {
        paper.on('element:contextmenu', function (elementView, event, eventX, eventY) {
            componentAttributes = null;
            currentComponentId = null;
            const currentElement = elementView.model;
            const midPoint = currentElement.position();
            const {x, y} = paper.localToPagePoint(midPoint.x, midPoint.y);
            const offset = paper.pageOffset();
            componentAttributes = [];
            currentComponentId = currentElement.id;
            const currentComponentAttrs = contextMenuAttrs[currentComponentId];

            Object.keys(currentComponentAttrs).forEach(attr => {
                componentAttributes.push({
                    name: attr,
                    value: currentComponentAttrs[attr],
                    type: typeof currentComponentAttrs[attr]
                });
            });

            attrDivTop = `${y - offset.y + 50}px`;
            attrDivLeft = `${x - offset.x + 50}px`;
        });


        paper.on('blank:pointerclick', resetAttrsDiv);
        paper.on('cell:pointerclick', resetAttrsDiv);
    }

    function resetAttrsDiv() {
        componentAttributes = null;
        currentComponentId = null;
        attrDivLeft = null;
        attrDivTop = null;
    }

    function relayoutGraph() {
        joint.layout.DirectedGraph.layout(circuitGraph, {
            setLinkVertices: true,
            rankDir: rankDir || 'LR',
            nodeSep: 50,
            rankSep: 50,
            dagre: dagre,
            graphlib: graphlib,
            marginX: 50,
            marginY: 50
        });

        zoom(1.0);
    }

    function setRankDirValue() {
        rankDir = jq('#rankdir').val();
        jq('#rankdir').blur();
    }

    function scaleCircuitPaperToFitContent(zoomLevel) {
        circuitPaper.scaleContentToFit({
            maxScale: zoomLevel,
            padding: {
                horizontal: circuitPaper.options.width / 8,
                vertical: 100,
            }
        });
    }

    function setCellAttributes(cell, cellJSON) {
        cell.attr('text', {text: cellJSON.type !== 'Junction' ? cellJSON.attrs.name : ''});
        contextMenuAttrs[cellJSON.id] = cellJSON.attrs;
    }

    function elementAttributeChanged() {
        const changedAttribs = {}
        componentAttributes.forEach(attr => {
            changedAttribs[attr.name] = attr.value;
        });
        const diff = shallowDiff(contextMenuAttrs[currentComponentId], changedAttribs);

        if (Object.keys(diff).length) {
            const event = new CustomEvent(
                'attributeChanged', {
                    detail: {
                        id: currentComponentId,
                        attributes: diff
                    }
                });
            eventElement.dispatchEvent(event);
        }
        resetAttrsDiv();
    }

    function shallowDiff(obj1, obj2) {
        const diff = {};

        Object.keys(obj1).forEach(key => {
            if (obj1[key] !== obj2[key]) {
                diff[key] = obj2[key];
            }
        });

        return diff;
    }

</script>
<main bind:this={eventElement}>
    <nav bind:this={navBar} class="navbar navbar-default">
        <div class="container-fluid">
            <div class="navbar-header">
                <button type="button" class="navbar-brand btn-clear" disabled>ElectricCircuits Editor</button>
            </div>

            <div class="navbar-form navbar-right">
                {#if rankDirOpts}
                    <div class="form-group" style="margin-right: 10px">
                        <label for="rankdir" style="font-size: 14px">RankDir:</label>
                        <select on:blur|stopPropagation|preventDefault={relayoutGraph}
                                on:change|stopPropagation|preventDefault={setRankDirValue}
                                class="form-control" id="rankdir"
                                bind:value={rankDir}>
                            {#each rankDirOpts as opt}
                                <option value="{opt}">{opt}</option>
                            {/each}>
                        </select>
                    </div>
                {/if}
            </div>
        </div>

    </nav>
    <div class="row row-list">
        <div class="col-md-12" style="overflow: scroll">
            <div class="paper-div" bind:this={circuitContainer}></div>
        </div>
    </div>
    {#if componentAttributes}
        <div class="properties-div row" style="top: {attrDivTop}; left: {attrDivLeft}">
            <div class="col-md-6">
                <h5><b>Properties</b></h5>
                <hr>
                <div class="form form-inline">
                    <div class="row">
                        {#each componentAttributes as attr, index}
                            <label class="col-md-8" for="{attr.name}"><b style="font-size: 14px">{attr.name}
                                : </b></label>
                            <div class="col-md-4">
                                {#if attr.type === 'number'}
                                    <input
                                            id="{attr.name}"
                                            type="number"
                                            bind:value={attr.value}
                                            class="form-control"
                                    />
                                {:else if attr.type === 'boolean'}
                                    <input
                                            id="{attr.name}"
                                            type="checkbox"
                                            bind:checked={attr.value}
                                            class="form-control"
                                    />
                                {:else}
                                    <input
                                            id="{attr.name}"
                                            type="text"
                                            bind:value={attr.value}
                                            class="form-control"
                                    />
                                {/if}
                            </div>
                            <br/>
                        {/each}
                    </div>
                </div>
            </div>
            <div class="col-md-8 text-center col-md-offset-1" style="margin-top: 20px; margin-bottom: 20px">
                <button type="submit" on:click|stopPropagation|preventDefault={elementAttributeChanged}
                        class="btn btn-primary">Submit
                </button>
            </div>
        </div>
    {/if}

</main>

<style>
    main {
        align: center;
        position: relative;
    }

    .properties-div {
        background: #FEFEFE;
        position: absolute;
        z-index: 1000;
        border-radius: 10px;
        border: 1px solid crimson;
        height: 200px;
        overflow-y: scroll;
    }

    .form-inline label {
        line-height: 34px;
    }

    .form-inline .form-control {
        margin-bottom: 10px;
    }
</style>
