/* GLSL for the particle morph. The morph runs entirely on the GPU: each vertex
   carries all five target positions and mixes the pair around `uStage`. */

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
vec3 snoiseVec3(vec3 x){
  return vec3(snoise(x), snoise(vec3(x.y-19.1,x.z+33.4,x.x+47.2)), snoise(vec3(x.z+74.2,x.x-124.4,x.y+99.4)));
}
vec3 curlNoise(vec3 p){
  const float e=0.1;
  vec3 dx=vec3(e,0.0,0.0), dy=vec3(0.0,e,0.0), dz=vec3(0.0,0.0,e);
  vec3 px0=snoiseVec3(p-dx), px1=snoiseVec3(p+dx);
  vec3 py0=snoiseVec3(p-dy), py1=snoiseVec3(p+dy);
  vec3 pz0=snoiseVec3(p-dz), pz1=snoiseVec3(p+dz);
  vec3 c=vec3(py1.z-py0.z-pz1.y+pz0.y, pz1.x-pz0.x-px1.z+px0.z, px1.y-px0.y-py1.x+py0.x)/(2.0*e);
  return c/max(length(c),1e-4);
}`;

export const VERTEX_SHADER = /* glsl */ `
attribute vec3 aMesh; attribute vec3 aStack; attribute vec3 aText; attribute vec3 aCore; attribute vec4 aRand;
uniform float uTime; uniform float uStage; uniform float uDrift; uniform float uMorphNoise;
uniform float uSize; uniform float uPR; uniform float uRepel; uniform float uRadius; uniform float uAspect;
uniform vec2 uMouse;
varying float vAlpha; varying float vTone; varying float vHot; varying float vCore;
${NOISE}
vec3 rotY(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}
vec3 shapeAt(float i){
  if(i<0.5) return rotY(position*(1.0+0.035*sin(uTime*0.9+position.y*0.8)), uTime*0.08);
  if(i<1.5) return rotY(aMesh, uTime*0.06+0.4);
  if(i<2.5) return rotY(aStack, uTime*0.12);
  if(i<3.5) return rotY(aText, sin(uTime*0.35)*0.2);
  return rotY(aCore*(1.0+0.07*sin(uTime*1.7+aRand.z*6.2831)), uTime*0.2);
}
void main(){
  float s=clamp(uStage,0.0,4.0);
  float i0=min(floor(s),3.0);
  float f=s-i0;
  float d=aRand.y*0.35;
  float k=smoothstep(0.0,1.0,clamp((f-d)/0.65,0.0,1.0));
  vec3 p=mix(shapeAt(i0),shapeAt(i0+1.0),k);
  float transit=sin(k*3.14159265);
  vec3 n=curlNoise(p*0.32+vec3(0.0,0.0,uTime*0.05)+aRand.w*0.2);
  p+=n*(uDrift*(0.5+aRand.w)+transit*0.85*uMorphNoise);
  vec4 mv=modelViewMatrix*vec4(p,1.0);
  vec4 cp=projectionMatrix*mv;
  vec2 dd=cp.xy/cp.w-uMouse; dd.x*=uAspect;
  float dist=length(dd);
  float force=smoothstep(uRadius,0.0,dist)*uRepel;
  vec2 dir=dist>1e-4?dd/dist:vec2(0.0);
  mv.xy+=dir*force*0.75;
  mv.z+=force*0.4;
  gl_Position=projectionMatrix*mv;
  vCore=smoothstep(3.0,4.0,s);
  vHot=force;
  vTone=aRand.z;
  vAlpha=(0.35+0.65*aRand.x)*(1.0+transit*0.35);
  gl_PointSize=uSize*uPR*(0.55+aRand.x*0.9)*(1.0+vCore*0.35+force*0.6)/max(-mv.z,0.5);
}`;

export const FRAGMENT_SHADER = /* glsl */ `
precision highp float;
uniform vec3 uColA; uniform vec3 uColB; uniform vec3 uColC; uniform float uOpacity;
varying float vAlpha; varying float vTone; varying float vHot; varying float vCore;
void main(){
  vec2 c=gl_PointCoord-0.5; float r=length(c);
  if(r>0.5) discard;
  float a=smoothstep(0.5,0.0,r); a*=a;
  vec3 col=mix(uColA,uColB,vTone);
  col=mix(col,uColC,clamp(step(0.94,vTone)*0.8+vHot*0.7+vCore*0.3,0.0,1.0));
  gl_FragColor=vec4(col,a*vAlpha*uOpacity);
}`;
