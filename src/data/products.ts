import { Product } from '../types';

export const initialProducts: Product[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    sku: '8904109242281',
    name: 'Meenakari Gold Metallic Ganesh Swastik',
    description: `A beautiful, auspicious Swastik symbol with a central Lord Ganesha idol. Crafted with vibrant Meenakari enamel on a golden metallic base. Self-adhesive, ideal for placing at the entrance of homes, on doors, or in puja rooms to invite prosperity.`,
    category: 'Meenakari Auspicious Decor',
    material: 'Gold Metalised Plastic Mould with Meenakari work',
    size: '12.3cm / 4.8 inches',
    features: ['Gold Metalised', 'Meenakari', 'Plastic Mould', 'Self-Adhesive'],
    ideal_locations: ['Main door', 'Temple frame center', 'Puja room wall'],
    visual_style: {
      lighting: 'Soft, warm, devotional light',
      camera_focus: 'macro on gold texture, red/green enamel details, Ganesha figure',
      tone: 'auspicious, elegant, spiritual'
    },
    continuityBatch: 'Festive Decor 2025 Series A',
    related_products: ['f0g1h2i3-j4k5-6789-0123-456789abcdef0', 'b2c3d4e5-f6a7-8901-2345-67890abcdef1']
  },
  {
    id: 'f0g1h2i3-j4k5-6789-0123-456789abcdef0',
    sku: '8904109244077',
    name: 'Daily So Medium Holo Rangoli & Kolam Umra Patti Combo',
    description: 'A combo pack of 4 self-adhesive, laminated vinyl stickers with a stunning holographic finish. Includes 2 medium rangoli designs and 2 Kolam Umra Patti for door thresholds.',
    category: 'Holographic Rangoli Sticker',
    material: 'Self-adhesive laminated vinyl with holographic finish',
    features: ['Glossy Effect', 'Holographic Effect', 'Self-Adhesive', 'Laminated'],
    pack: 'Pack of 4 (2 Rangoli + 2 Kolam Patti)',
    ideal_locations: ['Entrances', 'Puja rooms', 'Temple floors', 'Office doors'],
    how_to_use: [
      'Clean surface thoroughly',
      'Peel sticker carefully from backing',
      'Apply symmetrically to the desired surface',
      'Smooth out any air bubbles for a perfect finish'
    ],
    visual_style: {
      lighting: 'Warm indoor soft tone, highlighting reflections',
      camera_focus: 'macro on holographic shine, reflections from diyas, vibrant colors',
      tone: 'devotional, elegant, festive, modern'
    },
    continuityBatch: 'Festive Decor 2025 Series A'
  },
  {
    id: 'f0g1h2i3-j4k5-6789-0123-456789abcdef',
    sku: '8904109244056',
    name: 'Daily So MDF Rangoli 8x8 Combo Pack of 8 Pcs',
    description: 'A combo pack of 8 easy-to-use, laser-cut MDF wood pieces to create beautiful, vibrant rangoli designs. Perfect for home entrances, temple decor, and office receptions during festive seasons.',
    category: 'MDF Rangoli',
    material: 'Laser-cut MDF wood',
    size: '8 in × 8 in each',
    finish: 'Natural MDF base suitable for rangoli colors',
    use_cases: ['Home entrances', 'Temple décor', 'Office receptions', 'DIY Craft Projects'],
    how_to_use: [
      'Assemble MDF cutouts on a clean surface',
      'Add rangoli colors or flower petals into the patterns',
      'Give finishing touches with diyas or glitter',
      'Use as a stunning piece of home décor'
    ],
    visual_keywords: ['macro shot of MDF texture', 'color filling with hands', 'finished vibrant rangoli on floor', 'top-view symmetry', 'laser-cut precision'],
    continuityBatch: 'Craft Series 2025'
  },
  {
    id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
    name: 'Diya & Laxmi Charan Rangoli Sticker Set',
    description: `A beautiful, intricate Rangoli sticker set featuring glowing diyas and the auspicious footprints of Goddess Laxmi. Made from high-quality golden material, this sticker is designed to be placed on a clean floor near the entrance or on the 'umbartha' (door threshold) to create a welcoming and festive look without the mess of traditional powders.`,
    category: 'Floor Rangoli Sticker',
    continuityBatch: 'Festive Decor 2025 Series A'
  },
  {
    id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef12',
    name: 'Vibrant Peacock Mandala Rangoli Stickers (Pack of 6)',
    description: `Instantly beautify your home with this pack of six unique and vibrant Mandala-style Rangoli stickers. Featuring stunning peacock designs on a golden PVC base. A mess-free alternative to traditional rangoli, they can be applied to floors to create a stunning decorative arrangement for Diwali, weddings, and other cultural celebrations.`,
    category: 'Floor Rangoli Sticker',
    continuityBatch: 'Festive Decor 2025 Series A'
  }
];