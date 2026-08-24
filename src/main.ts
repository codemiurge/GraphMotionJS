const graph = document.querySelector<HTMLDivElement>(".graph")!;
const circle = document.querySelector<HTMLDivElement>(".node")!;

type Node = {
    x: number;
    y: number;
    vx: number;
    vy: number;
};

const currentNode: Node = {
    x: 100,
    y: 100,
    vx: 0,
    vy: 0
};

const damping = 0.95;

let isDragging = false;

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

function startDrag(event: PointerEvent): void {
    isDragging = true;
    circle.classList.add("grabbed");

    circle.setPointerCapture(event.pointerId);
    const pointer = getPointerPosLocalGraph(event);

    // The vertex shouldn't be dragged by the top-left corner all the time
    dragOffsetX = pointer.x - currentNode.x;
    dragOffsetY = pointer.y - currentNode.y;

    lastMouseX = pointer.x;
    lastMouseY = pointer.y;

    // Stopping the inertia
    currentNode.vx = 0;
    currentNode.vy = 0;
}

function dragging(event: PointerEvent): void {
    if (!isDragging) {
        return;
    }

    const pointer = getPointerPosLocalGraph(event);

    currentNode.x = pointer.x - dragOffsetX;
    currentNode.y = pointer.y - dragOffsetY;

    currentNode.vx = pointer.x - lastMouseX;;
    currentNode.vy = pointer.y - lastMouseY;

    lastMouseX = pointer.x;
    lastMouseY = pointer.y;
}

function stopDrag(event: PointerEvent): void {
    circle.classList.remove("grabbed");

    isDragging = false;

    if (circle.hasPointerCapture(event.pointerId)) {
        circle.releasePointerCapture(event.pointerId);
    }
}

function updatePosition(): void {
    if (!isDragging) {
        currentNode.x += currentNode.vx;
        currentNode.y += currentNode.vy;

        currentNode.vx *= damping;
        currentNode.vy *= damping;
    }

    circle.style.transform =
        `translate(${currentNode.x}px, ${currentNode.y}px)`;

    requestAnimationFrame(updatePosition);
}

circle.addEventListener("pointerdown", startDrag);
circle.addEventListener("pointermove", dragging);
circle.addEventListener("pointerup", stopDrag);

updatePosition();