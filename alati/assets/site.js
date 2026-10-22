/* Sole Komerc — meni za telefon, uvećanje slika, obrazac (maketa) */
(function(){
  document.documentElement.classList.add('js');

  /* naslovna, poglavlja ispod uvoda: pojavljivanje pri skrolu, blaga paralaksa slika, vremenska linija koja se puni */
  var abs=document.querySelectorAll('.ab');
  if(abs.length){
    var rmo=matchMedia('(prefers-reduced-motion: reduce)').matches,els=document.querySelectorAll('.ab h2,.ab p,.ab figure:not(.par),.ab .ab-duo');
    if(rmo||!('IntersectionObserver' in window)){[].forEach.call(document.querySelectorAll('.ab h2,.ab p,.ab figure,.ab .ab-duo'),function(e){e.classList.add('in')})}
    else{
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -10% 0px',threshold:.06});
      [].forEach.call(els,function(e){e.classList.add('rv');io.observe(e)});
      [].forEach.call(document.querySelectorAll('.ab figure.par'),function(e){io.observe(e)});
    }
    var pars=[].slice.call(document.querySelectorAll('.ab figure.par')),tl=document.querySelector('.ab-time'),tk=0;
    var upd=function(){tk=0;var vh=innerHeight;
      if(!rmo)pars.forEach(function(f){var r=f.getBoundingClientRect();if(r.bottom<-80||r.top>vh+80)return;var c=(r.top+r.height/2-vh/2)/vh;f.style.setProperty('--py',(-c*(f.classList.contains('ab-bgimg')?70:34)).toFixed(1)+'px')});
      if(tl){var r=tl.getBoundingClientRect(),p=Math.min(1,Math.max(0,(vh*.62-r.top)/r.height));tl.style.setProperty('--p',p.toFixed(3))}};
    addEventListener('scroll',function(){if(!tk)tk=requestAnimationFrame(upd)},{passive:true});addEventListener('resize',upd);upd();
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
