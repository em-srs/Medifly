export const sampleOrders = [
  {
    id: "MF-20260308-001",
    items: [
      { name: "Dolo 650", qty: 2, price: 32 },
      { name: "Pan 40", qty: 1, price: 65 }
    ],
    status: "Delivered",
    placedAt: "2026-03-07T10:30:00",
    deliveredAt: "2026-03-07T11:15:00",
    total: 149,
    pharmacy: "MedPlus Pharmacy",
    rider: "Rajesh K."
  },
  {
    id: "MF-20260308-002",
    items: [
      { name: "Lantus Solostar", qty: 1, price: 850 },
      { name: "Metformin 500", qty: 1, price: 24 }
    ],
    status: "In Transit",
    placedAt: "2026-03-08T14:00:00",
    deliveredAt: null,
    total: 924,
    pharmacy: "Apollo Pharmacy",
    rider: "Suresh M.",
    eta: "15 mins"
  },
  {
    id: "MF-20260308-003",
    items: [
      { name: "Azithral 500", qty: 1, price: 98 },
      { name: "Combiflam", qty: 2, price: 38 }
    ],
    status: "Processing",
    placedAt: "2026-03-08T15:10:00",
    deliveredAt: null,
    total: 194,
    pharmacy: "Netmeds Store",
    rider: null
  },
  {
    id: "MF-20260307-004",
    items: [
      { name: "Thyronorm 50", qty: 1, price: 115 }
    ],
    status: "Delivered",
    placedAt: "2026-03-06T08:00:00",
    deliveredAt: "2026-03-06T08:45:00",
    total: 141,
    pharmacy: "MedPlus Pharmacy",
    rider: "Amit P."
  }
];

export const samplePrescriptions = [
  {
    id: "RX-001",
    doctorName: "Dr. Ananya Sharma",
    hospital: "AIIMS Delhi",
    uploadDate: "2026-03-01",
    expiryDate: "2026-09-01",
    status: "Approved",
    medicines: ["Azithral 500", "Pan 40"],
    fileName: "prescription_march.pdf"
  },
  {
    id: "RX-002",
    doctorName: "Dr. Vikram Patel",
    hospital: "Fortis Hospital",
    uploadDate: "2026-02-15",
    expiryDate: "2026-08-15",
    status: "Approved",
    medicines: ["Lantus Solostar", "Metformin 500", "Glycomet GP 2"],
    fileName: "diabetes_prescription.jpg"
  },
  {
    id: "RX-003",
    doctorName: "Dr. Priya Reddy",
    hospital: "Apollo Clinic",
    uploadDate: "2026-03-08",
    expiryDate: null,
    status: "Pending",
    medicines: ["Dermiford Cream"],
    fileName: "skin_rx.pdf"
  }
];

export const pharmacies = [
  {
    id: "PH-001", name: "MedPlus Pharmacy", license: "DL-2024-MH-4521",
    address: "Shop 12, Sector 5, Mumbai", rating: 4.5,
    ordersToday: 45, revenue: 28500, verified: true
  },
  {
    id: "PH-002", name: "Apollo Pharmacy", license: "DL-2024-DL-7832",
    address: "Plot 7, Connaught Place, Delhi", rating: 4.8,
    ordersToday: 78, revenue: 52000, verified: true
  },
  {
    id: "PH-003", name: "Netmeds Store", license: "DL-2024-KA-1234",
    address: "MG Road, Bengaluru", rating: 4.2,
    ordersToday: 32, revenue: 19800, verified: true
  },
  {
    id: "PH-004", name: "HealthKart Plus", license: "PENDING",
    address: "Anna Nagar, Chennai", rating: 0,
    ordersToday: 0, revenue: 0, verified: false
  }
];

export const riders = [
  {
    id: "RD-001", name: "Rajesh Kumar", phone: "9876543210",
    status: "Active", deliveriesToday: 12, earnings: 1450,
    rating: 4.7, zone: "South Mumbai"
  },
  {
    id: "RD-002", name: "Suresh Mishra", phone: "9876543211",
    status: "On Delivery", deliveriesToday: 8, earnings: 980,
    rating: 4.5, zone: "Central Delhi"
  },
  {
    id: "RD-003", name: "Amit Patil", phone: "9876543212",
    status: "Active", deliveriesToday: 15, earnings: 1820,
    rating: 4.9, zone: "Andheri West"
  },
  {
    id: "RD-004", name: "Vikram Singh", phone: "9876543213",
    status: "Offline", deliveriesToday: 0, earnings: 0,
    rating: 4.3, zone: "Noida"
  }
];

export const adminStats = {
  totalUsers: 15420,
  totalOrders: 8934,
  totalRevenue: 2145000,
  activeRiders: 156,
  activePharmacies: 89,
  avgDeliveryTime: "47 mins",
  ordersToday: 342,
  revenueToday: 198500,
  slaCompliance: 94.2,
  customerSatisfaction: 4.6
};
