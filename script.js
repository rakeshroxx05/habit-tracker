let habits = JSON.parse(localStorage.getItem("habits")) || [];
let log = JSON.parse(localStorage.getItem("log")) || {};
let darkMode = false;

const habitsDiv = document.getElementById("habits");
const heatmap = document.getElementById("heatmap");
const chart = document.getElementById("chart");
const ctx = chart.getContext("2d");

function addHabit() {
  const name = habitInput.value;
  const cat = category.value;
  if (!name) return alert("Enter habit");

  habits.push({ name, cat, done: false });
  habitInput.value = "";
  save();
  renderHabits();
}

function toggleHabit(i) {
  habits[i].done = !habits[i].done;

  const today = new Date().toISOString().slice(0,10);
  log[today] = (log[today] || 0) + (habits[i].done ? 1 : -1);

  save();
  renderHabits();
  renderHeatmap();
  renderChart();
}

function deleteHabit(i) {
  habits.splice(i,1);
  save();
  renderHabits();
}

function renderHabits() {
  habitsDiv.innerHTML = "";
  habits.forEach((h,i)=>{
    const div = document.createElement("div");
    div.className = "habit " + (h.done ? "done":"");
    div.innerHTML = `
      <h3>${h.name}</h3>
      <p>Category: ${h.cat}</p>
      <button onclick="toggleHabit(${i})">${h.done?"Undo":"Done"}</button>
      <button onclick="deleteHabit(${i})">❌</button>
    `;
    habitsDiv.appendChild(div);
  });
  updateStats();
}

function updateStats() {
  let total = Object.values(log).reduce((a,b)=>a+b,0);
  let days = Object.keys(log).length || 1;
  let progress = Math.round((total/(days*habits.length||1))*100);
  progressSpan.innerText = progress;

  let streak=0;
  let d=new Date();
  while(true){
    let key=d.toISOString().slice(0,10);
    if(log[key]>0) streak++;
    else break;
    d.setDate(d.getDate()-1);
  }
  streakSpan.innerText = streak;
}

function renderHeatmap() {
  heatmap.innerHTML="";
  for(let i=90;i>=0;i--){
    let d=new Date();
    d.setDate(d.getDate()-i);
    let key=d.toISOString().slice(0,10);
    let val=log[key]||0;
    let div=document.createElement("div");
    div.className="day";
    if(val>0&&val<=2)div.classList.add("low");
    else if(val<=4&&val>2)div.classList.add("medium");
    else if(val>4)div.classList.add("high");
    heatmap.appendChild(div);
  }
}

function renderChart() {
  ctx.clearRect(0,0,400,200);
  let days=7;
  let values=[];
  for(let i=days-1;i>=0;i--){
    let d=new Date();
    d.setDate(d.getDate()-i);
    let key=d.toISOString().slice(0,10);
    values.push(log[key]||0);
  }

  let barWidth=40;
  values.forEach((v,i)=>{
    ctx.fillStyle="#5a67d8";
    ctx.fillRect(i*60+30,200-v*20,barWidth,v*20);
  });
}

function toggleTheme(){
  darkMode=!darkMode;
  document.body.classList.toggle("dark");
}

function save(){
  localStorage.setItem("habits",JSON.stringify(habits));
  localStorage.setItem("log",JSON.stringify(log));
}

renderHabits();
renderHeatmap();
renderChart();
