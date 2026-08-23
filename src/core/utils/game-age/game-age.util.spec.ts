import { calculateAge } from "@/core/utils/game-age/game-age.util";

describe("calculateAge", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-06-15"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns null for a null birthDate", () => {
    expect(calculateAge(null)).toBeNull();
  });

  it("calculates age when the birthday has already occurred this year", () => {
    expect(calculateAge(new Date("2006-06-15"))).toBe(20);
    expect(calculateAge(new Date("2006-01-01"))).toBe(20);
  });

  it("subtracts one year when the birthday hasn't occurred yet this year", () => {
    expect(calculateAge(new Date("2006-06-16"))).toBe(19);
    expect(calculateAge(new Date("2006-12-31"))).toBe(19);
  });

  it("accepts a string birthDate", () => {
    expect(calculateAge("2006-06-15")).toBe(20);
  });
});
