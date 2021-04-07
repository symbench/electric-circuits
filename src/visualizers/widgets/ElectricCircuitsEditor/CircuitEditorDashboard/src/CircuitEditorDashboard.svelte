<script>
    import {defineElectricCircuitsDomain} from './circuits';

    const DOMAIN_PREFIX = 'circuit';

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
    let activeObjectChangeFn,
        goToParentFn,
        toolViewRemoveFn,
        toolViewAddFn,
        undoPluginResultsFn,
        isNested,
        parentName;
    let showRecommendationConfig,
        recommendationPluginMetadata,
        recommendationPluginRunning,
        recommendationPluginSuccess,
        recommendedComponentsDivider;

    export function initialize(jointInstance, dagreInstance, graphlibInstance, ELK, opts={}) {
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
        recommendationPluginMetadata = null;
        recommendationPluginRunning = false;
        showRecommendationConfig = false;
        recommendationPluginSuccess = false;
        isNested = false;
        parentName = '';
        defineElectricCircuitsDomain(joint);
        if (opts.activeObjectChangeFn && opts.goToParentFn) {
            activeObjectChangeFn = opts.activeObjectChangeFn;
            goToParentFn = opts.goToParentFn;
            toolViewRemoveFn = opts.toolViewRemoveFn;
            toolViewAddFn = opts.toolViewAddFn;
            undoPluginResultsFn = opts.undoPluginResultsFn;
        }
    }

    export function render(opts) {
        renderCircuit(opts.width, opts.height);
        renderComponents(opts.validComponents);
        recommendationPluginMetadata = opts.recommendationPluginMetadata;
    }

    export function adjustPaperDimensions(width, height) {
        const navBarHeight = jq(navBar).height();
        const navBarWidth = jq(navBar).width();
        if (navBarWidth < width) {
            width = navBarWidth;
        }
        circuitPaper.setDimensions(width * 10 / 12, height - navBarHeight);
        layoutComponentBrowser();
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

    export function setNested(val) {
        isNested = val;
    }

    export function setParentName(val) {
        parentName = val;
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
        const Component = joint.shapes.circuit.Component;
        circuitPaper.freeze();
        const cell = circuitGraph.getCell(cellJSON.id);
        if(cell){
            cell.set({
                attrs: cellJSON.attrs
            });
            cellJSON.isTemporary ? Component.setTemporary(cell) : Component.unsetTemporary(cell);
            Component.setOpacity(cell, cellJSON.opacity || 1.0);
            if(!cellJSON.isTemporary) {
                cell.findView(circuitPaper).removeTools();
            }
        }
        circuitPaper.unfreeze();
    }

    export function removeCell(id) {
        circuitPaper.freeze();
        const cell = circuitGraph.getCell(id);
        if(cell){
            cell.remove();
        }
        circuitPaper.unfreeze();
        layout();
    }

    export function addCell(cellJSON) {
        circuitPaper.freeze();
        const Component = joint.shapes.circuit.Component;
        let cellId;
        if (cellJSON.type === 'Wire') {
            wires[cellJSON.id] = cellJSON;
        } else {
            const cell = new joint.shapes[cellJSON.domainPrefix][cellJSON.type](cellJSON);
            circuitGraph.addCell(cell);

            if (cellJSON.isTemporary) {
                Component.setTemporary(cell, true);
                Component.setOpacity(cell, cellJSON.opacity || 1.0);
                addControls(cell, circuitPaper);
            }
            addedCellIds.push(cellJSON.id || cell.id);
            cellId = cell.id;
        }

        Object.keys(wires).forEach(wireId => {
            const wireJSON = wires[wireId];
            if (addedCellIds.includes(wireJSON.source.id) && addedCellIds.includes(wireJSON.target.id)) {
                const wire = new joint.shapes.circuit.Wire(wireJSON);
                circuitGraph.addCell(wire);
            }
        });
        circuitPaper.unfreeze();
        return cellId;
    }

    export function getPortIdBySpiceIndex(id, index) {
        const cell = circuitGraph.getCell(id);
        if (cell) {
            return joint.shapes.circuit.Component.getUniqueSpicePortIdAt(cell, index);
        }
    }

    export function getConnectedTargets(id) {
        const Component = joint.shapes.circuit.Component;
        const cell = circuitGraph.getCell(id);
        if(cell){
            const links = circuitGraph.getConnectedLinks(cell);
            const wires = {};
            links.forEach(link => {
                let pinName;
                if(link.source().id === cell.id) {
                    const sourceCell = circuitGraph.getCell(link.source().id);
                    pinName = Component.getPortNameById(sourceCell, link.source().port);
                    wires[pinName] = link.target();
                } else {
                    const targetCell = circuitGraph.getCell(link.target().id);
                    pinName = Component.getPortNameById(targetCell, link.target().port);
                    wires[pinName] = link.source();
                }
            });
            return wires;
        }
    }

    export function getPortIdByName(id, portName) {
        const Component = joint.shapes.circuit.Component;
        const cell = circuitGraph.getCell(id);
        if (cell) {
            return Component.getPortIdByName(cell, portName);
        }
    }

    export function getElementByPort(portId) {
        const element = circuitGraph.getElements().find(el => {
            if(getElementType(el) === 'Circuit'){
                return el.getPorts().map(port => port.id).includes(portId);
            } else if (getElementType(el) === 'Pin'){
                return portId === el.id;
            } else{
                if(el.ports[portId]){
                    return true;
                }
            }
         });
        return element ? element.id : null;
    }

    export function getElementTypeById(id) {
        const cell = circuitGraph.getCell(id);
        if(cell) {
            return cell.get('type');
        }
    }

    export function layout(animate = true) {
        if (elk) {
            circuitPaper.freeze();
            joint.layout.elk.layoutLayered(circuitGraph, circuitPaper, elk, animate);
            circuitPaper.unfreeze();
            setTimeout(() => zoom(1.0), 1000);
        }
    }

    export function showPartBrowserRecommendation(recommendations, top=3){
        hideRecommendationPluginConfig();
        recommendationPluginRunning = false;
        const existing = getExistingComponentsByName();
        const topN = Object.keys(recommendations).slice(0, top);
        const topNConfidence = Object.values(recommendations).slice(0, top);
        existing.unshift(...topN);
        addComponentsToComponentBrowser(existing, topNConfidence);
        recommendationPluginSuccess = true;
        layoutComponentBrowser();
    }

    export function showRecommendationFail(error) {
        alert(error.message);
        recommendationPluginSuccess = false;
        recommendationPluginRunning = false;
    }

    export function removeTemporaryElements () {
        if(circuitGraph && circuitPaper) {
            circuitGraph.getElements().forEach(el => {
                if(joint.shapes.circuit.Component.isTemporary(el)) {
                    el.remove();
                }
            });
        }
    }

    function getExistingComponentsByName() {
        return Array.from(
            new Set(
                componentBrowserGraph.getElements()
                    .map(el => getElementType(el))
            )
        ).sort();
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

        circuitPaper.on('blank:pointerdown', hideRecommendationPluginConfig);

        circuitPaper.on('element:mouseenter', function(elementView) {
            elementView.showTools();
        });

        circuitPaper.on('element:mouseleave', function(elementView) {
            elementView.hideTools();
        });

        circuitPaper.on('element:pointerdown', (elementView) => {
            activeObjectChangeFn(elementView.model.id);
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
        addComponentsToComponentBrowser(components);
        addComponentsBrowserEvents();
    }

    function addComponentsToComponentBrowser(components, confidence = []) {
        componentBrowserPaper.freeze();
        componentBrowserGraph.clear();

        if (recommendedComponentsDivider) {
            componentBrowserPaper.viewport.removeChild(recommendedComponentsDivider.node);
            recommendedComponentsDivider = null;
        }

        let offsetX = jq(componentBrowserContainer).width() / 2, offsetY = 50;
        const toHighlight = [];
        components.forEach((component, index) => {
            if (!['Wire', 'ELKWire'].includes(component)) {
                const element = new joint.shapes.circuit[component]();
                element.position(offsetX - element.get('size').width / 2, offsetY)
                offsetY += element.get('size').height + 50;
                if (confidence[index]) {
                    element.attr('text', {
                        text: '\n\n' + element.get('attrs').text.text + '\n' + confidence[index],
                        fill: '#006400'
                    });
                    toHighlight.push(element);
                }
                componentBrowserGraph.addCell(element);
                if (confidence.length && index === confidence.length - 1) {
                    recommendedComponentsDivider = joint.V('line', {
                        x1: 0,
                        x2: 5000,
                        y1: offsetY + 20,
                        y2: offsetY + 20,
                        stroke: 'gray',
                        'stroke-width': 10
                    });
                    joint.V(componentBrowserPaper.viewport).append(recommendedComponentsDivider);
                    offsetY += 50;
                }
            }
        });
        layoutComponentBrowser();
        componentBrowserPaper.unfreeze();
        toHighlight.forEach(el => {
            const elementView = el.findView(componentBrowserPaper)
            elementView.highlight();
            setTimeout(() => elementView.unhighlight(), 1000);
        });
    }

    function layoutComponentBrowser() {
        componentBrowserPaper.scale(0.75);
        componentBrowserPaper.fitToContent({
            useModelGeometry: true,
            padding: {
                horizontal: jq('#componentBrowserContainer').width() / 2 - 30,
                vertical: recommendationPluginSuccess ? 100 : 50,
            },
            allowNewOrigin: 'any',
            minWidth: componentBrowserPaper.options.width,
            minHeight: 4000
        });

        jq('#componentBrowserContainer').scrollTop(0);
    }

    function addComponentsBrowserEvents() {
        componentBrowserPaper.on('cell:pointerdown', function (cellView, e, x, y) {

            if (!cellView.model.get('type').startsWith('circuit.')) {
                return;
            }

            flyDragged = true;
            const flyGraph = new joint.dia.Graph();
            const flyPaper = new joint.dia.Paper({
                el: jq('#flyPaper'),
                model: flyGraph,
                interactive: false,
                async: true,
            });
            flyPaper.freeze();
            const flyShape = cellView.model.clone();
            const pos = cellView.model.position();
            const offset = {
                x: x - pos.x,
                y: y - pos.y
            };

            flyShape.position(10, 10);
            flyShape.attr('text', {
                text: ''
            });

            jq('#flyPaper').css({
                width: flyShape.get('size').width + 20,
                height: flyShape.get('size').height + 20
            });

            // Without timeout. The shape doesn't get cloned
            setTimeout(() => {
                flyGraph.addCell(flyShape);
            }, 10);

            flyPaper.unfreeze();

            jq('#flyPaper').offset({
                left: e.pageX - offset.x,
                top: e.pageY - offset.y
            });

            jq(eventElement).on('mousedown', function (e) {
                jq('#flyPaper').offset({
                    left: e.pageX - offset.x,
                    top: e.pageY - offset.y
                });
            });

            jq(eventElement).on('mousemove.fly', function (e) {
                jq('#flyPaper').offset({
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
                    const event = new CustomEvent('nodeCreated', {
                        detail: {
                            type: flyShape.get('type'),
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

        componentBrowserPaper.on('blank:pointerdown', hideRecommendationPluginConfig)
    }

    function showRecommendationPluginConfig() {
        showRecommendationConfig = true;
    }

    function hideRecommendationPluginConfig() {
        showRecommendationConfig = false;
    }

    function requestRecommendationPluginRun() {
        hideRecommendationPluginConfig();
        const pluginMetadata = {};
        recommendationPluginMetadata.configStructure.forEach(config => {
            pluginMetadata[config.name] = config.value;
        });
        const event = new CustomEvent('recommendationRequested', {
            detail: {
                pluginMetadata: pluginMetadata
            }
        });

        eventElement.dispatchEvent(event);
        recommendationPluginRunning = true;
    }

    function undoRecommendations() {
        const components = getExistingComponentsByName();
        recommendationPluginSuccess = false;
        addComponentsToComponentBrowser(components);
        if (undoPluginResultsFn) {
            undoPluginResultsFn();
        }
        layout(false);
    }

    function addControls(element, paper) {
        const Component = joint.shapes.circuit.Component;

        const elementView = element.findView(paper);
        const boundaryTool = new joint.elementTools.Boundary();
        const removeButton = new joint.elementTools.RemoveButton({
            action: (event, view, tool) => {
                if (toolViewRemoveFn) {
                    toolViewRemoveFn(view.model.id);
                } else {
                    view.model.remove({ui: true, tool: tool.cid});
                }
            }
        });
        const addButton = new joint.elementTools.AddButton({
            action: (event, view, tool) => {
                if(toolViewAddFn) {
                    toolViewAddFn(view.model.id);
                    view.removeTools();
                    if(undoPluginResultsFn) {
                        undoPluginResultsFn();
                    }
                }
            }
        });
        const toolsView = new joint.dia.ToolsView({
            tools: [
                boundaryTool,
                removeButton,
                addButton
            ]
        });
        elementView.addTools(toolsView);
    }

    function getElementType(element) {
        return element.get('type').replace(`${DOMAIN_PREFIX}.`, '');
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
                <div class="navbar-right">
                    {#if isNested}
                        <button on:click|stopPropagation|preventDefault={goToParentFn ? goToParentFn : () => {}} class="btn btn-primary navbar-btn"> {parentName} <i class="fa fa-arrow-circle-up"></i></button>
                    {/if}
                </div>
            </div>
        </div>
    </nav>
    <div class="container-fluid">
        <div class="row row-list">
            <div class="col-md-2" id="componentBrowserContainer">
                <div class="text-center"
                     style="position:fixed; z-index:100; width: 15.3%; height: 40px; background: #FEFEF8">
                    <h4>Component Browser
                        <i style="cursor:pointer; color: {(recommendationPluginRunning || showRecommendationConfig) ? '#006400' : 'black'}"
                           on:click|stopPropagation|preventDefault={showRecommendationPluginConfig}
                           class="fa fa-lightbulb-o"></i>
                        {#if recommendationPluginRunning}
                            <span class="text-primary glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>
                        {/if}
                        {#if recommendationPluginSuccess}
                            <span style="cursor: pointer"
                                  on:click|stopPropagation|preventDefault={undoRecommendations}
                                  class="fa fa-undo"></span>
                        {/if}
                    </h4>
                    {#if recommendationPluginSuccess}
                        <div style="background: #FEFEF8; border-top: 2px dashed gray; border-bottom: 2px dashed gray">
                            <h5>Recommendations</h5>
                        </div>
                    {/if}
                </div>
                <div class="components-div" style="height: 4000px;" bind:this={componentBrowserContainer}></div>
            </div>
            <div class="col-md-10" id="circuitEditorContainer">
                <div class="paper-div" bind:this={circuitContainer}></div>
            </div>
        </div>
    </div>

    <div id="flyPaper"
         style="display: {flyDragged ? 'block': 'none'}; background-color:transparent;position:fixed;z-index:100;opacity:1.0;pointer-event:none;"></div>

    {#if showRecommendationConfig}
        <form class="form-inline"
              style="position:fixed; z-index: 2000; background-color: #FEFEF8; width:15%; padding: 1%; top: 11%; left: 1%;">
            <h4>{recommendationPluginMetadata.name}</h4>
            <hr/>
            {#each recommendationPluginMetadata.configStructure as config}
                {#if Array.isArray(config.valueItems) && config.valueType === 'string'}
                    <label class="form-text" for="{config.name}">{config.displayName}: </label>
                    <select style="width: 100px;" class="form-control" id="{config.name}" bind:value={config.value}>
                        {#each config.valueItems as opt}
                            <option value="{opt}">{opt}</option>
                        {/each}
                    </select>
                    <button class="btn btn-primary"
                            on:click|stopPropagation|preventDefault={requestRecommendationPluginRun}>Run
                    </button>
                {/if}
            {/each}
        </form>
    {/if}

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

    #circuitEditorContainer {
        overflow: scroll;
        padding-left: 0px;
    }

    .glyphicon-refresh-animate {
        -animation: spin .7s infinite linear;
        -webkit-animation: spin .7s infinite linear;
    }


</style>
