import { createContext, useContext, useState } from 'react';

const LangContext = createContext(null);

export const translations = {
  ar: {
    appName:         'واصل',
    tagline:         'منصة التوصيل الذكية',
    login:           'تسجيل الدخول',
    register:        'إنشاء حساب',
    logout:          'خروج',
    myOrders:        'طلباتي',
    dashboard:       'لوحتي',
    welcomeBack:     'مرحباً بعودتك 👋',
    email:           'البريد الإلكتروني',
    password:        'كلمة المرور',
    signIn:          'تسجيل الدخول 🚀',
    signingIn:       '⏳ جارٍ الدخول...',
    noAccount:       'ليس لديك حساب؟',
    createAccount:   'إنشاء حساب',
    fullName:        'الاسم الكامل',
    phone:           'رقم الهاتف',
    wilaya:          'الولاية',
    createAcc:       'إنشاء الحساب 🎉',
    creating:        '⏳ جارٍ الإنشاء...',
    haveAccount:     'لديك حساب بالفعل؟',
    orderNow:        'اطلب الآن',
    availableStores: '🏪 المتاجر المتاحة',
    noStores:        'لا توجد متاجر بعد',
    open:            'مفتوح',
    closed:          'مغلق',
    orders:          'طلب',
    all:             'الكل',
    food:            'طعام',
    pharmacy:        'صيدلية',
    market:          'سوق',
    document:        'وثائق',
    parcel:          'طرد',
    newOrder:        '🚀 طلب جديد',
    pickupAddr:      'عنوان الاستلام',
    deliveryAddr:    'عنوان التوصيل',
    notes:           'ملاحظات (اختياري)',
    deliveryFee:     'رسوم التوصيل',
    confirmOrder:    '🚀 تأكيد الطلب',
    placing:         '⏳ جارٍ الطلب...',
    enterAddrs:      'الرجاء إدخال العناوين',
    orderSuccess:    '✅ تم تقديم الطلب!',
    orderFailed:     'فشل الطلب',
    welcomeUser:     'مرحباً،',
    trackOrders:     'تابع طلباتك وأدر حسابك',
    totalOrders:     'إجمالي الطلبات',
    delivered:       'مُسلَّم',
    totalSpent:      'المبلغ المُنفق',
    noOrders:        'لا توجد طلبات بعد!',
    placeFirst:      'قدّم طلبك الأول الآن',
    activeOrder:     'لديك طلب نشط! 🏍️',
    onTheWay:        'طلبك في الطريق إليك',
    myOrdersTab:     '📦 طلباتي',
    leaveReview:     '⭐ اترك تقييم',
    profile:         '👤 ملفي',
    memberSince:     'عضو منذ',
    wallet:          'المحفظة',
    submitReview:    '🚀 إرسال التقييم',
    submitting:      '⏳ جارٍ الإرسال...',
    writeComment:    'اكتب تعليقاً',
    reviewSuccess:   'تم إرسال التقييم! شكراً 🎉',
    reviewFailed:    'فشل إرسال التقييم',
    shareExp:        'شارك تجربتك مع واصل',
    yourRating:      'تقييمك',
    yourComment:     'تعليقك',
    fillFields:      'يرجاء ملء جميع الحقول',
    emailUsed:       'البريد الإلكتروني مستخدم',
    emailNotFound:   'البريد الإلكتروني غير موجود',
    wrongPassword:   'كلمة المرور خاطئة',
    loginFailed:     'فشل تسجيل الدخول',
    regFailed:       'فشل إنشاء الحساب',
  },
  en: {
    appName:         'WASEL',
    tagline:         'Smart Delivery Platform',
    login:           'Login',
    register:        'Register',
    logout:          'Logout',
    myOrders:        'My Orders',
    dashboard:       'Dashboard',
    welcomeBack:     'Welcome Back 👋',
    email:           'Email',
    password:        'Password',
    signIn:          'Sign In 🚀',
    signingIn:       '⏳ Signing in...',
    noAccount:       "Don't have an account?",
    createAccount:   'Register',
    fullName:        'Full Name',
    phone:           'Phone',
    wilaya:          'Wilaya',
    createAcc:       'Create Account 🎉',
    creating:        '⏳ Creating...',
    haveAccount:     'Already have an account?',
    orderNow:        'Order Now',
    availableStores: '🏪 Available Stores',
    noStores:        'No stores yet',
    open:            'Open',
    closed:          'Closed',
    orders:          'orders',
    all:             'All',
    food:            'Food',
    pharmacy:        'Pharmacy',
    market:          'Market',
    document:        'Document',
    parcel:          'Parcel',
    newOrder:        '🚀 New Order',
    pickupAddr:      'Pickup Address',
    deliveryAddr:    'Delivery Address',
    notes:           'Notes (optional)',
    deliveryFee:     'Delivery Fee',
    confirmOrder:    '🚀 Confirm Order',
    placing:         '⏳ Placing...',
    enterAddrs:      'Please enter addresses',
    orderSuccess:    '✅ Order placed!',
    orderFailed:     'Order failed',
    welcomeUser:     'Welcome,',
    trackOrders:     'Track your orders and manage your account',
    totalOrders:     'Total Orders',
    delivered:       'Delivered',
    totalSpent:      'Total Spent',
    noOrders:        'No orders yet!',
    placeFirst:      'Place your first order now',
    activeOrder:     'You have an active order! 🏍️',
    onTheWay:        'Your delivery is on the way',
    myOrdersTab:     '📦 My Orders',
    leaveReview:     '⭐ Leave Review',
    profile:         '👤 Profile',
    memberSince:     'Member Since',
    wallet:          'Wallet',
    submitReview:    '🚀 Submit Review',
    submitting:      '⏳ Submitting...',
    writeComment:    'Write a comment',
    reviewSuccess:   'Review submitted! Thank you 🎉',
    reviewFailed:    'Failed to submit review',
    shareExp:        'Share your experience with WASEL',
    yourRating:      'Your Rating',
    yourComment:     'Your Comment',
    fillFields:      'Please fill all required fields',
    emailUsed:       'Email already registered',
    emailNotFound:   'Email not found',
    wrongPassword:   'Incorrect password',
    loginFailed:     'Login failed',
    regFailed:       'Registration failed',
  }
};

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('wasel_lang') || 'ar');

  const toggleLang = () => {
    const next = lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('wasel_lang', next);
    setLang(next);
  };

  const t = (key) => translations[lang]?.[key] || translations['en']?.[key] || key;

  const isRTL = lang === 'ar';

  const ctxValue = {
    lang:       lang,
    toggleLang: toggleLang,
    t:          t,
    isRTL:      isRTL,
  };

  return (
    <LangContext.Provider value={ctxValue}>
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}