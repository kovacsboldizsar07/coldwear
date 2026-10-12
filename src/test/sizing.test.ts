import { describe, expect, it } from 'vitest';
import { gloveSizeFor, sockSizeFor } from '@/lib/sizing';

describe('glove size calculator', () => {
  it('17.5 cm → S', () => expect(gloveSizeFor(17.5)).toBe('S'));
  it('18.5 cm → M', () => expect(gloveSizeFor(18.5)).toBe('M'));
  it('19.5 cm → L', () => expect(gloveSizeFor(19.5)).toBe('L'));
  it('21 cm → XL', () => expect(gloveSizeFor(21)).toBe('XL'));
  it('23 cm → XXL', () => expect(gloveSizeFor(23)).toBe('XXL'));
  it('boundary 19 cm picks the larger size (L)', () => expect(gloveSizeFor(19)).toBe('L'));
});

describe('sock size calculator', () => {
  it('37 → 35–38', () => expect(sockSizeFor(37)).toBe('35–38'));
  it('42 → 39–42', () => expect(sockSizeFor(42)).toBe('39–42'));
  it('43 → 43–46', () => expect(sockSizeFor(43)).toBe('43–46'));
});
