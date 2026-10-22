/* Sole Komerc — meni za telefon, uvećanje slika, obrazac (maketa) */
(function(){
  /* mobilni meni */
  var dr=document.getElementById('drawer'),bt=document.getElementById('burger');
  function setOpen(o){if(!dr)return;dr.classList.toggle('open',o);document.body.style.overflow=o?'hidden':'';if(bt)bt.setAttribute('aria-expanded',o)}
  if(bt)bt.addEventListener('click',function(){setOpen(true)});
  if(dr){dr.addEventListener('click',function(e){if(e.target===dr||e.target.closest('.close'))setOpen(false)});}
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
