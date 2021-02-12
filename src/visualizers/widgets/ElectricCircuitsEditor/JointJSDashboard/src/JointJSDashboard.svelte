<script>
    import {defineElectricCircuitShapes} from './circuits';
    const jq = window.$;

    let joint = null;
    let navBar;
    let circuitContainer;
    let circuitPaper;
    let circuitGraph;

    export function initialize(jointInstance, meta) {
        joint = jointInstance;
        defineElectricCircuitShapes(joint);
    }

    export function render(width, height) {
        const r1 = new joint.shapes.circuit.NPN({ position: { x: 410, y: 25 }});
        circuitGraph = new joint.dia.Graph();

        circuitPaper = new joint.dia.Paper({
            el: jq(circuitContainer),
            model: circuitGraph,
            width: width,
            height: height,
            gridSize: 5,
            drawGrid: {drawGrid: 'dot', args: { color: 'black' }},
            snapLinks: true,
            linkPinning: false,
            defaultLink: new joint.dia.Link,
            defaultRouter: {name: 'manhattan', args: {padding: 100, elementPadding: 100}}
        });
    }

    export function adjustPaperDimensions(width, height) {
        const navBarHeight = jq(navBar).height();
        circuitPaper.setDimensions(width, height-navBarHeight);
    }

</script>
<main>
    <nav bind:this={navBar} class="navbar navbar-default">
        <div class="container-fluid">
            <div class="navbar-header">
                <button class="navbar-brand btn-clear" disabled>ElectricCircuits Editor</button>
            </div>
        </div>
    </nav>
    <div class="row row-list">
        <div class="border-left col-md-12">
            <div class="paper-div" bind:this={circuitContainer}></div>
        </div>
    </div>
</main>

<style>
    main {
        alignment: center;
    }
</style>
