'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';

interface FluidCanvasProps {
  className?: string;
  style?: React.CSSProperties;
}

interface Pointer {
  id: number;
  texcoordX: number;
  texcoordY: number;
  prevTexcoordX: number;
  prevTexcoordY: number;
  deltaX: number;
  deltaY: number;
  down: boolean;
  moved: boolean;
  color: { r: number; g: number; b: number };
}

interface Framebuffer {
  texture: WebGLTexture | null;
  fbo: WebGLFramebuffer | null;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
}

interface DoubleFramebuffer {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: Framebuffer;
  write: Framebuffer;
  swap: () => void;
}

interface Config {
  SIM_RESOLUTION: number;
  DYE_RESOLUTION: number;
  CAPTURE_RESOLUTION: number;
  DENSITY_DISSIPATION: number;
  VELOCITY_DISSIPATION: number;
  PRESSURE: number;
  PRESSURE_ITERATIONS: number;
  CURL: number;
  SPLAT_RADIUS: number;
  SPLAT_FORCE: number;
  SHADING: boolean;
  COLOR_UPDATE_SPEED: number;
  PAUSED: boolean;
  BACK_COLOR: { r: number; g: number; b: number };
  Neon_cycle: boolean;
}

const FluidCanvas: React.FC<FluidCanvasProps> = ({
  className = 'fixed top-0 left-0 w-full h-full z-0 pointer-events-none',
  style = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const extRef = useRef<any>(null);
  const pointersRef = useRef<Pointer[]>([
    {
      id: -1,
      texcoordX: 0,
      texcoordY: 0,
      prevTexcoordX: 0,
      prevTexcoordY: 0,
      deltaX: 0,
      deltaY: 0,
      down: false,
      moved: false,
      color: { r: 0, g: 0, b: 0 },
    },
  ]);
  const lastUpdateRef = useRef<number>(0); // For manual delay

  const config = {
    SIM_RESOLUTION: 256, // Reduced for mobile
    DYE_RESOLUTION: 512, // Reduced for mobile
    CAPTURE_RESOLUTION: 256,
    DENSITY_DISSIPATION: 0.5,
    VELOCITY_DISSIPATION: 2,
    PRESSURE: 0.8,
    PRESSURE_ITERATIONS: 20,
    CURL: 3,
    SPLAT_RADIUS: 0.15, // Reduced for mobile
    SPLAT_FORCE: 3000, // Reduced for mobile
    SHADING: true,
    COLOR_UPDATE_SPEED: 0.5,
    PAUSED: false,
    BACK_COLOR: { r: 0, g: 0, b: 0 },
    Neon_cycle: true,
  };

  const baseVertexShader = `
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;

    void main () {
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(texelSize.x, 0.0);
      vR = vUv + vec2(texelSize.x, 0.0);
      vT = vUv + vec2(0.0, texelSize.y);
      vB = vUv - vec2(0.0, texelSize.y);
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const copyShader = `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    uniform sampler2D uTexture;

    void main () {
      gl_FragColor = texture2D(uTexture, vUv);
    }
  `;

  const splatShader = `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;

    void main () {
      vec2 p = vUv - point.xy;
      p.x *= aspectRatio;
      vec3 splat = exp(-dot(p, p) / radius) * color;
      vec3 base = texture2D(uTarget, vUv).xyz;
      gl_FragColor = vec4(base + splat, 1.0);
    }
  `;

  const advectionShader = `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;

    vec4 bilerp(sampler2D sam, vec2 uv, vec2 tsize) {
      vec2 st = uv / tsize - 0.5;
      vec2 iuv = floor(st);
      vec2 fuv = fract(st);
      vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
      vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
      vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
      vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
      return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }

    void main () {
      vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
      vec4 result = bilerp(uSource, coord, texelSize);
      float decay = 1.0 + dissipation * dt;
      gl_FragColor = result / decay;
    }
  `;

  const divergenceShader = `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;

    void main () {
      float L = texture2D(uVelocity, vL).x;
      float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y;
      float B = texture2D(uVelocity, vB).y;
      vec2 C = texture2D(uVelocity, vUv).xy;
      if (vL.x < 0.0) { L = -C.x; }
      if (vR.x > 1.0) { R = -C.x; }
      if (vT.y > 1.0) { T = -C.y; }
      if (vB.y < 0.0) { B = -C.y; }
      float div = 0.5 * (R - L + T - B);
      gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
  `;

  const curlShader = `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;

    void main () {
      float L = texture2D(uVelocity, vL).y;
      float R = texture2D(uVelocity, vR).y;
      float T = texture2D(uVelocity, vT).x;
      float B = texture2D(uVelocity, vB).x;
      float vorticity = R - L - T + B;
      gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
  `;

  const vorticityShader = `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;

    void main () {
      float L = texture2D(uCurl, vL).x;
      float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x;
      float B = texture2D(uCurl, vB).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= curl * C;
      force.y *= -1.0;
      vec2 velocity = texture2D(uVelocity, vUv).xy;
      velocity += force * dt;
      velocity = min(max(velocity, -1000.0), 1000.0);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
  `;

  const pressureShader = `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;

    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      float C = texture2D(uPressure, vUv).x;
      float divergence = texture2D(uDivergence, vUv).x;
      float pressure = (L + R + B + T - divergence) * 0.25;
      gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
  `;

  const gradientSubtractShader = `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;

    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      vec2 velocity = texture2D(uVelocity, vUv).xy;
      velocity.xy -= vec2(R - L, T - B);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
  `;

  const displayShader = `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform vec2 texelSize;

    vec3 linearToGamma(vec3 color) {
      color = max(color, vec3(0));
      return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
    }

    void main () {
      vec3 c = texture2D(uTexture, vUv).rgb;
      #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;
        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);
        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        vec3 l = vec3(0.0, 0.0, 1.0);
        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
        c *= diffuse;
      #endif
      float a = max(c.r, max(c.g, c.b));
      gl_FragColor = vec4(c, a);
    }
  `;

  const initGL = (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!context) {
      throw new Error('WebGL not supported');
    }

    const gl = context as WebGLRenderingContext;
    let supportLinearFiltering = false;
    let halfFloatTexType: number = 0;
    let formatRGBA = null;
    let formatRG = null;
    let formatR = null;

    gl.clearColor(0, 0, 0, 1);
    const halfFloat = gl.getExtension('OES_texture_half_float');
    supportLinearFiltering = !!gl.getExtension('OES_texture_half_float_linear');

    if (!halfFloat) {
      throw new Error('OES_texture_half_float extension not supported');
    }

    halfFloatTexType = halfFloat.HALF_FLOAT_OES;
    formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);

    if (!formatRGBA || !formatRG || !formatR) {
      throw new Error('Required WebGL texture formats not supported');
    }

    return {
      gl,
      ext: {
        formatRGBA,
        formatRG,
        formatR,
        halfFloatTexType,
        supportLinearFiltering,
      },
    };
  };

  const getSupportedFormat = (
    gl: WebGLRenderingContext,
    internalFormat: number,
    format: number,
    type: number
  ) => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    return status === gl.FRAMEBUFFER_COMPLETE ? { internalFormat, format } : null;
  };

  const createShader = (
    gl: WebGLRenderingContext,
    type: number,
    source: string,
    keywords?: string[]
  ) => {
    let shaderSource = source;
    if (keywords) {
      let defines = '';
      for (const keyword of keywords) {
        defines += `#define ${keyword}\n`;
      }
      shaderSource = defines + source;
    }

    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  const createProgram = (
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ) => {
    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return null;
    }

    return program;
  };

  const getUniforms = (gl: WebGLRenderingContext, program: WebGLProgram) => {
    const uniforms: { [key: string]: WebGLUniformLocation | null } = {};
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      const uniformInfo = gl.getActiveUniform(program, i);
      if (uniformInfo) {
        uniforms[uniformInfo.name] = gl.getUniformLocation(program, uniformInfo.name);
      }
    }
    return uniforms;
  };

  class Program {
    program: WebGLProgram | null;
    uniforms: { [key: string]: WebGLUniformLocation | null };
    gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
      this.gl = gl;
      this.program = createProgram(gl, vertexShader, fragmentShader);
      this.uniforms = this.program ? getUniforms(gl, this.program) : {};
    }

    bind() {
      if (this.program) this.gl.useProgram(this.program);
    }
  }

  class Material {
    gl: WebGLRenderingContext;
    vertexShader: WebGLShader;
    fragmentShaderSource: string;
    programs: { [key: number]: WebGLProgram | null };
    activeProgram: WebGLProgram | null;
    uniforms: { [key: string]: WebGLUniformLocation | null };

    constructor(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShaderSource: string) {
      this.gl = gl;
      this.vertexShader = vertexShader;
      this.fragmentShaderSource = fragmentShaderSource;
      this.programs = {};
      this.activeProgram = null;
      this.uniforms = {};
    }

    setKeywords(keywords: string[]) {
      let hash = 0;
      for (const keyword of keywords) {
        for (let i = 0; i < keyword.length; i++) {
          hash = ((hash << 5) - hash + keyword.charCodeAt(i)) | 0;
        }
      }

      let program = this.programs[hash];
      if (!program) {
        const fragmentShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
        if (fragmentShader) {
          program = createProgram(this.gl, this.vertexShader, fragmentShader);
          this.programs[hash] = program;
        }
      }

      if (program !== this.activeProgram && program) {
        this.uniforms = getUniforms(this.gl, program);
        this.activeProgram = program;
      }
    }

    bind() {
      if (this.activeProgram) this.gl.useProgram(this.activeProgram);
    }
  }

  const createFramebuffer = (
    gl: WebGLRenderingContext,
    width: number,
    height: number,
    internalFormat: number,
    format: number,
    type: number,
    filter: number
  ): Framebuffer => {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const texelSizeX = 1 / width;
    const texelSizeY = 1 / height;

    return {
      texture,
      fbo,
      width,
      height,
      texelSizeX,
      texelSizeY,
      attach: (id: number) => {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
    };
  };

  const createDoubleFramebuffer = (
    gl: WebGLRenderingContext,
    width: number,
    height: number,
    internalFormat: number,
    format: number,
    type: number,
    filter: number
  ): DoubleFramebuffer => {
    const fbo1 = createFramebuffer(gl, width, height, internalFormat, format, type, filter);
    const fbo2 = createFramebuffer(gl, width, height, internalFormat, format, type, filter);

    return {
      width,
      height,
      texelSizeX: fbo1.texelSizeX,
      texelSizeY: fbo1.texelSizeY,
      read: fbo1,
      write: fbo2,
      swap: function () {
        const temp = this.read;
        this.read = this.write;
        this.write = temp;
      },
    };
  };

  const correctRadius = (radius: number, aspectRatio: number) => {
    let corrected = radius;
    if (aspectRatio > 1) corrected *= aspectRatio;
    return corrected;
  };

  const generateWarmColor = () => {
    const hue = 0.5 + Math.random() * 0.1; // Hue range 0.5-0.6 for cyan-blue
    const saturation = 1;
    const value = 1;
    let r = 0, g = 0, b = 0;

    const i = Math.floor(hue * 6);
    const f = hue * 6 - i;
    const p = value * (1 - saturation);
    const q = value * (1 - f * saturation);
    const t = value * (1 - (1 - f) * saturation);

    switch (i % 6) {
      case 0: r = value; g = t; b = p; break;
      case 1: r = q; g = value; b = p; break;
      case 2: r = p; g = value; b = t; break;
      case 3: r = p; g = q; b = value; break;
      case 4: r = t; g = p; b = value; break;
      case 5: r = value; g = p; b = q; break;
    }

    return { r: r * 0.15, g: g * 0.15, b: b * 0.15 };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !canvasRef.current) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCursorPos({ x: e.clientX, y: e.clientY });

    const pointer = pointersRef.current[0];
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = x / canvasRef.current.width;
    pointer.texcoordY = 1 - y / canvasRef.current.height;

    const aspectRatio = canvasRef.current.width / canvasRef.current.height;
    pointer.deltaX = correctRadius(pointer.texcoordX - pointer.prevTexcoordX, aspectRatio < 1 ? aspectRatio : 1);
    pointer.deltaY = correctRadius(pointer.texcoordY - pointer.prevTexcoordY, aspectRatio > 1 ? 1 / aspectRatio : 1);
    pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    pointer.color = generateWarmColor();

    // Manual delay to limit update frequency
    const now = Date.now();
    if (now - lastUpdateRef.current > 16) { // ~60fps
      if (pointer.moved && pointer.down) {
        splat(pointer.texcoordX, pointer.texcoordY, pointer.deltaX * config.SPLAT_FORCE, pointer.deltaY * config.SPLAT_FORCE, pointer.color);
      }
      lastUpdateRef.current = now;
    }
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !canvasRef.current) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pointer = pointersRef.current[0];
    pointer.id = -1;
    pointer.down = true;
    pointer.moved = false;
    pointer.texcoordX = x / canvasRef.current.width;
    pointer.texcoordY = 1 - y / canvasRef.current.height;
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.deltaX = 0;
    pointer.deltaY = 0;
    pointer.color = generateWarmColor();

    const color = { ...pointer.color };
    color.r *= 10;
    color.g *= 10;
    color.b *= 10;
    const dx = 10 * (Math.random() - 0.5);
    const dy = 30 * (Math.random() - 0.5);
    splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color);
  }, []);

  const handleMouseUp = useCallback(() => {
    const pointer = pointersRef.current[0];
    pointer.down = false;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !canvasRef.current) return;

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setCursorPos({ x: touch.clientX, y: touch.clientY });

    const pointer = pointersRef.current[0];
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = x / canvasRef.current.width;
    pointer.texcoordY = 1 - y / canvasRef.current.height;

    const aspectRatio = canvasRef.current.width / canvasRef.current.height;
    pointer.deltaX = correctRadius(pointer.texcoordX - pointer.prevTexcoordX, aspectRatio < 1 ? aspectRatio : 1);
    pointer.deltaY = correctRadius(pointer.texcoordY - pointer.prevTexcoordY, aspectRatio > 1 ? 1 / aspectRatio : 1);
    pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    pointer.color = generateWarmColor();

    // Manual delay to limit update frequency
    const now = Date.now();
    if (now - lastUpdateRef.current > 16) { // ~60fps
      if (pointer.moved && pointer.down) {
        splat(pointer.texcoordX, pointer.texcoordY, pointer.deltaX * config.SPLAT_FORCE, pointer.deltaY * config.SPLAT_FORCE, pointer.color);
      }
      lastUpdateRef.current = now;
    }
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !canvasRef.current) return;

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const pointer = pointersRef.current[0];
    pointer.id = -1;
    pointer.down = true;
    pointer.moved = false;
    pointer.texcoordX = x / canvasRef.current.width;
    pointer.texcoordY = 1 - y / canvasRef.current.height;
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.deltaX = 0;
    pointer.deltaY = 0;
    pointer.color = generateWarmColor();

    const color = { ...pointer.color };
    color.r *= 10;
    color.g *= 10;
    color.b *= 10;
    const dx = 10 * (Math.random() - 0.5);
    const dy = 30 * (Math.random() - 0.5);
    splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color);
  }, []);

  const handleTouchEnd = useCallback(() => {
    const pointer = pointersRef.current[0];
    pointer.down = false;
  }, []);

  let density: DoubleFramebuffer | null = null;
  let velocity: DoubleFramebuffer | null = null;
  let divergence: Framebuffer | null = null;
  let curl: Framebuffer | null = null;
  let pressure: DoubleFramebuffer | null = null;
  let copyProgram: Program | null = null;
  let splatProgram: Program | null = null;
  let advectionProgram: Program | null = null;
  let divergenceProgram: Program | null = null;
  let curlProgram: Program | null = null;
  let vorticityProgram: Program | null = null;
  let pressureProgram: Program | null = null;
  let gradienSubtractProgram: Program | null = null;
  let displayMaterial: Material | null = null;
  let blit: ((target: Framebuffer | null, clear?: boolean) => void) | null = null;

  const splat = (x: number, y: number, dx: number, dy: number, color: { r: number; g: number; b: number }) => {
    const gl = glRef.current;
    const canvas = canvasRef.current;
    if (!gl || !splatProgram || !velocity || !density || !canvas || !blit) return;

    splatProgram.bind();
    splatProgram.uniforms.uTarget && gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
    splatProgram.uniforms.aspectRatio && gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
    splatProgram.uniforms.point && gl.uniform2f(splatProgram.uniforms.point, x, y);
    splatProgram.uniforms.color && gl.uniform3f(splatProgram.uniforms.color, dx * config.SPLAT_FORCE, dy * config.SPLAT_FORCE, 0);
    splatProgram.uniforms.radius && gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100, canvas.width / canvas.height));
    blit(velocity.write);
    velocity.swap();

    splatProgram.uniforms.uTarget && gl.uniform1i(splatProgram.uniforms.uTarget, density.read.attach(0));
    splatProgram.uniforms.color && gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
    blit(density.write);
    density.swap();
  };

  const update = (dt: number) => {
  const gl = glRef.current;
  if (
    !gl ||
    !curlProgram ||
    !vorticityProgram ||
    !divergenceProgram ||
    !pressureProgram ||
    !gradienSubtractProgram ||
    !advectionProgram ||
    !velocity ||
    !density ||
    !divergence ||
    !curl ||
    !pressure ||
    !blit
  )
    return;

  gl.disable(gl.BLEND);

  curlProgram.bind();
  curlProgram.uniforms.texelSize && gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  curlProgram.uniforms.uVelocity && gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
  blit(curl);

  vorticityProgram.bind();
  vorticityProgram.uniforms.texelSize && gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeY, velocity.texelSizeY); // Fixed typo: texelSizeY instead of texelSize
  vorticityProgram.uniforms.uVelocity && gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
  vorticityProgram.uniforms.uCurl && gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
  vorticityProgram.uniforms.curl && gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
  vorticityProgram.uniforms.dt && gl.uniform1f(vorticityProgram.uniforms.dt, dt);
  blit(velocity.write);
  velocity.swap();

  divergenceProgram.bind();
  divergenceProgram.uniforms.texelSize && gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  divergenceProgram.uniforms.uVelocity && gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
  blit(divergence);

  pressureProgram.bind();
  pressureProgram.uniforms.texelSize && gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  pressureProgram.uniforms.uDivergence && gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
  for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
    pressureProgram.uniforms.uPressure && gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
    blit(pressure.write);
    pressure.swap();
  }

  gradienSubtractProgram.bind();
  gradienSubtractProgram.uniforms.texelSize && gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gradienSubtractProgram.uniforms.uPressure && gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
  gradienSubtractProgram.uniforms.uVelocity && gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
  blit(velocity.write);
  velocity.swap();

  advectionProgram.bind();
  advectionProgram.uniforms.texelSize && gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  const velocityId = velocity.read.attach(0);
  advectionProgram.uniforms.uVelocity && gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
  advectionProgram.uniforms.uSource && gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
  advectionProgram.uniforms.dt && gl.uniform1f(advectionProgram.uniforms.dt, dt * 0.8);
  advectionProgram.uniforms.dissipation && gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
  blit(velocity.write);
  velocity.swap();

  advectionProgram.uniforms.uVelocity && gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
  advectionProgram.uniforms.uSource && gl.uniform1i(advectionProgram.uniforms.uSource, density.read.attach(1));
  advectionProgram.uniforms.dt && gl.uniform1f(advectionProgram.uniforms.dt, dt * 0.8);
  advectionProgram.uniforms.dissipation && gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
  blit(density.write);
  density.swap();
};

  const render = (target: Framebuffer | null) => {
    const gl = glRef.current;
    if (!gl || !displayMaterial || !density || !blit) return;

    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    const width = target ? target.width : gl.drawingBufferWidth;
    const height = target ? target.height : gl.drawingBufferHeight;

    displayMaterial.bind();
    if (config.SHADING) {
      displayMaterial.uniforms.texelSize && gl.uniform2f(displayMaterial.uniforms.texelSize, 1 / width, 1 / height);
    }
    displayMaterial.uniforms.uTexture && gl.uniform1i(displayMaterial.uniforms.uTexture, density.read.attach(0));
    blit(target, false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { gl, ext } = initGL(canvas);
    glRef.current = gl;
    extRef.current = ext;

    if (!ext.supportLinearFiltering) {
      config.DYE_RESOLUTION = 256;
      config.SHADING = false;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, baseVertexShader);
    const copyFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, copyShader);
    const splatFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, splatShader);
    const advectionFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, advectionShader);
    const divergenceFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, divergenceShader);
    const curlFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, curlShader);
    const vorticityFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, vorticityShader);
    const pressureFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, pressureShader);
    const gradientSubtractFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, gradientSubtractShader);

    if (
      !vertexShader ||
      !copyFragmentShader ||
      !splatFragmentShader ||
      !advectionFragmentShader ||
      !divergenceFragmentShader ||
      !curlFragmentShader ||
      !vorticityFragmentShader ||
      !pressureFragmentShader ||
      !gradientSubtractFragmentShader
    ) {
      console.error('Failed to create shaders');
      return;
    }

    copyProgram = new Program(gl, vertexShader, copyFragmentShader);
    splatProgram = new Program(gl, vertexShader, splatFragmentShader);
    advectionProgram = new Program(gl, vertexShader, advectionFragmentShader);
    divergenceProgram = new Program(gl, vertexShader, divergenceFragmentShader);
    curlProgram = new Program(gl, vertexShader, curlFragmentShader);
    vorticityProgram = new Program(gl, vertexShader, vorticityFragmentShader);
    pressureProgram = new Program(gl, vertexShader, pressureFragmentShader);
    gradienSubtractProgram = new Program(gl, vertexShader, gradientSubtractFragmentShader);
    displayMaterial = new Material(gl, vertexShader, displayShader);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);

    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    blit = (target: Framebuffer | null, clear = false) => {
      if (target) {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      } else {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
      if (clear) {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };

    const getResolution = (resolution: number) => {
      const aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
      let width = Math.round(resolution);
      let height = Math.round(resolution * (aspectRatio < 1 ? 1 / aspectRatio : aspectRatio));
      if (gl.drawingBufferWidth > gl.drawingBufferHeight) {
        [width, height] = [height, width];
      }
      return { width, height };
    };

    const resizeFramebuffers = () => {
      const gl = glRef.current;
      const ext = extRef.current;
      if (!gl || !ext || !copyProgram || !blit) return;

      const simRes = getResolution(config.SIM_RESOLUTION);
      const dyeRes = getResolution(config.DYE_RESOLUTION);
      const type = ext.halfFloatTexType;
      const rgba = ext.formatRGBA;
      const rg = ext.formatRG;
      const r = ext.formatR;
      const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

      gl.disable(gl.BLEND);

      if (!rgba || !rg || !r) return;

      density = density || createDoubleFramebuffer(gl, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, type, filtering);
      velocity = velocity || createDoubleFramebuffer(gl, simRes.width, simRes.height, rg.internalFormat, rg.format, type, filtering);
      divergence = divergence || createFramebuffer(gl, simRes.width, simRes.height, r.internalFormat, r.format, type, gl.NEAREST);
      curl = curl || createFramebuffer(gl, simRes.width, simRes.height, r.internalFormat, r.format, type, gl.NEAREST);
      pressure = pressure || createDoubleFramebuffer(gl, simRes.width, simRes.height, r.internalFormat, r.format, type, gl.NEAREST);
    };

    let lastUpdateTime = Date.now();
    let colorUpdateTimer = 0;

    const updateSimulation = () => {
      const gl = glRef.current;
      if (!gl) return;

      const currentTime = Date.now();
      let dt = (currentTime - lastUpdateTime) / 1000;
      dt = Math.min(dt, 0.016666);
      lastUpdateTime = currentTime;

      const resized = resizeCanvas();
      if (resized) resizeFramebuffers();

      colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
      if (colorUpdateTimer >= 1) {
        colorUpdateTimer = colorUpdateTimer % 1;
        pointersRef.current.forEach((p) => {
          p.color = generateWarmColor();
        });
      }

      update(dt);
      render(null);

      requestAnimationFrame(updateSimulation);
    };

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return false;

      const width = Math.floor(canvas.clientWidth * (window.devicePixelRatio || 1));
      const height = Math.floor(canvas.clientHeight * (window.devicePixelRatio || 1));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
      }
      return false;
    };

    const keywords: string[] = [];
    if (config.SHADING) keywords.push('SHADING');
    displayMaterial?.setKeywords(keywords);

    resizeFramebuffers();
    updateSimulation();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleTouchMove, handleTouchStart, handleTouchEnd]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          display: 'block',
          ...style,
        }}
      />
      <div
        className="cursor"
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
          position: 'fixed',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'rgba(207, 28, 148, 0.8)',
          mixBlendMode: 'difference',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.3s, height 0.3s, background-color 0.3s',
          animation: 'glow 0.8s infinite alternate',
          zIndex: 9999,
        }}
      />
      <style jsx>{`
        @keyframes glow {
          0% {
            box-shadow: 0 0 5px 2px rgba(0, 255, 255, 0.8),
                       0 0 10px 5px rgba(0, 255, 255, 0.6),
                       0 0 20px 10px rgba(0, 255, 255, 0.4);
          }
          100% {
            box-shadow: 0 0 10px 5px rgba(0, 255, 255, 1),
                       0 0 20px 10px rgba(0, 255, 255, 0.8),
                       0 0 30px 15px rgba(0, 255, 255, 0.6);
          }
        }

        body {
          margin: 0;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #000;
          cursor: none;
        }

        body h1 {
          color: #fff;
          font-family: 'Arial', sans-serif;
          font-size: 3rem;
          text-align: center;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
          zIndex: 10;
          pointerEvents: none;
          animation: fadeIn 2s ease-in-out;
        }

        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default FluidCanvas;