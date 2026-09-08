let CFG=null,currentId=null;
const $=id=>document.getElementById(id);

function speak(text){
  if(!text)return;
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang='fr-FR';u.rate=1;u.pitch=1.05;
    speechSynthesis.speak(u);
  }catch(e){}
}
function openPlace(id){
  const l=CFG.lieux[id];
  if(!l || !l.actif)return;
  currentId=id;
  $('modalIcon').textContent=l.icone||'📍';
  $('modalTitle').textContent=l.nom_complet||l.titre;
  $('modalText').textContent=l.texte_robot;
  $('modal').classList.remove('hidden');
  speak(l.texte_robot);
}
function closeModal(){
  try{speechSynthesis.cancel()}catch(e){}
  $('modal').classList.add('hidden');currentId=null;
}
async function init(){
  CFG=await fetch('config.json?ts='+Date.now()).then(r=>r.json());
  document.querySelectorAll('.hotspot').forEach(b=>b.addEventListener('click',()=>openPlace(b.dataset.id)));
  $('close').addEventListener('click',closeModal);
  $('modal').addEventListener('click',e=>{if(e.target===$('modal'))closeModal()});
  $('listen').addEventListener('click',()=>{if(currentId)speak(CFG.lieux[currentId].texte_robot)});
  $('continue').addEventListener('click',()=>{
    if(!currentId)return;
    try{speechSynthesis.cancel()}catch(e){}
    window.location.href=CFG.tally_url+'?lieu='+encodeURIComponent(currentId);
  });
}
init();
