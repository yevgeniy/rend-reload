let c=0;
function workgen(gen) {
  let name=++c;

  let active=true;
  let childgen=[];

  const mainPromise=new Promise(async (mainPromiseResolve)=> {
    if (gen.constructor.name === "GeneratorFunction") gen = gen();

    let www=workgen._attacher;
    workgen._attacher=p=>childgen.push(p);
    let step = gen.next();
    workgen._attacher=www;
  
    let res;
  
    while (!step.done) { 
      if (step.value && step.value.then) {
        /*promise*/
        res = await step.value;
      } else if (step.value && step.value.next) {
        /*generator*/   
      
        let www=workgen._attacher;
        workgen._attacher=p=>childgen.push(p);
        res = await workgen(step.value);
        workgen._attacher=www;

      } else {
        res = step.value;
      }

      if (!active) {
        mainPromiseResolve(undefined);
        break;
      }
        
      let www=workgen._attacher;
      workgen._attacher=p=>childgen.push(p);
      step = gen.next(res);
      workgen._attacher=www;
    }

    mainPromiseResolve(step.value);
    
  })
  workgen._attacher(mainPromise);

  mainPromise.kill=()=> {
    active=false;
    childgen.forEach(v=>v.kill());
  }  

  return mainPromise;
}
workgen._attacher=()=>{};

function clone(obj) {
  if (!obj) return obj;
  if (obj.constructor === Array) return [...obj];
  else if (obj.constructor === Object) return { ...obj };
  else return obj;
}
function guid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
module.exports = {
  workgen,
  clone,
  guid,
  __esModule: true
};
