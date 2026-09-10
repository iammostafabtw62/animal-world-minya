/**
 * Central content source for Animal World — عالم الحيوان.
 * Location, contact and hours live here so they can later be driven
 * by the admin dashboard instead of being hard-coded in components.
 */

export const brand = {
  nameAr: "عالم الحيوان",
  nameEn: "Animal World",
  taglineAr: "كل ما يحتاجه حيوانك الأليف... في مكان واحد",
  taglineEn: "Everything Your Pet Needs, All in One Place.",
};

export const location = {
  cityAr: "المنيا، مصر",
  cityEn: "Minya, Egypt",
  addressAr: "العنوان التفصيلي — المنيا، مصر",
  phone: "+20 100 000 0000",
  whatsapp: "+20 100 000 0000",
  email: "info@animalworld.eg",
  mapsUrl: "https://www.google.com/maps?q=Minya,+Egypt&output=embed",
  hours: [
    { dayAr: "السبت – الخميس", timeAr: "10:00 ص – 10:00 م" },
    { dayAr: "الجمعة", timeAr: "2:00 م – 10:00 م" },
  ],
};

export const services = [
  {
    id: "products",
    titleAr: "منتجات الحيوانات الأليفة",
    titleEn: "Pet Products",
    descAr: "طعام ومستلزمات وألعاب مختارة بعناية لكل حيوان أليف.",
  },
  {
    id: "vet",
    titleAr: "رعاية بيطرية",
    titleEn: "Veterinary Care",
    descAr: "كشف وتطعيمات ومتابعة صحية على يد أطباء متخصصين.",
  },
  {
    id: "wellness",
    titleAr: "صحة ورفاهية",
    titleEn: "Pet Wellness",
    descAr: "تغذية ونصائح ومتابعة تجعل حياة حيوانك أسعد وأطول.",
  },
];

export const trustPoints = [
  { titleAr: "في قلب المنيا", descAr: "فرعنا في المنيا قريب منك ومن حيوانك الأليف." },
  { titleAr: "خبرة بيطرية", descAr: "فريق طبي متخصص في علاج ومتابعة القطط والكلاب." },
  { titleAr: "منتجات أصلية", descAr: "ماركات موثوقة ومنتجات مختارة بعناية فقط." },
  { titleAr: "دعم العملاء", descAr: "نرد على استفساراتك ونساعدك في اختيار الأنسب." },
  { titleAr: "توصيل سريع", descAr: "توصيل الطلبات داخل المنيا في نفس اليوم." },
  { titleAr: "حجز المواعيد", descAr: "احجز موعد الكشف بسهولة دون انتظار." },
];
