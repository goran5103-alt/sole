/* Sole Komerc — meni za telefon, uvećanje slika, obrazac (maketa) */
(function(){
  document.documentElement.classList.add('js');

  /* naslovna, poglavlja ispod uvoda: pojavljivanje pri skrolu, blaga paralaksa slika, slika vremenske linije, linija koja se puni */
  var abs=document.querySelectorAll('.ab');
  if(abs.length){
    var rmo=matchMedia('(prefers-reduced-motion: reduce)').matches,fx=document.querySelectorAll('.ab-lead,.ab-addr,.ab-state'),all=document.querySelectorAll('.ab h2,.ab p,.ab figure,.ab .type');
    [].forEach.call(fx,function(e){e.classList.add('fx')});
    if(rmo||!('IntersectionObserver' in window)){[].forEach.call(all,function(e){e.classList.add('in')});[].forEach.call(document.querySelectorAll('.ab-lead2,.ab-who'),function(e){e.classList.add('fx-in')})}
    else{
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.06});
      [].forEach.call(all,function(e){if(e.classList.contains('fx'))return;if(!e.matches('figure'))e.classList.add('rv');io.observe(e)});
      [].forEach.call(document.querySelectorAll('.ab .type'),function(e,i){e.style.transitionDelay=(i%3)*.08+'s'});
      var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('fx-in');io2.unobserve(e.target)}})},{threshold:.2});
      [].forEach.call(document.querySelectorAll('.ab-lead2,.ab-who'),function(e){io2.observe(e)});
    }
    var pars=[].slice.call(document.querySelectorAll('.ab figure.par,.ab figure.pf,.ab figure.ab-isoimg')).map(function(f){return{f:f,a:parseFloat(getComputedStyle(f).getPropertyValue('--amp'))||0}}),
      eq=document.querySelector('.ab-eq'),efs=[].slice.call(document.querySelectorAll('.ab-eq-figs figure')),emk=[].slice.call(document.querySelectorAll('.ab-eq .ab-body mark')),emap=[0,0,1,2,2],
      story=document.querySelector('.ab-story'),nodes=[].slice.call(document.querySelectorAll('.ab-node')),tk=0;
    var upd=function(){tk=0;var vh=innerHeight;
      if(!rmo)pars.forEach(function(o){var r=o.f.getBoundingClientRect();if(r.bottom<-80||r.top>vh+80)return;var c=Math.max(-1,Math.min(1,(r.top+r.height/2-vh/2)/vh));o.f.style.setProperty('--py',(-c*o.a).toFixed(1)+'px')});
      if(eq&&!rmo&&eq.offsetHeight>vh*1.4){var re=eq.getBoundingClientRect(),pe=Math.min(1,Math.max(0,-re.top/(re.height-vh))),ix=Math.min(emk.length-1,Math.floor(pe*emk.length)),fi=emap[ix];
        eq.style.setProperty('--ep',pe.toFixed(3));emk.forEach(function(m,k){m.classList.toggle('act',k===ix)});efs.forEach(function(f,k){f.classList.toggle('on',k===fi)})}
      if(story&&!rmo){var r=story.getBoundingClientRect();story.style.setProperty('--tp',Math.min(1,Math.max(0,(vh*.55-r.top)/(r.height-vh*.1))).toFixed(3))}
      if(nodes.length){var ref=vh*.55;nodes.forEach(function(n){var r=n.getBoundingClientRect(),gap=parseFloat(getComputedStyle(n).marginBottom)||0;
        n.style.setProperty('--q',Math.min(1,Math.max(0,(ref-r.top)/(r.height+gap))).toFixed(3));n.classList.toggle('on',ref>r.top)})}};
    addEventListener('scroll',function(){if(!tk)tk=requestAnimationFrame(upd)},{passive:true});addEventListener('resize',upd);upd();

    /* ugalj: na računaru je aktivan red pod mišem/fokusom (prvi na početku), njegova fotografija je velika sa desne strane */
    var tr=document.querySelector('.types-row');
    if(tr){var ts=[].slice.call(tr.querySelectorAll('.type')),ton=function(t){ts.forEach(function(x){x.classList.toggle('act',x===t)})};
      ton(ts[0]);ts.forEach(function(t){t.addEventListener('mouseenter',function(){ton(t)});t.addEventListener('focus',function(){ton(t)})})}

    /* prve dve sekcije posle uvoda zauzimaju ceo ekran: jedan skrol (točkić ili prevlačenje) prikazuje celu sekciju */
    var sA=document.querySelector('.ab-lead2'),sB=document.querySelector('.ab-who'),busy=false,lastW=0,t0=0;
    if(sA&&sB&&!rmo){
      var stops=function(){var vh=innerHeight,o=[];[sA,sB].forEach(function(e){var r=e.getBoundingClientRect();if(r.height<=vh+40)o.push(r.top+scrollY)});return o};
      var de=document.documentElement,unlock=function(){if(performance.now()-lastW<180){setTimeout(unlock,60);return}de.style.overflow='';busy=false};
      var go=function(to){busy=true;de.style.overflow='hidden';   /* nativni skrol (i njegov zalet) se isključuje dok traje skok, da se dve animacije ne bore */
        var from=scrollY,d=Math.abs(to-from),dur=Math.min(900,520+d*.22),t=performance.now();
        (function step(n){var k=Math.min(1,(n-t)/dur),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;scrollTo({top:from+(to-from)*e,behavior:'instant'});
          if(k<1)requestAnimationFrame(step);else{lastW=performance.now();unlock()}})(t)};
      var target=function(dir){var st=stops(),y=scrollY,vh=innerHeight,k;if(st.length<2||st[0]-y>vh*1.1)return null;
        if(dir>0){if(y<st[0]-vh-60||y>=st[1]-4)return null;for(k=0;k<st.length;k++)if(st[k]>y+4)return st[k]}
        else{if(y>st[1]+4||y<=st[0]+4)return null;return st[0]}
        return null};
      addEventListener('wheel',function(e){if(e.ctrlKey||!e.deltaY)return;var n=performance.now();
        if(busy||n-lastW<160){lastW=n;e.preventDefault();return}
        var to=target(e.deltaY>0?1:-1);if(to===null)return;lastW=n;e.preventDefault();go(to)},{passive:false});
      /* telefon: kad se prst podigne i skrol se smiri, ekran se „zalepi” na najbližu od dve sekcije (smer prevlačenja odlučuje) */
      if(matchMedia('(pointer: coarse)').matches){
        var touching=false,lastY=scrollY,dirv=0,tm=0;
        var settle=function(){if(touching||busy)return;var st=stops();if(st.length<2)return;var y=scrollY,vh=innerHeight,A=st[0],B=st[1],to=null;
          if(dirv>=0){if(y>=A-vh*.6&&y<A-4)to=A;else if(y>=A-4&&y<B-4)to=(y-A)>(B-A)*.12?B:A}
          else{if(y>B+4&&y<=B+vh*.6)to=B;else if(y>A+4&&y<=B+4)to=(y-A)<(B-A)*.88?A:B}
          if(to!==null&&Math.abs(to-y)>3)go(to)};
        addEventListener('touchstart',function(){touching=true;clearTimeout(tm)},{passive:true});
        var up=function(){touching=false;clearTimeout(tm);tm=setTimeout(settle,160)};
        addEventListener('touchend',up,{passive:true});addEventListener('touchcancel',up,{passive:true});
        addEventListener('scroll',function(){var d=scrollY-lastY;if(Math.abs(d)>=1){dirv=d>0?1:-1;lastY=scrollY}clearTimeout(tm);tm=setTimeout(settle,160)},{passive:true});
      }
    }
  }

  /* podnožje na telefonu: kolone su harmonika, otvara se jedna po jedna */
  var fcols=document.querySelectorAll('.foot .cols>div:not(.f-brand)');
  [].forEach.call(fcols,function(c){var h=c.querySelector('h4');if(!h)return;h.setAttribute('role','button');h.setAttribute('tabindex','0');h.setAttribute('aria-expanded','false');
    var tg=function(){var o=!c.classList.contains('open');[].forEach.call(fcols,function(x){x.classList.remove('open');var xh=x.querySelector('h4');if(xh)xh.setAttribute('aria-expanded','false')});if(o){c.classList.add('open');h.setAttribute('aria-expanded','true')}};
    h.addEventListener('click',function(){if(matchMedia('(max-width: 900px)').matches)tg()});
    h.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&matchMedia('(max-width: 900px)').matches){e.preventDefault();tg()}})});

  /* unutrašnje strane: napredak čitanja, paralaksa trake, slajder galerije, praćenje sadržaja i blago pojavljivanje blokova (samo klase, stilovi i elementi u slotovima; sadržaj se ne dira) */
  var inner=document.querySelector('.banner')&&!document.querySelector('.ab');
  if(inner){
    var rmo2=matchMedia('(prefers-reduced-motion: reduce)').matches,hd3=document.getElementById('head'),bn=document.querySelector('.banner'),pr=document.createElement('i'),
      tocA=[].slice.call(document.querySelectorAll('.toc a')),tocH=tocA.map(function(a){return document.getElementById((a.getAttribute('href')||'').slice(1))}),tk2=0;
    pr.className='prog';if(hd3)hd3.appendChild(pr);
    var upd2=function(){tk2=0;var y=scrollY,h=document.documentElement.scrollHeight-innerHeight;pr.style.setProperty('--sp',h>0?Math.min(1,y/h).toFixed(4):0);
      if(bn&&!rmo2)bn.style.setProperty('--bp',(Math.min(y,700)*.22).toFixed(1)+'px');
      if(tocA.length){var cur=-1;tocH.forEach(function(e,i){if(e&&e.getBoundingClientRect().top<innerHeight*.32)cur=i});tocA.forEach(function(a,i){a.classList.toggle('on',i===cur)})}};
    addEventListener('scroll',function(){if(!tk2)tk2=requestAnimationFrame(upd2)},{passive:true});addEventListener('resize',upd2);upd2();

    /* slajder: velika scena (popunjava se u slotu), strelice, brojač, traka vremena, prevlačenje i tastatura; klik na scenu otvara uvećanje */
    var ARR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    [].forEach.call(document.querySelectorAll('.slider'),function(sl){
      var st=sl.querySelector('.gl-stage'),th=[].slice.call(sl.querySelectorAll('.gl-thumbs a')),n=th.length;if(!st||!n)return;
      var ims=[],cur=-1,tm=0,hov=false,opening=false,vis=true,T=6000;
      th.forEach(function(a,i){var im=document.createElement('img'),src=a.querySelector('img');im.src=a.getAttribute('href');im.alt=src?src.alt:'';im.decoding='async';if(i>1)im.loading='lazy';st.appendChild(im);ims.push(im)});
      var ui=document.createElement('div'),num=document.createElement('div'),btns=document.createElement('div'),bar=document.createElement('i'),pv=document.createElement('button'),nx=document.createElement('button');
      ui.className='gl-ui';num.className='gl-n';btns.className='gl-btns';bar.className='gl-bar';
      pv.type=nx.type='button';pv.className=nx.className='gl-btn';pv.setAttribute('aria-label','Prethodna fotografija');nx.setAttribute('aria-label','Sledeća fotografija');pv.innerHTML=ARR;nx.innerHTML=ARR;pv.firstChild.style.transform='scaleX(-1)';
      btns.appendChild(pv);btns.appendChild(nx);ui.appendChild(num);if(n>1)ui.appendChild(btns);st.appendChild(ui);if(n>1)st.appendChild(bar);st.tabIndex=0;
      var pad=function(x){return(x<10?'0':'')+x};
      var go=function(i,user){i=(i+n)%n;if(i===cur)return;cur=i;ims.forEach(function(m,k){m.classList.toggle('on',k===i)});
        th.forEach(function(a,k){a.classList.toggle('on',k===i)});num.innerHTML=pad(i+1)+'<em>/ '+pad(n)+'</em>';
        var box=sl.querySelector('.gl-thumbs'),a=th[i];if(box)box.scrollTo({left:a.offsetLeft-(box.clientWidth-a.offsetWidth)/2,behavior:'smooth'});
        bar.classList.remove('run');void bar.offsetWidth;if(!rmo2&&n>1&&!hov&&vis)bar.classList.add('run');
        clearTimeout(tm);if(!rmo2&&n>1)tm=setTimeout(function(){if(!hov&&vis)go(cur+1)},T)};
      th.forEach(function(a,i){a.addEventListener('click',function(e){if(opening)return;e.preventDefault();e.stopPropagation();go(i,1)})});
      pv.addEventListener('click',function(e){e.stopPropagation();go(cur-1,1)});nx.addEventListener('click',function(e){e.stopPropagation();go(cur+1,1)});
      st.addEventListener('click',function(){opening=true;th[cur].click();opening=false});
      st.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){go(cur+1,1)}else if(e.key==='ArrowLeft'){go(cur-1,1)}else if(e.key==='Enter'){opening=true;th[cur].click();opening=false}});
      sl.addEventListener('mouseenter',function(){hov=true;clearTimeout(tm);bar.classList.remove('run')});sl.addEventListener('mouseleave',function(){hov=false;var c=cur;cur=-1;go(c)});
      var sx=0,dn=false;st.addEventListener('pointerdown',function(e){sx=e.clientX;dn=true});
      st.addEventListener('pointerup',function(e){if(!dn)return;dn=false;var d=e.clientX-sx;if(Math.abs(d)>45){go(cur+(d<0?1:-1),1);e.preventDefault()}});
      if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis){var c=cur;cur=-1;go(c)}else{clearTimeout(tm);bar.classList.remove('run')}},{threshold:.25}).observe(sl);
      go(0)});

    /* pojavljivanje blokova pri skrolu */
    if('IntersectionObserver' in window&&!rmo2){
      var pio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');pio.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px',threshold:.05});
      [].forEach.call(document.querySelectorAll('main .card,main .specs li,main .docs li,main .pay li,main .cbox,main .form-wrap,main .box,main .prose figure,main .slider,main .pay-band .prose,main .sec-h'),function(e){
        var sib=e.parentNode?[].indexOf.call(e.parentNode.children,e):0;e.style.transitionDelay=Math.min(sib%6,5)*.08+'s';e.classList.add('rv');pio.observe(e)})}
  }

  /* zaglavlje naslovne: providno preko uvoda, puno posle skrola */
  var hd=document.getElementById('head');
  if(hd&&document.body.classList.contains('has-intro')){var sol=function(){hd.classList.toggle('solid',scrollY>40)};addEventListener('scroll',sol,{passive:true});sol()}

  /* mega meni: grupa pod mišem (ili fokusom) pokazuje svoje podstavke i sliku; slike se učitavaju pri prvom otvaranju */
  var rail=document.querySelector('.rail');
  if(rail){
    var act=function(g){[].forEach.call(rail.querySelectorAll('.grp.act'),function(x){x.classList.remove('act')});g.classList.add('act')};
    var first=rail.querySelector('.grp.on')||rail.querySelector('.grp');act(first);
    rail.addEventListener('mouseover',function(e){var g=e.target.closest('.grp');if(g&&g.parentNode===rail)act(g)});
    rail.addEventListener('focusin',function(e){var g=e.target.closest('.grp');if(g&&g.parentNode===rail)act(g)});
    var warm=function(){[].forEach.call(rail.querySelectorAll('.pic img'),function(i){i.loading='eager'})},host=rail.closest('.has-mega');
    var nav=host&&host.closest('.nav');
    if(host){host.addEventListener('mouseenter',warm,{once:true});host.addEventListener('focusin',warm,{once:true})}
    if(nav)nav.addEventListener('mouseenter',warm,{once:true});
  }

  /* mobilni meni */
  var dr=document.getElementById('drawer'),bt=document.getElementById('burger');
  function setOpen(o){if(!dr)return;dr.classList.toggle('open',o);document.body.style.overflow=o?'hidden':'';if(bt)bt.setAttribute('aria-expanded',o)}
  if(bt)bt.addEventListener('click',function(){setOpen(true)});
  if(dr){dr.addEventListener('click',function(e){
    var t=e.target.closest('.tg');
    if(t){var li=t.closest('li'),o=!li.classList.contains('open');li.classList.toggle('open',o);t.setAttribute('aria-expanded',o);return}
    if(e.target===dr||e.target.closest('.close'))setOpen(false)});}
  addEventListener('keydown',function(e){if(e.key==='Escape'){setOpen(false);closeLb()}});

  /* uvećanje slika iz galerije */
  var lb=document.getElementById('lb'),li=lb&&lb.querySelector('img'),set=[],ix=0;
  function show(i){ix=(i+set.length)%set.length;li.src=set[ix].href;lb.classList.add('open')}
  function closeLb(){if(lb){lb.classList.remove('open')}}
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[data-lb]');if(!a||!lb)return;e.preventDefault();
    set=[].slice.call(document.querySelectorAll('a[data-lb="'+a.getAttribute('data-lb')+'"]'));show(set.indexOf(a));
  });
  if(lb){
    lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('x'))closeLb()});
    lb.querySelector('.pv').addEventListener('click',function(){show(ix-1)});
    lb.querySelector('.nx').addEventListener('click',function(){show(ix+1)});
    addEventListener('keydown',function(e){if(!lb.classList.contains('open'))return;if(e.key==='ArrowLeft')show(ix-1);if(e.key==='ArrowRight')show(ix+1)});
  }

  /* obrazac u maketi ne šalje ništa */
  var f=document.querySelector('form.form');
  if(f)f.addEventListener('submit',function(e){e.preventDefault()});
})();
