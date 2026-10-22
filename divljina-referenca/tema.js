(function(){
  var body=document.body, header=document.getElementById('header');
  if(!header)return;

  /* Mere trake i hedera (za tačno uklapanje u prvi ekran) */
  var tb=document.querySelector('.topbar'),root=document.documentElement;
  function measure(){var solid=header.classList.contains('solid');header.classList.remove('solid');var t=tb?tb.offsetHeight:0,h=header.offsetHeight;if(solid)header.classList.add('solid');root.style.setProperty('--tb',t+'px');root.style.setProperty('--hh',h+'px');root.style.setProperty('--top',(t+h)+'px');}
  measure();addEventListener('resize',function(){measure();fitMask();onScroll()});

  /* Maska: na uskom ekranu kadar se suzi oko reči; zum ide ravnomerno iz sredine reči */
  var mask=document.getElementById('hcMask'),word=document.getElementById('hcWord'),t1=document.getElementById('hcT1'),ox=800,oy=380;
  var hint=document.querySelector('.hc-hint');
  function fitMask(){if(!mask||!word||!hint)return;var r=mask.getBoundingClientRect(),portrait=r.width/r.height<1.1;
    if(!portrait){mask.setAttribute('viewBox','0 0 1600 900');hint.style.top='';hint.style.bottom='';
      try{var g=word.getBBox(),e=t1.getBBox();ox=g.x+g.width/2;oy=e.y+e.height*.55;}catch(err){}}
    else{ /* telefon: reči malo više gore, strelica odmah ispod, zum iz sredine oba reda */
      try{var g=word.getBBox(),tx=word.querySelectorAll('text'),cx=document.createElement('canvas').getContext('2d'),fam=getComputedStyle(tx[0]).fontFamily;
        /* stvarne ivice slova (bez praznog prostora fonta iznad i ispod) */
        cx.font=tx[0].getAttribute('font-size')+'px '+fam;var y1=+tx[0].getAttribute('y')-cx.measureText(tx[0].textContent.toUpperCase()).actualBoundingBoxAscent;
        cx.font=tx[1].getAttribute('font-size')+'px '+fam;var y2=+tx[1].getAttribute('y')+cx.measureText(tx[1].textContent.toUpperCase()).actualBoundingBoxDescent;
        var sc=r.width/800,vh=r.height/sc,cy=(y1+y2)/2,vy=cy-.38*vh;
        mask.setAttribute('viewBox','400 '+vy.toFixed(1)+' 800 '+vh.toFixed(1));
        /* tačka zuma: oba reda dodiruju ivice vidljivog dela (ispod hedera / iznad donje trake) u istom trenutku */
        var mb=document.querySelector('.mbar'),B=(mb&&mb.offsetHeight?mb.getBoundingClientRect().top:innerHeight),T=r.top,
            a=r.top+(y1-vy)*sc,b=r.top+(y2-vy)*sc,O=(T*b-a*B)/(b+T-B-a);
        ox=g.x+g.width/2;oy=vy+(O-r.top)/sc;
        var st=mask.parentElement.getBoundingClientRect();
        hint.style.top=Math.round(r.top-st.top+(y2-vy)*sc+28)+'px';hint.style.bottom='auto';}catch(err){}}
    word.style.transformOrigin=ox+'px '+oy+'px';}
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitMask);fitMask();

  /* Heder: providan preko heroja, pun posle skrola; skrol vodi masku */
  function onScroll(){
    header.classList.toggle('solid',body.dataset.head==='over'&&scrollY>40);
    var s=document.getElementById('heroC');if(!s||!word)return;var r=s.getBoundingClientRect(),vis=s.querySelector('.hc-stick').offsetHeight,max=s.offsetHeight-vis;
    var p=Math.min(1,Math.max(0,((body.dataset.head==='classic'?root.style.getPropertyValue('--top').replace('px','')*1:0)-r.top)/max));
    s.style.setProperty('--p',p.toFixed(4));
    word.style.transform='scale('+(1+Math.pow(p,1.8)*14).toFixed(3)+')';
    document.getElementById('hcCover').style.opacity=(1-Math.min(1,Math.max(0,(p-.3)*2.3))).toFixed(3);
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  /* Mega meni */
  var mega=document.getElementById('mega'),mb=document.querySelector('[data-mega]'),li=mb?mb.parentElement:null,t;
  if(mb&&mega&&li){
  function openMega(){clearTimeout(t);mega.classList.add('show');li.classList.add('open');header.classList.add('menu-open');mb.setAttribute('aria-expanded','true')}
  function closeMega(){t=setTimeout(function(){mega.classList.remove('show');li.classList.remove('open');header.classList.remove('menu-open');mb.setAttribute('aria-expanded','false')},160)}
  [li,mega].forEach(function(el){el.addEventListener('mouseenter',openMega);el.addEventListener('mouseleave',closeMega)});
  /* Stavka je link ka prodavnici: klik vodi na stranu, meni otvara prelaz
     mišem. Ako bi ovde neko vratio dugme, klik i dalje otvara/zatvara meni. */
  if(mb.tagName!=='A')mb.addEventListener('click',function(){mega.classList.contains('show')?(clearTimeout(t),mega.classList.remove('show'),li.classList.remove('open'),header.classList.remove('menu-open')):openMega()});
  /* Tastatura: meni se otvara kad stavka dobije fokus, da se do kategorija
     može doći i bez miša. */
  li.addEventListener('focusin',openMega);
  [li,mega].forEach(function(el){el.addEventListener('focusout',function(e){if(!el.contains(e.relatedTarget)&&!mega.contains(e.relatedTarget)&&!li.contains(e.relatedTarget))closeMega()})});
  }

  /* Pretraga */
  var so=document.getElementById('search');
  if(so){
  document.querySelectorAll('[data-search]').forEach(function(b){b.addEventListener('click',function(){so.classList.add('show');setTimeout(function(){so.querySelector('input').focus()},200)})});
  var sx=so.querySelector('[data-search-close]');if(sx)sx.addEventListener('click',function(){so.classList.remove('show')});
  }

  /* Mobilni meni */
  var dr=document.getElementById('drawer'),db=document.querySelector('[data-drawer]');
  if(dr&&db){
  db.addEventListener('click',function(){dr.classList.add('open')});
  var dx=dr.querySelector('[data-drawer-close]');if(dx)dx.addEventListener('click',function(){dr.classList.remove('open')});
  }

  /* Paneli */
  var bg=document.querySelector('.panel-bg');
  function closeAll(){document.querySelectorAll('.panel.open').forEach(function(p){p.classList.remove('open')});if(bg)bg.classList.remove('open')}
  document.querySelectorAll('[data-open]').forEach(function(a){a.addEventListener('click',function(e){var p=document.getElementById(a.dataset.open);if(!p)return;e.preventDefault();closeAll();p.classList.add('open');if(bg)bg.classList.add('open')})});
  document.querySelectorAll('[data-close]').forEach(function(a){a.addEventListener('click',closeAll)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeAll();if(so)so.classList.remove('show');if(dr)dr.classList.remove('open');if(mega)mega.classList.remove('show')}});

  /* Izdvajamo — strelice */
  var tr=document.getElementById('track');
  if(tr)document.querySelectorAll('.arrows button').forEach(function(b){b.addEventListener('click',function(){var c=tr.querySelector('.card');tr.scrollBy({left:(c.offsetWidth+24)*(+b.dataset.dir),behavior:'smooth'})})});

  /* Ulazak sekcija */
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
})();


(function(){
  var sl=document.querySelectorAll('#spotTrack .spot-slide'),i=0;
  if(!sl.length)return;
  var sp=document.getElementById('spotPrev'),sn=document.getElementById('spotNext');
  if(!sp||!sn)return;
  function go(n){i=(n+sl.length)%sl.length;sl.forEach(function(s,k){s.classList.toggle('on',k===i);s.setAttribute('aria-hidden',k===i?'false':'true')});}
  sp.addEventListener('click',function(){go(i-1)});
  sn.addEventListener('click',function(){go(i+1)});
})();
