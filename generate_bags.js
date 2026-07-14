import { Jimp } from 'jimp';
import { loadFont } from 'jimp';
import fs from 'fs';
import path from 'path';

// Helper to convert hex colors to RGBA components
function hexToRgb(hex) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

async function generateBags() {
  console.log('Starting programmatic 3D Rice Bag Image Generation...');

  // Load fonts
  // We have different font sizes in node_modules/@jimp/plugin-print/fonts/open-sans/
  const fontPath16 = 'node_modules/@jimp/plugin-print/fonts/open-sans/open-sans-16-black/open-sans-16-black.fnt';
  const fontPath32 = 'node_modules/@jimp/plugin-print/fonts/open-sans/open-sans-32-black/open-sans-32-black.fnt';
  const fontPath16White = 'node_modules/@jimp/plugin-print/fonts/open-sans/open-sans-16-white/open-sans-16-white.fnt';
  
  const font16 = await loadFont(fontPath16);
  const font32 = await loadFont(fontPath32);
  const font16White = await loadFont(fontPath16White);

  const configs = [
    {
      filename: 'lily.png',
      variety: 'BPT RICE',
      brand: 'LILY',
      bandColor: '#1E3A8A', // Deep Royal Blue
      badgeColor: '#FFFFFF',
      flowerType: 'lily',
      tagline: 'PREMIUM QUALITY SELECTION'
    },
    {
      filename: 'lotus.png',
      variety: 'KURNOOL SONA',
      brand: 'LOTUS',
      bandColor: '#DC2626', // Rich Crimson Red
      badgeColor: '#FFFFFF',
      flowerType: 'lotus',
      tagline: 'OLD HARVEST CHIPURA RICE'
    },
    {
      filename: 'jasmine.png',
      variety: 'HMT RICE',
      brand: 'JASMINE',
      bandColor: '#059669', // Rich Emerald Green
      badgeColor: '#FFFFFF',
      flowerType: 'jasmine',
      tagline: 'FINE GRAIN SUPER SILKY'
    },
    {
      filename: 'sunflower.png',
      variety: 'NDL RICE',
      brand: 'SUNFLOWER',
      bandColor: '#D97706', // Vibrant Gold/Amber
      badgeColor: '#FFFFFF',
      flowerType: 'sunflower',
      tagline: 'HIGH NUTRITION & SWELLING'
    },
    {
      filename: 'Browntopmillet.png',
      variety: 'BROWN TOP MILLET',
      brand: 'ORGANIC',
      bandColor: '#78350F', // Warm brown/amber
      badgeColor: '#FFFFFF',
      flowerType: 'sunflower',
      tagline: 'ANDU KORRALU - HIGH FIBER'
    },
    {
      filename: 'Chittimuthyalurice.png',
      variety: 'CHITTI MUTYALU',
      brand: 'ROYAL',
      bandColor: '#4338CA', // Indigo
      badgeColor: '#FFFFFF',
      flowerType: 'jasmine',
      tagline: 'PEARL AROMATIC BIRYANI'
    },
    {
      filename: 'Foxtailmillet.png',
      variety: 'FOXTAIL MILLET',
      brand: 'NATURAL',
      bandColor: '#047857', // Emerald Green
      badgeColor: '#FFFFFF',
      flowerType: 'sunflower',
      tagline: 'KORRALU - HEALTH IMMUNITY'
    },
    {
      filename: 'Quinoa.png',
      variety: 'ORGANIC QUINOA',
      brand: 'SUPERFOOD',
      bandColor: '#BE185D', // Magenta/Pink
      badgeColor: '#FFFFFF',
      flowerType: 'lily',
      tagline: 'KINOVA - COMPLETE PROTEIN'
    },
    {
      filename: 'Idlyrava.png',
      variety: 'PREMIUM IDLI RAVA',
      brand: 'JMR',
      bandColor: '#C2410C', // Red-orange
      badgeColor: '#FFFFFF',
      flowerType: 'jasmine',
      tagline: 'DOUBLE MILLED FLUFFY'
    },
    {
      filename: 'Ricebran.png',
      variety: 'NUTRITIOUS BRAN',
      brand: 'HEALTHY',
      bandColor: '#854D0E', // Golden Olive/Brown
      badgeColor: '#FFFFFF',
      flowerType: 'sunflower',
      tagline: 'RICH IN DIETARY FIBER'
    },
    {
      filename: 'Kodomillet.png',
      variety: 'KODO MILLET',
      brand: 'HEALTH',
      bandColor: '#15803D', // Green
      badgeColor: '#FFFFFF',
      flowerType: 'sunflower',
      tagline: 'ARIKELU - ANTIOXIDANT'
    },
    {
      filename: 'Littlemillet.png',
      variety: 'LITTLE MILLET',
      brand: 'PURE',
      bandColor: '#0F766E', // Teal
      badgeColor: '#FFFFFF',
      flowerType: 'sunflower',
      tagline: 'SAMALU - MINERAL RICH'
    },
    {
      filename: 'Redrice.png',
      variety: 'KERALA RED RICE',
      brand: 'TRADITIONAL',
      bandColor: '#B91C1C', // Dark Red
      badgeColor: '#FFFFFF',
      flowerType: 'lotus',
      tagline: 'WHOLESOME UNPOLISHED'
    },
    {
      filename: 'Ricerava.png',
      variety: 'RICE RAVA (UPMA)',
      brand: 'JMR',
      bandColor: '#DB2777', // Deep Pink
      badgeColor: '#FFFFFF',
      flowerType: 'jasmine',
      tagline: 'PERFECT TEXTURE UPMA'
    },
    {
      filename: 'Brokenrice.png',
      variety: 'BROKEN RICE',
      brand: 'VALUE',
      bandColor: '#475569', // Slate Gray
      badgeColor: '#FFFFFF',
      flowerType: 'jasmine',
      tagline: 'NOOKA - MULTI USE'
    },
    {
      filename: 'Barnyardmillet.png',
      variety: 'BARNYARD MILLET',
      brand: 'ORGANIC',
      bandColor: '#0369A1', // Light Blue
      badgeColor: '#FFFFFF',
      flowerType: 'sunflower',
      tagline: 'OODALU - DIGESTIVE'
    },
    {
      filename: 'Blackrice.png',
      variety: 'BLACK RICE',
      brand: 'ANCIENT',
      bandColor: '#111827', // Charcoal/Black
      badgeColor: '#FFFFFF',
      flowerType: 'lotus',
      tagline: 'KARUPPU KAVUNI - ANTIOXIDANT'
    },
    {
      filename: 'Boiledrice.png',
      variety: 'BOILED RICE',
      brand: 'PRE-STEAMED',
      bandColor: '#0284C7', // Sky Blue
      badgeColor: '#FFFFFF',
      flowerType: 'lily',
      tagline: 'PONNI - EASY DIGESTIBILITY'
    }
  ];

  for (const config of configs) {
    console.log(`Generating image for ${config.brand} brand...`);
    
    // Create canvas
    const width = 600;
    const height = 600;
    const img = new Jimp({ width, height });

    // Set background with soft studio vignette
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - 300;
        const dy = y - 300;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Studio vignette color: light grey-blue `#F3F4F6` at center to `#D1D5DB` at edges
        const r = Math.max(205, Math.min(245, Math.round(243 - dist * 0.08)));
        const g = Math.max(205, Math.min(245, Math.round(244 - dist * 0.08)));
        const b = Math.max(215, Math.min(250, Math.round(246 - dist * 0.07)));
        
        const hexColor = ((r << 24) | (g << 16) | (b << 8) | 255) >>> 0;
        img.setPixelColor(hexColor, x, y);
      }
    }

    // Draw soft floor shadow under the bag
    // Shadow center (300, 528), radius_x = 160, radius_y = 24
    for (let y = 500; y < 555; y++) {
      for (let x = 120; x < 480; x++) {
        const dx = x - 300;
        const dy = y - 528;
        const shadowVal = (dx * dx) / (160 * 160) + (dy * dy) / (24 * 24);
        if (shadowVal <= 1) {
          // Soften edge of shadow
          const intensity = 0.52 * (1 - shadowVal);
          const currentHex = img.getPixelColor(x, y);
          const cr = (currentHex >>> 24) & 255;
          const cg = (currentHex >>> 16) & 255;
          const cb = (currentHex >>> 8) & 255;
          
          const nr = Math.round(cr * (1 - intensity));
          const ng = Math.round(cg * (1 - intensity));
          const nb = Math.round(cb * (1 - intensity));
          
          const nextHex = ((nr << 24) | (ng << 16) | (nb << 8) | 255) >>> 0;
          img.setPixelColor(nextHex, x, y);
        }
      }
    }

    // Render the bag
    const bagLeft = 150;
    const bagRight = 450;
    const bagWidth = bagRight - bagLeft; // 300
    const bagTop = 70;
    const bagBottom = 525;
    const bagHeight = bagBottom - bagTop; // 455

    const bandRgb = hexToRgb(config.bandColor);

    for (let y = bagTop; y < bagBottom; y++) {
      for (let x = bagLeft; x < bagRight; x++) {
        // Rounded corners verification
        let outside = false;
        const cornerR = 22;
        
        // Top Left rounded corner
        if (x < bagLeft + cornerR && y < bagTop + cornerR) {
          const dx = x - (bagLeft + cornerR);
          const dy = y - (bagTop + cornerR);
          if (dx * dx + dy * dy > cornerR * cornerR) outside = true;
        }
        // Top Right rounded corner
        if (x > bagRight - cornerR && y < bagTop + cornerR) {
          const dx = x - (bagRight - cornerR);
          const dy = y - (bagTop + cornerR);
          if (dx * dx + dy * dy > cornerR * cornerR) outside = true;
        }
        // Bottom Left rounded corner
        if (x < bagLeft + cornerR && y > bagBottom - cornerR) {
          const dx = x - (bagLeft + cornerR);
          const dy = y - (bagBottom - cornerR);
          if (dx * dx + dy * dy > cornerR * cornerR) outside = true;
        }
        // Bottom Right rounded corner
        if (x > bagRight - cornerR && y > bagBottom - cornerR) {
          const dx = x - (bagRight - cornerR);
          const dy = y - (bagBottom - cornerR);
          if (dx * dx + dy * dy > cornerR * cornerR) outside = true;
        }

        if (outside) continue;

        // Base bag material: clean cream-white `#FCFCFB`
        let r = 252;
        let g = 251;
        let b = 248;

        // Draw top band and bottom band
        const isTopBand = (y >= 115 && y <= 145);
        const isBottomBand = (y >= 455 && y <= 485);
        if (isTopBand || isBottomBand) {
          r = bandRgb.r;
          g = bandRgb.g;
          b = bandRgb.b;
        } else {
          // Add plastic woven texture overlay inside the cream-white bag body
          if (x % 4 === 0 || y % 4 === 0) {
            // Subtle shading variation to simulate weave
            r -= 8;
            g -= 8;
            b -= 12;
          }
        }

        // Draw circular badge in the middle
        const bCenterX = 300;
        const bCenterY = 300;
        const bRadius = 80;
        const dx = x - bCenterX;
        const dy = y - bCenterY;
        const distToBadge = Math.sqrt(dx * dx + dy * dy);

        if (distToBadge <= bRadius) {
          if (distToBadge >= bRadius - 3) {
            // Gold border
            r = 218;
            g = 165;
            b = 32;
          } else {
            // Badge solid white bg
            r = 255;
            g = 255;
            b = 255;

            // Render programmatically drawn flower in the badge
            const angle = Math.atan2(dy, dx);
            
            if (config.flowerType === 'lily') {
              // 6 elegant pointed white lily petals
              // Placement of petals at multiples of 60 degrees (pi / 3)
              let inPetal = false;
              for (let i = 0; i < 6; i++) {
                const theta0 = (i * Math.PI) / 3;
                let diff = angle - theta0;
                while (diff < -Math.PI) diff += 2 * Math.PI;
                while (diff > Math.PI) diff -= 2 * Math.PI;
                
                if (Math.abs(diff) < 0.28) {
                  const len = 48 * Math.cos((diff * Math.PI) / 0.56);
                  if (distToBadge < len) {
                    inPetal = true;
                    break;
                  }
                }
              }

              if (inPetal) {
                // Soft cream-white petals with gentle shadow/vein
                r = 255;
                g = 252;
                b = 245;
                // Add yellow/pink center shading
                if (distToBadge < 18) {
                  r = 253;
                  g = 215;
                  b = 110; // Warm golden center
                }
              } else {
                // Lily green stem and background
                const stemX = Math.abs(dx);
                if (stemX < 3 && dy > 0 && dy < 50) {
                  r = 34;
                  g = 139;
                  b = 34; // Forest green stem
                } else if (dy > 15 && dy < 35 && dx > 5 && dx < 30 && (dx - 15) * (dx - 15) + (dy - 25) * (dy - 25) < 14 * 14) {
                  r = 46;
                  g = 160;
                  b = 46; // Small green leaf
                }
              }

              // Lily golden core ring
              if (distToBadge <= 6) {
                r = 255;
                g = 165;
                b = 0;
              }

            } else if (config.flowerType === 'lotus') {
              // Lotus flower: Overlapping pointed pink petals pointing upwards
              let inLotus = false;
              
              // Central upright petal (ellipse)
              const petal1 = (dx * dx) / (13 * 13) + ((dy + 12) * (dy + 12)) / (32 * 32);
              // Left rotated petal
              const rotLeftX = dx * Math.cos(-0.55) - dy * Math.sin(-0.55);
              const rotLeftY = dx * Math.sin(-0.55) + dy * Math.cos(-0.55) + 6;
              const petal2 = (rotLeftX * rotLeftX) / (12 * 12) + (rotLeftY * rotLeftY) / (32 * 32);
              
              // Right rotated petal
              const rotRightX = dx * Math.cos(0.55) - dy * Math.sin(0.55);
              const rotRightY = dx * Math.sin(0.55) + dy * Math.cos(0.55) + 6;
              const petal3 = (rotRightX * rotRightX) / (12 * 12) + (rotRightY * rotRightY) / (32 * 32);
              
              // Lower wide side petals
              const rotWideLeftX = dx * Math.cos(-1.1) - dy * Math.sin(-1.1);
              const rotWideLeftY = dx * Math.sin(-1.1) + dy * Math.cos(-1.1) + 12;
              const petal4 = (rotWideLeftX * rotWideLeftX) / (10 * 10) + (rotWideLeftY * rotWideLeftY) / (28 * 28);
              
              const rotWideRightX = dx * Math.cos(1.1) - dy * Math.sin(1.1);
              const rotWideRightY = dx * Math.sin(1.1) + dy * Math.cos(1.1) + 12;
              const petal5 = (rotWideRightX * rotWideRightX) / (10 * 10) + (rotWideRightY * rotWideRightY) / (28 * 28);

              if (petal1 <= 1 || petal2 <= 1 || petal3 <= 1 || petal4 <= 1 || petal5 <= 1) {
                inLotus = true;
              }

              if (inLotus) {
                // Lotus rich pink gradient color
                r = 236;
                g = 72;
                b = 153; // Radiant Pink

                // Add inner petals highlighting
                if (petal1 <= 0.7) {
                  r = 244;
                  g = 143;
                  b = 177; // Soft pink center
                }
              } else {
                // Green base leaf of Lotus (mud/water lotus pad base)
                if (dy > 18 && dy < 38 && Math.abs(dx) < 45) {
                  const leafVal = (dx * dx) / (45 * 45) + ((dy - 25) * (dy - 25)) / (12 * 12);
                  if (leafVal <= 1) {
                    r = 16;
                    g = 124;
                    b = 65; // Deep lotus green pad
                  }
                }
              }

            } else if (config.flowerType === 'jasmine') {
              // Jasmine flower: Star-shaped 5 delicate white/creamy petals
              let inJasmine = false;
              for (let i = 0; i < 5; i++) {
                const theta0 = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                let diff = angle - theta0;
                while (diff < -Math.PI) diff += 2 * Math.PI;
                while (diff > Math.PI) diff -= 2 * Math.PI;
                
                if (Math.abs(diff) < 0.35) {
                  const len = 44 * Math.cos((diff * Math.PI) / 0.7);
                  if (distToBadge < len) {
                    inJasmine = true;
                    break;
                  }
                }
              }

              if (inJasmine) {
                r = 250;
                g = 250;
                b = 240; // Silky white jasmine petals
                if (distToBadge < 12) {
                  r = 255;
                  g = 255;
                  b = 200; // Pale yellow center
                }
              } else {
                // Jasmine green sepals/leaves
                if (distToBadge < 18) {
                  r = 46;
                  g = 139;
                  b = 87; // Sea green base
                }
              }

            } else if (config.flowerType === 'sunflower') {
              // Sunflower flower: 16 yellow petals radiating from a textured brown disk
              if (distToBadge <= 25) {
                // Dark brown seed center disk
                r = 92;
                g = 64;
                b = 51;
                // Add texture to seed disk
                if ((x + y) % 2 === 0) {
                  r += 20;
                  g += 15;
                }
              } else {
                // 16 sharp golden yellow petals
                let inPetal = false;
                for (let i = 0; i < 16; i++) {
                  const theta0 = (i * 2 * Math.PI) / 16;
                  let diff = angle - theta0;
                  while (diff < -Math.PI) diff += 2 * Math.PI;
                  while (diff > Math.PI) diff -= 2 * Math.PI;
                  
                  if (Math.abs(diff) < 0.16) {
                    const len = 25 + 32 * Math.cos((diff * Math.PI) / 0.32);
                    if (distToBadge < len) {
                      inPetal = true;
                      break;
                    }
                  }
                }

                if (inPetal) {
                  r = 251;
                  g = 191;
                  b = 36; // Warm Sun Yellow
                }
              }
            }
          }
        }

        // Draw bag neck folds and stitched line at top and bottom
        const isStitchTop = (y === 92 && x % 8 >= 2);
        const isStitchBottom = (y === 505 && x % 8 >= 2);
        if (isStitchTop || isStitchBottom) {
          r = 40;
          g = 40;
          b = 40; // Stitched thread
        }

        // Apply 3D Cylindrical Shading & Vertical Light Shading
        const t = (x - bagLeft) / bagWidth;
        const shading = 0.55 + 0.45 * Math.sin(t * Math.PI); // Perfectly smooth horizontal curve
        
        const vt = (y - bagTop) / bagHeight;
        const vShading = 0.88 + 0.12 * Math.sin(vt * Math.PI); // Vertical swell highlight

        const finalFactor = shading * vShading;

        const fr = Math.min(255, Math.max(0, Math.round(r * finalFactor)));
        const fg = Math.min(255, Math.max(0, Math.round(g * finalFactor)));
        const fb = Math.min(255, Math.max(0, Math.round(b * finalFactor)));

        const finalHex = ((fr << 24) | (fg << 16) | (fb << 8) | 255) >>> 0;
        img.setPixelColor(finalHex, x, y);
      }
    }

    // Print text on the bag
    // 1. BRAND: "JAGAN MOHAN" above badge, centered
    const textBrand = 'JAGAN MOHAN';
    const textBrandWidth = 14 * textBrand.length; // Approximate proportional spacing width
    img.print({
      font: font16,
      x: 300 - Math.round(textBrandWidth / 2) + 12,
      y: 172,
      text: textBrand
    });

    // 2. VARIETY: large, beautifully centered below badge
    const textVariety = config.variety;
    // Estimated width of variety text
    const charWidth32 = 22;
    const textVarietyWidth = charWidth32 * textVariety.length;
    img.print({
      font: font32,
      x: 300 - Math.round(textVarietyWidth / 2) + 16,
      y: 395,
      text: textVariety
    });

    // 3. TAGLINE: in small font centered below variety
    const textTag = config.tagline;
    const textTagWidth = 9.5 * textTag.length;
    img.print({
      font: font16,
      x: 300 - Math.round(textTagWidth / 2) + 8,
      y: 432,
      text: textTag
    });

    // 4. White text overlay in the top colored band: "100% QUALITY"
    const textTopBand = '★ PREMIUM SELECTED ★';
    const textTopWidth = 9.5 * textTopBand.length;
    img.print({
      font: font16White,
      x: 300 - Math.round(textTopWidth / 2) + 8,
      y: 121,
      text: textTopBand
    });

    // 5. White text overlay in the bottom colored band: "NET WT: 26KG"
    const textBottomBand = 'NET WEIGHT 26 KG';
    const textBottomWidth = 9.5 * textBottomBand.length;
    img.print({
      font: font16White,
      x: 300 - Math.round(textBottomWidth / 2) + 8,
      y: 461,
      text: textBottomBand
    });

    // Save image to /public and /dist folders
    const publicPath = path.join('public', config.filename);
    const distPath = path.join('dist', config.filename);

    await img.write(publicPath);
    console.log(`Successfully saved ${config.filename} to /public`);

    // Ensure the folder exist and copy to dist too so it is instantly refreshed in dev server
    if (fs.existsSync('dist')) {
      await img.write(distPath);
      console.log(`Successfully saved ${config.filename} to /dist`);
    }
  }

  console.log('All 4 premium branded 3D rice bag images generated successfully!');
}

generateBags().catch(err => {
  console.error('Error generating images:', err);
});
