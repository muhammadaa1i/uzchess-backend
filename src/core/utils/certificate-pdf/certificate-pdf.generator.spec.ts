import { PDFDocument, PDFFont, StandardFonts } from "pdf-lib";
import { wrapTextToLines } from "@/core/utils/certificate-pdf/certificate-pdf.generator";

describe("wrapTextToLines", () => {
  let font: PDFFont;

  beforeAll(async () => {
    const doc = await PDFDocument.create();
    font = await doc.embedFont(StandardFonts.Helvetica);
  });

  it("returns the whole text as a single line when it already fits", () => {
    const lines = wrapTextToLines(font, "Introduction to Chess Openings", 9, 525, 2);
    expect(lines).toEqual(["Introduction to Chess Openings"]);
  });

  it("wraps long text across multiple lines, each within maxWidth", () => {
    const text =
      'For successfully completing the course "Advanced Comprehensive Masterclass in Competitive Chess Strategy, Tactics, and Endgame Theory for Serious Tournament Players"';

    const lines = wrapTextToLines(font, text, 9, 525, 2);

    expect(lines).toHaveLength(2);
    // Reassembling the lines must reproduce the original text exactly (no
    // words dropped or duplicated by the wrapping logic).
    expect(lines.join(" ")).toBe(text);
    // Every produced line must actually fit within maxWidth at this size —
    // this is the actual bug being guarded against: a line that's still too
    // wide after "wrapping" would just move the overflow, not fix it.
    for (const line of lines) {
      expect(font.widthOfTextAtSize(line, 9)).toBeLessThanOrEqual(525);
    }
  });

  it("caps output at maxLines, folding any remainder into the final line", () => {
    // A pathologically long text that would need far more than 2 lines to
    // stay within maxWidth — the function must still return exactly 2 lines
    // (per the certificate layout's vertical budget), even if that means the
    // final line ends up wider than maxWidth.
    const words = Array.from({ length: 40 }, (_, i) => `word${i}`);
    const text = words.join(" ");

    const lines = wrapTextToLines(font, text, 9, 100, 2);

    expect(lines).toHaveLength(2);
    expect(lines.join(" ")).toBe(text);
  });

  it("does not drop or duplicate words when the text fits exactly at the boundary", () => {
    const lines = wrapTextToLines(font, "One two three four five six seven", 12, 525, 2);
    expect(lines.join(" ")).toBe("One two three four five six seven");
  });
});
