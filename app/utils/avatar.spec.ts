import { describe, it, expect } from "vitest";
import { getAvatarUrl } from "./avatar";

describe("getAvatarUrl", () => {
  it("generates a valid SVG data URI", () => {
    const url = getAvatarUrl("John Doe");
    expect(url).toContain("data:image/svg+xml;utf8,");
    expect(url).toContain("JD");
  });

  it("handles single-word and empty names gracefully", () => {
    const single = getAvatarUrl("Alice");
    expect(single).toContain("A");

    const empty = getAvatarUrl("");
    expect(empty).toContain("U");

    const undefinedName = getAvatarUrl(undefined);
    expect(undefinedName).toContain("U");
  });

  it("supports custom and random background colors", () => {
    const custom = getAvatarUrl("Jane", "6366f1", "ffffff");
    expect(custom).toContain("6366f1");

    const random = getAvatarUrl("Bob", "random");
    expect(random).toContain("data:image/svg+xml;utf8,");
  });
});
