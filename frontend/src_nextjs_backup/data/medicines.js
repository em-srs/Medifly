/**
 * medicines.js — Lightweight client-safe module.
 *
 * The full 400-item medicines dataset has been moved to /public/medicines.json
 * and is served via the Next.js API route at /api/medicines.
 *
 * This file only exports:
 *  • `categories`  – used in UI filter buttons (tiny, safe to bundle)
 *  • `MEDICINE_COUNT` – static count constant for display text
 */

export const MEDICINE_COUNT = 400;

export const categories = [
  { id: 'all',         label: 'All Medicines', icon: '💊' },
  { id: 'pain-relief', label: 'Pain Relief',   icon: '🤕' },
  { id: 'antibiotic',  label: 'Antibiotics',   icon: '🦠' },
  { id: 'diabetes',    label: 'Diabetes Care', icon: '🩸' },
  { id: 'cardiac',     label: 'Heart Care',    icon: '❤️' },
  { id: 'allergy',     label: 'Allergy',       icon: '🤧' },
  { id: 'respiratory', label: 'Respiratory',   icon: '🫁' },
  { id: 'gastro',      label: 'Stomach Care',  icon: '🫃' },
  { id: 'cold-flu',    label: 'Cold & Flu',    icon: '🤒' },
  { id: 'supplement',  label: 'Supplements',   icon: '✨' },
  { id: 'hormones',    label: 'Hormones',      icon: '🎭' },
];
