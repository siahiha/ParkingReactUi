import { describe, expect, it } from "vitest";
import { parseHshDetectionConfig } from "./hshDetectionRealtime";

describe("parseHshDetectionConfig", () => {
  it("parses the persisted Eos camera setting", () => {
    expect(
      parseHshDetectionConfig(
        "Eos|http://192.168.1.20:5080|customer-gate-plate",
      ),
    ).toEqual({
      serviceBaseUrl: "http://192.168.1.20:5080",
      triggerIds: ["customer-gate-plate"],
    });
  });

  it("supports multiple trigger ids and the pasted leading mark", () => {
    expect(
      parseHshDetectionConfig(
        "ٍEos|https://anpr.example.test/|entry-trigger, exit-trigger",
      ),
    ).toEqual({
      serviceBaseUrl: "https://anpr.example.test",
      triggerIds: ["entry-trigger", "exit-trigger"],
    });
  });

  it.each([
    "",
    "Eos|not-a-url|trigger",
    "Other|http://localhost:5080|trigger",
    "Eos|http://localhost:5080|",
    "Eos|http://localhost:5080|trigger|extra",
  ])("rejects invalid setting: %s", (value) => {
    expect(parseHshDetectionConfig(value)).toBeNull();
  });
});
