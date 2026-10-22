/* Uvod naslovne — maska + 3D žar (Sole Komerc) */
/* skrol vodi masku (radi i kad 3D nije dostupan) */
(function(){
  const intro=document.getElementById('intro'),stick=document.getElementById('stick'),svg=document.getElementById('hcMask'),
        word=document.getElementById('hcWord'),cover=document.getElementById('hcCover'),line=document.getElementById('hcLine'),t1=document.getElementById('hcT1');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){window.SOLE_P=1;return}
  function inside(){/* tačka zuma: u punom delu slova "SOLE", najbliža sredini reda (da kroz slovo uđemo u žar) */
    const fs=+t1.getAttribute('font-size'),x0=+t1.getAttribute('x'),y0=+t1.getAttribute('y'),k=.25,
          c=document.createElement('canvas'),W=Math.ceil(1600*k),H=Math.ceil(900*k);c.width=W;c.height=H;
    const g=c.getContext('2d');g.font=getComputedStyle(t1).fontWeight+' '+(fs*k)+'px '+getComputedStyle(t1).fontFamily;g.textAlign='center';g.fillText(t1.textContent,x0*k,y0*k);
    const d=g.getImageData(0,0,W,H).data,tx=x0*k,ty=(y0-fs*.36)*k;let best=null,bd=1e9;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>200){const q=(x-tx)**2+(y-ty)**2;if(q<bd){bd=q;best=[x/k,y/k]}}
    return best||[x0,y0-fs*.36]}
  let O=[800,320];
  /* Raspored reči u maski: oba reda iste širine (reč iznad je viša), po stvarnim ivicama slova, tačno na sredini */
  const LS=.13;/* razmak slova (em), isti kao u CSS-u */
  const t2=document.getElementById('hcT2'),l1=document.getElementById('hcL1'),l2=document.getElementById('hcL2');
  function ink(){
    const g=document.createElement('canvas').getContext('2d'),cs=getComputedStyle(t1),fam=cs.fontFamily,wt=cs.fontWeight;
    const fs1=+t1.getAttribute('font-size'),y1=430;
    g.textAlign='center';
    const ls=function(fs){if('letterSpacing' in g)g.letterSpacing=(LS*fs)+'px'};
    ls(fs1);g.font=wt+' '+fs1+'px '+fam;const m1=g.measureText(t1.textContent),w1=m1.actualBoundingBoxLeft+m1.actualBoundingBoxRight;
    ls(100);g.font=wt+' 100px '+fam;const m0=g.measureText(t2.textContent),w0=m0.actualBoundingBoxLeft+m0.actualBoundingBoxRight;
    const fs2=Math.min(fs1*1.1,100*w1/w0);
    ls(fs2);g.font=wt+' '+fs2+'px '+fam;const m2=g.measureText(t2.textContent);
    const gap=.14*m1.actualBoundingBoxAscent,y2=y1+m1.actualBoundingBoxDescent+gap+m2.actualBoundingBoxAscent;
    [[t1,l1,m1,fs1,y1],[t2,l2,m2,fs2,y2]].forEach(function(p){const m=p[2],x=(800-(m.actualBoundingBoxRight-m.actualBoundingBoxLeft)/2).toFixed(2);
      [p[0],p[1]].forEach(function(e){if(!e)return;e.setAttribute('x',x);e.setAttribute('y',p[4].toFixed(2));e.setAttribute('font-size',p[3].toFixed(2))})});
    const x1=800-(m1.actualBoundingBoxRight-m1.actualBoundingBoxLeft)/2,x2=800-(m2.actualBoundingBoxRight-m2.actualBoundingBoxLeft)/2;
    const left=Math.min(x1-m1.actualBoundingBoxLeft,x2-m2.actualBoundingBoxLeft),right=Math.max(x1+m1.actualBoundingBoxRight,x2+m2.actualBoundingBoxRight),
          top=y1-m1.actualBoundingBoxAscent,bot=y2+m2.actualBoundingBoxDescent;
    return{x:left,y:top,width:right-left,height:bot-top}}
  function fit(){const r=svg.getBoundingClientRect(),a=r.width/r.height,b=ink();
    const vw=Math.max(b.width/(a<1?.9:.64),b.height/(a<1?.6:.72)*a),vh=vw/a,cx=b.x+b.width/2,cy=b.y+b.height/2;
    svg.setAttribute('viewBox',(cx-vw/2).toFixed(1)+' '+(cy-vh/2).toFixed(1)+' '+vw.toFixed(1)+' '+vh.toFixed(1));
    O=inside();word.style.transformOrigin=line.style.transformOrigin=O[0].toFixed(1)+'px '+O[1].toFixed(1)+'px';onScroll()}
  function onScroll(){const r=intro.getBoundingClientRect(),max=intro.offsetHeight-stick.offsetHeight,
      off=parseFloat(getComputedStyle(stick).top)||0,p=Math.min(1,Math.max(0,(off-r.top)/max));
    stick.style.setProperty('--p',p.toFixed(4));window.SOLE_P=p;
    word.style.transform=line.style.transform='scale('+(1+Math.pow(p,1.8)*29).toFixed(3)+')';
    cover.style.opacity=(1-Math.min(1,Math.max(0,(p-.3)*2.3))).toFixed(3);line.style.opacity=(1-Math.min(1,p*5)).toFixed(3)}
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',fit);
  fit();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
})();

(function(){
const hero=document.getElementById('hero'),canvas=document.getElementById('gl');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!window.THREE||!THREE.EffectComposer||!THREE.UnrealBloomPass)return;
let ren;try{ren=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'})}catch(e){return}
const T=THREE,mobile=matchMedia('(max-width:640px)').matches||navigator.hardwareConcurrency<=4;
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R=rng(1977);
ren.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.25:1.6));
ren.setClearColor(0x050403,1);

const NOISE=`
float h3(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n3(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return s;}
`;

const scene=new T.Scene();
scene.fog=new T.FogExp2(0x060302,0.075);
const cam=new T.PerspectiveCamera(30,1,.1,80);
const U={uTime:{value:0},uHeat:{value:1},uFl:{value:1},uSp:{value:1}};

/* ---- komadi uglja: nekoliko oblika, instancirano ---- */
function jn(x,y,z){const h=(a,b,c)=>{let t=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453;return t-Math.floor(t)};
  const X=Math.floor(x),Y=Math.floor(y),Z=Math.floor(z),fx=x-X,fy=y-Y,fz=z-Z,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),w=fz*fz*(3-2*fz);
  const L=(a,b,t)=>a+(b-a)*t;
  return L(L(L(h(X,Y,Z),h(X+1,Y,Z),u),L(h(X,Y+1,Z),h(X+1,Y+1,Z),u),v),L(L(h(X,Y,Z+1),h(X+1,Y,Z+1),u),L(h(X,Y+1,Z+1),h(X+1,Y+1,Z+1),u),v),w)}
function rockGeo(seed,detail,sx,sy,sz){
  const g=new T.IcosahedronGeometry(1,detail),p=g.attributes.position,r=rng(seed),m=new Map(),v=new T.Vector3();
  const o=[r()*50,r()*50,r()*50];
  const cuts=Array.from({length:5+(r()*4|0)},()=>({n:new T.Vector3(r()-.5,r()-.5,r()-.5).normalize(),d:.5+r()*.32}));
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
  const nr=new Float32Array(p.count*3),cr=Math.cos(42*Math.PI/180);
  for(let i=0;i<p.count;i++){const f=fn[(i/3)|0].clone().normalize(),sum=new T.Vector3();
    for(const n of acc.get(kk(i))){if(n.clone().normalize().dot(f)>cr)sum.add(n)}
    sum.normalize();nr[i*3]=sum.x;nr[i*3+1]=sum.y;nr[i*3+2]=sum.z}
  g.setAttribute('normal',new T.BufferAttribute(nr,3));return g}
const DET=mobile?2:3;
const geos=[rockGeo(3,DET,1.2,.78,1),rockGeo(7,DET,1,.84,1.12),rockGeo(11,DET,1.15,.74,.95),rockGeo(19,DET,.96,.8,1.05),rockGeo(23,DET,1.08,.86,1.18)];

const rockMat=new T.MeshStandardMaterial({color:0x070707,roughness:.5,metalness:.14});
rockMat.onBeforeCompile=sh=>{
  sh.uniforms.uTime=U.uTime;sh.uniforms.uHeat=U.uHeat;
  sh.vertexShader='attribute float aHeat;varying float vHeat;varying vec3 vWP;varying vec3 vWN;\n'+sh.vertexShader.replace('#include <project_vertex>',
    `#include <project_vertex>
     vec4 wpos=modelMatrix*instanceMatrix*vec4(transformed,1.0);vWP=wpos.xyz;vHeat=aHeat;
     vWN=normalize(mat3(modelMatrix)*mat3(instanceMatrix)*objectNormal);`);
  sh.fragmentShader='uniform float uTime,uHeat;varying float vHeat;varying vec3 vWP;varying vec3 vWN;\n'+NOISE+sh.fragmentShader
   .replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
     normal=normalize(normal+(vec3(n3(vWP*16.),n3(vWP*16.+5.3),n3(vWP*16.+9.7))-.5)*.32);`)
   .replace('#include <color_fragment>',`#include <color_fragment>
     float crust=smoothstep(.38,.6,fbm(vWP*3.4+vec3(7.1)));
     float up=smoothstep(.35,.95,vWN.y);
     float ash=clamp(smoothstep(.55,.75,n3(vWP*2.6))*up*.55+vHeat*crust*up*.45,0.,1.);
     diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.09,.085,.08),ash);`)
   .replace('#include <emissivemap_fragment>',`
     float cn=fbm(vWP*3.1+vec3(2.3));float cracks=(1.-smoothstep(0.,.05,abs(cn-.5)))+(1.-smoothstep(.0,.35,crust))*.35;
     float pulse=.72+.28*sin(uTime*(.7+vHeat*1.4)+vWP.x*2.7+vWP.z*1.9);
     float fl=.9+.1*sin(uTime*7.3+n3(vWP*2.)*20.);
     float down=smoothstep(.45,-.65,vWN.y);
     float under=down*smoothstep(.55,0.,vWP.y)*(.18+vHeat*.5);
     float heat=vHeat*(cracks*1.25+.03)*pulse*fl+under*.5;
     vec3 hc=mix(vec3(.45,.02,0.),vec3(1.,.2,.015),clamp(heat*1.25,0.,1.));
     hc=mix(hc,vec3(1.,.5,.12),smoothstep(.85,1.35,heat));
     totalEmissiveRadiance=hc*heat*1.35*uHeat;`)
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n roughnessFactor=mix(roughnessFactor,.9,ash);');
};

const N=mobile?1400:3200,per=Math.ceil(N/geos.length),dummy=new T.Object3D(),hotSpots=[];
geos.forEach((g,gi)=>{const im=new T.InstancedMesh(g,rockMat,per),ht=new Float32Array(per);
  for(let i=0;i<per;i++){
    const z=-26+Math.pow(R(),.7)*32,x=(R()-.5)*(18+(6-z)*.62);
    const s=.16+R()*R()*.26+(z>1?.05:0);
    const layer=R()<.5?(R()<.3?2:1):0;
    const y=s*.3+layer*s*.55+(R()-.5)*.05;
    dummy.position.set(x,y,z);
    dummy.rotation.set(R()*6.28,R()*6.28,R()*6.28);dummy.scale.setScalar(s);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);
    const q=R();ht[i]=q<.13?.75+R()*.25:q<.38?.25+R()*.3:R()*.06;
    if(ht[i]>.85&&z>-9&&z<4.5&&layer>0)hotSpots.push([x,y+s*.55,z,s])}
  g.setAttribute('aHeat',new T.InstancedBufferAttribute(ht,1));
  scene.add(im)});

/* ---- užarena podloga ispod ---- */
const bed=new T.Mesh(new T.PlaneGeometry(70,60),new T.ShaderMaterial({uniforms:U,
  vertexShader:`varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
  fragmentShader:`uniform float uTime,uHeat;varying vec3 vW;${NOISE}
   void main(){float n=fbm(vW*.85+vec3(uTime*.025,uTime*.03,uTime*.04));float h=smoothstep(.36,.78,n);
    vec3 c=mix(vec3(.05,.004,0.),vec3(.55,.06,.005),h)*(.2+h*.6);
    float d=length(vW-cameraPosition);c*=exp(-d*.075)*smoothstep(-31.,-22.,vW.z)*uHeat;gl_FragColor=vec4(c,1.);}`}));
bed.rotation.x=-Math.PI/2;bed.position.set(0,-.02,-14);scene.add(bed);

/* ---- svetla ---- */
scene.add(new T.HemisphereLight(0x2a3444,0x2a0e04,.22));
const rim=new T.DirectionalLight(0xa9bede,.3);rim.position.set(-4,6,-8);scene.add(rim);
const warm=new T.DirectionalLight(0xff8a45,.35);warm.position.set(5,2,6);scene.add(warm);
const embers=[];for(let i=0;i<7;i++){const l=new T.PointLight(0xff2a06,1.5,3.4,2);
  l.position.set((R()-.5)*9,.12,-6+R()*11);l.userData={b:1.6+R()*1.6,a:1.5+R()*2.5,p:R()*6};scene.add(l);embers.push(l)}

/* ---- iskre (sa dubinskom oštrinom) ---- */
const SP=mobile?520:1100,A=new Float32Array(SP*4),B=new Float32Array(SP*3),P=new Float32Array(SP*3);
for(let i=0;i<SP;i++){const bok=i<SP*.035;
  A[i*4]=(R()-.5)*(bok?8:20);A[i*4+1]=bok?5+R()*2.6:-14+R()*19;A[i*4+2]=bok?7+R()*6:2.2+R()*4.8;A[i*4+3]=R()*20;
  B[i*3]=bok?1.5+R()*2.5:1.2+R()*4.2;B[i*3+1]=bok?.8+R()*.8:.55+R()*1.1;B[i*3+2]=R()*6.28}
const sg=new T.BufferGeometry();sg.setAttribute('position',new T.BufferAttribute(P,3));
sg.setAttribute('aA',new T.BufferAttribute(A,4));sg.setAttribute('aB',new T.BufferAttribute(B,3));
const sparkU={uTime:U.uTime,uPx:{value:1},uSp:U.uSp};
const sparks=new T.Points(sg,new T.ShaderMaterial({uniforms:sparkU,transparent:true,depthWrite:false,blending:T.AdditiveBlending,
  vertexShader:`uniform float uTime,uPx;attribute vec4 aA;attribute vec3 aB;varying float vA,vAge,vS;
   void main(){float age=fract((uTime+aA.w)/aA.z);
    vec3 p=vec3(aA.x,.08+age*aB.x,aA.y);
    p.x+=sin(age*5.+aB.z)*.32*age+age*age*.9;p.z+=cos(age*4.+aB.z*1.3)*.22*age;
    vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float d=-mv.z;
    vS=smoothstep(4.2,1.4,d);
    gl_PointSize=min(aB.y*uPx*30./d*(1.+1.3*vS),70.*uPx);
    vAge=age;vA=smoothstep(0.,.05,age)*pow(1.-age,1.3)*(.62+.38*sin(uTime*(9.+aB.z*3.)+aB.z*40.))*mix(1.,.16,vS);}`,
  fragmentShader:`uniform float uSp;varying float vA,vAge,vS;
   void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;
    float k=mix(pow(1.-r,1.6),(1.-smoothstep(.7,1.,r))*(.75+.25*r),vS);
    vec3 c=mix(mix(vec3(1.,.86,.6),vec3(1.,.3,.04),smoothstep(0.,.75,vAge)),vec3(1.,.38,.08),vS);
    gl_FragColor=vec4(c*3.,vA*k*uSp);}`}));
sparks.frustumCulled=false;scene.add(sparks);

/* ---- mali plamenovi iznad najtoplijih komada ---- */
const flameMat=[];
hotSpots.sort(()=>R()-.5).slice(0,mobile?10:24).forEach((h,i)=>{
  const m=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    uniforms:{uTime:U.uTime,uFl:U.uFl,uSeed:{value:R()*100},uSz:{value:new T.Vector2(.45+h[3]*1.6,.26+h[3]*1.1+R()*.12)}},
    vertexShader:`uniform vec2 uSz;varying vec2 vUv;void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(0.,0.,0.,1.);
      mv.xy+=vec2(position.x,position.y+.5)*uSz;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform float uTime,uSeed,uFl;varying vec2 vUv;${NOISE}
     void main(){float t=uTime*1.1+uSeed;float y=vUv.y;
      float n=fbm(vec3(vUv.x*2.6+uSeed,y*2.4-t*2.8,t*.4));
      float x=(vUv.x-.5)*2.+(n-.5)*1.5*y+sin(y*6.-t*3.+uSeed)*.12*y;
      float w=mix(.95,.12,pow(y,.7));
      float body=smoothstep(w,w*.25,abs(x))*smoothstep(0.,.1,y)*smoothstep(1.,.35,y+(n-.5)*.55);
      float core=smoothstep(w*.55,0.,abs(x))*smoothstep(.6,.05,y);
      float life=smoothstep(.25,.65,n3(vec3(uSeed,t*.35,0.)));
      vec3 c=mix(vec3(1.,.2,.02),vec3(1.,.62,.22),core);
      c=mix(c,vec3(.25,.35,1.),smoothstep(.12,0.,y)*.45*core);
      gl_FragColor=vec4(c*1.25,body*life*(.35+.4*core)*uFl);}`});
  const f=new T.Mesh(new T.PlaneGeometry(1,1),m);f.position.set(h[0],h[1],h[2]);f.frustumCulled=false;scene.add(f)});

/* ---- dim i izmaglica ---- */
function smoke(w,h,x,y,z,a,sd){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,
  uniforms:{uTime:U.uTime,uA:{value:a},uS:{value:sd}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform float uTime,uA,uS;varying vec2 vUv;${NOISE}
   void main(){vec2 u=vUv;float n=fbm(vec3(u*vec2(3.2,1.6)+vec2(uTime*.018+uS,-uTime*.035),uTime*.025+uS));
    float m=smoothstep(.42,.82,n)*smoothstep(0.,.3,u.y)*smoothstep(1.,.45,u.y)*smoothstep(0.,.18,u.x)*smoothstep(1.,.82,u.x);
    vec3 c=mix(vec3(.6,.17,.04),vec3(.16,.14,.13),smoothstep(.1,.8,u.y));gl_FragColor=vec4(c,m*uA);}`}));
  m.position.set(x,y,z);scene.add(m);return m}
smoke(30,7,0,3.6,-5,.3,0);smoke(56,12,0,6.1,-15,.45,7.3);

/* ---- obrada slike: sjaj, boja, vinjeta, zrno ---- */
const comp=new T.EffectComposer(ren);comp.addPass(new T.RenderPass(scene,cam));
const bloom=new T.UnrealBloomPass(new T.Vector2(512,512),.8,.65,.32);comp.addPass(bloom);
const grade=new T.ShaderPass({uniforms:{tDiffuse:{value:null},uTime:{value:0},uRes:{value:new T.Vector2(1,1)}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform sampler2D tDiffuse;uniform float uTime;uniform vec2 uRes;varying vec2 vUv;
   vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
   float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
   void main(){vec2 d=vUv-.5;float r2=dot(d,d);
    float hz=smoothstep(.75,.25,vUv.y);vec2 uv=vUv+vec2(sin(vUv.y*90.+uTime*5.)*.0011+sin(vUv.y*37.-uTime*3.1+vUv.x*20.)*.0008,sin(vUv.x*60.+uTime*4.)*.0006)*hz;
    vec3 c=vec3(texture2D(tDiffuse,uv-d*.0018).r,texture2D(tDiffuse,uv).g,texture2D(tDiffuse,uv+d*.0018).b);
    c=aces(c*1.0);c=pow(c,vec3(1./2.2));
    float l=dot(c,vec3(.299,.587,.114));c=mix(c,c*vec3(.93,.97,1.06),1.-smoothstep(.0,.35,l));
    c*=mix(1.,.42,smoothstep(.12,.62,r2*1.9));
    c+=(hs(vUv*uRes+fract(uTime*7.31))-.5)*.035;
    gl_FragColor=vec4(c,1.);}`});
comp.addPass(grade);

/* ---- kamera, veličina, petlja ---- */
let W=1,H=1,mx=0,my=0,tx=0,ty=0;
function size(){const r=hero.getBoundingClientRect();W=r.width;H=r.height;ren.setSize(W,H,false);comp.setSize(W,H);
  const pr=ren.getPixelRatio();grade.uniforms.uRes.value.set(W*pr,H*pr);bloom.resolution.set(W*pr/2,H*pr/2);
  sparkU.uPx.value=pr*H/800;cam.aspect=W/H;cam.fov=W/H<1?46:30;cam.updateProjectionMatrix()}
hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5});
hero.addEventListener('pointerleave',()=>{tx=ty=0});
function place(t){mx+=(tx-mx)*.03;my+=(ty-my)*.03;const port=W/H<1,e=1-Math.pow(window.SOLE_P==null?1:window.SOLE_P,.8);
  cam.position.set(Math.sin(t*.05)*.7+mx*.7,(port?2.9:2.35)+e*.5+Math.sin(t*.07)*.1-my*.3,8.6+e*2.2+Math.sin(t*.04)*.5);
  cam.lookAt(port?0:-.8+mx*.3,-.25,0)}
/* žar: jak na početku (slova se vide kroz vatru), pri skrolu se jako zagasi i ostaju samo poneki plamenovi, više kao ugalj (zbog čitkosti teksta na kraju) */
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)},mixf=(a,b,k)=>a+(b-a)*k;
function render(t){U.uTime.value=t;grade.uniforms.uTime.value=t;
  const sp=window.SOLE_P==null?1:window.SOLE_P,k=ss(.1,.6,sp);
  U.uHeat.value=mixf(1.9,.3,k);U.uFl.value=mixf(1.35,.38,k);U.uSp.value=mixf(1.25,.45,k);bloom.strength=mixf(1.05,.42,k);const em=mixf(1.35,.35,k);
  for(const l of embers){const d=l.userData;l.intensity=em*d.b*(.72+.2*Math.sin(t*d.a+d.p)+.08*Math.sin(t*d.a*3.7+d.p*2.))}
  place(t);comp.render()}
size();
let raf=0,t0=performance.now(),visible=true,on=true;
function loop(now){render((now-t0)/1000+4);raf=requestAnimationFrame(loop)}
function play(){if(!raf&&visible&&on&&!RM)raf=requestAnimationFrame(loop)}
function pause(){cancelAnimationFrame(raf);raf=0}
new IntersectionObserver(es=>{visible=es[0].isIntersecting;visible?play():pause()}).observe(hero);
document.addEventListener('visibilitychange',()=>{on=!document.hidden;on?play():pause()});
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{size();if(RM)render(8)},120)});
render(4);hero.classList.add('live');
if(RM)render(8);else play();
})();
