import { Sparkles, Pill } from 'lucide-react';

/**
 * medicines.js — Lightweight client-safe module.
 *
 * The full 400-item medicines dataset has been moved to /public/medicines.json
 * and is served via the Vite dev server.
 *
 * This file only exports:
 *  • `categories`  – used in UI filter buttons (tiny, safe to bundle)
 *  • `MEDICINE_COUNT` – static count constant for display text
 */

export const MEDICINE_COUNT = 400;

export const categories = [
  { id: 'all',         label: 'All Medicines', icon: <Pill size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> },
  { id: 'pain-relief', label: 'Pain Relief',   icon: '🤕' },
  { id: 'antibiotic',  label: 'Antibiotics',   icon: '🦠' },
  { id: 'diabetes',    label: 'Diabetes Care', icon: '🩸' },
  { id: 'cardiac',     label: 'Heart Care',    icon: '❤️' },
  { id: 'allergy',     label: 'Allergy',       icon: '🤧' },
  { id: 'respiratory', label: 'Respiratory',   icon: '🫁' },
  { id: 'gastro',      label: 'Stomach Care',  icon: '🫃' },
  { id: 'cold-flu',    label: 'Cold & Flu',    icon: '🤒' },
  { id: 'supplement',  label: 'Supplements',   icon: <Sparkles size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> },
  { id: 'hormones',    label: 'Hormones',      icon: '🎭' },
];
