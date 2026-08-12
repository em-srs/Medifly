/**
 * getMedicineImage.js
 *
 * Resolves the best available image for a medicine object.
 *
 * Priority:
 *   1. medicine.imageUrl / medicine.image_url  — real product image from DB
 *   2. dosage_form / dosageForm / form         — physical-form placeholder
 *   3. fallback generic placeholder             — "other.png"
 *
 * The dosage form values that exist in the DB (inserted as 'Tablet' for all
 * currently seeded rows) are normalised case-insensitively so new values
 * from the CSV work automatically once the seed script is updated to read
 * the actual form column.
 */

import tabletImg    from '@/assets/medicine-placeholders/tablet.png';
import capsuleImg   from '@/assets/medicine-placeholders/capsule.png';
import injectionImg from '@/assets/medicine-placeholders/injection.png';
import syrupImg     from '@/assets/medicine-placeholders/syrup.png';
import inhalerImg   from '@/assets/medicine-placeholders/inhaler.png';
import topicalImg   from '@/assets/medicine-placeholders/topical.png';
import coldChainImg from '@/assets/medicine-placeholders/cold_chain.png';
import otherImg     from '@/assets/medicine-placeholders/other.png';

/** Maps normalised dosage-form keywords -> placeholder image */
const FORM_IMAGE_MAP = {
  tablet:     tabletImg,
  tablets:    tabletImg,
  tab:        tabletImg,

  capsule:    capsuleImg,
  capsules:   capsuleImg,
  cap:        capsuleImg,
  softgel:    capsuleImg,
  'soft gelatin': capsuleImg,

  injection:  injectionImg,
  injectable: injectionImg,
  vial:       injectionImg,
  ampoule:    injectionImg,
  iv:         injectionImg,

  syrup:      syrupImg,
  liquid:     syrupImg,
  solution:   syrupImg,
  suspension: syrupImg,
  drops:      syrupImg,
  oral:       syrupImg,

  inhaler:    inhalerImg,
  inhalation: inhalerImg,
  nebulizer:  inhalerImg,
  rotacap:    inhalerImg,
  respule:    inhalerImg,

  cream:      topicalImg,
  ointment:   topicalImg,
  gel:        topicalImg,
  lotion:     topicalImg,
  topical:    topicalImg,
  patch:      topicalImg,
  spray:      topicalImg,

  cold_chain: coldChainImg,
  'cold chain': coldChainImg,
};

/**
 * Returns the best image src for a medicine.
 * @param {object} medicine - medicine object from API / static data
 * @returns {string} image src
 */
export function getMedicineImage(medicine) {
  if (!medicine) return otherImg;

  // 1. Real product image wins (skip unsplash fallback URLs)
  const productImage = medicine.imageUrl || medicine.image_url || medicine.image;
  if (productImage && !productImage.includes('unsplash')) return productImage;

  // 2. Dosage-form based placeholder
  const rawForm =
    medicine.dosageForm ||     // camelCase from formatMedicine()
    medicine.dosage_form ||    // snake_case direct DB
    medicine.form ||           // static generated data field
    '';

  if (rawForm) {
    const normalised = rawForm.toLowerCase().trim();
    // Exact match first
    if (FORM_IMAGE_MAP[normalised]) return FORM_IMAGE_MAP[normalised];
    // Keyword scan (handles values like "Tablet 10mg" or "Oral Solution")
    for (const [keyword, img] of Object.entries(FORM_IMAGE_MAP)) {
      if (normalised.includes(keyword)) return img;
    }
  }

  // 3. Cold-chain medicines (even if dosage form is unmapped) get cold_chain img
  if (medicine.coldChainRequired || medicine.cold_chain_required || medicine.coldChain) {
    return coldChainImg;
  }

  // 4. Generic fallback
  return otherImg;
}

/**
 * Returns a human-readable label for the dosage form.
 */
export function getDosageFormLabel(medicine) {
  if (!medicine) return 'Medicine';
  const rawForm =
    medicine.dosageForm ||
    medicine.dosage_form ||
    medicine.form ||
    '';
  if (!rawForm || rawForm === 'Standard') return 'Medicine';
  return rawForm.charAt(0).toUpperCase() + rawForm.slice(1).toLowerCase();
}

/**
 * Maps category IDs to human-readable badge labels.
 */
export const CATEGORY_LABELS = {
  'pain-relief':  'Pain Relief',
  'antibiotic':   'Antibiotic',
  'diabetes':     'Diabetes Care',
  'cardiac':      'Heart Care',
  'allergy':      'Allergy',
  'respiratory':  'Respiratory',
  'gastro':       'Stomach Care',
  'cold-flu':     'Cold & Flu',
  'supplement':   'Supplement',
  'hormones':     'Hormones',
  'allopathy':    'Allopathy',
};

/**
 * Returns badge label text for a medicine's category.
 */
export function getCategoryLabel(medicine) {
  if (!medicine) return null;
  const cat = medicine.category;
  if (!cat) return null;
  return CATEGORY_LABELS[cat] || cat;
}
