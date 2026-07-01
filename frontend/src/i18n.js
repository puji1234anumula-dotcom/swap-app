import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English (en)
const en = {
  translation: {
    "nav_how_it_works": "How it Works",
    "nav_browse_skills": "Browse Skills",
    "nav_login": "Log In",
    "nav_get_started": "Get Started",
    "nav_messages": "Messages",
    "nav_dashboard": "Dashboard",
    "nav_logout": "Log Out",
    "hero_headline": "Trade What You Know. Learn What You Want.",
    "hero_subheadline": "SWAP connects people who want to exchange skills — no money, just knowledge.",
    "hero_cta": "Start Swapping Free",
    "how_it_works_title": "How it works",
    "step_1_title": "1. Post Your Skills",
    "step_1_desc": "List what you offer and what you want to learn.",
    "step_2_title": "2. Get Matched",
    "step_2_desc": "Our engine finds compatible skill swaps automatically.",
    "step_3_title": "3. Start Learning",
    "step_3_desc": "Connect and swap directly through our secure messaging.",
    "featured_skills": "Featured Skills"
  }
};

// Hindi (hi)
const hi = {
  translation: {
    "nav_how_it_works": "यह कैसे काम करता है",
    "nav_browse_skills": "कौशल खोजें",
    "nav_login": "लॉग इन",
    "nav_get_started": "शुरू करें",
    "nav_messages": "संदेश",
    "nav_dashboard": "डैशबोर्ड",
    "nav_logout": "लॉग आउट",
    "hero_headline": "जो आप जानते हैं उसका व्यापार करें। जो आप चाहते हैं उसे सीखें।",
    "hero_subheadline": "SWAP उन लोगों को जोड़ता है जो कौशल का आदान-प्रदान करना चाहते हैं - कोई पैसा नहीं, सिर्फ ज्ञान।",
    "hero_cta": "मुफ़्त में स्वैपिंग शुरू करें",
    "how_it_works_title": "यह कैसे काम करता है",
    "step_1_title": "1. अपने कौशल पोस्ट करें",
    "step_1_desc": "सूचीबद्ध करें कि आप क्या प्रदान करते हैं और क्या सीखना चाहते हैं।",
    "step_2_title": "2. मैच प्राप्त करें",
    "step_2_desc": "हमारा इंजन स्वचालित रूप से संगत कौशल स्वैप ढूंढता है।",
    "step_3_title": "3. सीखना शुरू करें",
    "step_3_desc": "हमारे सुरक्षित मैसेजिंग के माध्यम से सीधे कनेक्ट और स्वैप करें।",
    "featured_skills": "विशेष कौशल"
  }
};

// Telugu (te)
const te = {
  translation: {
    "nav_how_it_works": "ఇది ఎలా పనిచేస్తుంది",
    "nav_browse_skills": "నైపుణ్యాలను అన్వేషించండి",
    "nav_login": "లాగిన్",
    "nav_get_started": "ప్రారంభించండి",
    "nav_messages": "సందేశాలు",
    "nav_dashboard": "డాష్‌బోర్డ్",
    "nav_logout": "లాగ్ అవుట్",
    "hero_headline": "మీకు తెలిసిన దాన్ని మార్పిడి చేసుకోండి. మీకు కావలసినది నేర్చుకోండి.",
    "hero_subheadline": "SWAP నైపుణ్యాలను మార్పిడి చేయాలనుకునే వ్యక్తులను కలుపుతుంది - డబ్బు లేదు, కేవలం జ్ఞానం మాత్రమే.",
    "hero_cta": "ఉచితంగా స్వాపింగ్ ప్రారంభించండి",
    "how_it_works_title": "ఇది ఎలా పనిచేస్తుంది",
    "step_1_title": "1. మీ నైపుణ్యాలను పోస్ట్ చేయండి",
    "step_1_desc": "మీరు ఏమి ఆఫర్ చేస్తారో మరియు మీరు ఏమి నేర్చుకోవాలనుకుంటున్నారో జాబితా చేయండి.",
    "step_2_title": "2. మ్యాచ్ పొందండి",
    "step_2_desc": "మా ఇంజిన్ స్వయంచాలకంగా అనుకూలమైన నైపుణ్య మార్పిడిని కనుగొంటుంది.",
    "step_3_title": "3. నేర్చుకోవడం ప్రారంభించండి",
    "step_3_desc": "మా సురక్షిత మెసేజింగ్ ద్వారా నేరుగా కనెక్ట్ అవ్వండి మరియు మార్పిడి చేయండి.",
    "featured_skills": "ప్రత్యేక నైపుణ్యాలు"
  }
};

// Tamil (ta)
const ta = {
  translation: {
    "nav_how_it_works": "இது எப்படி வேலை செய்கிறது",
    "nav_browse_skills": "திறன்களைத் தேடுக",
    "nav_login": "உள்நுழைக",
    "nav_get_started": "தொடங்குங்கள்",
    "nav_messages": "செய்திகள்",
    "nav_dashboard": "கட்டுப்பாட்டு அறை",
    "nav_logout": "வெளியேறு",
    "hero_headline": "உங்களுக்கு தெரிந்ததை வர்த்தகம் செய்யுங்கள். நீங்கள் விரும்பியதை கற்றுக்கொள்ளுங்கள்.",
    "hero_subheadline": "திறன்களை பரிமாறிக்கொள்ள விரும்பும் நபர்களை SWAP இணைக்கிறது - பணம் இல்லை, அறிவு மட்டுமே.",
    "hero_cta": "இலவசமாக மாற்றுவதைத் தொடங்குங்கள்",
    "how_it_works_title": "இது எப்படி வேலை செய்கிறது",
    "step_1_title": "1. உங்கள் திறன்களை பதிவேற்றுங்கள்",
    "step_1_desc": "நீங்கள் என்ன வழங்குகிறீர்கள் மற்றும் என்ன கற்றுக்கொள்ள விரும்புகிறீர்கள் என்பதை பட்டியலிடுங்கள்.",
    "step_2_title": "2. பொருந்தக்கூடியதை பெறுங்கள்",
    "step_2_desc": "எங்கள் இயந்திரம் தானாகவே இணக்கமான திறன் பரிமாற்றங்களைக் கண்டறியும்.",
    "step_3_title": "3. கற்க தொடங்குங்கள்",
    "step_3_desc": "எங்கள் பாதுகாப்பான செய்தியிடல் மூலம் நேரடியாக இணைக்கவும், பரிமாறவும்.",
    "featured_skills": "சிறப்பு திறன்கள்"
  }
};

// Bengali (bn)
const bn = {
  translation: {
    "nav_how_it_works": "এটি কীভাবে কাজ করে",
    "nav_browse_skills": "দক্ষতা ব্রাউজ করুন",
    "nav_login": "লগ ইন",
    "nav_get_started": "শুরু করুন",
    "nav_messages": "বার্তা",
    "nav_dashboard": "ড্যাশবোর্ড",
    "nav_logout": "লগ আউট",
    "hero_headline": "আপনি যা জানেন তা বিনিময় করুন। আপনি যা চান তা শিখুন।",
    "hero_subheadline": "SWAP সেই সমস্ত লোকদের সংযুক্ত করে যারা দক্ষতা বিনিময় করতে চায় - কোনও টাকা নয়, কেবল জ্ঞান।",
    "hero_cta": "বিনামূল্যে সোয়াপিং শুরু করুন",
    "how_it_works_title": "এটি কীভাবে কাজ করে",
    "step_1_title": "1. আপনার দক্ষতা পোস্ট করুন",
    "step_1_desc": "আপনি কী অফার করেন এবং আপনি কী শিখতে চান তা তালিকাভুক্ত করুন।",
    "step_2_title": "2. মিল পান",
    "step_2_desc": "আমাদের ইঞ্জিন স্বয়ংক্রিয়ভাবে সামঞ্জস্যপূর্ণ দক্ষতা অদলবদল খুঁজে বের করে।",
    "step_3_title": "3. শেখা শুরু করুন",
    "step_3_desc": "আমাদের নিরাপদ মেসেজিংয়ের মাধ্যমে সরাসরি সংযুক্ত হন এবং বিনিময় করুন।",
    "featured_skills": "বৈশিষ্ট্যযুক্ত দক্ষতা"
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: en,
      hi: hi,
      te: te,
      ta: ta,
      bn: bn
    },
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
