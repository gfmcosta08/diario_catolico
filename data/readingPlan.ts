import { READING_PLAN_BODY_DATA } from './readingPlanBodyData';
import { READING_PLAN_PUBLIC_DOMAIN_DATA } from './readingPlanPublicDomainData';
import { READING_PLAN_DATA } from './readingPlanData';

const STRICT_FIDELITY_MODE = true;

export type ReadingDay = {
  day: number;
  references: string[];
  body: string | null;
  bodySource: 'licensed' | 'public_domain' | null;
  coverage: number;
  missingReferences: string[];
  optionalAudioUrl?: string | null;
};

const planCache: ReadingDay[] = READING_PLAN_DATA.map((item) => {
  const licensedBody = READING_PLAN_BODY_DATA[item.day] ?? null;
  const publicDomainDay = READING_PLAN_PUBLIC_DOMAIN_DATA[item.day] ?? null;

  if (STRICT_FIDELITY_MODE) {
    return {
      day: item.day,
      references: item.references,
      body: licensedBody,
      bodySource: licensedBody ? 'licensed' : null,
      coverage: licensedBody ? 1 : 0,
      missingReferences: item.references,
      optionalAudioUrl: null,
    };
  }

  return {
    day: item.day,
    references: item.references,
    body: licensedBody ?? publicDomainDay?.body ?? null,
    bodySource: licensedBody ? 'licensed' : (publicDomainDay ? 'public_domain' : null),
    coverage: licensedBody ? 1 : (publicDomainDay?.coverage ?? 0),
    missingReferences: licensedBody ? [] : (publicDomainDay?.missingReferences ?? item.references),
    optionalAudioUrl: null,
  };
});

export function getReadingPlanDay(day: number): ReadingDay {
  const safeDay = Math.min(365, Math.max(1, day));
  return planCache[safeDay - 1];
}

export function getAllReadingDays(): ReadingDay[] {
  return planCache;
}
