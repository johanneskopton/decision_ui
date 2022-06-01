import { UVType } from "../../src/UncertainVariable";
import { UV } from "../../src/UncertainVariable";

let a = new UV(UVType.Normal, { min90ci: 0.2, max90ci: 1.2 });

test("create valid normal random variable", () => {
  expect(a.params.min90ci).toBe(0.2);
  expect(a.params.max90ci).toBe(1.2);
  expect(a.type.id).toBe(2);
  expect(a.is_valid).toBe(true);
  expect(a.get_most_likely()).toBe(0.7);
});

let b = new UV(UVType.Normal, { min90ci: 2.2, max90ci: 1.2 });

test("create invalid normal random variable", () => {
  expect(b.params.min90ci).toBe(2.2);
  expect(b.params.max90ci).toBe(1.2);
  expect(b.type.id).toBe(2);
  expect(b.is_valid).toBe(false);
});

let c = () => {
  new UV(UVType.Normal, { min90ci: 1 });
};
test("create normal random variable incompletely", () => {
  expect(c).toThrow("incomplete definition of random variable!");
});

let d = new UV(UVType.Bernoulli, { p: 0.6 });
test("create valid Bernoulli random varibale", () => {
  expect(d.params.p).toBe(0.6);
  expect(d.is_valid).toBe(true);
  expect(d.get_most_likely()).toBe(1);
});
