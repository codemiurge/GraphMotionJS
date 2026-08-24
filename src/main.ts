///////////////////////////////////////////////////////////////////
// GraphMotionJS v0.3.0 — Multi-node support + JSON-based graph loading
///////////////////////////////////////////////////////////////////


import type { Node, Edge } from "./types";

const graph = document.querySelector<HTMLDivElement>(".graph")!;
const nodesContainer = document.querySelector<HTMLDivElement>(".nodes")!;

const response = await fetch("/graphNodes.json");
if (!response.ok) {
    throw new Error(`Failed to load vertexes.json: ${response.status}`);
}
const graphData = await response.json();

// Map storing the [node.id, node div] pair, 
// used for DOM-interactions such as style.classlist.add or style.transform
const nodeElements = new Map<string, HTMLDivElement>();

// Appending graphData nodes to HTML and stuffing nodeElements with nodes
for (let i = 0; i < graphData.nodes.length; i++){
    const node = graphData.nodes[i];

    const div = document.createElement("div");
    div.classList.add("node");
    div.innerHTML = `<span class="nodeLabel">${node.label}</span>`;
    
    nodesContainer.appendChild(div);
    nodeElements.set(node.id, div)

    // Adding event listeners
    div.addEventListener("pointerdown", (event) => {
        startDrag(event, node);
    });

    div.addEventListener("pointermove", (event) => {
        dragging(event, node);
    });

    div.addEventListener("pointerup", (event) => {
        stopDrag(event, node);
    });
}

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
    const nodeDiv = nodeElements.get(node.id)!;
    nodeDiv.classList.add("grabbed");

    draggedNode = node;

    nodeDiv.setPointerCapture(event.pointerId);
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
}

// Note: There could be div instead of Node, though
function stopDrag(event: PointerEvent, node: Node): void {
    const nodeDiv = nodeElements.get(node.id)!;
    nodeDiv.classList.remove("grabbed");

    draggedNode = null;

    if (nodeDiv.hasPointerCapture(event.pointerId)) {
        nodeDiv.releasePointerCapture(event.pointerId);
    }
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
    
        nodeElements.get(node.id)!.style.transform =
            `translate(${node.x}px, ${node.y}px)`;

    }
    requestAnimationFrame(updatePosition);
}

updatePosition();