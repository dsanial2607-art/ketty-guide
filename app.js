let CFG={},current=null;const $=s=>document.querySelector(s);

function speak(t,end){
  speechSynthesis.cancel();
  if(!t)return;
  const u=new SpeechSynthesisUtterance(t);
  u.lang="fr-FR";
  u.rate=1;
  u.pitch=1;
  if(end)u.onend=end;
  speechSynthesis.speak(u);
}

function applyUI(){
  const u=CFG.interface||{};
  $("#app").style.backgroundImage=`url("${u.background}")`;
  $("#ketty").src=u.ketty_image;
  $("#title").textContent=u.titre||"";
  $("#instruction").textContent=u.instruction||"";
  $("#sub").textContent=u.sous_instruction||"";
  $("#tagline").textContent=u.accroche||"";
  $("#bubble").textContent=u.bulle_ketty||"";
  $("#brandName").textContent=u.nom_destination||"";
  $("#brandSignature").textContent=u.signature_destination||"";
  $("#footerText").textContent=u.footer||"";
  $("#mmessage").textContent=u.message_modal||"";
  $("#replay").textContent=u.bouton_reecouter||"";
  $("#go").textContent=u.bouton_continuer||"";
}

function shuffle(array){
  const a=[...array];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function build(){
  const box=$("#cards");
  box.innerHTML="";
  const sitesMelanges=shuffle(Object.entries(CFG.lieux||{}));

  sitesMelanges.forEach(([id,s])=>{
    const a=document.createElement("article");
    a.className="card";
    a.style.setProperty("--c",s.couleur||"#f2ae17");
    a.innerHTML=`
      <img class="photo" src="${s.photo}" alt="${s.titre}">
      <div class="info">
        <div class="icon">${s.icone||"📍"}</div>
        <div>
          <div class="ctitle">${s.titre}</div>
          <div class="city">${s.commune||""}</div>
        </div>
        <div class="arrow">›</div>
      </div>`;
    a.onclick=()=>openSite(id);
    box.appendChild(a);
  });
}

function openSite(id){
  current=id;
  const s=CFG.lieux[id];
  $("#micon").textContent=s.icone||"📍";
  $("#mtitle").textContent=s.titre;
  $("#modal").classList.remove("hidden");
  speak(s.phrase_lieu);
}

$("#close").onclick=()=>{
  $("#modal").classList.add("hidden");
  speechSynthesis.cancel();
};

$("#replay").onclick=()=>current&&speak(CFG.lieux[current].phrase_lieu);

$("#go").onclick=()=>{
  if(!current)return;
  const p=CFG.phrases_tally_aleatoires||[];
  const r=(p.length?p[Math.floor(Math.random()*p.length)]+" ":"")+(CFG.phrase_tally_finale||"");
  const url=`${CFG.tally_url}?lieu=${encodeURIComponent(current)}`;

  let done=false;
  const go=()=>{
    if(done)return;
    done=true;
    location.href=url;
  };

  speak(r,go);
  setTimeout(go,Math.max(5000,r.length*70));
};

fetch("config.json?v="+Date.now())
  .then(r=>r.json())
  .then(c=>{
    CFG=c;
    applyUI();
    build();
  })
  .catch(e=>{
    console.error(e);
    alert("Impossible de charger config.json");
  });