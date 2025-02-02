// Vertex shader program
const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = u_Size;
    }
`;

// Fragment shader program
const VFSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }
`;

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

// Drawing state
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedType = POINT;
let g_shapesList = [];
let g_selectedColor = [1.0, 0.0, 0.0, 1.0];
let g_selectedSize = 10;
let g_segments = 10;

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    setupEventHandlers();

    // Initialize canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.error('Failed to get the WebGL context');
        return;
    }
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, VFSHADER_SOURCE)) {
        console.error('Failed to initialize shaders');
        return;
    }

    // Get locations of shader variables
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');

    if (a_Position < 0 || !u_FragColor || !u_Size) {
        console.error('Failed to get shader variable locations');
        return;
    }
}

function setupEventHandlers() {
    // Canvas events
    canvas.onmousedown = handleClick;
    canvas.onmousemove = function(ev) {
        if (ev.buttons === 1) {
            handleClick(ev);
        }
    };

    // Button events
    document.getElementById('clearCanvas').onclick = clearCanvas;
    document.getElementById('pointButton').onclick = () => g_selectedType = POINT;
    document.getElementById('triangleButton').onclick = () => g_selectedType = TRIANGLE;
    document.getElementById('circleButton').onclick = () => g_selectedType = CIRCLE;

    // Slider events with live updates
    setupSlider('sizeSlider', 'sizeValue', (value) => {
        g_selectedSize = parseInt(value);
    });

    setupSlider('segmentSlider', 'segmentValue', (value) => {
        g_segments = parseInt(value);
    });

    const redSlider = document.getElementById('redSlider');
    const greenSlider = document.getElementById('greenSlider');
    const blueSlider = document.getElementById('blueSlider');
    const redValue = document.getElementById('redValue');
    const greenValue = document.getElementById('greenValue');
    const blueValue = document.getElementById('blueValue');

    redSlider.addEventListener('input', function() {
        g_selectedColor[0] = this.value / 100;
        redValue.innerHTML = this.value + '%';
    });

    greenSlider.addEventListener('input', function() {
        g_selectedColor[1] = this.value / 100;
        greenValue.innerHTML = this.value + '%';
    });

    blueSlider.addEventListener('input', function() {
        g_selectedColor[2] = this.value / 100;
        blueValue.innerHTML = this.value + '%';
    });
}

function setupSlider(sliderId, valueId, callback, suffix = '') {
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(valueId);
    
    slider.oninput = function() {
        valueDisplay.textContent = this.value + suffix;
        callback(this.value);
    };
}

function handleClick(ev) {
    const [x, y] = convertCoordinatesEventToGL(ev);
    let shape;

    switch(g_selectedType) {
        case POINT:
            shape = new Point([x, y], g_selectedColor.slice(), g_selectedSize);
            break;
        case TRIANGLE:
            shape = new Triangle();
            shape.position = [x, y];
            shape.color = g_selectedColor.slice();
            shape.size = g_selectedSize;
            break;
        case CIRCLE:
            shape = new Circle();
            shape.position = [x, y];
            shape.color = g_selectedColor.slice();
            shape.size = g_selectedSize;
            shape.segments = g_segments;
            break;
    }

    g_shapesList.push(shape);
    renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
    const rect = ev.target.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) - canvas.width/2) / (canvas.width/2);
    const y = (canvas.height/2 - (ev.clientY - rect.top)) / (canvas.height/2);
    return [x, y];
}

function renderAllShapes() {
    //gl.clear(gl.COLOR_BUFFER_BIT);
    g_shapesList.forEach(shape => shape.render());
}

function clearCanvas() {
    g_shapesList = [];
    gl.clear(gl.COLOR_BUFFER_BIT);
}