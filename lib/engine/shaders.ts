// Full-screen triangle; every program binds attribute `p` to location 0.
export const VERT = "attribute vec2 p;varying vec2 vUv;void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}";

export const SCENE = `#extension GL_OES_standard_derivatives : enable
precision highp float;
varying vec2 vUv;
uniform sampler2D uA; uniform sampler2D uB; uniform sampler2D uFlow; uniform sampler2D uDye;
uniform float uT; uniform float uTime; uniform float uZ; uniform float uVel; uniform float uInv;
uniform float uAsp; uniform float uS; uniform float uLines; uniform float uInk; uniform float uOffA;
uniform float uFrom; uniform float uTo; uniform float uThR; uniform vec2 uThC; uniform vec2 uSimTx;
const vec3 PAPER = vec3(0.957, 0.953, 0.937);
const vec3 INK = vec3(0.067, 0.067, 0.067);
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 3; i++) { s += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; } return s / 0.875; }
void main(){
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uAsp, 1.0);
  vec2 fv = texture2D(uFlow, uv).xy * uSimTx;
  float fs = length(fv);
  vec2 lens = fv * 0.045 * uS * smoothstep(0.02, 0.5, fs);

  float zoom = 1.0 + 0.18 * fract(uZ);
  vec2 q = p * 1.25 / zoom - lens * 1.6;
  float w = fbm(vec3(q * 0.7, uZ * 0.32 + uTime * 0.012));
  float h = fbm(vec3(q + w * 1.1 + vec2(0.0, uVel * 0.004), uZ * 0.55 + uTime * 0.018));
  float k = h * uLines;
  float l1 = 1.0 - min(abs(fract(k - 0.5) - 0.5) / fwidth(k), 1.0);
  float k5 = k / 5.0;
  float l5 = 1.0 - min(abs(fract(k5 - 0.5) - 0.5) / fwidth(k5) * 0.7, 1.0);
  float clear = smoothstep(0.12, 0.9, length(p * vec2(0.75, 1.2)));
  float la = (l1 * 0.075 + l5 * 0.11) * mix(0.25, 1.0, clear) * (1.0 + min(abs(uVel) * 0.02, 0.8));

  float ta = 0.0;
  vec2 lt = lens * 0.9;
  if (uT < 0.001) {
    ta = texture2D(uA, uv - lt + vec2(0.0, uOffA)).a;
  } else {
    float n = fbm(vec3(p * 2.6, 3.1));
    vec2 fl = vec2(fbm(vec3(p * 2.2, uTime * 0.08)) - 0.5, fbm(vec3(p * 2.2 + 5.2, uTime * 0.08)) - 0.5);
    float tA = clamp(uT / 0.7, 0.0, 1.0), tB = clamp((uT - 0.3) / 0.7, 0.0, 1.0);
    vec2 uvA = uv - lt + fl * tA * tA * 0.32 + vec2(0.0, tA * tA * 0.05);
    vec2 uvB = uv - lt - fl * (1.0 - tB) * (1.0 - tB) * 0.32 - vec2(0.0, (1.0 - tB) * (1.0 - tB) * 0.05);
    float mA = smoothstep(tA * 1.3 - 0.22, tA * 1.3, n);
    float mB = 1.0 - smoothstep(tB * 1.3 - 0.22, tB * 1.3, n);
    ta = min(texture2D(uA, uvA + vec2(0.0, uOffA)).a * mA + texture2D(uB, uvB).a * mB, 1.0);
  }

  float n2 = fbm(vec3(p * 1.8, 7.0 + uTime * 0.05));
  float front = uInv * 1.5 - 0.25;
  float m = 1.0 - smoothstep(front - 0.05, front, uv.y + (n2 - 0.5) * 0.45);
  float dth = length((uv - uThC) * vec2(uAsp, 1.0)) + (n2 - 0.5) * 0.3;
  float tm = mix(uFrom, uTo, 1.0 - smoothstep(uThR - 0.05, uThR, dth));
  vec3 PA = mix(PAPER, INK, tm), IN = mix(INK, PAPER, tm);
  vec3 bg = mix(PA, IN, m);
  vec3 fg = mix(IN, PA, m);

  vec3 col = mix(bg, fg, la);
  col = mix(col, fg, ta);
  float dye = texture2D(uDye, uv - lens * 0.3).x;
  col = mix(col, fg, min(smoothstep(0.06, 0.45, dye) * 0.9 * uInk, 1.0));
  col *= 1.0 - 0.05 * dot(p, p);
  col += (hash(vec3(gl_FragCoord.xy, floor(uTime * 24.0))) - 0.5) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}`;

export const FLUID_HEAD = "precision highp float;varying vec2 vUv;";

const neighbours = (x: string) =>
  `float L=texture2D(${x},vUv-vec2(uTx.x,0.)).x;float R=texture2D(${x},vUv+vec2(uTx.x,0.)).x;float T=texture2D(${x},vUv+vec2(0.,uTx.y)).x;float B=texture2D(${x},vUv-vec2(0.,uTx.y)).x;`;

export const FLUID = {
  splat:
    "uniform sampler2D uTarget;uniform float uAsp;uniform vec2 uPoint;uniform vec2 uColor;uniform float uRadius;void main(){vec2 p=vUv-uPoint;p.x*=uAsp;vec2 s=exp(-dot(p,p)/uRadius)*uColor;gl_FragColor=vec4(texture2D(uTarget,vUv).xy+s,0.,1.);}",
  textDye:
    "uniform sampler2D uTarget;uniform sampler2D uText;uniform vec2 uPoint;uniform float uAsp;uniform float uRadius;uniform float uHover;uniform float uFlood;uniform float uOff;void main(){vec2 p=vUv-uPoint;p.x*=uAsp;float g=exp(-dot(p,p)/uRadius);float a=texture2D(uText,vUv+vec2(0.,uOff)).a;float d=texture2D(uTarget,vUv).x+a*(g*uHover+uFlood);gl_FragColor=vec4(min(d,1.6),0.,0.,1.);}",
  textForce:
    "uniform sampler2D uTarget;uniform sampler2D uText;uniform float uAmt;uniform float uTime;uniform float uDrift;uniform float uOff;void main(){vec2 v=texture2D(uTarget,vUv).xy;float a=texture2D(uText,vUv+vec2(0.,uOff)).a;v+=vec2(sin(vUv.y*38.+uTime*2.3)*.7,1.)*a*uAmt;v.y+=uDrift;gl_FragColor=vec4(v,0.,1.);}",
  advect:
    "uniform sampler2D uVel;uniform sampler2D uSrc;uniform vec2 uTx;uniform float uDt;uniform float uDiss;void main(){vec2 c=vUv-uDt*texture2D(uVel,vUv).xy*uTx;gl_FragColor=uDiss*texture2D(uSrc,c);}",
  curl:
    "uniform sampler2D uVel;uniform vec2 uTx;void main(){float L=texture2D(uVel,vUv-vec2(uTx.x,0.)).y;float R=texture2D(uVel,vUv+vec2(uTx.x,0.)).y;float T=texture2D(uVel,vUv+vec2(0.,uTx.y)).x;float B=texture2D(uVel,vUv-vec2(0.,uTx.y)).x;gl_FragColor=vec4(.5*(R-L-T+B),0.,0.,1.);}",
  vort:
    "uniform sampler2D uVel;uniform sampler2D uCurl;uniform vec2 uTx;uniform float uC;uniform float uDt;void main(){" +
    neighbours("uCurl") +
    "float C=texture2D(uCurl,vUv).x;vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));f/=length(f)+1e-4;f*=uC*C;f.y*=-1.;vec2 v=texture2D(uVel,vUv).xy+f*uDt;gl_FragColor=vec4(clamp(v,-1000.,1000.),0.,1.);}",
  div:
    "uniform sampler2D uVel;uniform vec2 uTx;void main(){float L=texture2D(uVel,vUv-vec2(uTx.x,0.)).x;float R=texture2D(uVel,vUv+vec2(uTx.x,0.)).x;float T=texture2D(uVel,vUv+vec2(0.,uTx.y)).y;float B=texture2D(uVel,vUv-vec2(0.,uTx.y)).y;vec2 C=texture2D(uVel,vUv).xy;if(vUv.x-uTx.x<0.)L=-C.x;if(vUv.x+uTx.x>1.)R=-C.x;if(vUv.y+uTx.y>1.)T=-C.y;if(vUv.y-uTx.y<0.)B=-C.y;gl_FragColor=vec4(.5*(R-L+T-B),0.,0.,1.);}",
  mul: "uniform sampler2D uSrc;uniform float uK;void main(){gl_FragColor=uK*texture2D(uSrc,vUv);}",
  jacobi:
    "uniform sampler2D uP;uniform sampler2D uDiv;uniform vec2 uTx;void main(){" +
    neighbours("uP") +
    "float d=texture2D(uDiv,vUv).x;gl_FragColor=vec4((L+R+B+T-d)*.25,0.,0.,1.);}",
  grad:
    "uniform sampler2D uP;uniform sampler2D uVel;uniform vec2 uTx;void main(){" +
    neighbours("uP") +
    "vec2 v=texture2D(uVel,vUv).xy-vec2(R-L,T-B)*.5;gl_FragColor=vec4(v,0.,1.);}",
} as const;
