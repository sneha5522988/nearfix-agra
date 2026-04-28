import { describe, expect, it } from 'vitest';

import { labelsFromNominatimAddress } from '@/lib/nearfix-location-address';

describe('nearfix-location-resolve', () => {
  it('maps Nominatim-style address into city and locality', () => {
    const { city, locality } = labelsFromNominatimAddress({
      neighbourhood: 'Koramangala 5th Block',
      suburb: 'Koramangala',
      city: 'Agra',
      state: 'Uttar Pradesh',
      country: 'India',
    });

    expect(locality).toBe('Koramangala 5th Block');
    expect(city).toBe('Agra');
  });

  it('falls back when granular keys are missing', () => {
    const { city, locality } = labelsFromNominatimAddress({
      town: 'Mysuru',
      state: 'Uttar Pradesh',
    });

    expect(city).toBe('Mysuru');
    expect(locality).toBe('Mysuru');
  });
});
