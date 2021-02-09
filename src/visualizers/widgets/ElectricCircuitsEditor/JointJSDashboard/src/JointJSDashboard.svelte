<script>
    import {onMount} from 'svelte';
    import {defineElectricCircuitShapes} from './circuits';
    import * as joint from 'jointjs/dist/joint';
    import 'jointjs/dist/joint.css';

    const jq = window.$;
    window.V = joint.V;

    let eventElement;
    let editorElement;
    let circuitEditorGraph;
    let editorPaper;
    let componentsGraph;
    let componentsPaper;

    onMount(() => {
       defineElectricCircuitShapes();
    });


    export function render(width, height) {
        editorPaper = getEditorPaper(width * 0.7, height);
        componentsPaper = getComponentsPaper(width * 0.3, height);
    }

    export function rerender(width, height) {
        editorPaper.height = height;
        editorPaper.width = 0.7 * width;

    }

    function getEditorPaper(width, height) {
        const paper = new joint.dia.Paper({
            width: width,
            height: height,
            gridSize: 5,
            drawGrid: true,
            snapLinks: true,
            defaultRouter: {name: 'manhattan', args: {padding: 10}},
            model: getGraph()
        });
        editorPaper.appendChild(paper.el);
        return paper;
    }

    function getComponentsPaper(width, height) {
        const paper = new joint.dia.Paper({
            width: width,
            height: height * 10,
            gridSize: 20,
            interactive: false,
            model: getGraph()
        });
        console.log(jq(componentsPaper).width());
        componentsPaper.appendChild(paper.el);
        return paper;
    }

    function getGraph () {
        const graph = new joint.dia.Graph();
        const rect = getRect().position(100, 30).resize(1, 1);
        const rect2 = new joint.shapes.circuit.NPN().position(100, 100).resize(1, 1);
        const rect3 = new joint.shapes.circuit.PNP().position(100, 210).resize(1, 1);
        const rect4 = new joint.shapes.circuit.OpAmp().position(100, 300).resize(1, 1);
        const rect5 = new joint.shapes.circuit.PMOS().position(100, 390).resize(1, 1);
        const rect6 = new joint.shapes.circuit.CCC().position(100, 480).resize(1, 1);
        const rect7 = new joint.shapes.circuit.VCC().position(100, 560).resize(1, 1);
        const rect8 = new joint.shapes.circuit.Transformer().position(100, 650).resize(1, 1);
        const rect9 = new joint.shapes.circuit.VariableConductor().position(100, 740).resize(1, 1);
        const rect10 = new joint.shapes.circuit.Voltage().resize(1, 1).position(125, 830);
        const rect11 = new joint.shapes.circuit.Current().resize(1, 1).position(125, 950);
        const rect12 = new joint.shapes.circuit.PulseVoltageSource().resize(1, 1).position(125, 1070);
        const rect13 = new joint.shapes.circuit.PulseCurrentSource().resize(1, 1).position(125, 1190);
        const rect14 = new joint.shapes.circuit.PieceWiseLinearCurrentSource().resize(1, 1).position(125, 1310);
        const rect15 = new joint.shapes.circuit.PieceWiseLinearVoltageSource().resize(1, 1).position(125, 1430);
        const rect16 = new joint.shapes.circuit.SinusoidalVoltageSource().resize(1, 1).position(125, 1550);
        const rect17 = new joint.shapes.circuit.SinusoidalCurrentSource().resize(1, 1).position(125, 1670);

        const rect18 = new joint.shapes.circuit.RandomVoltageSource().resize(1, 1).position(125, 1790);
        const rect19 = new joint.shapes.circuit.RandomCurrentSource().resize(1, 1).position(125, 1910);

        const rect20 = new joint.shapes.circuit.ExponentialVoltageSource().resize(1, 1).position(125, 2030);
        const rect21 = new joint.shapes.circuit.ExponentialCurrentSource().resize(1, 1).position(125, 2150);

        const rect22 = new joint.shapes.circuit.AmplitudeModulatedVoltageSource().resize(1, 1).position(125, 2270);
        const rect23 = new joint.shapes.circuit.AmplitudeModulatedCurrentSource().resize(1, 1).position(125, 2390);

        const rect24 = new joint.shapes.circuit.SingleFrequencyFMVoltageSource().resize(1, 1).position(125, 2510);
        const rect25 = new joint.shapes.circuit.SingleFrequencyFMCurrentSource().resize(1, 1).position(125, 2630);

        const rect26 = new joint.shapes.circuit.AcLine().resize(1, 1).position(125, 2750);

        const rect27 = new joint.shapes.circuit.Diode().resize(1, 1).position(100, 2870);
        const rect28 = new joint.shapes.circuit.ZDiode().resize(1, 1).position(100, 2990);
        const rect29 = new joint.shapes.circuit.SchottkyDiode().resize(1, 1).position(100, 3110);
        const rect30= new joint.shapes.circuit.LED().resize(1, 1).position(100, 3230);


        rect.addTo(graph);
        rect2.addTo(graph);
        rect3.addTo(graph);
        rect4.addTo(graph);
        rect5.addTo(graph);
        rect6.addTo(graph);
        rect7.addTo(graph);
        rect8.addTo(graph);
        rect9.addTo(graph);
        rect10.addTo(graph);
        rect11.addTo(graph);
        rect12.addTo(graph);
        rect13.addTo(graph);
        rect14.addTo(graph);
        rect15.addTo(graph);
        rect16.addTo(graph);
        rect17.addTo(graph);

        rect18.addTo(graph);
        rect19.addTo(graph);

        rect20.addTo(graph);
        rect21.addTo(graph);

        rect22.addTo(graph);
        rect23.addTo(graph);

        rect24.addTo(graph);
        rect25.addTo(graph);
        rect26.addTo(graph);

        rect27.addTo(graph);

        rect28.addTo(graph);
        rect29.addTo(graph);
        rect30.addTo(graph);



        return graph;
    }

    function getRect () {
        return new joint.shapes.circuit.Ground();
    }
</script>
<main bind:this={eventElement}>
    <nav class="navbar navbar-default">
        <div class="container-fluid">
            <div class="navbar-header">
                <button class="navbar-brand btn-clear" disabled>ElectricCircuits Editor</button>
            </div>
        </div>
    </nav>
    <div class="row row-list">
        <!-- Components -->
        <div class="col-md-2">
            <h2>Components</h2>
            <hr/>
            <div class="paper-div" bind:this={componentsPaper}></div>
        </div>
        <div class="border-left col-md-10">
            <div class="paper-div" bind:this={editorPaper}></div>
        </div>
        <!-- Editor -->
    </div>
</main>

<style>
    main {
        alignment: center;
        margin-left: 20px;
    }
    .paper-div {
        overflow: scroll;
        height: 800px;
    }
</style>
