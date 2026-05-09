const STORAGE_KEY = "acer_azkar_tasbeeh_data_v1";
const LANGUAGE_KEY = "acer_azkar_language_v1";
const PRAYER_METHOD_KEY = "acer_azkar_prayer_method_v1";

let language = localStorage.getItem(LANGUAGE_KEY) || "ar";
let prayerMethod = localStorage.getItem(PRAYER_METHOD_KEY) || "2";

const translations = {
  ar:{
    title:"مسبحة الأذكار",
    tap:"اضغط",
    target:"الهدف",
    times:"مرة",
    footer:"الحفظ تلقائي والتصفير يومي",
    date:"تاريخ اليوم",
    prayerLoading:"جاري تحميل أوقات الصلاة...",
    prayerError:"تعذر تحميل أوقات الصلاة",
    addPrompt:"اكتب الذكر الجديد",
    targetPrompt:"كم العدد المستهدف؟",
    deleteConfirm:"هل تريد حذف هذا الذكر؟",
    resetAllConfirm:"هل تريد تصفير كل الأذكار؟",
    lastAlert:"لا يمكن حذف آخر ذكر",
    completed:"أكملت الهدف، بارك الله فيك",
    continueMsg:"يمكنك الاستمرار أو الانتقال للذكر التالي"
  },
  en:{
    title:"Azkar Counter",
    tap:"Tap",
    target:"Target",
    times:"times",
    footer:"Auto saved and resets daily",
    date:"Today",
    prayerLoading:"Loading prayer times...",
    prayerError:"Could not load prayer times",
    addPrompt:"Enter new dhikr",
    targetPrompt:"Target count?",
    deleteConfirm:"Delete this dhikr?",
    resetAllConfirm:"Reset all adhkar?",
    lastAlert:"Cannot delete last dhikr",
    completed:"Target completed",
    continueMsg:"You can continue"
  }
};

    let adhkar = [
      { text: "سبحان الله", target: 33 },
      { text: "الحمد لله", target: 33 },
      { text: "الله أكبر", target: 34 },
      { text: "لا إله إلا الله", target: 100 },
      { text: "أستغفر الله", target: 100 },
      { text: "لا حول ولا قوة إلا بالله", target: 100 },
      { text: "سبحان الله وبحمده", target: 100 },
      { text: "سبحان الله العظيم", target: 100 },
      { text: "اللهم صل وسلم على نبينا محمد", target: 100 },
      { text: "حسبي الله ونعم الوكيل", target: 100 },
      { text: "اللهم اغفر لي وارحمني", target: 100 },
      { text: "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار", target: 10 },
      { text: "اللهم إنك عفو تحب العفو فاعف عني", target: 10 },
      { text: "رضيت بالله ربًا وبالإسلام دينًا وبمحمد ﷺ نبيًا", target: 3 },
      { text: "اللهم أعني على ذكرك وشكرك وحسن عبادتك", target: 10 }
    ];

let currentIndex = 0;
let counts = Array(adhkar.length).fill(0);

const dhikrText = document.getElementById("dhikrText");
const counter = document.getElementById("counter");
const targetText = document.getElementById("targetText");
const progress = document.getElementById("progress");
const message = document.getElementById("message");
const dhikrSelect = document.getElementById("dhikrSelect");
const dateInfo = document.getElementById("dateInfo");
const prayerTimes = document.getElementById("prayerTimes");
const methodSelect = document.getElementById("methodSelect");

function t(key){
  return translations[language][key];
}

function applyLanguage(){
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

  document.getElementById("titleText").textContent = t("title");
  document.getElementById("tapBtn").textContent = t("tap");
  document.getElementById("footerText").textContent = t("footer");

  updateScreen();
  loadPrayerTimes();
}

function toggleLanguage(){
  language = language === "ar" ? "en" : "ar";
  localStorage.setItem(LANGUAGE_KEY, language);
  applyLanguage();
}

function changePrayerMethod(){
  prayerMethod = methodSelect.value;
  localStorage.setItem(PRAYER_METHOD_KEY, prayerMethod);
  loadPrayerTimes();
}

function getTodayKey(){
  const today = new Date();

  return today.getFullYear() + "-" +
    String(today.getMonth()+1).padStart(2,"0") + "-" +
    String(today.getDate()).padStart(2,"0");
}

function saveData(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    date:getTodayKey(),
    counts:counts,
    currentIndex:currentIndex
  }));
}

function loadData(){
  const saved = localStorage.getItem(STORAGE_KEY);

  if(!saved){
    saveData();
    return;
  }

  try{
    const data = JSON.parse(saved);

    if(data.date !== getTodayKey()){
      counts = Array(adhkar.length).fill(0);
      currentIndex = 0;
      saveData();
      return;
    }

    counts = Array.isArray(data.counts) ? data.counts : Array(adhkar.length).fill(0);
    currentIndex = typeof data.currentIndex === "number" ? data.currentIndex : 0;

    while(counts.length < adhkar.length) counts.push(0);
    counts = counts.slice(0, adhkar.length);

  }catch(e){
    counts = Array(adhkar.length).fill(0);
    currentIndex = 0;
    saveData();
  }
}

function buildDhikrList(){
  dhikrSelect.innerHTML = "";

  adhkar.forEach((item,index)=>{
    const option = document.createElement("option");
    option.value = index;
    option.textContent = item.text + " — " + (counts[index] || 0);
    dhikrSelect.appendChild(option);
  });

  dhikrSelect.value = currentIndex;
}

function updateScreen(){
  buildDhikrList();

  const current = adhkar[currentIndex];
  const count = counts[currentIndex];

  dhikrText.textContent = current.text;
  counter.textContent = count;

  targetText.textContent =
    t("target") + ": " + current.target + " " + t("times");

  dateInfo.textContent =
    t("date") + ": " + getTodayKey();

  const percent = Math.min((count/current.target)*100,100);
  progress.style.width = percent + "%";

  if(count === current.target){
    message.textContent = t("completed");
  }else if(count > current.target){
    message.textContent = t("continueMsg");
  }else{
    message.textContent = "";
  }
}

function countTasbeeh(){
  counts[currentIndex]++;
  saveData();
  updateScreen();

  if(navigator.vibrate){
    navigator.vibrate(20);
  }
}

function resetCurrentDhikr(){
  counts[currentIndex] = 0;
  saveData();
  updateScreen();
}

function resetAllAdhkar(){
  if(!confirm(t("resetAllConfirm"))) return;

  counts = Array(adhkar.length).fill(0);
  saveData();
  updateScreen();
}

function nextDhikr(){
  currentIndex = (currentIndex + 1) % adhkar.length;
  saveData();
  updateScreen();
}

function changeDhikr(){
  currentIndex = Number(dhikrSelect.value);
  saveData();
  updateScreen();
}

function addNewDhikr(){
  const text = prompt(t("addPrompt"));

  if(!text || !text.trim()) return;

  const targetInput = prompt(t("targetPrompt"),"100");
  let target = parseInt(targetInput);

  if(isNaN(target) || target <= 0) target = 100;

  adhkar.push({
    text:text.trim(),
    target:target
  });

  counts.push(0);
  currentIndex = adhkar.length - 1;

  saveData();
  updateScreen();
}

function deleteCurrentDhikr(){
  if(adhkar.length <= 1){
    alert(t("lastAlert"));
    return;
  }

  if(!confirm(t("deleteConfirm"))) return;

  adhkar.splice(currentIndex,1);
  counts.splice(currentIndex,1);

  if(currentIndex >= adhkar.length){
    currentIndex = adhkar.length - 1;
  }

  saveData();
  updateScreen();
}

async function loadPrayerTimes(){
  prayerTimes.textContent = t("prayerLoading");

  try{
    const response = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=Austin&country=US&method=${prayerMethod}`
    );

    const data = await response.json();
    const times = data.data.timings;

    if(language === "ar"){
      prayerTimes.innerHTML =
        `🌅 الفجر ${times.Fajr} | ☀️ الظهر ${times.Dhuhr} | 🌤 العصر ${times.Asr}<br>
         🌇 المغرب ${times.Maghrib} | 🌙 العشاء ${times.Isha}`;
    }else{
      prayerTimes.innerHTML =
        `🌅 Fajr ${times.Fajr} | ☀️ Dhuhr ${times.Dhuhr} | 🌤 Asr ${times.Asr}<br>
         🌇 Maghrib ${times.Maghrib} | 🌙 Isha ${times.Isha}`;
    }

  }catch(e){
    prayerTimes.textContent = t("prayerError");
  }
}

methodSelect.value = prayerMethod;
loadData();
applyLanguage();