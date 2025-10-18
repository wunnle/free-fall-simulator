import React from 'react';
import { translations, type Language } from '../translations';

interface ReferenceHeightBandsProps {
  maxHeight: number;
  language: Language;
}

interface HeightReference {
  height: number;
  translationKey: keyof typeof translations.en;
  minRange?: number;
  maxRange?: number;
  displayHeight: string;
}

const heightReferences: HeightReference[] = [
  { height: 67, translationKey: 'galataTower', minRange: 27, maxRange: 500, displayHeight: '67m' },
  { height: 23, translationKey: 'maidenTower', minRange: 23, maxRange: 500, displayHeight: '23m' },
  { height: 165, translationKey: 'bosphorusBridge', minRange: 165, maxRange: 2000, displayHeight: '165m' },
  { height: 369, translationKey: 'camlicaTower', minRange: 369, maxRange: 3000, displayHeight: '369m' },
  { height: 4000, translationKey: 'skydivingAltitude', minRange: 3000, maxRange: 5000, displayHeight: '4km' },
  { height: 3917, translationKey: 'mountErciyes', minRange: 3000, displayHeight: '3917m' },
  { height: 8849, translationKey: 'mountEverest', minRange: 8849, maxRange: 30000, displayHeight: '8849m' },
  { height: 10000, translationKey: 'cruisingAltitude', minRange: 10000, maxRange: 30000, displayHeight: '10km' },
  { height: 20000, translationKey: 'stratosphere', minRange: 20000, displayHeight: '20km' },
  { height: 39000, translationKey: 'felixBaumgartnerJump', minRange: 39000, displayHeight: '39km' },
  { height: 50000, translationKey: 'mesosphere', minRange: 50000, displayHeight: '50km' },
];

export default function ReferenceHeightBands({ maxHeight, language }: ReferenceHeightBandsProps) {
  const t = translations[language];

  return (
    <>
      {heightReferences.map((ref, index) => {
        const shouldShow = maxHeight >= ref.height && 
          (ref.maxRange ? maxHeight < ref.maxRange : true);

        if (!shouldShow) return null;

        return (
          <div
            key={index}
            className="absolute left-0 right-0 border-t border-dashed border-gray-300"
            style={{ bottom: `${(ref.height / maxHeight) * 72 + 8}%` }}
          >
            <span className="absolute right-2 -top-3 text-xs bg-white bg-opacity-80 px-1 rounded text-gray-600">
              {t[ref.translationKey]} ({ref.displayHeight})
            </span>
          </div>
        );
      })}
    </>
  );
}