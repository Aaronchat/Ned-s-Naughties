ASSETS.performers.cinnamon="assets/performers/cinnamon.jpeg";
if(!PERFORMER_POOL.some(p=>p.id==="cinnamon"))PERFORMER_POOL.push({id:"cinnamon",name:"Cinnamon",concept:"Brunette nurse"});

function rosterSummary141(p,source){if(source==="former")return `Rank ${p.rank} - ${statusFor(p)}`;if(p.trainingWeeks)return `Rank ${p.rank} - Training - ${p.trainingWeeks}w left`;return `Rank ${p.rank} - Working - ${p.weeksRemaining}w`}
rosterButton=function(p,source){const el=document.createElement("button");el.className="roster-item";const formerNote=source==="former"&&p.returnWeeks>0?` - Not currently available - Possible return in ${p.returnWeeks} week${p.returnWeeks===1?"":"s"}`:"";el.innerHTML=`${imageOrPlaceholder(ASSETS.performers[p.id],`${p.name} portrait`,p.name.toUpperCase(),"Portrait coming soon","thumb")}<span><strong>${p.name}</strong><small>${rosterSummary141(p,source)}${formerNote}</small></span>`;el.onclick=()=>chooseProfile(p.id,source);return el};

const train141=train;
train=function(id){const p=state.performers.find(x=>x.id===id);if(p&&p.rank==="A"){setMessage(`${p.name} is already Max Rank.`);render();return}train141(id)};

const renderProfile141=renderProfile;
renderProfile=function(){renderProfile141();const p=selectedPerformer();if(!p)return;const employed=state.performers.some(x=>x.id===p.id);if(employed&&p.rank==="A"){const button=document.querySelector("#profile-train");if(button){button.disabled=true;button.textContent="Max Rank";button.onclick=()=>{setMessage(`${p.name} is already Max Rank.`);render()}}}};

render();
