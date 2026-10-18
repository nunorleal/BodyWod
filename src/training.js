// Programming roles are separate from technical difficulty: a simple squat can be hard at volume.
const activationNames=new Set(['Anjos invertidos','Elevações em Y','Elevações em T','Elevações em W','Elevações em I','Sequência Y-T-W','Retração escapular deitado','Deslizamentos dos braços na parede','Flexões escapulares','Flexões escapulares em prancha alta','Círculos dos braços','Braços em cruz isométricos','Pressão das palmas','Curl de bíceps com autorresistência','Extensão de tríceps com autorresistência']);
const posteriorNames=new Set(['Superman isométrico','Swimmers','Bird dog com cotovelo ao joelho','Bird dog isométrico','Dobradiça da anca a uma perna','Prancha invertida']);
const cardioNames=new Set(['Burpees','Burpees sem salto','Burpees sem flexão','Squat thrusts','High knees','Skaters','Mountain climbers','Mountain climbers cruzados','Bear crawl','Bear crawl para trás','Crab walk','Inchworm com flexão','Prancha com abertura dos pés','Boxe com deslocamento','Mountain climbers lentos','Prancha com passos dos pés','Agachamento com socos']);
export function trainingRole(exercise){return activationNames.has(exercise.name)?'activation':['Aquecimento','Retorno à calma'].includes(exercise.category)?'mobility':'training'}
export function suitableForMain(exercise,level){
 if(level!==3)return true;
 if(trainingRole(exercise)==='activation')return false;
 if(exercise.category==='Costas e cadeia posterior')return posteriorNames.has(exercise.name);
 if(exercise.category==='Peito e tríceps')return exercise.difficulty>=2&&!['Flexões de joelhos','Flexões na parede'].includes(exercise.name);
 if(exercise.category==='Pernas e glúteos')return ['agachar','passada'].includes(exercise.pattern)||['Pontes de glúteos a uma perna','Pontes de glúteos com marcha'].includes(exercise.name);
 if(exercise.category==='Ombros e braços')return exercise.difficulty>=2;
 if(exercise.category==='Abdominais e core')return exercise.difficulty>=2;
 if(exercise.category==='Cardio e corpo inteiro')return cardioNames.has(exercise.name);
 return true;
}
export const advancedWodSequence=[
 {category:'Cardio e corpo inteiro',focus:['Burpees','Burpees sem salto','Burpees sem flexão']},
 {category:'Pernas e glúteos',focus:['Lunges alternados','Lunges reversos','Lunges com pausa','Lunges com salto','Lunges estáticos']},
 {category:'Peito e tríceps',focus:['Flexões clássicas','Flexões com pausa','Flexões abertas','Flexões diamante','Flexões excêntricas']},
 {category:'Pernas e glúteos',focus:['Agachamentos','Agachamentos com pausa','Agachamentos sumo','Agachamentos com salto','Agachamentos com descida lenta']},
 {category:'Abdominais e core',focus:['Sit-ups','Tuck-ups','V-ups','Bicycle crunches','Crunch com pernas verticais']}
];
export function advancedRepProfile(exercise){
 if(exercise.execution!=='reps')return null;
 const n=exercise.name;
 let cadence=1.5,every=15;
 if(/pausa|excêntric|lent[ao]|descida lenta/i.test(n))cadence=3.5;
 else if(/^Burpees|Inchworm/i.test(n)){cadence=3;every=10}
 else if(exercise.category==='Costas e cadeia posterior')cadence=2;
 else if(['Tuck-ups','V-ups'].includes(n))cadence=2;
 else if(exercise.impact==='high'||exercise.difficulty===3)cadence=2;
 // Classic pushups retain the requested 1.5 s rhythm; technical variants take longer.
 if(exercise.category==='Peito e tríceps'&&!/pausa|excêntric|lent[ao]/i.test(n))cadence=1.5;
 return {cadence,cap:90,cluster:{every,rest:10}};
}
// A cluster window includes preparation, repetitions and its short recoveries.
export function clusterRepTime(index,{cadence=1.5,cluster},start=6){return start+index*cadence+Math.floor(index/cluster.every)*cluster.rest}
export function clusterTarget(duration,profile){
 let count=0;while(count<profile.cap&&clusterRepTime(count,profile)<=duration-1.5)count++;
 return count;
}
export function clusterPause(step,elapsed){
 if(!step.cluster||!step.reps||step.kind!=='work')return null;
 for(let n=step.cluster.every;n<step.reps;n+=step.cluster.every){
  const start=clusterRepTime(n-1,step)+step.cadence,end=clusterRepTime(n,step);
  if(elapsed>=start&&elapsed<end)return {group:n/step.cluster.every,remaining:end-elapsed};
 }
 return null;
}
