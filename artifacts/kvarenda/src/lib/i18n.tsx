import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "ru" | "uz";

const translations = {
  nav: {
    search: { en: "Search", ru: "Поиск", uz: "Qidiruv" },
    applications: { en: "Applications", ru: "Заявки", uz: "Arizalar" },
    myRental: { en: "My Rental", ru: "Моя аренда", uz: "Mening ijaram" },
    dashboard: { en: "Dashboard", ru: "Панель", uz: "Boshqaruv" },
    adminPanel: { en: "Admin Panel", ru: "Админ панель", uz: "Admin panel" },
    tenant: { en: "Tenant", ru: "Арендатор", uz: "Ijarachi" },
    owner: { en: "Owner", ru: "Владелец", uz: "Uy egasi" },
    admin: { en: "Admin", ru: "Админ", uz: "Admin" },
  },
  home: {
    heroTitle: {
      en: "Tashkent's Most Trusted Rental Platform",
      ru: "Самая надёжная платформа аренды в Ташкенте",
      uz: "Toshkentdagi eng ishonchli ijara platformasi",
    },
    heroSubtitle: {
      en: "Find verified apartments with protected rent and 5% service fee. No hidden costs.",
      ru: "Находите проверенные квартиры с защищённой арендой и комиссией 5%. Без скрытых платежей.",
      uz: "Tekshirilgan kvartiralarni himoyalangan ijara va 5% xizmat haqi bilan toping. Yashirin to'lovlarsiz.",
    },
    anyDistrict: { en: "Any district", ru: "Любой район", uz: "Barcha tumanlar" },
    rooms: { en: "Rooms", ru: "Комнаты", uz: "Xonalar" },
    anyRooms: { en: "Any rooms", ru: "Любые", uz: "Barchasi" },
    searchBtn: { en: "Search", ru: "Найти", uz: "Qidirish" },
    flatFee: { en: "5% Flat Fee", ru: "5% комиссия", uz: "5% xizmat haqi" },
    exploreMap: { en: "Explore on Map", ru: "Посмотреть на карте", uz: "Xaritada ko'rish" },
    exploreMapSub: {
      en: "Browse apartments across Tashkent's districts",
      ru: "Просматривайте квартиры по районам Ташкента",
      uz: "Toshkent tumanlari bo'yicha kvartiralarni ko'ring",
    },
    viewAll: { en: "View all listings", ru: "Все объявления", uz: "Barcha e'lonlar" },
    viewAllShort: { en: "View all", ru: "Все", uz: "Barchasi" },
    featured: { en: "Featured Listings", ru: "Избранные объявления", uz: "Tanlangan e'lonlar" },
    featuredSub: {
      en: "Handpicked apartments with verified owners",
      ru: "Отборные квартиры с проверенными владельцами",
      uz: "Tekshirilgan uy egalari bilan tanlangan kvartiralar",
    },
    whyTitle: { en: "Why Kvarenda?", ru: "Почему Kvarenda?", uz: "Nega Kvarenda?" },
    whySub: {
      en: "Everything you need for safe, transparent apartment rental in Tashkent",
      ru: "Всё для безопасной и прозрачной аренды квартир в Ташкенте",
      uz: "Toshkentda xavfsiz va shaffof kvartira ijarasi uchun hamma narsa",
    },
    verifiedOwners: { en: "Verified Owners", ru: "Проверенные владельцы", uz: "Tekshirilgan uy egalari" },
    verifiedDesc: {
      en: "Every owner goes through document verification. Real people, real apartments.",
      ru: "Каждый владелец проходит проверку документов. Реальные люди, реальные квартиры.",
      uz: "Har bir uy egasi hujjat tekshiruvidan o'tadi. Haqiqiy odamlar, haqiqiy kvartiralar.",
    },
    protectedRent: { en: "Protected Rent", ru: "Защищённая аренда", uz: "Himoyalangan ijara" },
    protectedDesc: {
      en: "Your deposit is held securely. Full refund guarantee if the owner breaks the contract.",
      ru: "Ваш залог в безопасности. Полный возврат при нарушении договора владельцем.",
      uz: "Sizning garovingiz xavfsiz saqlanadi. Uy egasi shartnomani buzsa, to'liq qaytariladi.",
    },
    flatFeeTitle: { en: "5% Flat Fee", ru: "5% комиссия", uz: "5% xizmat haqi" },
    flatFeeDesc: {
      en: "No hidden costs. Just a transparent 5% service fee on monthly rent. That's it.",
      ru: "Никаких скрытых платежей. Всего 5% от месячной аренды. Это всё.",
      uz: "Yashirin to'lovlar yo'q. Oylik ijaradan faqat 5% xizmat haqi. Hammasi shu.",
    },
    tours3d: { en: "3D Tours", ru: "3D-туры", uz: "3D turlar" },
    tours3dDesc: {
      en: "View apartments remotely with immersive 3D tours. Save time before visiting.",
      ru: "Просматривайте квартиры удалённо с помощью 3D-туров. Экономьте время.",
      uz: "3D turlar bilan kvartiralarni masofadan ko'ring. Tashrif buyurishdan oldin vaqtni tejang.",
    },
    ctaTitle: {
      en: "Ready to find your next home?",
      ru: "Готовы найти своё новое жильё?",
      uz: "Yangi uyingizni topishga tayyormisiz?",
    },
    ctaSub: {
      en: "Join thousands of tenants and owners who trust Kvarenda for safe, transparent rentals in Tashkent.",
      ru: "Присоединяйтесь к тысячам арендаторов и владельцев, которые доверяют Kvarenda.",
      uz: "Toshkentda xavfsiz ijaraga ishongan minglab ijarachilar va uy egalariga qo'shiling.",
    },
    browseApartments: { en: "Browse Apartments", ru: "Смотреть квартиры", uz: "Kvartiralarni ko'rish" },
    listProperty: { en: "List Your Property", ru: "Разместить квартиру", uz: "Kvartirangizni joylashtiring" },
    room: { en: "Room", ru: "Комната", uz: "Xona" },
    roomPlural: { en: "Rooms", ru: "Комнаты", uz: "Xonalar" },
  },
  badges: {
    verifiedOwner: { en: "Verified Owner", ru: "Проверенный", uz: "Tekshirilgan" },
    protectedRent: { en: "Protected Rent", ru: "Защита аренды", uz: "Himoyalangan" },
    tour3d: { en: "3D Tour", ru: "3D-тур", uz: "3D tur" },
    insurance: { en: "Insurance", ru: "Страхование", uz: "Sug'urta" },
  },
  listings: {
    filters: { en: "Filters", ru: "Фильтры", uz: "Filterlar" },
    allListings: { en: "All listings in Tashkent", ru: "Все объявления в Ташкенте", uz: "Toshkentdagi barcha e'lonlar" },
    apartmentsIn: { en: "Apartments in", ru: "Квартиры в районе", uz: "Kvartiralar:" },
    available: { en: "apartments available", ru: "квартир доступно", uz: "kvartira mavjud" },
    loading: { en: "Loading...", ru: "Загрузка...", uz: "Yuklanmoqda..." },
    noListings: { en: "No listings found", ru: "Объявлений не найдено", uz: "E'lonlar topilmadi" },
    tryFilters: { en: "Try adjusting your filters", ru: "Попробуйте изменить фильтры", uz: "Filterlarni o'zgartirib ko'ring" },
    clearFilters: { en: "Clear all filters", ru: "Сбросить фильтры", uz: "Barcha filterlarni tozalash" },
    district: { en: "District", ru: "Район", uz: "Tuman" },
    price: { en: "Price", ru: "Цена", uz: "Narx" },
    features: { en: "Features", ru: "Особенности", uz: "Xususiyatlar" },
    verified: { en: "Verified Owner", ru: "Проверенный владелец", uz: "Tekshirilgan uy egasi" },
    listingsCount: { en: "listings", ru: "объявлений", uz: "e'lon" },
  },
  detail: {
    monthlyRent: { en: "Monthly rent", ru: "Ежемесячная аренда", uz: "Oylik ijara" },
    serviceFee: { en: "Service fee (5%)", ru: "Комиссия (5%)", uz: "Xizmat haqi (5%)" },
    totalMonthly: { en: "Total monthly", ru: "Итого в месяц", uz: "Jami oylik" },
    deposit: { en: "Security deposit", ru: "Залог", uz: "Garov puli" },
    apply: { en: "Apply Now", ru: "Подать заявку", uz: "Ariza berish" },
    description: { en: "Description", ru: "Описание", uz: "Tavsif" },
    amenities: { en: "Amenities", ru: "Удобства", uz: "Qulayliklar" },
    rules: { en: "House Rules", ru: "Правила дома", uz: "Uy qoidalari" },
    listedBy: { en: "Listed by", ru: "Разместил(а)", uz: "E'lon beruvchi" },
    floor: { en: "Floor", ru: "Этаж", uz: "Qavat" },
    area: { en: "Area", ru: "Площадь", uz: "Maydon" },
  },
  apply: {
    title: { en: "Apply for Apartment", ru: "Подать заявку на квартиру", uz: "Kvartiraga ariza berish" },
    moveIn: { en: "Desired move-in date", ru: "Желаемая дата заезда", uz: "Ko'chib o'tish sanasi" },
    duration: { en: "Rental duration (months)", ru: "Срок аренды (месяцы)", uz: "Ijara muddati (oy)" },
    purpose: { en: "Purpose of rent", ru: "Цель аренды", uz: "Ijara maqsadi" },
    message: { en: "Message to owner", ru: "Сообщение владельцу", uz: "Uy egasiga xabar" },
    submit: { en: "Submit Application", ru: "Отправить заявку", uz: "Arizani yuborish" },
    living: { en: "Living", ru: "Проживание", uz: "Yashash" },
    office: { en: "Office", ru: "Офис", uz: "Ofis" },
    business: { en: "Business", ru: "Бизнес", uz: "Biznes" },
  },
  myApps: {
    title: { en: "My Applications", ru: "Мои заявки", uz: "Mening arizalarim" },
    pending: { en: "Pending", ru: "На рассмотрении", uz: "Ko'rib chiqilmoqda" },
    approved: { en: "Approved", ru: "Одобрено", uz: "Tasdiqlangan" },
    rejected: { en: "Rejected", ru: "Отклонено", uz: "Rad etilgan" },
    noApps: { en: "No applications yet", ru: "Заявок пока нет", uz: "Hali arizalar yo'q" },
    startBrowsing: { en: "Start browsing apartments", ru: "Начните поиск квартир", uz: "Kvartiralarni qidirishni boshlang" },
  },
  rental: {
    title: { en: "My Rental", ru: "Моя аренда", uz: "Mening ijaram" },
    activeRental: { en: "Active Rental", ru: "Активная аренда", uz: "Faol ijara" },
    nextPayment: { en: "Next Payment", ru: "Следующий платёж", uz: "Keyingi to'lov" },
    payNow: { en: "Pay Now", ru: "Оплатить", uz: "To'lash" },
    paymentHistory: { en: "Payment History", ru: "История платежей", uz: "To'lovlar tarixi" },
    viewContract: { en: "View Contract", ru: "Посмотреть договор", uz: "Shartnomani ko'rish" },
    noRental: { en: "No active rental", ru: "Нет активной аренды", uz: "Faol ijara yo'q" },
  },
  contract: {
    title: { en: "Rental Contract", ru: "Договор аренды", uz: "Ijara shartnomasi" },
    signAs: { en: "Sign as", ru: "Подписать как", uz: "Imzolash" },
    signed: { en: "Signed", ru: "Подписано", uz: "Imzolangan" },
    notSigned: { en: "Not signed", ru: "Не подписано", uz: "Imzolanmagan" },
    startDate: { en: "Start Date", ru: "Дата начала", uz: "Boshlanish sanasi" },
    endDate: { en: "End Date", ru: "Дата окончания", uz: "Tugash sanasi" },
    print: { en: "Print / PDF", ru: "Печать / PDF", uz: "Chop etish / PDF" },
  },
  owner: {
    title: { en: "Owner Dashboard", ru: "Панель владельца", uz: "Uy egasi paneli" },
    activeListings: { en: "Active Listings", ru: "Активные объявления", uz: "Faol e'lonlar" },
    totalApps: { en: "Applications", ru: "Заявки", uz: "Arizalar" },
    pendingApps: { en: "Pending", ru: "На рассмотрении", uz: "Kutilmoqda" },
    activeRentals: { en: "Active Rentals", ru: "Активные аренды", uz: "Faol ijaralar" },
    monthlyIncome: { en: "Monthly Income", ru: "Ежемесячный доход", uz: "Oylik daromad" },
    addListing: { en: "Add Listing", ru: "Добавить объявление", uz: "E'lon qo'shish" },
    approve: { en: "Approve", ru: "Одобрить", uz: "Tasdiqlash" },
    reject: { en: "Reject", ru: "Отклонить", uz: "Rad etish" },
    listings: { en: "Listings", ru: "Объявления", uz: "E'lonlar" },
    rentals: { en: "Rentals", ru: "Аренды", uz: "Ijaralar" },
  },
  admin: {
    title: { en: "Admin Panel", ru: "Панель администратора", uz: "Administrator paneli" },
    overview: { en: "Platform overview and management", ru: "Обзор и управление платформой", uz: "Platforma boshqaruvi" },
    totalUsers: { en: "Total Users", ru: "Всего пользователей", uz: "Jami foydalanuvchilar" },
    activeListings: { en: "Active Listings", ru: "Активные объявления", uz: "Faol e'lonlar" },
    activeRentals: { en: "Active Rentals", ru: "Активные аренды", uz: "Faol ijaralar" },
    pendingApps: { en: "Pending Apps", ru: "Ожидающие заявки", uz: "Kutilayotgan arizalar" },
    revenue: { en: "Revenue", ru: "Доход", uz: "Daromad" },
    users: { en: "Users", ru: "Пользователи", uz: "Foydalanuvchilar" },
    payments: { en: "Payments", ru: "Платежи", uz: "To'lovlar" },
    accessRequired: { en: "Admin access required", ru: "Требуется доступ администратора", uz: "Administrator ruxsati kerak" },
    switchAdmin: {
      en: "Switch to Admin role to access this panel.",
      ru: "Переключитесь на роль Админа для доступа.",
      uz: "Ushbu panelga kirish uchun Admin roliga o'ting.",
    },
  },
  footer: {
    tagline: {
      en: "Tashkent's most trusted apartment rental platform. Verified owners, protected rent, transparent pricing.",
      ru: "Самая надёжная платформа аренды квартир в Ташкенте. Проверенные владельцы, защита аренды, прозрачные цены.",
      uz: "Toshkentdagi eng ishonchli kvartira ijara platformasi. Tekshirilgan uy egalari, himoyalangan ijara, shaffof narxlar.",
    },
    forTenants: { en: "For Tenants", ru: "Арендаторам", uz: "Ijarachilarga" },
    forOwners: { en: "For Owners", ru: "Владельцам", uz: "Uy egalariga" },
    contact: { en: "Contact", ru: "Контакты", uz: "Aloqa" },
    browseApartments: { en: "Browse Apartments", ru: "Поиск квартир", uz: "Kvartiralarni qidirish" },
    myApplications: { en: "My Applications", ru: "Мои заявки", uz: "Mening arizalarim" },
    myRental: { en: "My Rental", ru: "Моя аренда", uz: "Mening ijaram" },
    rentProtection: { en: "Rent Protection", ru: "Защита аренды", uz: "Ijara himoyasi" },
    ownerDashboard: { en: "Owner Dashboard", ru: "Панель владельца", uz: "Uy egasi paneli" },
    listProperty: { en: "List Your Property", ru: "Разместить квартиру", uz: "Kvartirangizni joylashtiring" },
    verificationProgram: { en: "Verification Program", ru: "Программа проверки", uz: "Tekshiruv dasturi" },
    proListings: { en: "Pro Listings", ru: "PRO объявления", uz: "PRO e'lonlar" },
    flatFee: { en: "5% flat service fee", ru: "5% комиссия", uz: "5% xizmat haqi" },
    noHidden: { en: "No hidden costs", ru: "Без скрытых платежей", uz: "Yashirin to'lovlarsiz" },
    verifiedOnly: { en: "Verified owners only", ru: "Только проверенные владельцы", uz: "Faqat tekshirilgan uy egalari" },
    rights: { en: "All rights reserved.", ru: "Все права защищены.", uz: "Barcha huquqlar himoyalangan." },
  },
  common: {
    perMonth: { en: "/mo", ru: "/мес", uz: "/oy" },
    view: { en: "View", ru: "Смотреть", uz: "Ko'rish" },
    edit: { en: "Edit", ru: "Редактировать", uz: "Tahrirlash" },
    delete: { en: "Delete", ru: "Удалить", uz: "O'chirish" },
    cancel: { en: "Cancel", ru: "Отмена", uz: "Bekor qilish" },
    save: { en: "Save", ru: "Сохранить", uz: "Saqlash" },
    loading: { en: "Loading...", ru: "Загрузка...", uz: "Yuklanmoqda..." },
    language: { en: "English", ru: "Русский", uz: "O'zbek" },
  },
} as const;

type TranslationKeys = typeof translations;

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationKeys;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: translations,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("kvarenda_lang") as Language) || "en";
    }
    return "en";
  });

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("kvarenda_lang", newLang);
  };

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t: translations }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useT() {
  const { lang, t } = useContext(I18nContext);
  return {
    lang,
    tr: <T extends Record<Language, string>>(obj: T): string => obj[lang],
  };
}
