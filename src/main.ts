///////////////////////////////////////////////////////////////////////////////////
// GraphMotionJS v0.4.2 - Edges support + node highlight on hover 
//  + label support + node inertia stop using a debounce timer
///////////////////////////////////////////////////////////////////////////////////

import type { Node, Edge } from "./types";

const graph = document.querySelector<HTMLDivElement>(".graph")!;
const nodesContainer = document.querySelector<HTMLDivElement>(".nodes")!;

const edgesContainer = document.querySelector<SVGSVGElement>(".edges")!;
const SVG_NS = "http://www.w3.org/2000/svg";

const response = await fetch("/graphNodes.json");
if (!response.ok) {
    throw new Error(`Failed to load graphNodes.json: ${response.status}`);
}
const graphData = await response.json();

///////////////////////
// #region NODE (VERTEX) SECTION
///////////////////////

// Map that stores the [node.id, node div] pair, 
// used for DOM-interactions such as style.classlist.add or style.transform
const nodeContainerDivs = new Map<string, HTMLDivElement>();

// Appending graphData nodes to HTML and stuffing nodeContainerDivs with nodes
for (let i = 0; i < graphData.nodes.length; i++){
    const node = graphData.nodes[i];

    // NodeContainer has 2 children: the actual node div and it's label with text
    const nodeContainer = document.createElement("div");
    nodeContainer.classList.add("nodeContainer");
    nodeContainer.style.setProperty(
        "--node-size",
        `${graphData.settings.nodeSize}px`
    );

    const div = document.createElement("div");
    div.classList.add("node");

    const label = document.createElement("span");
    label.classList.add("nodeLabel");
    label.textContent = node.label;

    nodeContainer.appendChild(div);
    nodeContainer.appendChild(label);

    nodesContainer.appendChild(nodeContainer);

    // Saving that nodeContainer
    nodeContainerDivs.set(node.id, nodeContainer)

    // Adding event listeners
    nodeContainer.addEventListener("pointerdown", (event) => {
        startDrag(event, node);
    });

    nodeContainer.addEventListener("pointermove", (event) => {
        dragging(event, node);
    });

    nodeContainer.addEventListener("pointerup", (event) => {
        stopDrag(event, node);
    });

    nodeContainer.addEventListener("pointerenter", () => {
        highlightNode(node);
    });

    nodeContainer.addEventListener("pointerleave", () => {
        unHighlightNode(node);
    });
}

//#endregion

///////////////////////
//#region EDGE SECTION
///////////////////////

// Map that stores the [edge.id, edge svg element] pair
const edgeSVGLines = new Map<string, SVGLineElement>();

// [node.id, Node] pairs for getting fromNode and toNode while creating the edges
const nodesById = new Map<string, Node>();
for (const node of graphData.nodes) {
    nodesById.set(node.id, node);
}

// Map that stores [nodeId, connected edges array], 
// used for highlighting the edges
const nodeEdges = new Map<string, SVGLineElement[]>();

// Setting up edges
for (let i = 0; i < graphData.edges.length; i++) {
    const edge = graphData.edges[i];

    // Searching "from" and "to" nodes by id
    const fromNode = nodesById.get(edge.from);
    const toNode = nodesById.get(edge.to);
    if (!fromNode || !toNode) {
        throw new Error(
            `Invalid edge "${edge.id}": node not found`
        );
    }

    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", graphData.settings.edgeThickness);
    line.classList.add("edge");

    line.setAttribute("x1", String(fromNode.x))
    line.setAttribute("y1", String(fromNode.y))
    line.setAttribute("x2", String(toNode.x))
    line.setAttribute("y2", String(toNode.y))

    edgesContainer.appendChild(line);

    // Saving created line
    edgeSVGLines.set(edge.id, line);

    // Saving node-edges pair
    if (!nodeEdges.has(edge.from)) nodeEdges.set(edge.from, []);
    if (!nodeEdges.has(edge.to)) nodeEdges.set(edge.to, []);
    
    nodeEdges.get(edge.from)?.push(line);
    nodeEdges.get(edge.to)?.push(line);
}
//#endregion

/////////////////////
//#region MAIN SECTION
/////////////////////

const damping = 0.95;

let draggedNode: Node | null = null;

// Offset for the vertice "sprite" position - where in local vertex coordinates the click was
let dragOffsetX = 0;
let dragOffsetY = 0;

let lastMouseX = 0;
let lastMouseY = 0;

function getPointerPosLocalGraph(event: PointerEvent): {
    x: number;
    y: number;
} {
    const graphRect = graph.getBoundingClientRect();

    return {
        x: event.clientX - graphRect.left,
        y: event.clientY - graphRect.top
    };
}

function startDrag(event: PointerEvent, node: Node): void {
    const nodeContainerDiv = nodeContainerDivs.get(node.id)!;
    nodeContainerDiv.classList.add("grabbed");

    draggedNode = node;

    nodeContainerDiv.setPointerCapture(event.pointerId);
    const pointer = getPointerPosLocalGraph(event);

    // The vertex shouldn't be dragged by the top-left corner all the time
    dragOffsetX = pointer.x - node.x;
    dragOffsetY = pointer.y - node.y;

    lastMouseX = pointer.x;
    lastMouseY = pointer.y;

    // Stopping the inertia
    node.vx = 0;
    node.vy = 0;
}

let pointerStopTimer: number | null = null;

function dragging(event: PointerEvent, node: Node): void {
    if (!draggedNode) {
        return;
    }

    const pointer = getPointerPosLocalGraph(event);

    node.x = pointer.x - dragOffsetX;
    node.y = pointer.y - dragOffsetY;

    node.vx = pointer.x - lastMouseX;
    node.vy = pointer.y - lastMouseY;

    lastMouseX = pointer.x;
    lastMouseY = pointer.y;

    if (pointerStopTimer !== null) { clearTimeout(pointerStopTimer)}

    pointerStopTimer = window.setTimeout(()=>{
        node.vx = 0;
        node.vy = 0;
    }, 80);
}

// Note: There could be div instead of Node, though
function stopDrag(event: PointerEvent, node: Node): void {
    const nodeContainerDiv = nodeContainerDivs.get(node.id)!;
    nodeContainerDiv.classList.remove("grabbed");

    draggedNode = null;

    if (nodeContainerDiv.hasPointerCapture(event.pointerId)) {
        nodeContainerDiv.releasePointerCapture(event.pointerId);
    }
    if (pointerStopTimer !== null) { clearTimeout(pointerStopTimer)}
}

function updatePosition(): void {
    for(let i = 0; i < graphData.nodes.length; i++) {
        const node = graphData.nodes[i]

        // If this node is not the dragged one, let it continue to slide
        if (draggedNode != node) {
            node.x += node.vx;
            node.y += node.vy;
            
            // TODO: if 2 nodes have collided, vx *= -1 and so does vy
            node.vx *= damping;
            node.vy *= damping;
        }
        
        // Manipulating the styles of node
        const nodeContainerDiv = nodeContainerDivs.get(node.id);
        if (!nodeContainerDiv) throw Error(`No divs for node id=${node.id}`);

        nodeContainerDiv.style.left = `${node.x}px`;
        nodeContainerDiv.style.top = `${node.y}px`;
    }

    // Updating the edges
    for (let i=0; i < graphData.edges.length; i++){

        // Searching "from" and "to" nodes by id
        const edge = graphData.edges[i];
        const fromNode = nodesById.get(edge.from);
        const toNode = nodesById.get(edge.to);
        if (!fromNode || !toNode) {
            throw new Error(
                `Invalid edge "${edge.id}": nodes not found`
            );
        }

        // Manipulating the svg lines
        const line = edgeSVGLines.get(edge.id);
        if (!line) {
            throw new Error(
                `Invalid line "${edge.id}": lines not found`
            )
        }

        line.setAttribute("x1", String(fromNode.x))
        line.setAttribute("y1", String(fromNode.y))
        line.setAttribute("x2", String(toNode.x))
        line.setAttribute("y2", String(toNode.y))
    }

    requestAnimationFrame(updatePosition);
}

function highlightNode(node: Node){
    const lines = nodeEdges.get(node.id);
    if (!lines) throw Error(`No edges found for node ${node.id}`);

    for (const line of lines) {
        line.classList.add("highlighted");
    }
}

function unHighlightNode(node: Node){
    const lines = nodeEdges.get(node.id);
    if (!lines) throw Error(`No edges found for node ${node.id}`);

    for (const line of lines) {
        line.classList.remove("highlighted");
    }
}

updatePosition();

//#endregion