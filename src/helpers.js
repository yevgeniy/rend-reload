async function workgen(gen) {
  if (gen.constructor.name === "GeneratorFunction") gen = gen();
  let step = gen.next();

  let res;

  while (!step.done) {
    if (step.value && step.value.then) {
      /*promise*/
      res = await step.value;
    } else if (step.value && step.value.next) {
      /*generator*/
      res = await workgen(step.value);
    } else {
      res = step.value;
    }
    step = gen.next(res);
  }
  return step.value;
}
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
