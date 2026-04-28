const fs = require('fs');
import { Sparkles, Pill } from 'lucide-react';


const brands = ['Crocin','Calpol','Dolo','Brufen','Combiflam','Augmentin','Azithral','Ciplox','Doxicip','Glycomet','Amaryl','Diamicron','Huminsulin','Telmikind','Losar','Lipitor','Ecosprin','Cetzine','Montair','Asthalin','Budecort','Omez','Pan','Rablet','Domstal','Emeset','Aciloc','Thyronorm','Sinarest','VicksAction','Benadryl','Corex','Otrivin','Becosules','Supradyn','Zincovit','Revital','Clindac','Fluconazole','Acyclovir'];

const generics = ['Paracetamol','Ibuprofen','Amoxicillin','Azithromycin','Metformin','Amlodipine','Atorvastatin','Pantoprazole','Omeprazole','Levothyroxine','Losartan','Ciprofloxacin','Cetirizine','Montelukast','Salbutamol','Human Insulin','Doxycycline','Clopidogrel','Aspirin','Hydrochlorothiazide'];

const categories = [
  { id: 'all', label: 'All Medicines', icon: <Pill size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> },
  { id: 'pain-relief', label: 'Pain Relief', icon: '🤕' },
  { id: 'antibiotic', label: 'Antibiotics', icon: '🦠' },
  { id: 'diabetes', label: 'Diabetes Care', icon: '🩸' },
  { id: 'cardiac', label: 'Heart Care', icon: '❤️' },
  { id: 'allergy', label: 'Allergy', icon: '🤧' },
  { id: 'respiratory', label: 'Respiratory', icon: '🫁' },
  { id: 'gastro', label: 'Stomach Care', icon: ' stomach' },
  { id: 'cold-flu', label: 'Cold & Flu', icon: '🤒' },
  { id: 'supplement', label: 'Supplements', icon: <Sparkles size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> },
  { id: 'hormones', label: 'Hormones', icon: '🎭' }
];

const catSqlMap = ['pain-relief','antibiotic','diabetes','cardiac','allergy','respiratory','gastro','cold-flu','supplement','hormones'];

const dosageForms = ['Tablet','Capsule','Syrup','Injection','Inhaler'];
const strengths = ['250 mg','500 mg','650 mg','5 mg','10 mg','20 mg'];
const manufacturers = ['Sun Pharma','Cipla',"Dr Reddy's",'Lupin','Zydus','Torrent Pharma','Mankind','Abbott'];
const schedules = ['OTC','H','H1'];
const packSizes = ['Strip of 10','Bottle 100 ml','Pack of 1'];

const meds = [];
for (let i = 1; i <= 400; i++) {
  const n = i;
  const brandIdx = (n % 40);
  const genIdx = (n % 20);
  const catIdx = (n % 10);
  const formIdx = (n % 5);
  const strIdx = (n % 6);
  const manIdx = (n % 8);
  const schIdx = (n % 3);
  const packIdx = (n % 3);

  const reqPresc = (n % 3) === 1 ? false : true;
  const coldChain = (n % 20) === 15;
  const price = Math.round((20 + Math.random() * 400) * 100) / 100;
  const mrp = Math.round((price * (1 + Math.random() * 0.3)) * 100) / 100;

  meds.push({
    id: 'MED' + String(n).padStart(3, '0'),
    brandName: brands[brandIdx] + '-' + n,
    name: brands[brandIdx] + '-' + n,
    genericName: generics[genIdx],
    salt: generics[genIdx],
    manufacturer: manufacturers[manIdx],
    category: catSqlMap[catIdx],
    form: dosageForms[formIdx],
    strength: strengths[strIdx],
    schedule: schedules[schIdx],
    requiresPrescription: reqPresc,
    prescriptionRequired: reqPresc,
    coldChain: coldChain,
    packSize: packSizes[packIdx],
    price: price,
    mrp: mrp,
    stock: Math.random() > 0.05, // 95% stock
    deliveryTimes: ['1 Hour', 'Same Day', 'Standard 1-2 Days'].slice(0, 1 + Math.floor(Math.random() * 3))
  });
}

const fileContent = `export const categories = ${JSON.stringify(categories, null, 2)};

export const medicinesData = ${JSON.stringify(meds, null, 2)};

export const medicines = medicinesData;

export const searchMedicines = (query) => {
  const q = query.toLowerCase().trim();
  if (!q) return medicines;
  return medicines.filter(
    (med) =>
      med.name.toLowerCase().includes(q) ||
      med.salt.toLowerCase().includes(q) ||
      med.manufacturer.toLowerCase().includes(q)
  );
};

export const getMedicinesByCategory = (categoryId) => {
  if (categoryId === 'all') return medicines;
  return medicines.filter((med) => med.category === categoryId);
};`;

fs.writeFileSync('c:/Users/sunny/OneDrive/Desktop/final yr project/medifly/src/data/medicines.js', fileContent);
