/**
 * StadiumIQ Translation Engine
 * Translates navigation directions and chat strings across 5 supported languages.
 * Handles text-direction properties (LTR vs RTL) for Urdu/Arabic.
 */

export const LANGUAGES = {
  en: { code: "en", name: "English", dir: "ltr" },
  ar: { code: "ar", name: "العربية", dir: "rtl" },
  ur: { code: "ur", name: "اردو", dir: "rtl" },
  es: { code: "es", name: "Español", dir: "ltr" },
  fr: { code: "fr", name: "Français", dir: "ltr" }
};

const TRANSLATIONS = {
  ar: {
    "Where is the nearest exit?": "أين أقرب مخرج؟",
    "Nearest exit is Gate 4. Here are your step-by-step directions:": "أقرب مخرج هو البوابة 4. إليك إرشادات خطوة بخطوة:",
    "Turn right at Section 102 and head towards the North concourse.": "انعطف يمينًا عند القسم 102 وتوجه نحو الممر الشمالي.",
    "Pass the merchandise stand and continue straight for 50 meters.": "تجاوز كشك البضائع واستمر في السير المستقيم لمسافة 50 مترًا.",
    "Gate 4 will be on your left, past the security checkpoint.": "ستكون البوابة 4 على يسارك، بعد نقطة التفتيش الأمنية.",
    "Nearest exit is Gate 5. Here are your step-by-step directions:": "أقرب مخرج هو البوابة 5. إليك إرشادات خطوة بخطوة:",
    "Avoid Congestion Active": "تجنب الازدحام نشط",
    "Fan Assistant": "مساعد المشجعين",
    "Type or ask by voice...": "اكتب أو اسأل بالصوت...",
    "Food & Drink": "الأطعمة والأشربة",
    "My Seat": "مقعدي",
    "Restrooms": "دورات المياه",
    "Gate 4 is currently clear. Head there now for a 2-minute entry.": "البوابة 4 خالية حالياً. توجه إلى هناك الآن للدخول في غضون دقيقتين.",
    "ASK IQ": "اسأل ذكاء الملعب",
    "ETA TO EXIT": "الوقت المقدر للخروج",
    "4 MIN": "4 دقائق",
    "CONGESTION": "الازدحام",
    "HIGH": "مرتفع",
    "LOW CROWD": "ازدحام منخفض",
    "MODERATE": "متوسط",
    "Venue B is congested, rerouting via North Concourse.": "الممر ب مزدحم، جاري إعادة التوجيه عبر الممر الشمالي.",
    "You have arrived at your destination.": "لقد وصلت إلى وجهتك.",
    "You will reach your destination on the left.": "ستصل إلى وجهتك على اليسار."
  },
  ur: {
    "Where is the nearest exit?": "قریب ترین راستہ کہاں ہے؟",
    "Nearest exit is Gate 4. Here are your step-by-step directions:": "قریب ترین راستہ گیٹ 4 ہے۔ یہ رہے آپ کے قدم بہ قدم رہنما اصول:",
    "Turn right at Section 102 and head towards the North concourse.": "سیکشن 102 پر دائیں مڑیں اور شمالی ہال کی طرف بڑھیں۔",
    "Pass the merchandise stand and continue straight for 50 meters.": "مرچنڈائز اسٹینڈ سے گزریں اور 50 میٹر سیدھے چلتے رہیں۔",
    "Gate 4 will be on your left, past the security checkpoint.": "گیٹ 4 سیکیورٹی چیک پوائنٹ کے بعد آپ کے بائیں جانب ہوگا۔",
    "Nearest exit is Gate 5. Here are your step-by-step directions:": "قریب ترین راستہ گیٹ 5 ہے۔ یہ رہے آپ کے قدم بہ قدم رہنما اصول:",
    "Avoid Congestion Active": "ہجوم سے بچنے کا فلٹر فعال ہے",
    "Fan Assistant": "فین اسسٹنٹ",
    "Type or ask by voice...": "لکھیں یا آواز سے پوچھیں...",
    "Food & Drink": "کھانا اور پینا",
    "My Seat": "میری سیٹ",
    "Restrooms": "واش رومز",
    "Gate 4 is currently clear. Head there now for a 2-minute entry.": "گیٹ 4 فی الحال صاف ہے۔ 2 منٹ میں داخلے کے لیے ابھی وہاں جائیں۔",
    "ASK IQ": "آئی کیو سے پوچھیں",
    "ETA TO EXIT": "خروج کا تخمینہ وقت",
    "4 MIN": "4 منٹ",
    "CONGESTION": "ہجوم کی شرح",
    "HIGH": "بہت زیادہ",
    "LOW CROWD": "کم ہجوم",
    "MODERATE": "درمیانہ",
    "Venue B is congested, rerouting via North Concourse.": "وینیو بی میں ہجوم زیادہ ہے، شمالی ہال سے راستہ تبدیل کیا جا رہا ہے۔",
    "You have arrived at your destination.": "آپ اپنی منزل پر پہنچ چکے ہیں۔",
    "You will reach your destination on the left.": "آپ بائیں طرف اپنی منزل پر پہنچ جائیں گے۔"
  },
  es: {
    "Where is the nearest exit?": "¿Dónde está la salida más cercana?",
    "Nearest exit is Gate 4. Here are your step-by-step directions:": "La salida más cercana es la Puerta 4. Aquí tiene las indicaciones paso a paso:",
    "Turn right at Section 102 and head towards the North concourse.": "Gire a la derecha en la Sección 102 y diríjase hacia el pasillo norte.",
    "Pass the merchandise stand and continue straight for 50 meters.": "Pase el puesto de mercancías y continúe recto durante 50 metros.",
    "Gate 4 will be on your left, past the security checkpoint.": "La Puerta 4 estará a su izquierda, pasando el control de seguridad.",
    "Nearest exit is Gate 5. Here are your step-by-step directions:": "La salida más cercana es la Puerta 5. Aquí tiene las indicaciones paso a paso:",
    "Avoid Congestion Active": "Evitar Congestión Activo",
    "Fan Assistant": "Asistente del Fan",
    "Type or ask by voice...": "Escriba o pregunte por voz...",
    "Food & Drink": "Comida y Bebida",
    "My Seat": "Mi Asiento",
    "Restrooms": "Baños",
    "Gate 4 is currently clear. Head there now for a 2-minute entry.": "La Puerta 4 está despejada. Diríjase allí ahora para entrar en 2 minutos.",
    "ASK IQ": "PREGUNTAR A IQ",
    "ETA TO EXIT": "ETA A LA SALIDA",
    "4 MIN": "4 MIN",
    "CONGESTION": "CONGESTIÓN",
    "HIGH": "ALTA",
    "LOW CROWD": "POCA GENTE",
    "MODERATE": "MODERADA",
    "Venue B is congested, rerouting via North Concourse.": "El pasillo B está congestionado, desviando por el pasillo norte.",
    "You have arrived at your destination.": "Ha llegado a su destino.",
    "You will reach your destination on the left.": "Llegará a su destino a la izquierda."
  },
  fr: {
    "Where is the nearest exit?": "Où se trouve la sortie la plus proche?",
    "Nearest exit is Gate 4. Here are your step-by-step directions:": "La sortie la plus proche est la Porte 4. Voici les étapes de navigation:",
    "Turn right at Section 102 and head towards the North concourse.": "Tournez à droite à la Section 102 et dirigez-vous vers le hall Nord.",
    "Pass the merchandise stand and continue straight for 50 meters.": "Passez le stand de souvenirs et continuez tout droit sur 50 mètres.",
    "Gate 4 will be on your left, past the security checkpoint.": "La Porte 4 sera sur votre gauche, après le point de contrôle de sécurité.",
    "Nearest exit is Gate 5. Here are your step-by-step directions:": "La sortie la plus proche est la Porte 5. Voici les étapes de navigation:",
    "Avoid Congestion Active": "Éviter la congestion actif",
    "Fan Assistant": "Assistant de Supporter",
    "Type or ask by voice...": "Écrivez ou demandez par voix...",
    "Food & Drink": "Boisson & Nourriture",
    "My Seat": "Mon Siège",
    "Restrooms": "Toilettes",
    "Gate 4 is currently clear. Head there now for a 2-minute entry.": "La Porte 4 est libre. Dirigez-vous là-bas pour entrer en 2 minutes.",
    "ASK IQ": "DEMANDER À IQ",
    "ETA TO EXIT": "TEMPS DE SORTIE",
    "4 MIN": "4 MIN",
    "CONGESTION": "CONGESTION",
    "HIGH": "ÉLEVÉE",
    "LOW CROWD": "FLUX FLUIDE",
    "MODERATE": "MODÉRÉE",
    "Venue B is congested, rerouting via North Concourse.": "Le hall B est congestionné, redirection via le hall Nord.",
    "You have arrived at your destination.": "Vous êtes arrivé à destination.",
    "You will reach your destination on the left.": "Vous atteindrez votre destination sur la gauche."
  }
};

export const translate = (text, langCode) => {
  if (langCode === "en" || !TRANSLATIONS[langCode]) {
    return text;
  }
  return TRANSLATIONS[langCode][text] || text;
};

export const getDir = (langCode) => {
  return LANGUAGES[langCode]?.dir || "ltr";
};
