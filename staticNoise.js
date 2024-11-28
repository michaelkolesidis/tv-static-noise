const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

// Resize canvas to full window
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', resize);
resize();

// Vertex shader
const vertexShaderSource = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

// Fragment shader
const fragmentShaderSource = `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;

    float noise(vec2 pos, float evolve) {
        float e = fract((evolve*0.01));
        float cx = pos.x*e;
        float cy = pos.y*e;
        return fract(23.0*fract(2.0/fract(fract(cx*2.4/cy*23.0+pow(abs(cy/22.4),3.3))*fract(cx*evolve/pow(abs(cy),0.050)))));
    }

    void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        float noise_val = noise(fragCoord, u_time);
        gl_FragColor = vec4(vec3(noise_val), 1.0);
    }
`;

// Create shader program
function createShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  return program;
}

const program = createShaderProgram(
  gl,
  vertexShaderSource,
  fragmentShaderSource
);
gl.useProgram(program);

// Define vertex positions for a full-screen quad (spanning normalized device coordinates [-1, 1])
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]),
  gl.STATIC_DRAW
);

// Set up attributes and uniforms
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
const resolutionUniformLocation = gl.getUniformLocation(
  program,
  'u_resolution'
);

let isPaused = false;

// Pause/unpause on click
canvas.addEventListener('click', () => {
  isPaused = !isPaused;
});

// Render loop
function render() {
  if (!isPaused) {
    gl.uniform1f(timeUniformLocation, performance.now() * 0.001);
  }

  // Set resolution
  gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

  // Draw
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // Continue rendering
  requestAnimationFrame(render);
}

render();
