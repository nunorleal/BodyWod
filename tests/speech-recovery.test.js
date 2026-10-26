import test from 'node:test';
import assert from 'node:assert/strict';
import {CoachAudio,repetitionAt} from '../src/audio.js';
import {SessionClock} from '../src/timer.js';
import {prepareSessionPlan} from '../src/pace.js';
function harness(run){
 const keys=['speechSynthesis','SpeechSynthesisUtterance','setTimeout','clearTimeout','setInterval','clearInterval'],old=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 const timers=new Map(),polls=new Map(),spoken=[];let id=0,cancels=0;
 globalThis.setTimeout=(fn,ms)=>{timers.set(++id,{fn,ms});return id};globalThis.clearTimeout=n=>timers.delete(n);
 globalThis.setInterval=fn=>{polls.set(++id,fn);return id};globalThis.clearInterval=n=>polls.delete(n);
 globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
 globalThis.speechSynthesis={speaking:false,pending:false,getVoices:()=>[{lang:'pt-PT',localService:true}],addEventListener(){},resume(){},cancel(){cancels++},speak:u=>spoken.push(u)};
 const step={id:'w',start:0,end:40,duration:40,kind:'work',reps:10,cadence:2,round:1,sets:1,exercise:{id:'push',name:'Flexões clássicas'}};
 let now=0;const plan=prepareSessionPlan({duration:40,timeline:[step]}),clock=new SessionClock(plan,{now:()=>now});
 const coach=new CoachAudio(()=>({voice:true,voiceMode:'full',voiceVolume:1}),()=>{},()=>{clock.hold();return()=>clock.releaseHold()});coach.beep=()=>{};
 try{run({coach,clock,plan,spoken,timers,polls,now:v=>now=v,cancels:()=>cancels})}finally{coach.stop();for(const k of keys)if(old[k]===undefined)delete globalThis[k];else globalThis[k]=old[k]}
}
test('missing speech start never blocks a workout for fifteen seconds and late callbacks are harmless',()=>harness(({coach,clock,plan,spoken,timers,now})=>{
 clock.start();coach.cue(clock.tick(),plan);assert.equal(clock.held,true);assert.match(spoken[0].text,/Começa\.$/);assert.equal(coach.utterances.has(spoken[0]),true);
 const startWatchdog=[...timers.values()].find(t=>t.ms===1200);assert.ok(startWatchdog);now(1200);startWatchdog.fn();assert.equal(clock.held,false);
 now(2200);assert.equal(clock.elapsed,1);spoken[0].onend();assert.equal(clock.elapsed,1);assert.equal(coach.utterances.size,0);
}));
test('missing speech end releases on native idle and all ten counts continue at the scheduled cadence',()=>harness(({coach,clock,plan,spoken,polls,now,cancels})=>{
 clock.start();coach.cue(clock.tick(),plan);spoken[0].onstart();now(1000);for(const poll of [...polls.values()])poll();assert.equal(clock.held,false);assert.equal(clock.elapsed,0);
 for(let i=1;i<=10;i++){now(1000+plan.timeline[0].repTimes[i-1]*1000);coach.cue(clock.tick(),plan);const u=spoken.at(-1);assert.equal(coach.lastRep,i);assert.equal(coach.utterances.has(u),true);u.onstart();u.onend();}
 assert.equal(spoken.length,11);assert.equal(cancels(),1);assert.equal(coach.utterances.size,0);
}));
test('session preparation starts at zero, removes silent lead-in, and preserves duration, cadence and recovery progress',()=>{
 const step={id:'w',start:0,end:120,duration:120,kind:'work',reps:30,cadence:2,cluster:{every:15,rest:10}};
 const original={duration:120,timeline:[step]},plan=prepareSessionPlan(original);
 assert.equal(repetitionAt(plan.timeline[0],0),0);assert.equal(repetitionAt(plan.timeline[0],2),1);assert.equal(repetitionAt(plan.timeline[0],4),2);assert.equal(plan.timeline[0].repTimes[15],42);assert.equal(plan.duration,120);
 assert.deepEqual(prepareSessionPlan(plan),plan);assert.deepEqual(prepareSessionPlan(original,{elapsed:8}),original);assert.equal(original.timeline[0].repTimes,undefined);
});

test('FitTempo keeps the utterance alive and releases a stalled start exactly once',async()=>{
 const fs=await import('node:fs'),vm=await import('node:vm');
 const timers=new Map(),polls=new Map(),spoken=[];let id=0,starts=0;
 const synth={getVoices:()=>[],cancel(){},resume(){},speaking:false,pending:false,speak:u=>spoken.push(u)};
 const ctx={state:{isVoiceEnabled:true},speechTimer:null,guideVoice:{lang:'pt-PT'},loadGuideVoice(){},window:{speechSynthesis:synth},SpeechSynthesisUtterance:class{constructor(text){this.text=text}},setTimeout:(fn,ms)=>{timers.set(++id,{fn,ms});return id},clearTimeout:n=>timers.delete(n),setInterval:fn=>{polls.set(++id,fn);return id},clearInterval:n=>polls.delete(n),console,after:()=>starts++};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/counter/speech.js','utf8'),ctx);
 vm.runInContext('speak("Começa.",false,after)',ctx);assert.equal(ctx.speak.current.utterance,spoken[0]);assert.equal(starts,0);
 [...timers.values()].find(t=>t.ms===1200).fn();assert.equal(starts,1);spoken[0].onend();assert.equal(starts,1);assert.equal(ctx.speak.current,null);
 vm.runInContext('speak("Começa.",false,after)',ctx);spoken[1].onstart();for(const poll of [...polls.values()])poll();assert.equal(starts,2);spoken[1].onend();assert.equal(starts,2);
});
