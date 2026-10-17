export const emptyState=()=>({version:1,preferences:{voiceMode:'full',voice:true,beeps:true,voiceVolume:.85,beepVolume:.35,voiceURI:'',advanceWarning:true},favorites:[],excluded:[],saved:[],history:[],session:null,lastPlan:null});
export function createStore(storage=globalThis.localStorage){
 const key='bodywod.v1';let state=emptyState(),warning='';
 try{const raw=storage.getItem(key);if(raw){const data=JSON.parse(raw);if(data.version!==1)throw Error('Versão não reconhecida');state={...state,...data,preferences:{...state.preferences,...data.preferences}};for(const k of ['favorites','excluded','saved','history'])if(!Array.isArray(state[k]))throw Error('Dados inválidos')}}catch{warning='Não foi possível ler os dados locais. Exporte uma cópia antes de repor os dados.'}
 return {get state(){return state},get warning(){return warning},update(fn){const next=structuredClone(state);fn(next);try{storage.setItem(key,JSON.stringify(next));state=next;warning='';return true}catch{warning='Não foi possível guardar no dispositivo. O armazenamento pode estar cheio ou bloqueado.';return false}},export(){return JSON.stringify(state,null,2)}};
}
