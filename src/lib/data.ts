const higgs = (file: string, w: number): string =>
  `https://images.higgs.ai/?default=1&output=webp&url=${encodeURIComponent(
    `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/${file}.png`,
  )}&w=${w}&q=90`;

export const PROPS_SHEET = higgs('hf_20261123_061331_a11a52ac-d35b-4489-afdc-0e3d97464d02', 1024);
export const RING_IMG = higgs('hf_20261123_061250_28696685-24a2-408e-8365-47c9b892d5cc', 1024);

export interface Flavour {
  /** Two lines, as printed in the hero. */
  name: [string, string];
  label: string;
  bg: string;
  ink: string;
  img: string;
  bowl: string;
  scoops: [string, string, string];
  line: string;
  /** Price of one 500 ml tub, in euros. */
  price: number;
}

export const FLAVOURS: Flavour[] = [
  {
    name: ['FRUITS ROUGES /', 'ROSE'], label: 'Fruits rouges / Rose', bg: '#9C8FD0', ink: '#34284A',
    img: higgs('hf_20261123_062631_ec34a231-9141-457a-afd9-637effe7ec03', 1400),
    bowl: 'Porcelaine ivoire, fin liseré doré',
    scoops: ['Framboise', 'Rose poudrée', 'Cassis'],
    line: 'La framboise acidulée d’abord, les pétales de rose ensuite, le cassis pour finir.',
    price: 11,
  },
  {
    name: ['PISTACHE /', 'CRÈME'], label: 'Pistache / Crème', bg: '#E8A0B4', ink: '#4A1F33',
    img: higgs('hf_20261123_062744_ac87ceec-2040-4078-80fd-6b6bf016f675', 1400),
    bowl: 'Émail bordeaux, liseré doré',
    scoops: ['Pistache', 'Vanille en gousse', 'Chocolat blanc'],
    line: 'Des éclats de pistache sur une vanille infusée lentement, et des copeaux de chocolat blanc.',
    price: 13,
  },
  {
    name: ['MANGUE /', 'PASSION'], label: 'Mangue / Passion', bg: '#F5D4BA', ink: '#5A3216',
    img: higgs('hf_20261123_062753_b99d867d-9f15-4cde-a4b0-08e68fe96931', 1400),
    bowl: 'Émail cobalt, liseré doré',
    scoops: ['Mangue', 'Pêche', 'Fruit de la passion'],
    line: 'Mangue bien mûre, une tranche de pêche et des graines de passion pour le croquant.',
    price: 11,
  },
  {
    name: ['CHOCO NOIR /', 'NOISETTE'], label: 'Choco noir / Noisette', bg: '#C49A9A', ink: '#3B2222',
    img: higgs('hf_20261123_062803_7758f16c-7b82-4eb3-9c3e-aca45f2feda3', 1400),
    bowl: 'Grès vert sauge, liseré doré',
    scoops: ['Chocolat noir', 'Noisette', 'Café'],
    line: 'Chocolat amer, noisette torréfiée et trois grains de café entiers.',
    price: 12,
  },
  {
    name: ['MYRTILLE /', 'LAVANDE'], label: 'Myrtille / Lavande', bg: '#EBD98A', ink: '#2D2F63',
    img: higgs('hf_20261123_062812_b00d1221-9fcc-425e-9c6e-a51ed94ea059', 1400),
    bowl: 'Émail terre cuite, liseré doré',
    scoops: ['Myrtille', 'Lavande', 'Crème lilas'],
    line: 'Des myrtilles fraîches face aux fleurs de lavande. Doux, floral, peu sucré.',
    price: 12,
  },
];

export type PropKey = 'cone' | 'rasp' | 'blue' | 'spoonL' | 'spoonR';

/** Crops of the 1024×688 props sheet: [x, y, w, h]. */
export const PROP_BOXES: Record<PropKey, [number, number, number, number]> = {
  cone: [100, 63, 249, 276],
  rasp: [405, 214, 137, 132],
  blue: [691, 130, 186, 160],
  spoonL: [127, 381, 234, 211],
  spoonR: [658, 380, 233, 218],
};

export const NAV: [href: string, label: string][] = [
  ['#flavours', 'Parfums'],
  ['#lab', 'Le labo'],
  ['#box', 'Mon coffret'],
  ['#counters', 'Comptoirs'],
];
