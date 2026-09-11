import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "ar" | "en";

type Dict = Record<string, { ar: string; en: string }>;

export const dict: Dict = {
  "nav.home": { ar: "الرئيسية", en: "Home" },
  "nav.shop": { ar: "المتجر", en: "Shop" },
  "nav.services": { ar: "الخدمات البيطرية", en: "Vet Services" },
  "nav.blog": { ar: "مقالات", en: "Articles" },
  "nav.contact": { ar: "تواصل معنا", en: "Contact" },
  "nav.account": { ar: "حسابي", en: "Account" },
  "nav.cart": { ar: "السلة", en: "Cart" },
  "nav.wishlist": { ar: "المفضلة", en: "Wishlist" },
  "nav.admin": { ar: "لوحة التحكم", en: "Dashboard" },
  "nav.signin": { ar: "تسجيل الدخول", en: "Sign in" },
  "nav.signout": { ar: "تسجيل الخروج", en: "Sign out" },

  "cta.shop": { ar: "تسوق الآن", en: "Shop Now" },
  "cta.book": { ar: "احجز موعدًا", en: "Book Appointment" },
  "cta.addToCart": { ar: "أضف إلى السلة", en: "Add to Cart" },
  "cta.buyNow": { ar: "اشترِ الآن", en: "Buy Now" },
  "cta.checkout": { ar: "إتمام الشراء", en: "Proceed to Checkout" },
  "cta.viewAll": { ar: "عرض الكل", en: "View all" },
  "cta.save": { ar: "حفظ", en: "Save" },
  "cta.cancel": { ar: "إلغاء", en: "Cancel" },
  "cta.delete": { ar: "حذف", en: "Delete" },
  "cta.edit": { ar: "تعديل", en: "Edit" },
  "cta.add": { ar: "إضافة", en: "Add" },
  "cta.subscribe": { ar: "اشترك", en: "Subscribe" },
  "cta.apply": { ar: "تطبيق", en: "Apply" },
  "cta.continue": { ar: "متابعة", en: "Continue" },
  "cta.back": { ar: "رجوع", en: "Back" },

  "home.categories": { ar: "تسوق حسب الفئة", en: "Shop by Category" },
  "home.pets": { ar: "تسوق حسب الحيوان", en: "Shop by Pet" },
  "home.bestSellers": { ar: "الأكثر مبيعًا", en: "Best Sellers" },
  "home.offers": { ar: "عروض خاصة", en: "Special Offers" },
  "home.vetPicks": { ar: "اختيارات الطبيب البيطري", en: "Vet's Picks" },
  "home.expertise": { ar: "خبرة بيطرية تثق بها", en: "Veterinary Expertise" },
  "home.services": { ar: "الخدمات البيطرية", en: "Veterinary Services" },
  "home.why": { ar: "لماذا عالم الحيوان؟", en: "Why Choose Us" },
  "home.reviews": { ar: "آراء عملائنا", en: "Customer Reviews" },
  "home.articles": { ar: "مقالات العناية بالحيوانات", en: "Pet Care Articles" },
  "home.newsletter": { ar: "اشترك في النشرة", en: "Join our newsletter" },
  "home.newsletterDesc": {
    ar: "أحدث العروض ونصائح العناية على بريدك.",
    en: "Latest offers and care tips in your inbox.",
  },
  "home.location": { ar: "زُرنا في المنيا", en: "Visit us in Minya" },
  "home.announcement": {
    ar: "توصيل داخل المنيا خلال 24 ساعة • شحن مجاني للطلبات فوق 1000 جنيه",
    en: "Delivery inside Minya within 24h • Free shipping over 1000 EGP",
  },

  "shop.title": { ar: "المتجر", en: "Shop" },
  "shop.search": { ar: "ابحث عن منتج...", en: "Search products..." },
  "shop.filters": { ar: "الفلاتر", en: "Filters" },
  "shop.category": { ar: "الفئة", en: "Category" },
  "shop.petType": { ar: "نوع الحيوان", en: "Pet type" },
  "shop.brand": { ar: "الماركة", en: "Brand" },
  "shop.price": { ar: "السعر", en: "Price" },
  "shop.sort": { ar: "ترتيب", en: "Sort" },
  "shop.all": { ar: "الكل", en: "All" },
  "shop.inStockOnly": { ar: "المتوفر فقط", en: "In stock only" },
  "shop.onSaleOnly": { ar: "العروض فقط", en: "On sale only" },
  "shop.results": { ar: "منتج", en: "products" },
  "shop.empty": { ar: "لا توجد منتجات مطابقة.", en: "No matching products." },
  "sort.recommended": { ar: "الأنسب", en: "Recommended" },
  "sort.newest": { ar: "الأحدث", en: "Newest" },
  "sort.priceAsc": { ar: "السعر: من الأقل", en: "Price: Low → High" },
  "sort.priceDesc": { ar: "السعر: من الأعلى", en: "Price: High → Low" },
  "sort.rating": { ar: "الأعلى تقييمًا", en: "Highest Rated" },
  "sort.bestSelling": { ar: "الأكثر مبيعًا", en: "Best Selling" },

  "stock.in": { ar: "متوفر", en: "In Stock" },
  "stock.low": { ar: "كمية محدودة", en: "Low Stock" },
  "stock.out": { ar: "غير متوفر", en: "Out of Stock" },

  "product.description": { ar: "الوصف", en: "Description" },
  "product.ingredients": { ar: "المكونات", en: "Ingredients" },
  "product.benefits": { ar: "الفوائد", en: "Benefits" },
  "product.usage": { ar: "طريقة الاستخدام", en: "Usage" },
  "product.specs": { ar: "المواصفات", en: "Specifications" },
  "product.reviews": { ar: "التقييمات", en: "Reviews" },
  "product.shipping": { ar: "الشحن والإرجاع", en: "Shipping & Returns" },
  "product.related": { ar: "منتجات مشابهة", en: "You May Also Like" },
  "product.quantity": { ar: "الكمية", en: "Quantity" },
  "product.writeReview": { ar: "اكتب تقييمًا", en: "Write a review" },
  "product.noReviews": { ar: "لا توجد تقييمات بعد.", en: "No reviews yet." },
  "product.reviewPending": {
    ar: "شكرًا! تقييمك قيد المراجعة.",
    en: "Thanks! Your review is awaiting approval.",
  },

  "cart.title": { ar: "سلة التسوق", en: "Shopping Cart" },
  "cart.empty": { ar: "سلة التسوق فاضية... خلينا نملأها!", en: "Your cart is empty... let's fill it!" },
  "cart.subtotal": { ar: "المجموع الفرعي", en: "Subtotal" },
  "cart.discount": { ar: "الخصم", en: "Discount" },
  "cart.shipping": { ar: "الشحن", en: "Shipping" },
  "cart.total": { ar: "الإجمالي", en: "Total" },
  "cart.clear": { ar: "إفراغ السلة", en: "Clear cart" },
  "cart.coupon": { ar: "كود الخصم", en: "Coupon code" },
  "cart.added": { ar: "تمت الإضافة إلى السلة", en: "Added to cart" },
  "cart.free": { ar: "مجاني", en: "Free" },

  "checkout.title": { ar: "إتمام الطلب", en: "Checkout" },
  "checkout.info": { ar: "بيانات العميل", en: "Customer Information" },
  "checkout.address": { ar: "عنوان التوصيل", en: "Shipping Address" },
  "checkout.delivery": { ar: "التوصيل", en: "Delivery" },
  "checkout.payment": { ar: "الدفع", en: "Payment" },
  "checkout.confirm": { ar: "تأكيد الطلب", en: "Confirm Order" },
  "checkout.name": { ar: "الاسم", en: "Full name" },
  "checkout.phone": { ar: "رقم الهاتف", en: "Phone" },
  "checkout.email": { ar: "البريد الإلكتروني", en: "Email" },
  "checkout.city": { ar: "المدينة", en: "City" },
  "checkout.area": { ar: "المنطقة", en: "Area" },
  "checkout.street": { ar: "العنوان بالتفصيل", en: "Address" },
  "checkout.notes": { ar: "ملاحظات", en: "Notes" },
  "checkout.cod": { ar: "الدفع عند الاستلام", en: "Cash on Delivery" },
  "checkout.card": { ar: "بطاقة / دفع إلكتروني", en: "Card / Online Payment" },
  "checkout.placeOrder": { ar: "تأكيد الطلب", en: "Place Order" },
  "checkout.success": { ar: "تم استلام طلبك بنجاح!", en: "Your order has been placed!" },
  "checkout.signinFirst": {
    ar: "سجّل الدخول لإتمام الطلب ومتابعته.",
    en: "Sign in to place and track your order.",
  },

  "services.title": { ar: "الخدمات البيطرية", en: "Veterinary Services" },
  "services.duration": { ar: "المدة", en: "Duration" },
  "services.minutes": { ar: "دقيقة", en: "min" },
  "book.title": { ar: "حجز موعد", en: "Book an Appointment" },
  "book.service": { ar: "الخدمة", en: "Service" },
  "book.date": { ar: "التاريخ", en: "Date" },
  "book.time": { ar: "الوقت", en: "Time" },
  "book.petName": { ar: "اسم الحيوان", en: "Pet name" },
  "book.petSpecies": { ar: "النوع", en: "Species" },
  "book.submit": { ar: "تأكيد الحجز", en: "Confirm Booking" },
  "book.success": { ar: "تم استلام طلب الحجز، سنتواصل معك للتأكيد.", en: "Booking received — we'll confirm shortly." },

  "account.title": { ar: "حسابي", en: "My Account" },
  "account.profile": { ar: "الملف الشخصي", en: "Profile" },
  "account.orders": { ar: "طلباتي", en: "My Orders" },
  "account.pets": { ar: "حيواناتي", en: "My Pets" },
  "account.appointments": { ar: "مواعيدي", en: "My Appointments" },
  "account.wishlist": { ar: "المفضلة", en: "Wishlist" },
  "account.noOrders": { ar: "لا توجد طلبات بعد.", en: "No orders yet." },
  "account.wishlistEmpty": { ar: "قائمة المفضلة فارغة.", en: "Your wishlist is empty." },

  "auth.signin": { ar: "تسجيل الدخول", en: "Sign in" },
  "auth.signup": { ar: "إنشاء حساب", en: "Create account" },
  "auth.password": { ar: "كلمة المرور", en: "Password" },
  "auth.google": { ar: "المتابعة بحساب Google", en: "Continue with Google" },
  "auth.haveAccount": { ar: "لديك حساب بالفعل؟", en: "Already have an account?" },
  "auth.noAccount": { ar: "ليس لديك حساب؟", en: "Don't have an account?" },
  "auth.checkEmail": { ar: "راجع بريدك لتأكيد الحساب.", en: "Check your email to confirm your account." },

  "status.new": { ar: "جديد", en: "New" },
  "status.confirmed": { ar: "مؤكد", en: "Confirmed" },
  "status.processing": { ar: "قيد التجهيز", en: "Processing" },
  "status.shipped": { ar: "تم الشحن", en: "Shipped" },
  "status.delivered": { ar: "تم التسليم", en: "Delivered" },
  "status.cancelled": { ar: "ملغي", en: "Cancelled" },
  "status.refunded": { ar: "مسترجع", en: "Refunded" },
  "status.pending": { ar: "قيد المراجعة", en: "Pending" },
  "status.rejected": { ar: "مرفوض", en: "Rejected" },
  "status.completed": { ar: "مكتمل", en: "Completed" },

  "admin.overview": { ar: "نظرة عامة", en: "Overview" },
  "admin.products": { ar: "المنتجات", en: "Products" },
  "admin.categories": { ar: "الفئات", en: "Categories" },
  "admin.inventory": { ar: "المخزون", en: "Inventory" },
  "admin.orders": { ar: "الطلبات", en: "Orders" },
  "admin.customers": { ar: "العملاء", en: "Customers" },
  "admin.appointments": { ar: "المواعيد", en: "Appointments" },
  "admin.services": { ar: "الخدمات", en: "Services" },
  "admin.content": { ar: "المحتوى", en: "Content" },
  "admin.settings": { ar: "الإعدادات", en: "Settings" },
  "admin.revenue": { ar: "الإيرادات", en: "Revenue" },
  "admin.todayRevenue": { ar: "إيرادات اليوم", en: "Today's Revenue" },
  "admin.lowStock": { ar: "مخزون منخفض", en: "Low Stock" },
  "admin.recentOrders": { ar: "أحدث الطلبات", en: "Recent Orders" },
  "admin.noAccess": { ar: "هذه الصفحة للمسؤولين فقط.", en: "This area is for administrators only." },

  "common.loading": { ar: "جاري التحميل...", en: "Loading..." },
  "common.saved": { ar: "تم الحفظ", en: "Saved" },
  "common.deleted": { ar: "تم الحذف", en: "Deleted" },
  "common.error": { ar: "حدث خطأ، حاول مرة أخرى.", en: "Something went wrong. Please try again." },
  "common.confirmDelete": { ar: "هل أنت متأكد من الحذف؟", en: "Are you sure you want to delete this?" },
  "common.egp": { ar: "ج.م", en: "EGP" },
  "common.hours": { ar: "مواعيد العمل", en: "Working Hours" },
  "common.phone": { ar: "الهاتف", en: "Phone" },
  "common.whatsapp": { ar: "واتساب", en: "WhatsApp" },
  "common.address": { ar: "العنوان", en: "Address" },
  "pet.dog": { ar: "كلاب", en: "Dogs" },
  "pet.cat": { ar: "قطط", en: "Cats" },
  "pet.all": { ar: "كل الحيوانات", en: "All pets" },
};

type I18nValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  setLocale: (l: Locale) => void;
  t: (key: keyof typeof dict | string) => string;
  L: <T extends Record<string, unknown>>(row: T | null | undefined, field: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");

  useEffect(() => {
    const stored = window.localStorage.getItem("aw-locale") as Locale | null;
    if (stored === "ar" || stored === "en") setLocaleState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem("aw-locale", l);
  }, []);

  const t = useCallback(
    (key: string) => {
      const entry = dict[key];
      return entry ? entry[locale] : key;
    },
    [locale],
  );

  const L = useCallback(
    <T extends Record<string, unknown>>(row: T | null | undefined, field: string) => {
      if (!row) return "";
      const primary = row[`${field}_${locale}`];
      const fallback = row[`${field}_${locale === "ar" ? "en" : "ar"}`];
      return (primary as string) || (fallback as string) || "";
    },
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, dir: locale === "ar" ? "rtl" : "ltr", setLocale, t, L }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
