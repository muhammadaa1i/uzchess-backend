import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";
import {
  PDFDocument,
  PDFFont,
  PDFImage,
  PDFPage,
  StandardFonts,
  rgb,
} from "pdf-lib";
import * as QRCode from "qrcode";

const TEMPLATE_WIDTH = 842;
const TEMPLATE_HEIGHT = 595;
const RASTER_DENSITY = 72 * 3;
const BACKGROUND = rgb(0xf7 / 255, 0xf9 / 255, 0xfa / 255);
const ACCENT_BLUE = rgb(0x1c / 255, 0x92 / 255, 0xe0 / 255);
const TEXT_DARK = rgb(0x13 / 255, 0x18 / 255, 0x1c / 255);
const TEXT_GRAY = rgb(0.6, 0.6, 0.6);

// The template.svg is a raw design export with an example name/description/date and a
// decorative (non-functional) QR graphic baked in as static paths. These two regions cover
// that baked-in content with the background color so the real dynamic values can be drawn
// on top without visually overlapping the example content.
const NAME_BLOCK_MASK = { x: 140, y: 230, width: 565, height: 160 };
const QR_MASK = { x: 110, y: 20, width: 135, height: 130 };

type CertificateData = {
  fullName: string;
  courseTitle: string;
  code: string;
  issuedAt: string | Date;
};

async function renderTemplate(): Promise<Buffer> {
  const svgBytes = fs.readFileSync(
    path.join(process.cwd(), "assets/certificate/template.svg"),
  );
  return sharp(svgBytes, { density: RASTER_DENSITY }).png().toBuffer();
}

async function generateVerificationQr(code: string): Promise<Buffer> {
  const verifyUrl = `${process.env.APP_URL ?? "http://localhost:8000"}/certificates/${code}/verify`;
  return QRCode.toBuffer(verifyUrl, { type: "png", margin: 0 });
}

function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
}

function fitFontSize(
  font: PDFFont,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number,
): number {
  let size = startSize;
  while (size > minSize && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 1;
  }
  return size;
}

function drawTemplateBackground(page: PDFPage, image: PDFImage) {
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: TEMPLATE_WIDTH,
    height: TEMPLATE_HEIGHT,
  });
  page.drawRectangle({ ...NAME_BLOCK_MASK, color: BACKGROUND });
  page.drawRectangle({ ...QR_MASK, color: BACKGROUND });
  page.drawLine({
    start: { x: 157, y: 311.83 },
    end: { x: 685, y: 311.83 },
    thickness: 2.75,
    color: ACCENT_BLUE,
  });
}

function drawStudentName(page: PDFPage, font: PDFFont, fullName: string) {
  const size = fitFontSize(font, fullName, 525, 30, 16);
  const width = font.widthOfTextAtSize(fullName, size);
  page.drawText(fullName, {
    x: (TEMPLATE_WIDTH - width) / 2,
    y: 322,
    size,
    font,
    color: TEXT_DARK,
  });
}

function drawCourseLine(page: PDFPage, font: PDFFont, courseTitle: string) {
  const text = `For successfully completing the course "${courseTitle}"`;
  const size = fitFontSize(font, text, 525, 14, 9);
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: (TEMPLATE_WIDTH - width) / 2,
    y: 288,
    size,
    font,
    color: TEXT_DARK,
  });
}

function drawIssueDate(page: PDFPage, font: PDFFont, issuedAt: string | Date) {
  const text = formatDate(issuedAt);
  const size = 11;
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: (TEMPLATE_WIDTH - width) / 2,
    y: 262,
    size,
    font,
    color: TEXT_GRAY,
  });
}

function drawVerificationQr(page: PDFPage, qrImage: PDFImage) {
  const centerX = QR_MASK.x + QR_MASK.width / 2;
  const centerY = QR_MASK.y + QR_MASK.height / 2;

  const borderSize = 119;
  page.drawRectangle({
    x: centerX - borderSize / 2,
    y: centerY - borderSize / 2,
    width: borderSize,
    height: borderSize,
    borderColor: ACCENT_BLUE,
    borderWidth: 2,
  });

  const qrSize = 100;
  page.drawImage(qrImage, {
    x: centerX - qrSize / 2,
    y: centerY - qrSize / 2,
    width: qrSize,
    height: qrSize,
  });
}

export async function generateCertificatePdf(
  data: CertificateData,
): Promise<Buffer> {
  const [templatePng, qrPng] = await Promise.all([
    renderTemplate(),
    generateVerificationQr(data.code),
  ]);

  const doc = await PDFDocument.create();
  const templateImage = await doc.embedPng(templatePng);
  const qrImage = await doc.embedPng(qrPng);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await doc.embedFont(StandardFonts.Helvetica);

  const page = doc.addPage([TEMPLATE_WIDTH, TEMPLATE_HEIGHT]);

  drawTemplateBackground(page, templateImage);
  drawStudentName(page, boldFont, data.fullName);
  drawCourseLine(page, regularFont, data.courseTitle);
  drawIssueDate(page, regularFont, data.issuedAt);
  drawVerificationQr(page, qrImage);

  return Buffer.from(await doc.save());
}
