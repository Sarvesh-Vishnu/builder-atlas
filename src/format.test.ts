import { describe, expect, it } from "vitest";
import { exactCount } from "./format";

describe("exactCount", () => {
  it.each([
    [1160000, "1.16 million"],
    [2400000000, "2.4 billion"],
    [57000000, "57 million"],
    [708000000, "708 million"],
    [2500000000, "2.5 billion"],
    [15000, "15,000"],
  ])("%d → %s", (n, s) => expect(exactCount(n)).toBe(s));
});
