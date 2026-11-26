import { describe, expect, it } from 'vitest';
import { angleFrom } from '@/lib/track';

const p = (q: string) => new URLSearchParams(q);
describe('landing angle', () => {
  it('defaults without hints', () => expect(angleFrom(p(''))).toBe('default'));
  it('keeps an explicit bike angle', () => expect(angleFrom(p('angle=bike&utm_content=FISHING'))).toBe('bike'));
  it('detects the fishing ad set from utm_content', () => expect(angleFrom(p('utm_content=FISHING'))).toBe('fishing'));
  it('accepts angle=fishing', () => expect(angleFrom(p('angle=fishing'))).toBe('fishing'));
  it('ignores other ad sets', () => expect(angleFrom(p('utm_content=BROAD%20FFI'))).toBe('default'));
});
