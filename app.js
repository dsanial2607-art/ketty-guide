let CFG=null,currentId=null,voices=[];
const $=id=>document.getElementById(id), key=x=>"ketty_"+x;
function setting(k,d){return localStorage.getItem(key(k))??d}
function loadVoices(){
 voices=speechSynthesis.getVoices().filter(v=>(v.lang||"").toLowerCase().startsWith("fr"));
 const s=$("voiceSelect"),saved=setting("voice","");s.innerHTML="";
 if(!voices.length){let o=document.createElement("option");o.value="";o.textContent="Voix française par défaut";s.appendChild(o);return}
 voices.forEach(v=>{let o=document.createElement("option");o.value=v.name;o.textContent=v.name+" — "+v.lang;if(v.name===saved)o.selected=true;s.appendChild(o)})
}
function speak(t,onend){
 try{speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(t);u.lang="fr-FR";
 let v=voices.find(x=>x.name===setting("voice",""));if(v)u.voice=v;
 u.rate=parseFloat(setting("rate",".95"));u.pitch=parseFloat(setting("pitch","1.05"));
 if(onend)u.onend=onend;speechSynthesis.speak(u)}catch(e){if(onend)onend()}
}
function openPlace(id){
 let l=CFG.lieux[id];if(!l)return;currentId=id;$("modalIcon").textContent=l.icone;$("modalTitle").textContent=l.titre;
 $("modal").classList.remove("hidden");speak(l.phrase_lieu)
}
function closeVisitor(){try{speechSynthesis.cancel()}catch(e){};$("modal").classList.add("hidden");currentId=null}
function randomTallyPhrase(){
 let a=CFG.phrases_tally_aleatoires||[];return a.length?a[Math.floor(Math.random()*a.length)]:"";
}
function goTally(){
 if(!currentId)return;
 let id=currentId, first=randomTallyPhrase(), final=CFG.phrase_tally_finale||"";
 let text=[first,final].filter(Boolean).join(" ");
 // Tally opens only after Ketty has finished the randomly selected prompt.
 speak(text,()=>{location.href=CFG.tally_url+"?lieu="+encodeURIComponent(id)});
}
function showVals(){$("rateValue").textContent=$("rate").value;$("pitchValue").textContent=$("pitch").value}
async function init(){
 CFG=await fetch("config.json?v="+Date.now()).then(r=>r.json());
 loadVoices();speechSynthesis.onvoiceschanged=loadVoices;
 document.querySelectorAll(".hotspot").forEach(b=>b.onclick=()=>openPlace(b.dataset.id));
 $("close").onclick=closeVisitor;$("listen").onclick=()=>currentId&&speak(CFG.lieux[currentId].phrase_lieu);$("continue").onclick=goTally;
 $("adminOpen").onclick=()=>{loadVoices();$("rate").value=setting("rate",".95");$("pitch").value=setting("pitch","1.05");showVals();$("admin").classList.remove("hidden")};
 $("adminClose").onclick=()=>$("admin").classList.add("hidden");$("rate").oninput=showVals;$("pitch").oninput=showVals;
 $("voiceTest").onclick=()=>speak("Coucou ! Moi, c'est Ketty. Alors, où est-ce qu'on part aujourd'hui ?");
 $("save").onclick=()=>{localStorage.setItem(key("voice"),$("voiceSelect").value);localStorage.setItem(key("rate"),$("rate").value);localStorage.setItem(key("pitch"),$("pitch").value);$("admin").classList.add("hidden")}
}
document.addEventListener("DOMContentLoaded",init);
