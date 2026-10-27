import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Font, pdf } from '@react-pdf/renderer';

import { IaspReportPdfDocument } from './pdf/IaspReportPdfDocument.js';
import {
  buildIaspReportPdfModel,
  type IaspReportPdfInput,
} from './iasp-report-pdf-model.js';

const ASSETS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../assets/iasp-report',
);

let fontsReady: Promise<void> | null = null;
let logoCache: string | null | undefined;

function asset(...parts: string[]): string {
  return path.join(ASSETS_DIR, ...parts);
}

function safeFontRegister(register: () => void): void {
  try {
    register();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.toLowerCase().includes('already registered')) {
      throw error;
    }
  }
}

async function ensurePdfFonts(): Promise<void> {
  if (fontsReady) return fontsReady;

  fontsReady = (async () => {
    safeFontRegister(() => {
      Font.register({
        family: 'Inter',
        fonts: [
          { src: asset('fonts', 'inter-400.ttf'), fontWeight: 400 },
          { src: asset('fonts', 'inter-500.ttf'), fontWeight: 500 },
          { src: asset('fonts', 'inter-600.ttf'), fontWeight: 600 },
          { src: asset('fonts', 'inter-700.ttf'), fontWeight: 700 },
        ],
      });
    });

    safeFontRegister(() => {
      Font.register({
        family: 'DM Serif Display',
        src: asset('fonts', 'dm-serif-display-400.ttf'),
      });
    });

    safeFontRegister(() => {
      Font.register({
        family: 'Rounded Elegance',
        src: asset('fonts', 'Rounded-Elegance-Regular.otf'),
      });
    });

    Font.registerHyphenationCallback((word) => [word]);
  })();

  try {
    await fontsReady;
  } catch (error) {
    fontsReady = null;
    throw error;
  }
}

async function loadLogoDataUrl(): Promise<string | null> {
  if (logoCache !== undefined) return logoCache;
  try {
    const bytes = await readFile(asset('nivarak-logo.png'));
    logoCache = `data:image/png;base64,${bytes.toString('base64')}`;
  } catch {
    logoCache = null;
  }
  return logoCache;
}

/**
 * Builds the paid IAS-P report with the @react-pdf layout. Fonts and the logo
 * are loaded from server/assets — nothing is fetched from the browser.
 */
export async function buildIaspAssessmentReportPdf(
  input: IaspReportPdfInput,
): Promise<Buffer> {
  await ensurePdfFonts();
  const model = buildIaspReportPdfModel(input);
  const logoSrc = await loadLogoDataUrl();

  const instance = pdf(
    <IaspReportPdfDocument model={model} logoSrc={logoSrc} />,
  );
  const blob = await instance.toBlob();
  return Buffer.from(await blob.arrayBuffer());
}
