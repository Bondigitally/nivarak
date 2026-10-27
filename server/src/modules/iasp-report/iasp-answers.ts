import { ValidationError } from '../../shared/errors.js';
import {
  findIaspQuestion,
  getIaspQuestionOptions,
} from './data/iasp-questionnaire-data.js';
import type { IaspAnswerId } from './data/iasp-questionnaire-data.js';
import { IASP_RED_FLAG_OPTIONS } from './data/iasp-red-flags-data.js';
import type { IaspRedFlagId } from './data/iasp-red-flags-data.js';
import {
  IASP_MAX_SCORE,
  calculateIaspPercentage,
  calculateIaspRawScore,
} from './data/iasp-scoring.js';

const RED_FLAG_IDS = new Set<string>(IASP_RED_FLAG_OPTIONS.map((option) => option.id));

/**
 * Rejects question ids and answer values the questionnaire does not define, so
 * the stored jsonb only holds data the scorer understands.
 */
export function assertValidAnswers(answers: Record<string, string>): void {
  const problems: Array<{ field: string; message: string }> = [];
  for (const [questionId, answer] of Object.entries(answers)) {
    const question = findIaspQuestion(questionId);
    if (!question) {
      problems.push({ field: `answers.${questionId}`, message: 'Unknown question' });
      continue;
    }
    const allowed = getIaspQuestionOptions(question).some((option) => option.id === answer);
    if (!allowed) {
      problems.push({ field: `answers.${questionId}`, message: 'Unknown answer' });
    }
  }
  if (problems.length > 0) {
    throw new ValidationError('Validation failed', problems.slice(0, 10));
  }
}

export function assertValidRedFlags(redFlags: string[]): void {
  const unknown = redFlags.filter((id) => !RED_FLAG_IDS.has(id));
  if (unknown.length > 0 || new Set(redFlags).size !== redFlags.length) {
    throw new ValidationError('Validation failed', [
      { field: 'redFlags', message: 'Red flags must be known and unique' },
    ]);
  }
}

/** The server derives every score from the stored answers. */
export function scoreIaspAnswers(answers: Record<string, string>): {
  rawScore: number;
  maxScore: number;
  iasPercentage: number;
} {
  const rawScore = calculateIaspRawScore(answers as Record<string, IaspAnswerId | undefined>);
  return {
    rawScore,
    maxScore: IASP_MAX_SCORE,
    iasPercentage: calculateIaspPercentage(rawScore),
  };
}

export function toRedFlagIds(redFlags: string[]): IaspRedFlagId[] {
  return redFlags.filter((id): id is IaspRedFlagId => RED_FLAG_IDS.has(id));
}
