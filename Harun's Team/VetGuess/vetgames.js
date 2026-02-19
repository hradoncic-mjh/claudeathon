// ============================================================
// VetGames — Daily Veterinary Brain Training
// Pure vanilla JS — no build tools, no npm, no frameworks
// ============================================================

(function () {
  "use strict";

  // ==================== STORAGE ====================
  const Storage = {
    get(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} },
    del(key) { try { localStorage.removeItem(key); } catch (e) {} }
  };

  // ==================== HELPERS ====================
  const getDayNumber = () => Math.floor((new Date() - new Date(2025, 0, 1)) / 86400000);
  const seededRandom = (seed) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };
  const el = (tag, attrs, ...children) => {
    const e = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => {
      if (k === "style" && typeof v === "object") Object.assign(e.style, v);
      else if (k.startsWith("on")) e.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === "className") e.className = v;
      else if (k === "innerHTML") e.innerHTML = v;
      else e.setAttribute(k, v);
    });
    children.flat(Infinity).forEach(c => { if (c != null) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  };
  const svg = (html) => { const d = document.createElement("div"); d.innerHTML = html; return d.firstElementChild; };

  // ==================== CLINICAL DATABASE ====================
  const ENTRIES = [
    { name:"Canine Parvovirus", species:"Dog", breed:"All breeds", system:"Gastrointestinal", symptom:"Hemorrhagic diarrhea", diagnosis:"ELISA fecal test", treatment:"IV fluids + antiemetics", prognosis:"Guarded", zoonotic:"No", urgency:"Emergency" },
    { name:"Feline Lower Urinary Tract Disease", species:"Cat", breed:"Persian", system:"Urinary", symptom:"Stranguria", diagnosis:"Urinalysis + imaging", treatment:"Diet change + pain mgmt", prognosis:"Good", zoonotic:"No", urgency:"Urgent" },
    { name:"Gastric Dilatation-Volvulus", species:"Dog", breed:"Great Dane", system:"Gastrointestinal", symptom:"Non-productive retching", diagnosis:"Right lateral radiograph", treatment:"Emergency surgery", prognosis:"Guarded", zoonotic:"No", urgency:"Emergency" },
    { name:"Feline Infectious Peritonitis", species:"Cat", breed:"All breeds", system:"Multisystemic", symptom:"Ascites + fever", diagnosis:"Rivalta test + PCR", treatment:"GS-441524 antiviral", prognosis:"Poor", zoonotic:"No", urgency:"Urgent" },
    { name:"Canine Hip Dysplasia", species:"Dog", breed:"German Shepherd", system:"Musculoskeletal", symptom:"Bunny-hopping gait", diagnosis:"PennHIP radiograph", treatment:"Total hip replacement", prognosis:"Good", zoonotic:"No", urgency:"Elective" },
    { name:"Avian Psittacosis", species:"Bird", breed:"African Grey", system:"Respiratory", symptom:"Dyspnea + nasal discharge", diagnosis:"PCR Chlamydia psittaci", treatment:"Doxycycline 45 days", prognosis:"Fair", zoonotic:"Yes", urgency:"Urgent" },
    { name:"Equine Colic", species:"Horse", breed:"Thoroughbred", system:"Gastrointestinal", symptom:"Pawing + rolling", diagnosis:"Rectal palpation + US", treatment:"Flunixin + nasogastric tube", prognosis:"Variable", zoonotic:"No", urgency:"Emergency" },
    { name:"Canine Addison Disease", species:"Dog", breed:"Standard Poodle", system:"Endocrine", symptom:"Waxing-waning lethargy", diagnosis:"ACTH stimulation test", treatment:"DOCP + prednisone", prognosis:"Good", zoonotic:"No", urgency:"Urgent" },
    { name:"Feline Hyperthyroidism", species:"Cat", breed:"Domestic Shorthair", system:"Endocrine", symptom:"Weight loss + polyphagia", diagnosis:"Total T4 elevation", treatment:"Methimazole or I-131", prognosis:"Good", zoonotic:"No", urgency:"Routine" },
    { name:"Reptile Metabolic Bone Disease", species:"Reptile", breed:"Bearded Dragon", system:"Musculoskeletal", symptom:"Jaw softening + tremors", diagnosis:"Radiograph + ionized Ca", treatment:"Ca gluconate + UVB", prognosis:"Fair", zoonotic:"No", urgency:"Urgent" },
    { name:"Canine Bloat Prophylaxis", species:"Dog", breed:"Weimaraner", system:"Gastrointestinal", symptom:"Deep-chested breed risk", diagnosis:"Breed risk assessment", treatment:"Prophylactic gastropexy", prognosis:"Excellent", zoonotic:"No", urgency:"Elective" },
    { name:"Canine Lymphoma", species:"Dog", breed:"Golden Retriever", system:"Oncology", symptom:"Peripheral lymphadenopathy", diagnosis:"Fine needle aspirate", treatment:"CHOP chemotherapy", prognosis:"Fair", zoonotic:"No", urgency:"Urgent" },
    { name:"Feline Asthma", species:"Cat", breed:"Siamese", system:"Respiratory", symptom:"Expiratory wheeze", diagnosis:"Thoracic radiograph", treatment:"Fluticasone inhaler", prognosis:"Good", zoonotic:"No", urgency:"Routine" },
    { name:"Canine Intervertebral Disc Disease", species:"Dog", breed:"Dachshund", system:"Neurological", symptom:"Acute paraplegia", diagnosis:"MRI spine", treatment:"Hemilaminectomy", prognosis:"Guarded", zoonotic:"No", urgency:"Emergency" },
    { name:"Rabbit GI Stasis", species:"Rabbit", breed:"Holland Lop", system:"Gastrointestinal", symptom:"Anorexia + no fecal output", diagnosis:"Abdominal radiograph", treatment:"Metoclopramide + syringe feed", prognosis:"Fair", zoonotic:"No", urgency:"Urgent" },
    { name:"Canine Cranial Cruciate Rupture", species:"Dog", breed:"Labrador Retriever", system:"Musculoskeletal", symptom:"Acute hindlimb lameness", diagnosis:"Tibial thrust test", treatment:"TPLO surgery", prognosis:"Good", zoonotic:"No", urgency:"Elective" },
    { name:"Feline Panleukopenia", species:"Cat", breed:"All breeds", system:"Gastrointestinal", symptom:"Severe vomiting + leukopenia", diagnosis:"Canine parvo SNAP test", treatment:"IV fluids + antiemetics", prognosis:"Guarded", zoonotic:"No", urgency:"Emergency" },
    { name:"Equine Laminitis", species:"Horse", breed:"Quarter Horse", system:"Musculoskeletal", symptom:"Sawhorse stance + bounding digital pulse", diagnosis:"Lateral hoof radiograph", treatment:"Cryotherapy + NSAIDs", prognosis:"Guarded", zoonotic:"No", urgency:"Emergency" },
    { name:"Canine Dilated Cardiomyopathy", species:"Dog", breed:"Doberman Pinscher", system:"Cardiovascular", symptom:"Exercise intolerance + syncope", diagnosis:"Echocardiogram", treatment:"Pimobendan + furosemide", prognosis:"Poor", zoonotic:"No", urgency:"Urgent" },
    { name:"Feline Chronic Kidney Disease", species:"Cat", breed:"Maine Coon", system:"Urinary", symptom:"PU/PD + weight loss", diagnosis:"SDMA + urine SG", treatment:"Renal diet + SQ fluids", prognosis:"Fair", zoonotic:"No", urgency:"Routine" },
    { name:"Canine Immune-Mediated Hemolytic Anemia", species:"Dog", breed:"Cocker Spaniel", system:"Hematologic", symptom:"Jaundice + lethargy", diagnosis:"Saline agglutination test", treatment:"Immunosuppressive steroids", prognosis:"Guarded", zoonotic:"No", urgency:"Emergency" },
    { name:"Tortoise Respiratory Infection", species:"Reptile", breed:"Russian Tortoise", system:"Respiratory", symptom:"Nasal bubbling + gaping", diagnosis:"Culture + cytology", treatment:"Ceftazidime injection", prognosis:"Fair", zoonotic:"No", urgency:"Urgent" },
    { name:"Canine Cushing Syndrome", species:"Dog", breed:"Miniature Schnauzer", system:"Endocrine", symptom:"Pot-bellied + PU/PD", diagnosis:"Low-dose dex suppression", treatment:"Trilostane", prognosis:"Good", zoonotic:"No", urgency:"Routine" },
    { name:"Ferret Insulinoma", species:"Small Mammal", breed:"Ferret", system:"Endocrine", symptom:"Episodic collapse + ptyalism", diagnosis:"Fasting blood glucose", treatment:"Prednisolone + diazoxide", prognosis:"Fair", zoonotic:"No", urgency:"Urgent" },
    { name:"Canine Atopic Dermatitis", species:"Dog", breed:"French Bulldog", system:"Dermatologic", symptom:"Pruritus + erythema", diagnosis:"Intradermal allergy test", treatment:"Oclacitinib (Apoquel)", prognosis:"Good", zoonotic:"No", urgency:"Routine" },
    { name:"Feline Hypertrophic Cardiomyopathy", species:"Cat", breed:"Ragdoll", system:"Cardiovascular", symptom:"Auscultation murmur + gallop", diagnosis:"Echocardiogram", treatment:"Atenolol + clopidogrel", prognosis:"Guarded", zoonotic:"No", urgency:"Urgent" },
    { name:"Canine Osteosarcoma", species:"Dog", breed:"Rottweiler", system:"Oncology", symptom:"Firm metaphyseal swelling", diagnosis:"Radiograph + biopsy", treatment:"Amputation + carboplatin", prognosis:"Poor", zoonotic:"No", urgency:"Urgent" },
    { name:"Guinea Pig Scurvy", species:"Small Mammal", breed:"Guinea Pig", system:"Nutritional", symptom:"Swollen joints + petechiae", diagnosis:"Dietary history + response", treatment:"Vitamin C supplementation", prognosis:"Excellent", zoonotic:"No", urgency:"Routine" },
    { name:"Canine Heartworm Disease", species:"Dog", breed:"All breeds", system:"Cardiovascular", symptom:"Cough + exercise intolerance", diagnosis:"Antigen + microfilaria test", treatment:"Melarsomine protocol", prognosis:"Fair", zoonotic:"No", urgency:"Urgent" },
    { name:"Feline Diabetes Mellitus", species:"Cat", breed:"Burmese", system:"Endocrine", symptom:"PU/PD + plantigrade stance", diagnosis:"Fructosamine + glucose curve", treatment:"Glargine insulin + diet", prognosis:"Good", zoonotic:"No", urgency:"Routine" },
  ];

  const ATTRS = ["species","system","symptom","diagnosis","treatment","prognosis","urgency","zoonotic"];
  const ATTR_LABELS = {species:"Species",system:"System",symptom:"Symptom",diagnosis:"Dx",treatment:"Tx",prognosis:"Prog",urgency:"Urgency",zoonotic:"Zoon"};
  const REL = {
    species:{Dog:"Domestic",Cat:"Domestic",Horse:"Equid",Bird:"Exotic",Reptile:"Exotic",Rabbit:"Exotic","Small Mammal":"Exotic"},
    system:{Gastrointestinal:"Visceral",Urinary:"Visceral",Respiratory:"Visceral",Cardiovascular:"Visceral",Musculoskeletal:"Structural",Dermatologic:"Structural",Neurological:"Neural",Endocrine:"Regulatory",Hematologic:"Systemic",Oncology:"Systemic",Multisystemic:"Systemic",Nutritional:"Systemic"},
    prognosis:{Excellent:4,Good:3,Fair:2,Guarded:1,Poor:0,Variable:2},
    urgency:{Emergency:3,Urgent:2,Routine:1,Elective:0},
    zoonotic:{}
  };
  const compAttr = (a,gv,tv) => { if(gv===tv)return"green"; const r=REL[a]; if(!r)return"gray"; if(typeof r[gv]==="number"&&typeof r[tv]==="number")return Math.abs(r[gv]-r[tv])<=1?"yellow":"gray"; if(r[gv]&&r[tv]&&r[gv]===r[tv])return"yellow"; return"gray"; };
  const compGuess = (g,t) => ATTRS.map(a=>({attr:a,value:g[a],result:compAttr(a,g[a],t[a])}));

  const THEMES = [
    {name:"Emergency Medicine",icon:"🚨",weeks:["GI Emergencies","Cardiac Crisis","Toxicology","Trauma"]},
    {name:"Exotic Patients",icon:"🦎",weeks:["Reptiles","Avian","Small Mammals","Mixed Exotic"]},
    {name:"Internal Medicine",icon:"🔬",weeks:["Endocrine","Nephrology","Oncology","Hematology"]},
  ];

  // ==================== CONNECTIONS PUZZLES ====================
  const CONN_PUZZLES = [
    { groups:[{name:"NSAID Pain Relievers",color:"#4CAF50",words:["Meloxicam","Carprofen","Firocoxib","Deracoxib"]},{name:"Antiparasitic Drugs",color:"#FFC107",words:["Ivermectin","Fenbendazole","Praziquantel","Selamectin"]},{name:"Cranial Nerves",color:"#42A5F5",words:["Trigeminal","Vagus","Hypoglossal","Vestibulocochlear"]},{name:"Zoonotic Diseases",color:"#EF5350",words:["Leptospirosis","Rabies","Brucellosis","Psittacosis"]}] },
    { groups:[{name:"Cardiac Drugs",color:"#4CAF50",words:["Pimobendan","Atenolol","Digoxin","Furosemide"]},{name:"Liver Enzymes",color:"#FFC107",words:["ALT","AST","ALP","GGT"]},{name:"Surgical Procedures",color:"#42A5F5",words:["TPLO","Gastropexy","Hemilaminectomy","Enucleation"]},{name:"Vaccine-Preventable",color:"#EF5350",words:["Distemper","Parvovirus","Leptospirosis","Bordetella"]}] },
    { groups:[{name:"Blood Cell Types",color:"#4CAF50",words:["Neutrophil","Lymphocyte","Eosinophil","Monocyte"]},{name:"GI Medications",color:"#FFC107",words:["Metoclopramide","Omeprazole","Sucralfate","Maropitant"]},{name:"Endocrine Disorders",color:"#42A5F5",words:["Cushing","Addison","Hypothyroidism","Insulinoma"]},{name:"Orthopedic Tests",color:"#EF5350",words:["Ortolani","Drawer","Tibial thrust","Barlow"]}] },
    { groups:[{name:"Dermatology Terms",color:"#4CAF50",words:["Alopecia","Pyoderma","Pruritus","Erythema"]},{name:"Anesthetic Agents",color:"#FFC107",words:["Propofol","Isoflurane","Ketamine","Dexmedetomidine"]},{name:"Radiograph Views",color:"#42A5F5",words:["Ventrodorsal","Lateral","Oblique","Skyline"]},{name:"Electrolytes",color:"#EF5350",words:["Potassium","Sodium","Chloride","Calcium"]}] },
    { groups:[{name:"Antibiotics",color:"#4CAF50",words:["Amoxicillin","Enrofloxacin","Metronidazole","Cephalexin"]},{name:"Kidney Values",color:"#FFC107",words:["BUN","Creatinine","SDMA","Phosphorus"]},{name:"Intestinal Parasites",color:"#42A5F5",words:["Roundworm","Hookworm","Whipworm","Tapeworm"]},{name:"Bone Anatomy",color:"#EF5350",words:["Femur","Humerus","Tibia","Radius"]}] },
    { groups:[{name:"Emergency Presentations",color:"#4CAF50",words:["Dyspnea","Seizure","Hemorrhage","Collapse"]},{name:"Ophthalmic Conditions",color:"#FFC107",words:["Glaucoma","Entropion","Uveitis","Keratitis"]},{name:"Chemotherapy Drugs",color:"#42A5F5",words:["Vincristine","Doxorubicin","Cyclophosphamide","Carboplatin"]},{name:"Fluid Types",color:"#EF5350",words:["Lactated Ringer","Saline","Hetastarch","Dextrose"]}] },
    { groups:[{name:"Heart Sounds",color:"#4CAF50",words:["Murmur","Gallop","Arrhythmia","Splitting"]},{name:"Urinalysis Findings",color:"#FFC107",words:["Crystals","Casts","Proteinuria","Hematuria"]},{name:"Reproductive Terms",color:"#42A5F5",words:["Pyometra","Dystocia","Cryptorchid","Eclampsia"]},{name:"Toxins (Dogs)",color:"#EF5350",words:["Xylitol","Chocolate","Grapes","Onion"]}] },
  ];

  // ==================== CONFETTI ENGINE ====================
  const Confetti = {
    canvas: null, ctx: null, particles: [], animId: null,
    init() { this.canvas = document.getElementById("confetti-canvas"); this.ctx = this.canvas.getContext("2d"); },
    fire() {
      this.canvas.style.display = "block";
      const W = this.canvas.width = window.innerWidth, H = this.canvas.height = window.innerHeight;
      const cols = ["#FF5252","#FF4081","#E040FB","#7C4DFF","#536DFE","#448AFF","#40C4FF","#64FFDA","#69F0AE","#B2FF59","#EEFF41","#FFD740","#FFAB40","#FF6E40"];
      const shapes = ["rect","circle","star","paw"];
      this.particles = [];
      const mkP = (x,y,vx,vy) => ({x,y,vx,vy,size:3+Math.random()*7,color:cols[Math.floor(Math.random()*cols.length)],shape:shapes[Math.floor(Math.random()*shapes.length)],rot:Math.random()*360,rs:(Math.random()-.5)*14,g:.1+Math.random()*.08,drag:.98,life:1,decay:.003+Math.random()*.004,w:Math.random()*10,ws:.04+Math.random()*.08});
      const burst = (cx,cy,n,delay) => { setTimeout(()=>{ for(let i=0;i<n;i++){const a=(Math.PI*2*i)/n+(Math.random()-.5)*.5,sp=8+Math.random()*12; this.particles.push(mkP(cx+(Math.random()-.5)*150,cy+(Math.random()-.5)*80,Math.cos(a)*sp,Math.sin(a)*sp-5));} },delay); };
      const shower = (delay) => { setTimeout(()=>{ for(let i=0;i<60;i++) setTimeout(()=>{this.particles.push(mkP(Math.random()*W,-10,(Math.random()-.5)*3,2+Math.random()*4));},i*25); },delay); };
      burst(W/2,H*.3,50,0); burst(W/2,H*.3,35,200); burst(W*.2,H*.5,40,400); burst(W*.8,H*.5,40,500); shower(600); burst(W/2,H*.3,30,1100); shower(1800);
      const animate = () => {
        this.ctx.clearRect(0,0,W,H);
        this.particles = this.particles.filter(p=>p.life>0);
        for(const p of this.particles) {
          p.vy+=p.g;p.vx*=p.drag;p.vy*=p.drag;p.x+=p.vx+Math.sin(p.w)*.8;p.y+=p.vy;p.w+=p.ws;p.rot+=p.rs;p.life-=p.decay;
          this.ctx.globalAlpha=Math.min(1,p.life*2.5);this.ctx.fillStyle=p.color;
          if(p.shape==="rect"){this.ctx.save();this.ctx.translate(p.x,p.y);this.ctx.rotate(p.rot*Math.PI/180);this.ctx.fillRect(-p.size/2,-p.size/4,p.size,p.size/2);this.ctx.restore();}
          else if(p.shape==="circle"){this.ctx.beginPath();this.ctx.arc(p.x,p.y,p.size/2,0,Math.PI*2);this.ctx.fill();}
          else if(p.shape==="star"){this.ctx.save();this.ctx.translate(p.x,p.y);this.ctx.rotate(p.rot*Math.PI/180);this.ctx.beginPath();for(let i=0;i<5;i++){const a=(i*4*Math.PI)/5-Math.PI/2;this.ctx[i===0?"moveTo":"lineTo"](Math.cos(a)*p.size/2,Math.sin(a)*p.size/2);}this.ctx.closePath();this.ctx.fill();this.ctx.restore();}
          else{this.ctx.save();this.ctx.translate(p.x,p.y);this.ctx.rotate(p.rot*Math.PI/180);const s=p.size*.35;this.ctx.beginPath();this.ctx.arc(0,s*.3,s*1.1,0,Math.PI*2);this.ctx.fill();this.ctx.beginPath();this.ctx.arc(-s*.8,-s*.4,s*.5,0,Math.PI*2);this.ctx.fill();this.ctx.beginPath();this.ctx.arc(s*.8,-s*.4,s*.5,0,Math.PI*2);this.ctx.fill();this.ctx.beginPath();this.ctx.arc(-s*.25,-s*.9,s*.45,0,Math.PI*2);this.ctx.fill();this.ctx.beginPath();this.ctx.arc(s*.25,-s*.9,s*.45,0,Math.PI*2);this.ctx.fill();this.ctx.restore();}
        }
        this.ctx.globalAlpha=1;
        if(this.particles.length>0) this.animId=requestAnimationFrame(animate);
        else this.canvas.style.display="none";
      };
      if(this.animId) cancelAnimationFrame(this.animId);
      this.animId=requestAnimationFrame(animate);
    }
  };

  // ==================== PET SVG GENERATOR ====================
  const PetSVG = {
    _tick: 0, _interval: null,
    start() { if(this._interval) return; this._interval = setInterval(()=>{ this._tick++; document.querySelectorAll(".pet-container").forEach(c=>this.update(c)); },50); },
    stop() { if(this._interval){clearInterval(this._interval);this._interval=null;} },
    update(container) {
      const stage = parseInt(container.dataset.stage||"1");
      const mood = container.dataset.mood||"happy";
      const dancing = container.dataset.dancing === "true";
      const streak = parseInt(container.dataset.streak||"0");
      const t = this._tick;
      const danceBob=dancing?Math.sin(t*.3)*8:0, danceRock=dancing?Math.sin(t*.25)*12:0;
      const dancePawL=dancing?Math.max(0,Math.sin(t*.3))*15:0, dancePawR=dancing?Math.max(0,Math.sin(t*.3+Math.PI))*15:0;
      const danceEarBounce=dancing?Math.abs(Math.sin(t*.3))*8:0, danceHip=dancing?Math.sin(t*.2)*5:0;
      const breathe=dancing?0:Math.sin(t*.04)*2;
      const tailAngle=dancing?Math.sin(t*.4)*40:Math.sin(t*.08)*(mood==="happy"?20:6);
      const earFlop=dancing?danceEarBounce:Math.sin(t*.05)*(mood==="happy"?4:1.5);
      const isBlinking=!dancing&&t%80>75;
      const tongueOut=dancing||(mood==="happy"&&(t%150)<60);
      const hop=dancing?Math.abs(danceBob):(mood==="happy"?Math.abs(Math.sin(t*.04))*2:0);
      const pantSpeed=tongueOut?Math.sin(t*(dancing?.3:.12))*2.5:0;
      const sparkle=stage>=4&&t%30<15;
      const pawLift=dancing?0:(mood==="happy"?Math.max(0,Math.sin(t*.06))*3:0);
      const showBurst=dancing&&(t%30<6);
      const burstEmojis=["⭐","💛","🐾","✨","💖","🌟"];
      const bIdx=Math.floor(t/30)%burstEmojis.length;
      const palettes=[
        {body:"#C4A882",belly:"#E8D5B7",spots:"#A0845C",nose:"#3D2B1F",collar:"#E57373",ear:"#A0845C",tongue:"#E88B95",pad:"#D4A89A"},
        {body:"#D4A76A",belly:"#F0DFC0",spots:"#B08040",nose:"#3D2B1F",collar:"#42A5F5",ear:"#B08040",tongue:"#E88B95",pad:"#D4A89A"},
        {body:"#8E6AC8",belly:"#C4A8F0",spots:"#6A4BA0",nose:"#2A1B3D",collar:"#FFD740",ear:"#6A4BA0",tongue:"#D88BE8",pad:"#B898D4"},
        {body:"#FFB74D",belly:"#FFF3E0",spots:"#F09030",nose:"#4E3520",collar:"#FF5252",ear:"#F09030",tongue:"#FF8A95",pad:"#FFCC80"},
      ];
      const p=palettes[Math.min(stage-1,3)];
      const labels=["Puppy","Young Dog","Good Boy","Legendary"];
      const stageLabel=labels[Math.min(stage-1,3)];
      const eyesHTML = dancing
        ? `<path d="M39,40 Q44,37 49,40" fill="none" stroke="#2C1810" stroke-width="2.5" stroke-linecap="round"/><path d="M53,40 Q58,37 63,40" fill="none" stroke="#2C1810" stroke-width="2.5" stroke-linecap="round"/>`
        : !isBlinking
          ? `<ellipse cx="44" cy="42" rx="5" ry="5.5" fill="white"/><ellipse cx="58" cy="42" rx="5" ry="5.5" fill="white"/><circle cx="${44+(mood==="happy"?1:0)}" cy="42" r="3.5" fill="#2C1810"/><circle cx="${58+(mood==="happy"?1:0)}" cy="42" r="3.5" fill="#2C1810"/><circle cx="45.5" cy="40.5" r="1.5" fill="white"/><circle cx="59.5" cy="40.5" r="1.5" fill="white"/>`
          : `<path d="M39,42 Q44,45 49,42" fill="none" stroke="#2C1810" stroke-width="2" stroke-linecap="round"/><path d="M53,42 Q58,45 63,42" fill="none" stroke="#2C1810" stroke-width="2" stroke-linecap="round"/>`;
      const blushHTML = dancing ? `<ellipse cx="34" cy="48" rx="5" ry="3" fill="#FF8A80" opacity=".4"/><ellipse cx="64" cy="48" rx="5" ry="3" fill="#FF8A80" opacity=".4"/>` : "";
      const mouthHTML = tongueOut
        ? `<path d="M34,56 Q39,60 44,56" fill="none" stroke="${p.nose}" stroke-width="1.2"/><path d="M39,56 L39,${64+pantSpeed}" stroke="${p.tongue}" stroke-width="5" stroke-linecap="round"/><ellipse cx="39" cy="${65+pantSpeed}" rx="4" ry="2.5" fill="${p.tongue}"/>`
        : mood==="happy" ? `<path d="M34,56 Q39,61 44,56" fill="none" stroke="${p.nose}" stroke-width="1.5" stroke-linecap="round"/>` : `<path d="M35,58 Q39,55 43,58" fill="none" stroke="${p.nose}" stroke-width="1.5" stroke-linecap="round"/>`;
      const crownHTML = stage>=4 ? `<g transform="translate(42,18)"><polygon points="0,10 4,0 8,7 12,0 16,10" fill="#FFD740" stroke="#FFA000" stroke-width="1"/><circle cx="4" cy="2" r="1.5" fill="#FF5252"/><circle cx="12" cy="2" r="1.5" fill="#42A5F5"/><circle cx="8" cy="5" r="1.5" fill="#66BB6A"/></g>` : "";
      const sparkleHTML = stage>=3&&!dancing&&sparkle ? `<text x="20" y="30" font-size="10" opacity=".8">✨</text><text x="100" y="30" font-size="9" opacity=".7">⭐</text>` : "";
      const burstHTML = dancing&&showBurst ? `<text x="10" y="25" font-size="16" opacity=".9">${burstEmojis[bIdx]}</text><text x="110" y="20" font-size="14" opacity=".8">${burstEmojis[(bIdx+2)%burstEmojis.length]}</text>` : "";
      const musicHTML = dancing ? `<text x="${15+Math.sin(t*.1)*5}" y="${10+Math.cos(t*.08)*3}" font-size="14" opacity="${.4+Math.sin(t*.15)*.3}">♪</text><text x="${130+Math.cos(t*.12)*5}" y="${15+Math.sin(t*.1)*3}" font-size="12" opacity="${.4+Math.cos(t*.15)*.3}">♫</text>` : "";
      const spotsHTML = stage>=2 ? `<circle cx="95" cy="72" r="5" fill="${p.spots}" opacity=".4"/><circle cx="70" cy="76" r="3.5" fill="${p.spots}" opacity=".3"/>` : "";
      const collarTagHTML = stage>=3 ? `<circle cx="65" cy="74" r="4" fill="#FFD740" stroke="${p.collar}" stroke-width="1.5"/>` : "";

      const svgHTML = `<svg width="140" height="${dancing?145:130}" viewBox="0 0 160 ${dancing?155:140}" style="overflow:visible">
        <g transform="translate(${danceHip},${-hop+breathe-danceBob}) rotate(${danceRock},80,80)">
          <ellipse cx="80" cy="132" rx="${22+hop*.8}" ry="${4-hop*.2}" fill="rgba(0,0,0,0.07)"/>
          <g transform="translate(115,65) rotate(${-30+tailAngle})"><path d="M0,0 Q12,-25 8,-45 Q6,-52 10,-58" fill="none" stroke="${p.body}" stroke-width="8" stroke-linecap="round"/></g>
          <g transform="translate(100,100)"><rect x="-5" y="0" width="12" height="22" rx="6" fill="${p.body}" transform="rotate(${dancing?-dancePawR*.5:0})"/><ellipse cx="1" cy="24" rx="8" ry="5" fill="${p.body}"/><ellipse cx="1" cy="25" rx="5" ry="3" fill="${p.pad}"/></g>
          <g transform="translate(88,100)"><rect x="-5" y="0" width="12" height="22" rx="6" fill="${p.body}" opacity=".85" transform="rotate(${dancing?dancePawL*.5:0})"/><ellipse cx="1" cy="24" rx="8" ry="5" fill="${p.body}" opacity=".85"/></g>
          <ellipse cx="80" cy="82" rx="34" ry="26" fill="${p.body}"/><ellipse cx="75" cy="90" rx="20" ry="14" fill="${p.belly}"/>${spotsHTML}
          <g transform="translate(58,98)"><g transform="rotate(${dancing?-dancePawL:0},1,0)"><rect x="-5" y="${dancing?-dancePawL:0}" width="12" height="24" rx="6" fill="${p.body}"/><ellipse cx="1" cy="${dancing?26-dancePawL:26}" rx="8" ry="5" fill="${p.body}"/><ellipse cx="1" cy="${dancing?27-dancePawL:27}" rx="5" ry="3" fill="${p.pad}"/></g></g>
          <g transform="translate(68,98)"><g transform="rotate(${dancing?dancePawR:0},1,0) translate(0,${dancing?0:-pawLift})"><rect x="-5" y="${dancing?-dancePawR:0}" width="12" height="24" rx="6" fill="${p.body}" opacity=".9"/><ellipse cx="1" cy="${dancing?26-dancePawR:26}" rx="8" ry="5" fill="${p.body}" opacity=".9"/><ellipse cx="1" cy="${dancing?27-dancePawR:27}" rx="5" ry="3" fill="${p.pad}" opacity=".9"/></g></g>
          <ellipse cx="65" cy="68" rx="18" ry="6" fill="none" stroke="${p.collar}" stroke-width="4"/>${collarTagHTML}
          <ellipse cx="60" cy="65" rx="16" ry="14" fill="${p.body}"/>
          <g transform="translate(0,${dancing?Math.sin(t*.35)*3:0})">
            <ellipse cx="52" cy="46" rx="22" ry="20" fill="${p.body}"/><ellipse cx="40" cy="52" rx="14" ry="11" fill="${p.belly}"/>
            <g transform="translate(38,28) rotate(${-20+earFlop})"><ellipse cx="0" cy="0" rx="10" ry="18" fill="${p.ear}"/><ellipse cx="0" cy="2" rx="6" ry="12" fill="${p.body}" opacity=".5"/></g>
            <g transform="translate(68,30) rotate(${15-earFlop})"><ellipse cx="0" cy="0" rx="9" ry="16" fill="${p.ear}"/><ellipse cx="0" cy="2" rx="5.5" ry="11" fill="${p.body}" opacity=".5"/></g>
            ${eyesHTML}${blushHTML}
            <ellipse cx="38" cy="52" rx="5" ry="3.5" fill="${p.nose}"/><ellipse cx="37" cy="51" rx="1.5" ry="1" fill="white" opacity=".3"/>
            ${mouthHTML}${crownHTML}
          </g>
          ${burstHTML}${sparkleHTML}
        </g>
        ${musicHTML}
      </svg>`;
      const svgEl = container.querySelector(".pet-svg");
      if(svgEl) svgEl.innerHTML = svgHTML;
      const labelEl = container.querySelector(".pet-label");
      if(labelEl) {
        if(dancing) labelEl.innerHTML = `<span style="font-weight:700;color:#FF7043">🎉 ${stageLabel} is celebrating! 🎉</span> <span style="color:#FF9800">🔥 ${streak}</span>`;
        else labelEl.innerHTML = `<span style="font-weight:600;color:${p.collar}">${stageLabel}</span>${mood==="happy"?" — feeling great! ":" — needs attention... "}<span style="color:#FF9800">🔥 ${streak}</span>`;
      }
    }
  };

  const createPetWidget = (stage, mood, streak, dancing) => {
    const wrap = el("div", { className:"pet-container", style:{textAlign:"center",padding:"6px 0",userSelect:"none"}, "data-stage":stage, "data-mood":mood, "data-streak":streak, "data-dancing":dancing?"true":"false" },
      el("div", { className:"pet-svg" }),
      el("div", { className:"pet-label", style:{fontSize:"11px",color:"#777",marginTop:"-2px"} })
    );
    return wrap;
  };

  // ==================== GAME STATE ====================
  const State = {
    screen: "menu",
    streak: 0, petStage: 1, petMood: "happy",
    // VetGuess
    vg: { guesses:[], won:false, hintsUsed:0, hintTexts:[], puzzleSeed: getDayNumber(), search:"", selectedIdx:-1 },
    // Connections
    cn: { selected:[], solved:[], mistakes:0, won:false, lost:false, shuffledWords:[], puzzleSeed: getDayNumber() },
    load() {
      const s = Storage.get("vetguess-streak");
      if(s){ this.streak=s.streak||0; this.petStage=s.petStage||1; this.petMood=s.petMood||"happy"; const dn=getDayNumber(); if(s.lastDay&&dn-s.lastDay>1){this.petMood="sad";if(dn-s.lastDay>3){this.streak=0;this.petStage=1;}} }
      const vg = Storage.get(`vetguess-day-${getDayNumber()}`);
      if(vg){ this.vg.guesses=vg.guesses||[]; this.vg.won=vg.won||false; this.vg.hintsUsed=vg.hintsUsed||0; this.vg.hintTexts=vg.hintTexts||[]; }
    },
    saveStreak() { Storage.set("vetguess-streak",{streak:this.streak,petStage:this.petStage,petMood:this.petMood,lastDay:getDayNumber()}); },
    saveVG() { Storage.set(`vetguess-day-${getDayNumber()}`,{guesses:this.vg.guesses,won:this.vg.won,hintsUsed:this.vg.hintsUsed,hintTexts:this.vg.hintTexts}); },
    winStreak() { this.streak++; this.petStage=this.streak>=30?4:this.streak>=7?3:this.streak>=3?2:1; this.petMood="happy"; this.saveStreak(); },
    getVGTarget() { const r=seededRandom(this.vg.puzzleSeed*31337); return ENTRIES[Math.floor(r()*ENTRIES.length)]; },
    getCNPuzzle() { const r=seededRandom(this.cn.puzzleSeed*54321); return CONN_PUZZLES[Math.floor(r()*CONN_PUZZLES.length)]; }
  };

  // ==================== RENDER ====================
  const app = document.getElementById("app");
  const render = () => { app.innerHTML = ""; const s = State.screen; if(s==="menu") renderMenu(); else if(s==="vetguess") renderVetGuess(); else if(s==="connections") renderConnections(); PetSVG.start(); setTimeout(()=>document.querySelectorAll(".pet-container").forEach(c=>PetSVG.update(c)),10); };

  // ==================== MENU ====================
  const renderMenu = () => {
    const header = el("div",{style:{textAlign:"center",marginBottom:"10px"}},
      el("h1",{style:{margin:"0",fontSize:"28px",fontWeight:"800",color:"#263238",letterSpacing:"-0.5px"}},"🐾 VetGames"),
      el("div",{style:{fontSize:"11px",color:"#90A4AE"}},"Daily Veterinary Brain Training")
    );
    const pet = createPetWidget(State.petStage, State.petMood, State.streak, false);
    const petCard = el("div",{style:{background:"white",borderRadius:"16px",padding:"4px 8px",marginBottom:"20px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}, pet);
    const mkCard = (emoji, title, desc, tags, gradient, shadow, onclick) => {
      const btn = el("button",{style:{background:gradient,borderRadius:"18px",padding:"20px",border:"none",cursor:"pointer",textAlign:"left",color:"white",boxShadow:shadow,transition:"transform .15s,box-shadow .15s",display:"flex",gap:"16px",alignItems:"center",width:"100%",fontFamily:"inherit"},onClick:onclick},
        el("div",{style:{fontSize:"40px",animation:"float 3s ease infinite"}},emoji),
        el("div",{},el("div",{style:{fontSize:"18px",fontWeight:"800"}},title),el("div",{style:{fontSize:"12px",opacity:".9",marginTop:"2px"}},desc),el("div",{style:{fontSize:"10px",opacity:".7",marginTop:"6px"}},tags))
      );
      btn.onmouseenter = () => { btn.style.transform="scale(1.02)"; };
      btn.onmouseleave = () => { btn.style.transform="scale(1)"; };
      return btn;
    };
    const cards = el("div",{style:{display:"flex",flexDirection:"column",gap:"12px"}},
      mkCard("🩺","VetGuess","Guess the clinical condition from attribute clues. Wordle meets veterinary medicine!","🎯 Deduction · 💊 30 conditions · 💡 Hints","linear-gradient(135deg,#FF8A65,#FF5722)","0 6px 24px rgba(255,87,34,0.25)",()=>{State.screen="vetguess";render();}),
      mkCard("🔬","VetConnect","Group 16 veterinary terms into 4 hidden categories. Test your clinical knowledge!","🧩 Grouping · 📚 7 puzzles · ❌ 4 mistakes max","linear-gradient(135deg,#42A5F5,#1E88E5)","0 6px 24px rgba(30,136,229,0.25)",()=>{State.screen="connections";initConnections();render();})
    );
    const footer = el("div",{style:{textAlign:"center",marginTop:"20px",fontSize:"11px",color:"#B0BEC5"}},`Day #${getDayNumber()} · Both games share your streak and pet progress`);
    app.append(header, petCard, cards, footer);
  };

  // ==================== DOG EAR TILE ====================
  const createTile = (value, result, label, delay) => {
    const bg = result==="green"?"#4CAF50":result==="yellow"?"#FFC107":"#78909C";
    const tc = result==="yellow"?"#333":"white";
    const wrap = el("div",{style:{position:"relative",width:"100%",minWidth:"0"}});
    const earSvg = `<svg width="100%" height="12" viewBox="0 0 60 12" preserveAspectRatio="none" style="display:block"><ellipse cx="12" cy="8" rx="10" ry="11" fill="#CFD8DC" opacity=".8"/><ellipse cx="48" cy="8" rx="10" ry="11" fill="#CFD8DC" opacity=".8"/></svg>`;
    const earDiv = el("div",{innerHTML:earSvg});
    const body = el("div",{style:{background:"#ECEFF1",color:"#90A4AE",borderRadius:"8px",padding:"5px 3px 6px",textAlign:"center",fontSize:"9px",fontWeight:"600",transition:"all .4s ease",transform:"scale(0.95)",marginTop:"-5px",position:"relative",zIndex:"2",lineHeight:"1.15",minHeight:"38px",display:"flex",flexDirection:"column",justifyContent:"center",overflow:"hidden"}},
      el("div",{style:{fontSize:"7px",opacity:".75",textTransform:"uppercase",letterSpacing:".3px"}},label),
      el("div",{style:{fontSize:"9px",marginTop:"2px",wordBreak:"break-word",padding:"0 1px"}},value)
    );
    wrap.append(earDiv, body);
    setTimeout(()=>{
      earDiv.innerHTML = `<svg width="100%" height="12" viewBox="0 0 60 12" preserveAspectRatio="none" style="display:block"><ellipse cx="12" cy="8" rx="10" ry="11" fill="${bg}" opacity=".8"/><ellipse cx="48" cy="8" rx="10" ry="11" fill="${bg}" opacity=".8"/></svg>`;
      body.style.background=bg; body.style.color=tc; body.style.transform="scale(1)";
    }, delay);
    return wrap;
  };

  // ==================== VETGUESS ====================
  const renderVetGuess = () => {
    const target = State.getVGTarget();
    const cw=Math.floor(getDayNumber()/7)%4, ct=THEMES[Math.floor(getDayNumber()/28)%THEMES.length];

    // Header
    const header = el("div",{style:{display:"flex",alignItems:"center",marginBottom:"12px",gap:"10px"}},
      el("button",{style:{background:"none",border:"none",fontSize:"20px",cursor:"pointer",padding:"4px 8px",borderRadius:"8px",color:"#455A64"},onClick:()=>{State.screen="menu";render();}},"←"),
      el("div",{style:{flex:"1"}},el("h1",{style:{margin:"0",fontSize:"22px",fontWeight:"800",color:"#263238"}},"🐾 VetGuess"),el("div",{style:{fontSize:"11px",color:"#90A4AE"}},"Clinical Deduction Puzzle"))
    );

    // Dog banner
    const bannerSvg = `<svg width="46" height="46" viewBox="0 0 50 50"><circle cx="25" cy="28" r="15" fill="#FFCC80"/><ellipse cx="14" cy="14" rx="7" ry="11" fill="#D7A86E" transform="rotate(-20 14 14)"/><ellipse cx="36" cy="14" rx="7" ry="11" fill="#D7A86E" transform="rotate(20 36 14)"/><circle cx="25" cy="26" r="12" fill="#FFCC80"/><circle cx="20" cy="24" r="2.2" fill="#333"/><circle cx="30" cy="24" r="2.2" fill="#333"/><circle cx="20.7" cy="23.3" r=".7" fill="white"/><circle cx="30.7" cy="23.3" r=".7" fill="white"/><ellipse cx="25" cy="28" rx="3.5" ry="2.2" fill="#333"/><path d="M22 32 Q25 35 28 32" fill="none" stroke="#333" stroke-width="1.3" stroke-linecap="round"/></svg>`;
    const banner = el("div",{style:{background:"linear-gradient(135deg,#FF8A65,#FF5722)",borderRadius:"14px",padding:"10px 14px",marginBottom:"14px",display:"flex",alignItems:"center",gap:"12px",color:"white",boxShadow:"0 4px 16px rgba(255,87,34,0.25)"}},
      el("div",{innerHTML:bannerSvg}),
      el("div",{},el("div",{style:{fontWeight:"700",fontSize:"14px"}},ct.icon+" "+ct.name),el("div",{style:{fontSize:"11px",opacity:".9"}},"This week: "+ct.weeks[cw]))
    );

    // Pet
    const pet = createPetWidget(State.petStage, State.petMood, State.streak, State.vg.won);
    const petCard = el("div",{style:{background:State.vg.won?"linear-gradient(135deg,#FFF8E1,#FFF3E0)":"white",borderRadius:"16px",padding:"4px 8px",marginBottom:"14px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}},pet);

    // Hints
    const hintsDiv = el("div",{style:{marginBottom:"10px"}});
    State.vg.hintTexts.forEach((h,i)=>{
      hintsDiv.appendChild(el("div",{style:{background:"#FFF8E1",border:"1px solid #FFE082",borderRadius:"10px",padding:"7px 12px",fontSize:"12px",marginBottom:"5px",animation:"slideIn .3s ease"},innerHTML:`💡 <strong>Hint ${i+1}:</strong> ${h}`}));
    });

    // Input
    let inputArea = el("div");
    if(!State.vg.won) {
      const input = el("input",{type:"text",placeholder:"Search clinical conditions...",value:State.vg.search,style:{width:"100%",padding:"11px 14px",borderRadius:"12px",border:"2px solid #CFD8DC",fontSize:"13px",outline:"none",transition:"all .2s",boxSizing:"border-box",background:"white"}});
      const dropdown = el("div",{style:{position:"absolute",top:"100%",left:"0",right:"0",background:"white",borderRadius:"12px",marginTop:"4px",boxShadow:"0 8px 28px rgba(0,0,0,0.12)",maxHeight:"220px",overflowY:"auto",zIndex:"10",display:"none"}});
      const hintBtn = el("button",{style:{padding:"0 14px",borderRadius:"12px",border:"none",background:State.vg.hintsUsed>=3?"#ECEFF1":"#FFF3E0",cursor:State.vg.hintsUsed>=3?"default":"pointer",fontSize:"18px",flexShrink:"0"},onClick:()=>{
        if(State.vg.hintsUsed>=3||State.vg.won) return;
        let text="";
        if(State.vg.hintsUsed===0){const a=ATTRS[Math.floor(seededRandom(getDayNumber()*7)()*ATTRS.length)];text=ATTR_LABELS[a]+": "+target[a];}
        else if(State.vg.hintsUsed===1) text="Breed predisposition: "+target.breed;
        else{const nm=target.name;text="Condition: "+nm.split("").map((c,i)=>i===0||i===nm.length-1||c===" "?c:"_").join("");}
        State.vg.hintTexts.push(text); State.vg.hintsUsed++; State.saveVG(); render();
      }},"💡");

      const updateDropdown = () => {
        const val = input.value.toLowerCase();
        const filtered = ENTRIES.filter(e=>e.name.toLowerCase().includes(val)&&!State.vg.guesses.some(g=>g.name===e.name));
        dropdown.innerHTML = "";
        if(val&&filtered.length>0) {
          dropdown.style.display = "block";
          filtered.slice(0,8).forEach(e=>{
            const item = el("div",{style:{padding:"9px 14px",cursor:"pointer",fontSize:"12px",borderBottom:"1px solid #f0f0f0",background:"white"},onClick:()=>makeVGGuess(e,target)},
              el("div",{style:{fontWeight:"600",color:"#37474F"}},e.name),
              el("div",{style:{color:"#90A4AE",fontSize:"10px",marginTop:"1px"}},`${e.species} · ${e.breed} · ${e.system} · ${e.urgency}`)
            );
            item.onmouseenter = ()=>item.style.background="#FFF3E0";
            item.onmouseleave = ()=>item.style.background="white";
            dropdown.appendChild(item);
          });
        } else dropdown.style.display="none";
      };
      input.addEventListener("input",()=>{ State.vg.search=input.value; updateDropdown(); });
      input.addEventListener("focus", updateDropdown);
      input.addEventListener("blur",()=>setTimeout(()=>dropdown.style.display="none",200));
      input.addEventListener("keydown",(ev)=>{
        const val=input.value.toLowerCase();
        const filtered=ENTRIES.filter(e=>e.name.toLowerCase().includes(val)&&!State.vg.guesses.some(g=>g.name===e.name));
        if(ev.key==="Enter"&&filtered.length===1){makeVGGuess(filtered[0],target);}
      });

      const inputWrap = el("div",{style:{flex:"1",position:"relative"}},input,dropdown);
      const row = el("div",{style:{display:"flex",gap:"8px"}},inputWrap,hintBtn);
      const info = el("div",{style:{fontSize:"10px",color:"#B0BEC5",marginTop:"4px",textAlign:"right"}},`${3-State.vg.hintsUsed} hints · ${State.vg.guesses.length} guess${State.vg.guesses.length!==1?"es":""}`);
      inputArea = el("div",{style:{position:"relative",marginBottom:"14px"}},row,info);
    }

    // Win banner
    let winBanner = el("div");
    if(State.vg.won) {
      winBanner = el("div",{style:{background:"linear-gradient(135deg,#43A047,#66BB6A,#81C784)",backgroundSize:"200% 200%",animation:"rainbow 3s ease infinite, pop .5s ease",borderRadius:"16px",padding:"18px",textAlign:"center",color:"white",marginBottom:"14px",boxShadow:"0 8px 32px rgba(76,175,80,0.3)"}},
        el("div",{style:{fontSize:"36px",marginBottom:"2px"}},"🎉🐾🎉"),
        el("div",{style:{fontSize:"20px",fontWeight:"800"}},"Diagnosis Confirmed!"),
        el("div",{style:{fontSize:"14px",opacity:".95",margin:"6px 0"},innerHTML:`<strong>${target.name}</strong> in ${State.vg.guesses.length} guess${State.vg.guesses.length!==1?"es":""}${State.vg.hintsUsed>0?` + ${State.vg.hintsUsed} hint${State.vg.hintsUsed>1?"s":""}`:""}`}),
        el("div",{style:{fontSize:"11px",opacity:".85",marginBottom:"12px"}},`${target.breed} · ${target.system} · ${target.treatment}`),
        el("div",{style:{display:"flex",gap:"8px",justifyContent:"center",flexWrap:"wrap"}},
          el("button",{style:{padding:"8px 18px",borderRadius:"10px",border:"2px solid rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.15)",color:"white",fontWeight:"700",cursor:"pointer",fontSize:"13px"},onClick:()=>{
            const l=[`🐾 VetGuess #${getDayNumber()} — ${State.vg.guesses.length}/${ENTRIES.length}`,""]; [...State.vg.guesses].reverse().forEach(g=>l.push(g.results.map(r=>r.result==="green"?"🟩":r.result==="yellow"?"🟨":"⬜").join("")));
            navigator.clipboard.writeText(l.join("\n"));
          }},"📋 Share"),
          el("button",{style:{padding:"8px 18px",borderRadius:"10px",border:"2px solid rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.15)",color:"white",fontWeight:"700",cursor:"pointer",fontSize:"13px"},onClick:()=>{
            State.vg={guesses:[],won:false,hintsUsed:0,hintTexts:[],puzzleSeed:State.vg.puzzleSeed+10000+Math.floor(Math.random()*9999),search:"",selectedIdx:-1};
            Storage.del(`vetguess-day-${getDayNumber()}`); render();
          }},"🔄 Play Again")
        )
      );
    }

    // Guess grid
    const grid = el("div");
    if(State.vg.guesses.length>0) {
      const hdr = el("div",{style:{display:"grid",gridTemplateColumns:`72px repeat(${ATTRS.length},1fr)`,gap:"3px",padding:"0 1px",marginBottom:"4px"}});
      hdr.appendChild(el("div",{style:{fontSize:"8px",color:"#B0BEC5",fontWeight:"700"}},"CONDITION"));
      ATTRS.forEach(a=>hdr.appendChild(el("div",{style:{fontSize:"7px",color:"#B0BEC5",fontWeight:"700",textAlign:"center",textTransform:"uppercase"}},ATTR_LABELS[a])));
      grid.appendChild(hdr);
      State.vg.guesses.forEach((g,gi)=>{
        const row = el("div",{style:{display:"grid",gridTemplateColumns:`72px repeat(${ATTRS.length},1fr)`,gap:"3px",marginBottom:"6px",animation:gi===0?"slideIn .35s ease":"none"}});
        row.appendChild(el("div",{style:{display:"flex",flexDirection:"column",justifyContent:"center",paddingRight:"4px"}},
          el("div",{style:{fontSize:"10px",fontWeight:"700",color:"#455A64",lineHeight:"1.2"}},g.name),
          el("div",{style:{fontSize:"8px",color:"#90A4AE"}},g.breed)
        ));
        g.results.forEach((r,ri)=>row.appendChild(createTile(r.value,r.result,ATTR_LABELS[r.attr],gi===0?ri*80:0)));
        grid.appendChild(row);
      });
    }

    // Legend
    const legend = el("div",{style:{display:"flex",justifyContent:"center",gap:"14px",fontSize:"10px",color:"#90A4AE",marginTop:"18px",paddingBottom:"12px"}});
    [["#4CAF50","Correct"],["#FFC107","Close"],["#78909C","Wrong"]].forEach(([c,l])=>{
      legend.appendChild(el("span",{innerHTML:`<span style="display:inline-block;width:10px;height:10px;background:${c};border-radius:2px;vertical-align:middle;margin-right:4px"></span>${l}`}));
    });

    app.append(header, banner, petCard, hintsDiv, inputArea, winBanner, grid, legend);
  };

  const makeVGGuess = (entry, target) => {
    if(State.vg.won||State.vg.guesses.some(g=>g.name===entry.name)) return;
    const res = compGuess(entry, target);
    State.vg.guesses.unshift({name:entry.name,breed:entry.breed,results:res});
    State.vg.search = "";
    const isWin = res.every(r=>r.result==="green");
    if(isWin) { State.vg.won=true; State.winStreak(); Confetti.fire(); }
    State.saveVG(); render();
  };

  // ==================== CONNECTIONS ====================
  const initConnections = () => {
    const puzzle = State.getCNPuzzle();
    const allWords = puzzle.groups.flatMap(g=>g.words);
    const rng = seededRandom(State.cn.puzzleSeed*99991);
    State.cn.shuffledWords = [...allWords].sort(()=>rng()-.5);
    State.cn.selected=[]; State.cn.solved=[]; State.cn.mistakes=0; State.cn.won=false; State.cn.lost=false;
  };

  const renderConnections = () => {
    const puzzle = State.getCNPuzzle();
    const maxM = 4;

    const header = el("div",{style:{display:"flex",alignItems:"center",marginBottom:"12px",gap:"10px"}},
      el("button",{style:{background:"none",border:"none",fontSize:"20px",cursor:"pointer",padding:"4px 8px",borderRadius:"8px",color:"#455A64"},onClick:()=>{State.screen="menu";render();}},"←"),
      el("div",{style:{flex:"1"}},el("h1",{style:{margin:"0",fontSize:"22px",fontWeight:"800",color:"#263238"}},"🔬 VetConnect"),el("div",{style:{fontSize:"11px",color:"#90A4AE"}},"Veterinary Connections Puzzle"))
    );

    const info = el("div",{style:{textAlign:"center",marginBottom:"14px"}},
      el("div",{style:{fontSize:"12px",color:"#90A4AE"}},"Find 4 groups of 4 related veterinary terms"),
      el("div",{style:{marginTop:"6px",display:"flex",justifyContent:"center",gap:"6px",alignItems:"center"}})
    );
    const dots = info.lastChild;
    for(let i=0;i<maxM;i++) dots.appendChild(el("div",{style:{width:"14px",height:"14px",borderRadius:"50%",background:i<(maxM-State.cn.mistakes)?"#FF7043":"#E0E0E0",transition:"background .3s ease"}}));
    dots.appendChild(el("span",{style:{fontSize:"11px",color:"#90A4AE",marginLeft:"4px"}},`${maxM-State.cn.mistakes} mistakes left`));

    // Solved groups
    const solvedDiv = el("div");
    State.cn.solved.forEach(g=>{
      solvedDiv.appendChild(el("div",{style:{background:g.color,borderRadius:"12px",padding:"12px",marginBottom:"8px",textAlign:"center",color:"white",animation:"pop .4s ease"}},
        el("div",{style:{fontWeight:"800",fontSize:"13px",textTransform:"uppercase",letterSpacing:".5px"}},g.name),
        el("div",{style:{fontSize:"12px",marginTop:"4px",opacity:".9"}},g.words.join(" · "))
      ));
    });

    // Remaining words
    const remaining = State.cn.shuffledWords.filter(w=>!State.cn.solved.some(sg=>sg.words.includes(w)));
    const wordGrid = el("div",{id:"conn-grid",style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"6px",marginBottom:"14px"}});
    if(!State.cn.lost) {
      remaining.forEach(w=>{
        const isSel = State.cn.selected.includes(w);
        const btn = el("button",{style:{padding:"12px 6px",borderRadius:"10px",border:isSel?"2px solid #FF7043":"2px solid #E0E0E0",background:isSel?"#FFF3E0":"white",cursor:"pointer",fontSize:"11px",fontWeight:"600",color:isSel?"#E64A19":"#455A64",transition:"all .15s ease",transform:isSel?"scale(1.03)":"scale(1)",minHeight:"48px",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",lineHeight:"1.2",fontFamily:"inherit"},onClick:()=>{
          if(State.cn.won||State.cn.lost) return;
          if(State.cn.selected.includes(w)) State.cn.selected=State.cn.selected.filter(x=>x!==w);
          else if(State.cn.selected.length<4) State.cn.selected.push(w);
          render();
        }},w);
        wordGrid.appendChild(btn);
      });
    }

    // Action buttons
    const actions = el("div",{style:{display:"flex",gap:"8px",justifyContent:"center",marginBottom:"14px"}});
    if(!State.cn.won&&!State.cn.lost) {
      actions.append(
        el("button",{style:{padding:"8px 16px",borderRadius:"10px",border:"2px solid #E0E0E0",background:"white",cursor:"pointer",fontSize:"12px",fontWeight:"600",color:"#455A64",fontFamily:"inherit"},onClick:()=>{
          const rem=remaining; const rng=seededRandom(Date.now()); const nw=[...State.cn.shuffledWords];
          for(let i=rem.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));const ai=nw.indexOf(rem[i]),aj=nw.indexOf(rem[j]);[nw[ai],nw[aj]]=[nw[aj],nw[ai]];}
          State.cn.shuffledWords=nw; render();
        }},"🔀 Shuffle"),
        el("button",{style:{padding:"8px 16px",borderRadius:"10px",border:"2px solid #E0E0E0",background:"white",cursor:State.cn.selected.length===0?"default":"pointer",fontSize:"12px",fontWeight:"600",color:State.cn.selected.length===0?"#bbb":"#455A64",fontFamily:"inherit"},onClick:()=>{State.cn.selected=[];render();}},"Deselect"),
        el("button",{style:{padding:"8px 20px",borderRadius:"10px",border:"none",background:State.cn.selected.length===4?"#FF7043":"#E0E0E0",color:State.cn.selected.length===4?"white":"#999",cursor:State.cn.selected.length===4?"pointer":"default",fontSize:"12px",fontWeight:"700",fontFamily:"inherit"},onClick:()=>{
          if(State.cn.selected.length!==4) return;
          const matched = puzzle.groups.find(g=>g.words.every(w=>State.cn.selected.includes(w))&&State.cn.selected.every(w=>g.words.includes(w)));
          if(matched) {
            State.cn.solved.push(matched); State.cn.selected=[];
            if(State.cn.solved.length===4){ State.cn.won=true; State.winStreak(); Confetti.fire(); }
          } else {
            State.cn.mistakes++; State.cn.selected=[];
            if(State.cn.mistakes>=maxM){ State.cn.lost=true; State.cn.solved=puzzle.groups; }
          }
          render();
          if(!matched&&!State.cn.lost){const g=document.getElementById("conn-grid");if(g)g.style.animation="shake .4s ease";setTimeout(()=>{if(g)g.style.animation="";},500);}
        }},"Submit")
      );
    }

    // Win/Loss
    let resultBanner = el("div");
    if(State.cn.won) {
      resultBanner = el("div",{style:{background:"linear-gradient(135deg,#43A047,#66BB6A)",borderRadius:"16px",padding:"18px",textAlign:"center",color:"white",marginBottom:"14px",animation:"pop .5s ease"}},
        el("div",{style:{fontSize:"32px"}},"🎉🔬🎉"),
        el("div",{style:{fontSize:"18px",fontWeight:"800"}},"Perfect Diagnosis!"),
        el("div",{style:{fontSize:"13px",opacity:".9",marginTop:"4px"}},`Solved with ${State.cn.mistakes} mistake${State.cn.mistakes!==1?"s":""}`),
        el("button",{style:{marginTop:"12px",padding:"8px 20px",borderRadius:"10px",border:"2px solid rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.15)",color:"white",fontWeight:"700",cursor:"pointer",fontSize:"13px",fontFamily:"inherit"},onClick:()=>{State.cn.puzzleSeed=State.cn.puzzleSeed+10000+Math.floor(Math.random()*9999);initConnections();render();}},"🔄 Play Again")
      );
    } else if(State.cn.lost) {
      resultBanner = el("div",{style:{background:"linear-gradient(135deg,#EF5350,#E53935)",borderRadius:"16px",padding:"18px",textAlign:"center",color:"white",marginBottom:"14px",animation:"pop .5s ease"}},
        el("div",{style:{fontSize:"28px"}},"😔"),
        el("div",{style:{fontSize:"16px",fontWeight:"700"}},"Out of attempts!"),
        el("div",{style:{fontSize:"12px",opacity:".9",marginTop:"4px"}},"The correct groups are shown above. Study up!"),
        el("button",{style:{marginTop:"12px",padding:"8px 20px",borderRadius:"10px",border:"2px solid rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.15)",color:"white",fontWeight:"700",cursor:"pointer",fontSize:"13px",fontFamily:"inherit"},onClick:()=>{State.cn.puzzleSeed=State.cn.puzzleSeed+10000+Math.floor(Math.random()*9999);initConnections();render();}},"🔄 Try Another")
      );
    }

    // Pet
    const pet = createPetWidget(State.petStage, State.cn.won?"happy":State.cn.lost?"sad":State.petMood, State.streak, State.cn.won);
    const petCard = el("div",{style:{background:State.cn.won?"linear-gradient(135deg,#FFF8E1,#FFF3E0)":"white",borderRadius:"16px",padding:"4px 8px",marginTop:"10px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}},pet);

    app.append(header, info, solvedDiv, wordGrid, actions, resultBanner, petCard);
  };

  // ==================== INIT ====================
  Confetti.init();
  State.load();
  render();
})();
