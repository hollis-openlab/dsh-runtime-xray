// src/invariant.ts
var name = "dsh-runtime-xray-invariant";
var inject = ["invariants"];
function apply(ctx) {
  return Promise.resolve(ctx.invariants.register("@deepseek-ai/dsh-runtime-xray", () => {
  }));
}
export {
  apply,
  inject,
  name
};
