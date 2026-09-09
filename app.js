let CFG={},current=null;const $=s=>document.querySelector(s);

let availableVoices=[];
const VOICE_STORAGE_KEY="kettyVoiceSettings";

function getVoiceSettings(){
  try{
    return JSON.parse(localStorage.getItem(VOICE_STORAGE_KEY)) || {};
  }catch(e){
    return {};
  }
}

function saveVoiceSettings(){
  const data={
    voiceName: $("#voiceSelect")?.value || "",
    rate: parseFloat($("#rateRange")?.value || "1"),
    pitch: parseFloat($("#pitchRange")?.value || "1")
  };
  localStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify(data));
}

function loadVoices(){
  availableVoices=speechSynthesis.getVoices() || [];
  const select=$("#voiceSelect");
  if(!select)return;

  const french=availableVoices.filter(v => (v.lang||"").toLowerCase().startsWith("fr"));
  const list=french.length ? french : availableVoices;

  select.innerHTML="";
  list.forEach(v=>{
    const o=document.createElement("option");
    o.value=v.name;
    o.textContent=`${v.name} — ${v.lang || "langue inconnue"}`;
    select.appendChild(o);
  });

  const saved=getVoiceSettings();
  if(saved.voiceName && [...select.options].some(o=>o.value===saved.voiceName)){
    select.value=saved.voiceName;
  }
}

function applySavedVoiceSettings(){
  const saved=getVoiceSettings();
  if($("#rateRange")){
    $("#rateRange").value=saved.rate ?? 1;
    $("#rateValue").textContent=Number($("#rateRange").value).toFixed(2);
  }
  if($("#pitchRange")){
    $("#pitchRange").value=saved.pitch ?? 1;
    $("#pitchValue").textContent=Number($("#pitchRange").value).toFixed(2);
  }
}

function speak(t,end){
  speechSynthesis.cancel();
  if(!t)return;

  const u=new SpeechSynthesisUtterance(t);
  u.lang="fr-FR";

  const saved=getVoiceSettings();
  u.rate=saved.rate ?? 1;
  u.pitch=saved.pitch ?? 1;

  const chosen=availableVoices.find(v=>v.name===saved.voiceName);
  if(chosen)u.voice=chosen;

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


function initVoiceSettings(){
  loadVoices();
  applySavedVoiceSettings();

  // Le bouton de réglage n'est visible qu'en mode administrateur.
  const adminMode = new URLSearchParams(window.location.search).get("admin") === "1";
  const settingsBtn = $("#voiceSettingsBtn");
  if(settingsBtn){
    settingsBtn.style.display = adminMode ? "block" : "none";
  }

  if(typeof speechSynthesis !== "undefined"){
    speechSynthesis.onvoiceschanged=loadVoices;
    setTimeout(loadVoices,300);
    setTimeout(loadVoices,1200);
  }

  $("#voiceSettingsBtn").onclick=()=>{
    loadVoices();
    applySavedVoiceSettings();
    $("#voiceSettingsModal").classList.remove("hidden");
  };

  $("#closeVoiceSettings").onclick=()=>{
    saveVoiceSettings();
    $("#voiceSettingsModal").classList.add("hidden");
  };

  $("#voiceSelect").onchange=saveVoiceSettings;

  $("#rateRange").oninput=()=>{
    $("#rateValue").textContent=Number($("#rateRange").value).toFixed(2);
    saveVoiceSettings();
  };

  $("#pitchRange").oninput=()=>{
    $("#pitchValue").textContent=Number($("#pitchRange").value).toFixed(2);
    saveVoiceSettings();
  };

  $("#testVoiceBtn").onclick=()=>{
    saveVoiceSettings();
    speak("Bonjour, je suis Ketty. Test de la voix française.");
  };
}


initVoiceSettings();

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