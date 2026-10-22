/* Studio za renderovanje vrsta uglja (stilizovan 3D prikaz, ista tehnika kao uvod naslovne). Parametri: #tip,sirina,visina,seme */
(function(){
const [TIP,W,H,SEED]=(location.hash.slice(1)||'antracit,1600,900,1').split(',');
const WW=+W,HH=+H,seed=+SEED;
const T=THREE,canvas=document.getElementById('c');
canvas.width=WW;canvas.height=HH;
const ren=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
ren.setPixelRatio(1);ren.setSize(WW,HH,false);
ren.shadowMap.enabled=true;ren.shadowMap.type=T.PCFSoftShadowMap;
ren.outputEncoding=T.sRGBEncoding;
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R=rng(seed*7919+13);

/* ---- tipovi: izgled materijala i raspored komada ---- */
const TIPS={
 lignit:{ex:.62,col:0x120c08,rough:.82,metal:.02,coat:0,env:.35,ash:.22,band:1,size:[.28,.62],det:3,warm:1.0,bg:0x0b0806,tint:[1.0,.96,.92]},
 mrko:{ex:.6,col:0x0e0907,rough:.7,metal:.04,coat:0,env:.5,ash:.1,band:.6,size:[.24,.55],det:3,warm:.9,bg:0x0a0807,tint:[1.0,.97,.93]},
 suseni:{ex:.7,col:0x1a110b,rough:.9,metal:0,coat:0,env:.25,ash:.3,band:.3,size:[.09,.2],det:2,warm:1.1,bg:0x0b0806,tint:[1.08,.98,.88]},
 mrki:{ex:.72,col:0x0a0706,rough:.55,metal:.06,coat:0,env:.7,ash:.08,band:.5,size:[.26,.6],det:3,warm:.9,bg:0x090807,tint:[1.03,.99,.95]},
 kameni:{ex:1.15,col:0x060607,rough:.34,metal:.12,coat:.25,env:1.1,ash:.04,band:0,size:[.28,.62],det:3,warm:.8,bg:0x08090b,tint:[.98,1,1.05]},
 antracit:{ex:1.35,col:0x050506,rough:.14,metal:.42,coat:.9,env:1.6,ash:0,band:0,size:[.22,.5],det:3,warm:.7,bg:0x07080a,tint:[.96,1,1.08]},
 koks:{ex:.62,col:0x2e3033,rough:.92,metal:.05,coat:0,env:.55,ash:0,band:0,size:[.2,.5],det:3,warm:.9,bg:0x0a0a0b,tint:[1,1,1.02],porous:1},
 pelet:{ex:.33,pellet:1,col:0xa97a46,rough:.72,metal:0,coat:0,env:.5,bg:0x0c0906,tint:[1.06,1,.9]},
 zar:{ex:1.12,col:0x070606,rough:.6,metal:.05,coat:0,env:.4,ash:.2,band:0,size:[.24,.55],det:3,warm:.8,bg:0x060403,tint:[1.05,.97,.9],heat:1}
};
const P=TIPS[TIP]||TIPS.antracit;

const NOISE=`
float h3(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n3(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return s;}
`;
const scene=new T.Scene();scene.background=new T.Color(P.bg);scene.fog=new T.FogExp2(P.bg,.085);

/* ---- okruženje (studijski sjaj za odsjaje) ---- */
(function(){const es=new T.Scene(),bgm=new T.Mesh(new T.SphereGeometry(40,32,16),new T.MeshBasicMaterial({color:0x0b0c0e,side:T.BackSide}));es.add(bgm);
 const box=(w,h,x,y,z,c,i)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(c).multiplyScalar(i),side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m)};
 box(14,6,-9,12,6,0xfff1e0,5);box(5,14,12,6,-4,0xcfe0ff,3.2);box(18,2.4,0,3,-14,0xffd8b0,2.2);box(10,10,0,16,0,0xffffff,2.5);
 const pm=new T.PMREMGenerator(ren);scene.environment=pm.fromScene(es,.03).texture;pm.dispose()})();

/* ---- komadi: nepravilni, brušeni, sa šumom ---- */
function jn(x,y,z){const h=(a,b,c)=>{let t=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453;return t-Math.floor(t)};
  const X=Math.floor(x),Y=Math.floor(y),Z=Math.floor(z),fx=x-X,fy=y-Y,fz=z-Z,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),w=fz*fz*(3-2*fz);
  const L=(a,b,t)=>a+(b-a)*t;
  return L(L(L(h(X,Y,Z),h(X+1,Y,Z),u),L(h(X,Y+1,Z),h(X+1,Y+1,Z),u),v),L(L(h(X,Y,Z+1),h(X+1,Y,Z+1),u),L(h(X,Y+1,Z+1),h(X+1,Y+1,Z+1),u),v),w)}
function rockGeo(sd,detail,sx,sy,sz,cutsN){
  const g=new T.IcosahedronGeometry(1,detail),p=g.attributes.position,r=rng(sd),m=new Map(),v=new T.Vector3();
  const o=[r()*50,r()*50,r()*50];
  const cuts=Array.from({length:cutsN+(r()*4|0)},()=>({n:new T.Vector3(r()-.5,r()-.5,r()-.5).normalize(),d:.5+r()*.32}));
  const key=i=>p.getX(i).toFixed(3)+'|'+p.getY(i).toFixed(3)+'|'+p.getZ(i).toFixed(3);
  for(let i=0;i<p.count;i++){const k=key(i);
    if(!m.has(k)){v.fromBufferAttribute(p,i);
      const q=1+(jn(v.x*1.7+o[0],v.y*1.7+o[1],v.z*1.7+o[2])-.5)*.42+(jn(v.x*4.2+o[1],v.y*4.2+o[2],v.z*4.2+o[0])-.5)*.12;
      v.multiplyScalar(q);
      for(const c of cuts){const dd=v.dot(c.n);if(dd>c.d)v.addScaledVector(c.n,-(dd-c.d)*.97)}
      m.set(k,new T.Vector3(v.x*sx,v.y*sy,v.z*sz))}
    const w=m.get(k);p.setXYZ(i,w.x,w.y,w.z)}
  const acc=new Map(),fn=[],A=new T.Vector3(),B=new T.Vector3(),C=new T.Vector3(),kk=i=>p.getX(i).toFixed(4)+'|'+p.getY(i).toFixed(4)+'|'+p.getZ(i).toFixed(4);
  for(let i=0;i<p.count;i+=3){A.fromBufferAttribute(p,i);B.fromBufferAttribute(p,i+1);C.fromBufferAttribute(p,i+2);
    const n=B.clone().sub(A).cross(C.clone().sub(A));fn.push(n);
    for(let j=0;j<3;j++){const k=kk(i+j);if(!acc.has(k))acc.set(k,[]);acc.get(k).push(n)}}
  const nr=new Float32Array(p.count*3),cr=Math.cos((P.coat>0?30:42)*Math.PI/180);
  for(let i=0;i<p.count;i++){const f=fn[(i/3)|0].clone().normalize(),sum=new T.Vector3();
    for(const n of acc.get(kk(i))){if(n.clone().normalize().dot(f)>cr)sum.add(n)}
    sum.normalize();nr[i*3]=sum.x;nr[i*3+1]=sum.y;nr[i*3+2]=sum.z}
  g.setAttribute('normal',new T.BufferAttribute(nr,3));return g}

/* ---- materijal: boja i neravnine po vrsti ---- */
const matCls=P.coat>0?T.MeshPhysicalMaterial:T.MeshStandardMaterial;
const mat=new matCls({color:P.col,roughness:P.rough,metalness:P.metal,envMapIntensity:P.env});
if(P.coat>0){mat.clearcoat=P.coat;mat.clearcoatRoughness=.08}
mat.onBeforeCompile=sh=>{
  sh.vertexShader='attribute float aHeat;varying float vHeat;varying vec3 vWP;varying vec3 vWN;\n'+sh.vertexShader.replace('#include <project_vertex>',
    `#include <project_vertex>
     vec4 wpos=modelMatrix*instanceMatrix*vec4(transformed,1.0);vWP=wpos.xyz;vHeat=aHeat;
     vWN=normalize(mat3(modelMatrix)*mat3(instanceMatrix)*objectNormal);`);
  const por=P.porous?1:0,band=(P.band||0).toFixed(2),ash=(P.ash||0).toFixed(2),heat=P.heat?1:0;
  sh.fragmentShader='varying float vHeat;varying vec3 vWP;varying vec3 vWN;\n'+NOISE+sh.fragmentShader
   .replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
     float bump=${por?'.55':'.3'};
     normal=normalize(normal+(vec3(n3(vWP*${por?'22.':'15.'}),n3(vWP*${por?'22.':'15.'}+5.3),n3(vWP*${por?'22.':'15.'}+9.7))-.5)*bump);`)
   .replace('#include <color_fragment>',`#include <color_fragment>
     float cn=fbm(vWP*3.1+vec3(7.1));
     float up=smoothstep(.3,.95,vWN.y);
     float bands=${band}*smoothstep(.35,.9,.5+.5*sin(vWP.y*34.+cn*9.));
     diffuseColor.rgb*=1.-bands*.38+bands*cn*.5;
     float dust=clamp(smoothstep(.5,.8,n3(vWP*2.4))*up*${ash},0.,1.);
     diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.12,.1,.085),dust);
     ${por?'float pore=smoothstep(.62,.7,fbm(vWP*17.+vec3(3.))); diffuseColor.rgb*=mix(1.,.22,pore); diffuseColor.rgb*=.9+.2*cn;':''}
     diffuseColor.rgb*=.86+.28*n3(vWP*30.);`)
   .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
     ${por?'roughnessFactor=min(1.,roughnessFactor+.1);':''}
     roughnessFactor=mix(roughnessFactor,.9,dust);`)
   .replace('#include <emissivemap_fragment>',`
     ${heat?`float cr=fbm(vWP*3.1+vec3(2.3));float cracks=(1.-smoothstep(0.,.05,abs(cr-.5)))*1.3+.05;
     float hh=vHeat*cracks;vec3 hc=mix(vec3(.45,.02,0.),vec3(1.,.2,.015),clamp(hh*1.25,0.,1.));hc=mix(hc,vec3(1.,.5,.12),smoothstep(.85,1.35,hh));
     totalEmissiveRadiance=hc*hh*1.6;`:''}`)};
const rockMat=mat;

const isPellet=!!P.pellet;
let geos=[];
if(isPellet){
  for(let i=0;i<4;i++){const len=.34+i*.1,g=new T.CylinderGeometry(.11,.11,len,14,1,false);
    /* blago nepravilni krajevi */
    const p=g.attributes.position;for(let k=0;k<p.count;k++){const y=p.getY(k);p.setXYZ(k,p.getX(k)*(1+(jn(k*.7,i,1)-.5)*.12),y+(jn(k*.3,i,5)-.5)*.04,p.getZ(k)*(1+(jn(k*.7,i,9)-.5)*.12))}
    g.computeVertexNormals();geos.push(g)}
}else{
  geos=[rockGeo(3,P.det,1.2,.78,1,5),rockGeo(7,P.det,1,.84,1.12,6),rockGeo(11,P.det,1.15,.74,.95,5),rockGeo(19,P.det,.96,.8,1.05,6),rockGeo(23,P.det,1.08,.86,1.18,7)]
}

/* ---- raspored: gomila ---- */
const N=isPellet?5200:(P.size[0]<.15?9000:4200),per=Math.ceil(N/geos.length),dummy=new T.Object3D();
const meshes=[];
function mound(x,z){return 1.5*Math.exp(-(x*x/30+(z+3)*(z+3)/26))}
geos.forEach((g,gi)=>{const im=new T.InstancedMesh(g,rockMat,per),ht=new Float32Array(per);
  for(let i=0;i<per;i++){
    const z=-16+Math.pow(R(),.75)*22,x=(R()-.5)*(22+(8-z)*.3);
    const s=isPellet?(.62+R()*.5):(P.size[0]+R()*R()*(P.size[1]-P.size[0]));
    const y=mound(x,z)*(.75+R()*.35)+s*(.25+R()*.55)+(R()-.5)*.05;
    dummy.position.set(x,y,z);
    dummy.rotation.set(R()*6.28,R()*6.28,R()*6.28);dummy.scale.setScalar(s);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);
    const q=R();ht[i]=P.heat?(q<.3?.7+R()*.3:q<.55?.25+R()*.3:R()*.08):0}
  g.setAttribute('aHeat',new T.InstancedBufferAttribute(ht,1));
  im.castShadow=true;im.receiveShadow=true;im.frustumCulled=false;scene.add(im);meshes.push(im)});

const floor=new T.Mesh(new T.PlaneGeometry(120,120),new T.MeshStandardMaterial({color:0x050505,roughness:.95,metalness:0}));
floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);

/* ---- svetla ---- */
scene.add(new T.HemisphereLight(0x8aa0c0,0x201008,.28));
const key=new T.DirectionalLight(P.heat?0xff9a55:0xffe2c4,P.heat?1.2:3.1);key.position.set(-6,9,7);key.castShadow=true;
key.shadow.mapSize.set(2048,2048);const sc=key.shadow.camera;sc.left=-14;sc.right=14;sc.top=14;sc.bottom=-14;sc.near=1;sc.far=40;key.shadow.bias=-.0004;key.shadow.radius=3;scene.add(key);
const rim=new T.DirectionalLight(0xa8c4ff,2.2);rim.position.set(8,4,-9);scene.add(rim);
const fill=new T.PointLight(0xffb070,P.heat?3:1.2,16,2);fill.position.set(2,1.4,5);scene.add(fill);
if(P.heat){for(let i=0;i<7;i++){const l=new T.PointLight(0xff3a0a,2.4,4.2,2);l.position.set((R()-.5)*8,.5+R()*.6,-4+R()*7);scene.add(l)}}

/* ---- kamera ---- */
const cam=new T.PerspectiveCamera(isPellet?30:26,WW/HH,.1,80);
const jx=(R()-.5)*1.2,jz=(R()-.5)*1.4;
cam.position.set(-1.1+jx,isPellet?3.4:2.5,isPellet?8.6:7.4+jz);cam.lookAt(.2,.45,-1.5);

/* ---- obrada: sjaj, boja, vinjeta, zrno ---- */
const comp=new T.EffectComposer(ren);comp.setSize(WW,HH);comp.addPass(new T.RenderPass(scene,cam));
const bloom=new T.UnrealBloomPass(new T.Vector2(WW/2,HH/2),P.heat?1.0:.28,.6,.78);comp.addPass(bloom);
const grade=new T.ShaderPass({uniforms:{tDiffuse:{value:null},uRes:{value:new T.Vector2(WW,HH)},uTint:{value:new T.Vector3(...P.tint)},uEx:{value:P.ex||1}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 uRes;uniform vec3 uTint;uniform float uEx;varying vec2 vUv;
   vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
   float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
   void main(){vec2 d=vUv-.5;float r2=dot(d,d);
    vec3 c=texture2D(tDiffuse,vUv).rgb;
    c=aces(c*1.05*uEx)*uTint;c=pow(c,vec3(1./1.0));
    c*=mix(1.,.5,smoothstep(.1,.55,r2*1.9));
    c+=(hs(vUv*uRes)-.5)*.022;
    gl_FragColor=vec4(c,1.);}`});
comp.addPass(grade);
comp.render();
window.__done=true;
})();
