var CFG = {};
var current = null;
var currentLang = "fr";
try {
  currentLang = sessionStorage.getItem("kettyLang") || "fr";
} catch(e) {}

function byId(id){ return document.getElementById(id); }
function all(selector){ return document.querySelectorAll(selector); }

var availableVoices = [];
var VOICE_STORAGE_KEY = "kettyVoiceSettingsBilingual";

function getVoiceSettings(){
  try {
    var x = JSON.parse(localStorage.getItem(VOICE_STORAGE_KEY));
    return x || {fr:{},en:{}};
  } catch(e) {
    return {fr:{},en:{}};
  }
}

function saveVoiceSettings(){
  var data = getVoiceSettings();
  var langs = ["fr","en"];
  for(var i=0;i<langs.length;i++){
    var lang = langs[i], L = lang==="fr" ? "Fr" : "En";
    var sel = byId("voiceSelect"+L);
    var rate = byId("rateRange"+L);
    var pitch = byId("pitchRange"+L);
    data[lang] = {
      voiceName: sel ? sel.value : "",
      rate: rate ? parseFloat(rate.value || "1") : 1,
      pitch: pitch ? parseFloat(pitch.value || "1") : 1
    };
  }
  try { localStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
}

function populateVoiceSelect(lang){
  var L = lang==="fr" ? "Fr" : "En";
  var sel = byId("voiceSelect"+L);
  if(!sel) return;
  var prefix = lang==="fr" ? "fr" : "en";
  var list = [], i, v, o;
  for(i=0;i<availableVoices.length;i++){
    v=availableVoices[i];
    if(((v.lang||"").toLowerCase()).indexOf(prefix)===0) list.push(v);
  }
  if(!list.length) list=availableVoices;
  sel.innerHTML="";
  for(i=0;i<list.length;i++){
    v=list[i];
    o=document.createElement("option");
    o.value=v.name;
    o.appendChild(document.createTextNode(v.name+" — "+(v.lang||"")));
    sel.appendChild(o);
  }
  var saved=(getVoiceSettings()[lang]||{}).voiceName||"";
  if(saved){
    for(i=0;i<sel.options.length;i++){
      if(sel.options[i].value===saved){ sel.selectedIndex=i; break; }
    }
  } else if(lang==="en"){
    for(i=0;i<sel.options.length;i++){
      for(var j=0;j<availableVoices.length;j++){
        if(availableVoices[j].name===sel.options[i].value &&
           ((availableVoices[j].lang||"").toLowerCase()).indexOf("en-gb")===0){
          sel.selectedIndex=i; return;
        }
      }
    }
  }
}

function loadVoices(){
  try{
    if(window.speechSynthesis){
      availableVoices=window.speechSynthesis.getVoices()||[];
      populateVoiceSelect("fr");
      populateVoiceSelect("en");
    }
  }catch(e){}
}

function applySavedVoiceSettings(){
  var data=getVoiceSettings(), langs=["fr","en"];
  for(var i=0;i<langs.length;i++){
    var lang=langs[i], L=lang==="fr"?"Fr":"En", s=data[lang]||{};
    var r=typeof s.rate==="number"?s.rate:1;
    var p=typeof s.pitch==="number"?s.pitch:1;
    if(byId("rateRange"+L)) byId("rateRange"+L).value=r;
    if(byId("rateValue"+L)) byId("rateValue"+L).innerHTML=Number(r).toFixed(2);
    if(byId("pitchRange"+L)) byId("pitchRange"+L).value=p;
    if(byId("pitchValue"+L)) byId("pitchValue"+L).innerHTML=Number(p).toFixed(2);
  }
}

/* Voice is optional: the guide must remain usable even if KettyBot's WebView
   exposes speechSynthesis but produces no sound. */
function speak(text, lang, end){
  var finished=false;
  function done(){
    if(finished) return;
    finished=true;
    if(end) end();
  }
  if(!text){ done(); return; }
  try{
    if(window.speechSynthesis && window.SpeechSynthesisUtterance){
      window.speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(text);
      var s=getVoiceSettings()[lang]||{};
      u.lang=lang==="fr"?"fr-FR":"en-GB";
      u.rate=typeof s.rate==="number"?s.rate:1;
      u.pitch=typeof s.pitch==="number"?s.pitch:1;
      for(var i=0;i<availableVoices.length;i++){
        if(availableVoices[i].name===s.voiceName){u.voice=availableVoices[i];break;}
      }
      u.onend=done;
      u.onerror=done;
      window.speechSynthesis.speak(u);
      /* Never block navigation on a missing/broken WebView voice. */
      if(end) setTimeout(done, 1800);
      return;
    }
  }catch(e){}
  done();
}

function setCssVar(n,v){
  if(v && document.documentElement.style.setProperty) document.documentElement.style.setProperty(n,v);
}
function ui(){
  var t = CFG.interface && CFG.interface.textes;
  return (t && t[currentLang]) ? t[currentLang] : {};
}
function applyUI(){
  var base=CFG.interface||{}, u=ui();
  setCssVar("--bg",base.couleur_fond);
  setCssVar("--ink",base.couleur_texte);
  setCssVar("--accent",base.couleur_principale);
  setCssVar("--footer",base.couleur_footer);

  if(byId("ketty")) byId("ketty").src=base.ketty_image||"";
  if(byId("title")) byId("title").innerHTML=u.titre||"";
  if(byId("instruction")) byId("instruction").innerHTML=u.instruction||"";
  if(byId("sub")) byId("sub").innerHTML=u.sous_instruction||"";
  if(byId("bubble")) byId("bubble").innerHTML=u.bulle_ketty||"";
  if(byId("brandName")) byId("brandName").innerHTML=u.nom_destination||"";
  if(byId("brandSignature")) byId("brandSignature").innerHTML=u.signature_destination||"";
  if(byId("footerText")) byId("footerText").innerHTML=u.footer||"";
  if(byId("mmessage")) byId("mmessage").innerHTML=u.message_modal||"";
  if(byId("replay")) byId("replay").innerHTML=u.bouton_reecouter||"";
  if(byId("go")) byId("go").innerHTML=u.bouton_continuer||"";

  var logo=byId("officeLogo");
  if(logo){
    if(base.afficher_logo_ot===false || !base.logo_ot) logo.style.display="none";
    else { logo.style.display="block"; logo.src=base.logo_ot; logo.alt=base.logo_alt||""; }
  }
  document.documentElement.lang=currentLang;
  var bs=all("#languageSwitch button");
  for(var i=0;i<bs.length;i++){
    if(bs[i].getAttribute("data-lang")===currentLang) bs[i].className="active";
    else bs[i].className="";
  }
}

function shuffledKeys(obj){
  var a=[], k;
  for(k in obj) if(Object.prototype.hasOwnProperty.call(obj,k)) a.push(k);
  for(var i=a.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1)), tmp=a[i]; a[i]=a[j]; a[j]=tmp;
  }
  return a;
}

function build(){
  var box=byId("cards");
  if(!box) return;
  box.innerHTML="";
  var lieux=CFG.lieux||{};
  var ids=shuffledKeys(lieux);
  for(var i=0;i<ids.length;i++){
    (function(id){
      var s=lieux[id];
      var a=document.createElement("article");
      a.className="card";
      a.style.setProperty("--c",s.couleur||"#72a45a");

      var img=document.createElement("img");
      img.className="photo"; img.src=s.photo||""; img.alt=s.titre||"";
      a.appendChild(img);

      var info=document.createElement("div"); info.className="info";
      var icon=document.createElement("div"); icon.className="icon"; icon.style.background=s.couleur||"#72a45a"; icon.innerHTML=s.icone||"📍";
      var copy=document.createElement("div"); copy.className="copy";
      var title=document.createElement("div"); title.className="ctitle"; title.appendChild(document.createTextNode(s.titre||""));
      var city=document.createElement("div"); city.className="city"; city.appendChild(document.createTextNode(s.commune||""));
      var arrow=document.createElement("div"); arrow.className="arrow"; arrow.innerHTML="›";
      copy.appendChild(title); copy.appendChild(city);
      info.appendChild(icon); info.appendChild(copy); info.appendChild(arrow);
      a.appendChild(info);
      a.onclick=function(){openSite(id);};
      box.appendChild(a);
    })(ids[i]);
  }
}

function openSite(id){
  current=id;
  var s=CFG.lieux[id];
  if(!s) return;
  byId("micon").innerHTML=s.icone||"📍";
  byId("mtitle").innerHTML=s.titre||"";
  byId("modal").className="modal";
  var phrase=(s.phrase_lieu && s.phrase_lieu[currentLang]) || "";
  speak(phrase,currentLang);
}

function chooseLanguage(lang,announce){
  currentLang=lang;
  try{sessionStorage.setItem("kettyLang",lang);}catch(e){}
  applyUI(); build();
  byId("languageSplash").className="language-splash hidden";
  if(announce) speak(ui().annonce_langue||"",currentLang);
}

function closeModal(){
  byId("modal").className="modal hidden";
  try{if(window.speechSynthesis)window.speechSynthesis.cancel();}catch(e){}
}

function replay(){
  if(!current) return;
  var s=CFG.lieux[current];
  speak((s.phrase_lieu&&s.phrase_lieu[currentLang])||"",currentLang);
}

function continueRoute(){
  if(!current) return;
  var arr=(CFG.phrases_tally_aleatoires&&CFG.phrases_tally_aleatoires[currentLang])||[];
  var r=(arr.length?arr[Math.floor(Math.random()*arr.length)]+" ":"")+((CFG.phrase_tally_finale&&CFG.phrase_tally_finale[currentLang])||"");
  var t=CFG.tally_url||{};
  var base=t[currentLang];
  if(!base || base.indexOf("URL_")===0){
    alert(currentLang==="fr"?"Le formulaire Tally n'est pas encore configuré.":"The English Tally form is not configured yet.");
    return;
  }
  var url=base+"?lieu="+encodeURIComponent(current)+"&langue="+encodeURIComponent(currentLang);
  speak(r,currentLang,function(){window.location.href=url;});
}

function getQueryParam(name){
  var q=window.location.search||"";
  if(q.charAt(0)==="?")q=q.substring(1);
  var parts=q.split("&");
  for(var i=0;i<parts.length;i++){
    var p=parts[i].split("=");
    if(decodeURIComponent(p[0]||"")===name)return decodeURIComponent((p[1]||"").replace(/\+/g," "));
  }
  return null;
}

function initVoiceSettings(){
  loadVoices(); applySavedVoiceSettings();
  var btn=byId("voiceSettingsBtn");
  if(btn) btn.style.display=getQueryParam("admin")==="1"?"block":"none";
  try{
    if(window.speechSynthesis) window.speechSynthesis.onvoiceschanged=loadVoices;
  }catch(e){}
  setTimeout(loadVoices,300); setTimeout(loadVoices,1200);

  if(btn) btn.onclick=function(){byId("voiceSettingsModal").className="voice-settings-modal";loadVoices();applySavedVoiceSettings();};
  if(byId("closeVoiceSettings")) byId("closeVoiceSettings").onclick=function(){saveVoiceSettings();byId("voiceSettingsModal").className="voice-settings-modal hidden";};

  var langs=["fr","en"];
  for(var i=0;i<langs.length;i++){
    (function(lang){
      var L=lang==="fr"?"Fr":"En";
      var sel=byId("voiceSelect"+L), rr=byId("rateRange"+L), pr=byId("pitchRange"+L), tv=byId("testVoice"+L);
      if(sel)sel.onchange=saveVoiceSettings;
      if(rr)rr.oninput=function(){byId("rateValue"+L).innerHTML=Number(rr.value).toFixed(2);saveVoiceSettings();};
      if(pr)pr.oninput=function(){byId("pitchValue"+L).innerHTML=Number(pr.value).toFixed(2);saveVoiceSettings();};
      if(tv)tv.onclick=function(){saveVoiceSettings();speak(lang==="fr"?"Bonjour, je suis Ketty. Test de la voix française.":"Hello, I'm Ketty. This is my English voice.",lang);};
    })(langs[i]);
  }

  /* Hidden admin access: 3 quick taps in upper-right corner */
  var taps=0, timer=null;
  document.addEventListener("click",function(ev){
    var w=window.innerWidth||document.documentElement.clientWidth;
    var h=window.innerHeight||document.documentElement.clientHeight;
    if(ev.clientX>w-140 && ev.clientY<140){
      taps++;
      if(timer)clearTimeout(timer);
      timer=setTimeout(function(){taps=0;},1800);
      if(taps>=3){
        taps=0;
        if(btn){btn.style.display="block";btn.click();}
      }
    }
  },false);
}

function bindUI(){
  if(byId("close"))byId("close").onclick=closeModal;
  if(byId("replay"))byId("replay").onclick=replay;
  if(byId("go"))byId("go").onclick=continueRoute;
  var bs=all("[data-lang]");
  for(var i=0;i<bs.length;i++){
    bs[i].onclick=function(){chooseLanguage(this.getAttribute("data-lang"),true);};
  }
}

function loadConfig(){
  var xhr=new XMLHttpRequest();
  xhr.open("GET","config.json?t="+new Date().getTime(),true);
  xhr.onreadystatechange=function(){
    if(xhr.readyState!==4)return;
    if(xhr.status===200 || xhr.status===0){
      try{
        CFG=JSON.parse(xhr.responseText);
        applyUI(); build();
      }catch(e){
        alert("Impossible de lire config.json");
      }
    }else{
      alert("Impossible de charger config.json");
    }
  };
  xhr.send(null);
}

bindUI();
initVoiceSettings();
loadConfig();
