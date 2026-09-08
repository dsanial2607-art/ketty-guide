const TALLY_URL = "https://tally.so/r/1Ae6lW";

const LIEUX = {
  palais: {
    titre: "Palais idéal du Facteur Cheval",
    icone: "🏰",
    actif: true,
    texte_robot: "Vous cherchez le Palais idéal du Facteur Cheval ? Bonne nouvelle, c'est juste à côté de l'Office de tourisme ! Je vais vous aider à récupérer votre itinéraire sur votre téléphone."
  },
  oasis: {
    titre: "Parc Oasis Aventura",
    icone: "🌳",
    actif: true,
    texte_robot: "Vous souhaitez vous rendre au Parc Oasis Aventura ? Parfait ! Je vais vous aider à récupérer votre itinéraire sur votre téléphone."
  }
};

let currentId = null;
const $ = id => document.getElementById(id);

function speak(text){
  if(!text) return;
  try{
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = 1;
    u.pitch = 1.05;
    speechSynthesis.speak(u);
  }catch(e){}
}

function openPlace(id){
  const l = LIEUX[id];
  if(!l || !l.actif) return;
  currentId = id;
  $("modalIcon").textContent = l.icone || "📍";
  $("modalTitle").textContent = l.titre;
  $("modalText").textContent = l.texte_robot;
  $("modal").classList.remove("hidden");
  speak(l.texte_robot);
}

function closeModal(){
  try{ speechSynthesis.cancel(); }catch(e){}
  $("modal").classList.add("hidden");
  currentId = null;
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".hotspot").forEach(btn => {
    btn.addEventListener("click", () => openPlace(btn.dataset.id));
  });

  $("close").addEventListener("click", closeModal);

  $("modal").addEventListener("click", e => {
    if(e.target === $("modal")) closeModal();
  });

  $("listen").addEventListener("click", () => {
    if(currentId) speak(LIEUX[currentId].texte_robot);
  });

  $("continue").addEventListener("click", () => {
    if(!currentId) return;
    try{ speechSynthesis.cancel(); }catch(e){}
    window.location.href = TALLY_URL + "?lieu=" + encodeURIComponent(currentId);
  });
});
