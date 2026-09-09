let CFG={},current=null,currentLang=sessionStorage.getItem("kettyLang")||"fr";
const $=s=>document.querySelector(s);
let availableVoices=[];
const VOICE_STORAGE_KEY="kettyVoiceSettingsBilingual";

function getVoiceSettings(){
  try{return JSON.parse(localStorage.getItem(VOICE_STORAGE_KEY))||{fr:{},en:{}}}
  catch(e){return {fr:{},en:{}}}
}
function saveVoiceSettings(){
  const all=getVoiceSettings();
  ["fr","en"].forEach(lang=>{
    const L=lang==="fr"?"Fr":"En";
    all[lang]={
      voiceName:$(`#voiceSelect${L}`)?.value||"",
      rate:parseFloat($(`#rateRange${L}`)?.value||"1"),
      pitch:parseFloat($(`#pitchRange${L}`)?.value||"1")
    };
  });
  localStorage.setItem(VOICE_STORAGE_KEY,JSON.stringify(all));
}
function populateVoiceSelect(lang){
  const L=lang==="fr"?"Fr":"En", sel=$(`#voiceSelect${L}`);
  if(!sel)return;
  const prefix=lang==="fr"?"fr":"en";
  const filtered=availableVoices.filter(v=>(v.lang||"").toLowerCase().startsWith(prefix));
  const list=filtered.length?filtered:availableVoices;
  sel.innerHTML="";
  list.forEach(v=>{
    const o=document.createElement("option");o.value=v.name;o.textContent=`${v.name} — ${v.lang||""}`;sel.appendChild(o);
  });
  const saved=getVoiceSettings()[lang]||{};
  if(saved.voiceName&&[...sel.options].some(o=>o.value===saved.voiceName))sel.value=saved.voiceName;
  else if(lang==="en"){
    const gb=[...sel.options].find(o=>{
      const v=availableVoices.find(x=>x.name===o.value);return (v?.lang||"").toLowerCase().startsWith("en-gb");
    });
    if(gb)sel.value=gb.value;
  }
}
function loadVoices(){
  availableVoices=speechSynthesis.getVoices()||[];
  populateVoiceSelect("fr");populateVoiceSelect("en");
}
function applySavedVoiceSettings(){
  const all=getVoiceSettings();
  ["fr","en"].forEach(lang=>{
    const L=lang==="fr"?"Fr":"En", s=all[lang]||{};
    $(`#rateRange${L}`).value=s.rate??1;$(`#rateValue${L}`).textContent=Number(s.rate??1).toFixed(2);
    $(`#pitchRange${L}`).value=s.pitch??1;$(`#pitchValue${L}`).textContent=Number(s.pitch??1).toFixed(2);
  });
}
function speak(text,lang=currentLang,end){
  speechSynthesis.cancel();if(!text)return;
  const u=new SpeechSynthesisUtterance(text), s=getVoiceSettings()[lang]||{};
  u.lang=lang==="fr"?"fr-FR":"en-GB";u.rate=s.rate??1;u.pitch=s.pitch??1;
  const chosen=availableVoices.find(v=>v.name===s.voiceName);
  if(chosen)u.voice=chosen;
  else{
    const prefix=lang==="fr"?"fr":"en-gb";
    const fallback=availableVoices.find(v=>(v.lang||"").toLowerCase().startsWith(prefix))
      ||availableVoices.find(v=>(v.lang||"").toLowerCase().startsWith(lang));
    if(fallback)u.voice=fallback;
  }
  if(end)u.onend=end;speechSynthesis.speak(u);
}
function setCssVar(n,v){if(v)document.documentElement.style.setProperty(n,v)}
function ui(){return CFG.interface?.textes?.[currentLang]||{}}
function applyUI(){
  const base=CFG.interface||{},u=ui();
  setCssVar("--bg",base.couleur_fond);setCssVar("--ink",base.couleur_texte);
  setCssVar("--accent",base.couleur_principale);setCssVar("--footer",base.couleur_footer);
  $("#ketty").src=base.ketty_image||"";
  $("#title").textContent=u.titre||"";$("#instruction").textContent=u.instruction||"";
  $("#sub").textContent=u.sous_instruction||"";$("#bubble").textContent=u.bulle_ketty||"";
  $("#brandName").textContent=u.nom_destination||"";$("#brandSignature").textContent=u.signature_destination||"";
  $("#footerText").textContent=u.footer||"";$("#mmessage").textContent=u.message_modal||"";
  $("#replay").textContent=u.bouton_reecouter||"";$("#go").textContent=u.bouton_continuer||"";
  const logo=$("#officeLogo");
  if(base.afficher_logo_ot===false||!base.logo_ot)logo.style.display="none";
  else{logo.style.display="block";logo.src=base.logo_ot+"?v="+Date.now();logo.alt=base.logo_alt||""}
  document.documentElement.lang=currentLang;
  document.querySelectorAll("#languageSwitch button").forEach(b=>b.classList.toggle("active",b.dataset.lang===currentLang));
}
function shuffle(array){
  const a=[...array];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a;
}
function build(){
  const box=$("#cards");box.innerHTML="";
  shuffle(Object.entries(CFG.lieux||{})).forEach(([id,s])=>{
    const a=document.createElement("article");a.className="card";a.style.setProperty("--c",s.couleur||"#72a45a");
    a.innerHTML=`<img class="photo" src="${s.photo}?v=${Date.now()}" alt="${s.titre}">
      <div class="info"><div class="icon" style="background:${s.couleur||"#72a45a"}">${s.icone||"📍"}</div>
      <div class="copy"><div class="ctitle">${s.titre}</div><div class="city">${s.commune||""}</div></div><div class="arrow">›</div></div>`;
    a.onclick=()=>openSite(id);box.appendChild(a);
  });
}
function openSite(id){
  current=id;const s=CFG.lieux[id];$("#micon").textContent=s.icone||"📍";$("#mtitle").textContent=s.titre;
  $("#modal").classList.remove("hidden");speak(s.phrase_lieu?.[currentLang]||"",currentLang);
}
function chooseLanguage(lang,announce=true){
  currentLang=lang;sessionStorage.setItem("kettyLang",lang);applyUI();build();
  $("#languageSplash").classList.add("hidden");
  if(announce)speak(ui().annonce_langue,currentLang);
}
$("#close").onclick=()=>{$("#modal").classList.add("hidden");speechSynthesis.cancel()};
$("#replay").onclick=()=>current&&speak(CFG.lieux[current].phrase_lieu?.[currentLang]||"",currentLang);
$("#go").onclick=()=>{
  if(!current)return;
  const arr=CFG.phrases_tally_aleatoires?.[currentLang]||[];
  const r=(arr.length?arr[Math.floor(Math.random()*arr.length)]+" ":"")+(CFG.phrase_tally_finale?.[currentLang]||"");
  const base=CFG.tally_url?.[currentLang];
  if(!base||base.startsWith("URL_")){alert(currentLang==="fr"?"Le formulaire Tally n'est pas encore configuré.":"The English Tally form is not configured yet.");return}
  const url=`${base}?lieu=${encodeURIComponent(current)}&langue=${encodeURIComponent(currentLang)}`;
  let done=false;const go=()=>{if(done)return;done=true;location.href=url};
  speak(r,currentLang,go);setTimeout(go,Math.max(5000,r.length*70));
};
document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>chooseLanguage(b.dataset.lang,true)));

function initVoiceSettings(){
  loadVoices();applySavedVoiceSettings();
  const adminMode=new URLSearchParams(location.search).get("admin")==="1";
  $("#voiceSettingsBtn").style.display=adminMode?"block":"none";
  speechSynthesis.onvoiceschanged=loadVoices;setTimeout(loadVoices,300);setTimeout(loadVoices,1200);
  $("#voiceSettingsBtn").onclick=()=>{$("#voiceSettingsModal").classList.remove("hidden");loadVoices();applySavedVoiceSettings()};
  $("#closeVoiceSettings").onclick=()=>{saveVoiceSettings();$("#voiceSettingsModal").classList.add("hidden")};
  ["fr","en"].forEach(lang=>{
    const L=lang==="fr"?"Fr":"En";
    $(`#voiceSelect${L}`).onchange=saveVoiceSettings;
    $(`#rateRange${L}`).oninput=()=>{$(`#rateValue${L}`).textContent=Number($(`#rateRange${L}`).value).toFixed(2);saveVoiceSettings()};
    $(`#pitchRange${L}`).oninput=()=>{$(`#pitchValue${L}`).textContent=Number($(`#pitchRange${L}`).value).toFixed(2);saveVoiceSettings()};
    $(`#testVoice${L}`).onclick=()=>{saveVoiceSettings();speak(lang==="fr"?"Bonjour, je suis Ketty. Test de la voix française.":"Hello, I'm Ketty. This is my English voice.",lang)};
  });
}
initVoiceSettings();
fetch("config.json?v="+Date.now()).then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.json()}).then(c=>{
  CFG=c;applyUI();build();
}).catch(e=>{console.error(e);alert("Impossible de charger config.json")});
