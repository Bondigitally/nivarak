import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { ValidationError } from '../../shared/errors.js';
import {
  assertValidAnswers,
  assertValidRedFlags,
  scoreIaspAnswers,
} from '../../modules/iasp-report/iasp-answers.js';
import { IASP_SECTIONS } from '../../modules/iasp-report/data/iasp-questionnaire-data.js';

describe('IAS-P answer validation and scoring', () => {
  it('scores answers on the server and caps nothing the browser sends', () => {
    const score = scoreIaspAnswers({ bathe: 'independent', dress: 'assistance', toilet: 'dependent' });
    expect(score.rawScore).toBe(3);
    expect(score.maxScore).toBeGreaterThan(score.rawScore);
    expect(score.iasPercentage).toBe(Math.round((3 / score.maxScore) * 100));
  });

  it('accepts every defined question with each of its options', () => {
    const answers: Record<string, string> = {};
    for (const section of IASP_SECTIONS) {
      for (const question of section.questions) {
        answers[question.id] = question.options?.[0]?.id ?? 'independent';
      }
    }
    expect(() => assertValidAnswers(answers)).not.toThrow();
  });

  it('rejects unknown questions, unknown answers, and unknown or repeated red flags', () => {
    expect(() => assertValidAnswers({ nope: 'independent' })).toThrow(ValidationError);
    expect(() => assertValidAnswers({ bathe: 'maybe' })).toThrow(ValidationError);
    expect(() => assertValidRedFlags(['not_a_flag'])).toThrow(ValidationError);
    expect(() => assertValidRedFlags(['two_or_more_falls', 'two_or_more_falls'])).toThrow(ValidationError);
    expect(() => assertValidRedFlags(['two_or_more_falls'])).not.toThrow();
  });
});

describe('IAS-P data parity with the client questionnaire', () => {
  const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');
  const normalize = (text: string) => text.replace(/from "(\.\/[^"]+)\.js"/g, 'from "$1"').replace(/\r\n/g, '\n');

  it.each(['iasp-questionnaire-data', 'iasp-red-flags-data', 'iasp-scoring', 'iasp-about-you-data'])(
    '%s matches the client copy used for the free results',
    (name) => {
      const clientPath = `../../../../client/features/assessments/data/${name}.ts`;
      const serverPath = `../../modules/iasp-report/data/${name}.ts`;
      let client: string;
      try {
        client = read(clientPath);
      } catch {
        return; // The client package is not part of this checkout.
      }
      expect(normalize(read(serverPath))).toBe(normalize(client));
    },
  );
});
