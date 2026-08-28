<h1 align="center">GraphMotionJS</h1>

<p align="center">
    An interactive <strong>force-directed graph</strong> built from scratch with
    TypeScript, HTML and SCSS.
</p>

<p align="center">
    Drag nodes, watch the motion propagate through connected vertices,
    zoom around the cursor, and let the graph settle naturally.
</p>

<p align="center">
    <img  width="808" height="663" alt="CPT2608281436-808x663" src="https://github.com/user-attachments/assets/055bccf7-62b8-458c-b6eb-959ed9f6c596" />
</p>

<h2>✨ Features</h2>

<ul>
    <li>⛓ Force-directed spring physics</li>
    <li>⧉ Node collision detection</li>
    <li>💨 Inertia and damping</li>
    <li>✊ Drag &amp; drop interaction</li>
    <li>🔍 Zoom to cursor</li>
    <li>🎯 Viewport boundaries</li>
    <li>✨ Connected-edge highlighting</li>
    <li>⚡ <code>requestAnimationFrame</code> simulation loop</li>
</ul>

<h2>🧲 Physics</h2>

<p>
    Each node has a position and velocity. Connected nodes are linked by
    spring-like forces that try to keep them near a preferred distance.
</p>

<p>
    When a node is dragged, its velocity is transferred through the graph,
    creating a natural chain reaction.
</p>

<p>
    <img width="1582" height="748" alt="CPT2608281409-1582x748" src="https://github.com/user-attachments/assets/6f662276-b31f-48f6-a3f9-fc9cb4b2e25e" />

</p>

<p>
    Nodes also <strong>collide with each other</strong> and are constrained by the world boundaries.
</p>

<p>
    The physics are intentionally simple — there is no external physics or
    graph library. The goal is not perfect physical accuracy, but responsive
    and pleasant interaction.
</p>

<h2>🖱️ Interaction</h2>

<p>
    Nodes can be grabbed and dragged directly with the pointer. When released,
    they retain their velocity and gradually slow down through damping.
</p>

<p>
    Hovering a node highlights its connected edges, making relationships
    easier to follow.
</p>

<p>
    <img width="895" height="484" alt="CPT2608281355-895x484" src="https://github.com/user-attachments/assets/f81af130-4c8c-4928-9c75-5806a341b998" />
</p>

<p>
    The graph can also be zoomed with the mouse wheel.
</p>

<h2>🛠️ Tech stack</h2>

<ul>
    <li><strong>TypeScript</strong> — graph logic and physics</li>
    <li><strong>HTML</strong> — nodes and UI</li>
    <li><strong>SCSS</strong> — styling</li>
    <li><strong>SVG</strong> — edges</li>
    <li><strong>Vite</strong> — development and build tooling</li>
</ul>

<p>
    No graph or physics library is used.
</p>

<h2>📁 Graph data</h2>

<p>
    Graph JSON structure is loaded from the public/ folder, keeping the data separate from
    the rendering and physics logic:
</p>

<pre><code>{
    "settings": {
        "nodeSize": 25,
        "edgeThickness": 1
    },
    "nodes": [
        {
            "id": "js",
            "label": "JavaScript",
            "x": 346,
            "y": 530,
            "vx": 0,
            "vy": 0
        }
    ],
    "edges": [
        {
            "id": "1",
            "from": "js",
            "to": "react"
        }
    ]
}</code></pre>

<h2>🚀 Running locally</h2>

<pre><code>git clone https://github.com/codemiurge/GraphMotionJS.git
cd GraphMotionJS
npm install
npm run dev</code></pre>

<p>
    Then open the local address provided by Vite.
</p>

<h2>🔮 Possible improvements</h2>

<ul>
    <li>Better time-based physics with <code>deltaTime</code></li>
    <li>Spatial partitioning for collisions</li>
    <li>More advanced force balancing</li>
    <li>Larger graph performance</li>
    <li>Additional interaction modes</li>
</ul>
