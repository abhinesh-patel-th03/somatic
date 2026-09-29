// ============================================================================
// Risk-band report content, UI text and speech script builder.
// Languages: en (English), hi (Hindi), mr (Marathi), te (Telugu)
//
// To change any wording, edit it HERE. Both the on-screen report and the
// voice assistant read from this one file, so they can never disagree.
// ============================================================================

export const RISK_BANDS = [
  { id: "veryLow", min: 0, max: 20 },
  { id: "low", min: 20, max: 40 },
  { id: "moderate", min: 40, max: 60 },
  { id: "high", min: 60, max: 80 },
  { id: "severe", min: 80, max: 100 },
];

// 0-19.99 veryLow | 20-39.99 low | 40-59.99 moderate | 60-79.99 high | 80+ severe
export function getRiskBand(score) {
  const s = Number(score);
  if (!Number.isFinite(s)) return null;
  if (s < 20) return RISK_BANDS[0];
  if (s < 40) return RISK_BANDS[1];
  if (s < 60) return RISK_BANDS[2];
  if (s < 80) return RISK_BANDS[3];
  return RISK_BANDS[4];
}

// ----------------------------------------------------------------------------
// REPORT CONTENT  (5 bands x 8 points x 4 languages)
// ----------------------------------------------------------------------------
const REPORTS = {
  // ==========================================================================
  // ENGLISH
  // ==========================================================================
  en: {
    veryLow: {
      title: "Very Low",
      points: [
        "The cow is healthy, and the milk and udder look normal.",
        "Somatic cell count (SCC) is low, so there is no hidden infection.",
        "Bedding is dry and clean, and the milking machine works well.",
        "No treatment is needed, and antibiotics should not be used.",
        "Dip the teats in disinfectant after every milking.",
        "Keep the feed balanced, with vitamin E, zinc and selenium, since the paper links these to a stronger immune system.",
        "Check SCC regularly to catch problems early.",
        "Keep the shed clean, airy and not overcrowded.",
      ],
    },
    low: {
      title: "Low",
      points: [
        "The cow looks healthy, but a few risk factors are present.",
        "Examples are wet bedding, an older cow, a high-yielding breed like Holstein-Friesian, or a hot and humid season.",
        "There are still no signs in the milk or udder.",
        "No antibiotics are needed. Fix the cause of the risk instead.",
        "Change bedding more often, improve ventilation and reduce crowding.",
        "Test milk with the California Mastitis Test (CMT) or SCC every 2-4 weeks.",
        "Give extra care to cows near calving, because the 3 weeks before and after birth are the riskiest.",
        "Keep up teat dipping and machine maintenance, as in the five-point plan.",
      ],
    },
    moderate: {
      title: "Moderate (Hidden or Sub-clinical Mastitis)",
      points: [
        "SCC is rising and milk yield is slowly dropping.",
        "The milk and udder still look normal, so the infection is easy to miss.",
        "The paper says this hidden form causes more total loss than visible mastitis.",
        "Test first: run a CMT and send a milk sample for culture to find the germ.",
        "Milk this cow last, and separate her if the germ is contagious (Staph. aureus, Strep. agalactiae).",
        "Treat only on a vet's advice, because some germs, like coagulase-negative Staph, respond well to antibiotics while Staph. aureus often does not.",
        "Plant products (oregano oil, turmeric mix) and probiotics may help, but they are still mostly lab or small-trial results and shouldn't replace vet care.",
        "Recheck SCC after 2 weeks to see if the infection is clearing.",
      ],
    },
    high: {
      title: "High (Clinical Mastitis)",
      points: [
        "The udder is red, swollen or warm, and the milk is watery with flakes or clots.",
        "Milk yield drops clearly.",
        "Call a vet the same day.",
        "Separate the cow, and milk out the udder fully and often to remove germs and toxins.",
        "The vet will usually give antibiotics into the udder, and sometimes by injection if the udder is badly blocked.",
        "Throw away the milk during treatment and for the full withdrawal period, so no antibiotic residue reaches consumers.",
        "Culture the milk so the right antibiotic is chosen. Antibiotics may fail against biofilm-forming or resistant germs (MRSA).",
        "If the infection keeps coming back, consider culling, as the five-point plan suggests for chronic cases.",
      ],
    },
    severe: {
      title: "Severe or Life-Threatening",
      points: [
        "The cow has fever, is weak or off feed, and the udder is hard, hot and very painful.",
        "The milk may be watery, bloody or nearly gone.",
        "This is often caused by E. coli toxins, which trigger a strong inflammation, or by Mycoplasma.",
        "This is an emergency. Call a vet immediately, because the cow can die.",
        "Expect injected antibiotics plus udder treatment, fluids, anti-inflammatory drugs and very frequent milking out.",
        "Isolate the cow at once to protect the herd.",
        "Mycoplasma mastitis does not respond to antibiotics, so the paper says the only control is quick separation or culling.",
        "Damaged udder tissue may never fully recover, even after the infection is gone.",
      ],
    },
  },

  // ==========================================================================
  // HINDI
  // ==========================================================================
  hi: {
    veryLow: {
      title: "बहुत कम जोखिम",
      points: [
        "गाय स्वस्थ है, और दूध तथा थन सामान्य दिखते हैं।",
        "दैहिक कोशिका गणना (SCC) कम है, इसलिए कोई छिपा संक्रमण नहीं है।",
        "बिछावन सूखा और साफ़ है, और दुहने की मशीन ठीक से काम कर रही है।",
        "किसी इलाज की ज़रूरत नहीं है, और एंटीबायोटिक का उपयोग नहीं करना चाहिए।",
        "हर बार दुहने के बाद थनों को कीटाणुनाशक घोल में डुबोएँ।",
        "चारा संतुलित रखें, जिसमें विटामिन ई, ज़िंक और सेलेनियम हों, क्योंकि शोध पत्र इन्हें मज़बूत रोग-प्रतिरोधक क्षमता से जोड़ता है।",
        "समस्याओं को जल्दी पकड़ने के लिए नियमित रूप से SCC की जाँच करें।",
        "गोशाला को साफ़, हवादार और भीड़-भाड़ से मुक्त रखें।",
      ],
    },
    low: {
      title: "कम जोखिम",
      points: [
        "गाय स्वस्थ दिखती है, लेकिन कुछ जोखिम कारक मौजूद हैं।",
        "उदाहरण हैं: गीला बिछावन, उम्रदराज़ गाय, होल्स्टीन-फ़्रीज़ियन जैसी अधिक दूध देने वाली नस्ल, या गर्म और नम मौसम।",
        "दूध या थन में अभी भी कोई लक्षण नहीं हैं।",
        "एंटीबायोटिक की ज़रूरत नहीं है। इसके बजाय जोखिम के कारण को ठीक करें।",
        "बिछावन ज़्यादा बार बदलें, हवा का आवागमन बेहतर करें और भीड़ कम करें।",
        "हर 2 से 4 सप्ताह में कैलिफ़ोर्निया मैस्टाइटिस टेस्ट (CMT) या SCC से दूध की जाँच करें।",
        "ब्याने के करीब वाली गायों का विशेष ध्यान रखें, क्योंकि ब्याने से पहले और बाद के 3 सप्ताह सबसे जोखिम भरे होते हैं।",
        "पाँच-सूत्रीय योजना की तरह थन डुबाना और मशीन का रखरखाव जारी रखें।",
      ],
    },
    moderate: {
      title: "मध्यम जोखिम (छिपा हुआ या उप-नैदानिक थनैला रोग)",
      points: [
        "SCC बढ़ रही है और दूध की मात्रा धीरे-धीरे घट रही है।",
        "दूध और थन अभी भी सामान्य दिखते हैं, इसलिए संक्रमण को पकड़ना आसान नहीं है।",
        "शोध पत्र के अनुसार यह छिपा हुआ रूप, दिखने वाले थनैला रोग से ज़्यादा कुल नुकसान करता है।",
        "पहले जाँच करें: CMT करें और कीटाणु की पहचान के लिए दूध का नमूना कल्चर के लिए भेजें।",
        "इस गाय को सबसे आख़िर में दुहें, और अगर कीटाणु संक्रामक है (स्टैफ ऑरियस, स्ट्रेप एगैलेक्टिया) तो उसे अलग रखें।",
        "इलाज केवल पशु चिकित्सक की सलाह पर करें, क्योंकि कुछ कीटाणु, जैसे कोएगुलेज़-निगेटिव स्टैफ, एंटीबायोटिक से अच्छी तरह ठीक होते हैं, जबकि स्टैफ ऑरियस अक्सर नहीं होता।",
        "पौधों से बने उत्पाद (ओरिगैनो तेल, हल्दी का मिश्रण) और प्रोबायोटिक्स मदद कर सकते हैं, लेकिन ये अभी ज़्यादातर प्रयोगशाला या छोटे परीक्षणों के नतीजे हैं और पशु चिकित्सक की देखभाल की जगह नहीं ले सकते।",
        "संक्रमण ठीक हो रहा है या नहीं, यह देखने के लिए 2 सप्ताह बाद फिर से SCC जाँचें।",
      ],
    },
    high: {
      title: "उच्च जोखिम (नैदानिक थनैला रोग)",
      points: [
        "थन लाल, सूजा हुआ या गर्म है, और दूध पानी जैसा पतला है जिसमें छिछड़े या थक्के हैं।",
        "दूध की मात्रा साफ़ तौर पर घट जाती है।",
        "उसी दिन पशु चिकित्सक को बुलाएँ।",
        "गाय को अलग करें, और कीटाणु तथा विषैले पदार्थ निकालने के लिए थन को बार-बार और पूरी तरह दुहें।",
        "पशु चिकित्सक आमतौर पर थन के अंदर एंटीबायोटिक देते हैं, और थन बहुत ज़्यादा जाम हो तो कभी-कभी इंजेक्शन से भी देते हैं।",
        "इलाज के दौरान और दवा का असर ख़त्म होने की पूरी अवधि (विदड्रॉअल पीरियड) तक दूध फेंक दें, ताकि उपभोक्ताओं तक एंटीबायोटिक के अवशेष न पहुँचें।",
        "सही एंटीबायोटिक चुनने के लिए दूध का कल्चर कराएँ। एंटीबायोटिक बायोफ़िल्म बनाने वाले या प्रतिरोधी कीटाणुओं (MRSA) पर काम नहीं भी कर सकते।",
        "अगर संक्रमण बार-बार लौटता है, तो पाँच-सूत्रीय योजना के अनुसार पुराने मामलों में गाय को झुंड से हटाने (कलिंग) पर विचार करें।",
      ],
    },
    severe: {
      title: "गंभीर या जानलेवा जोखिम",
      points: [
        "गाय को बुखार है, वह कमज़ोर है या चारा नहीं खा रही, और थन सख़्त, गर्म और बहुत दर्दनाक है।",
        "दूध पानी जैसा, ख़ून मिला हुआ हो सकता है या लगभग बंद हो सकता है।",
        "यह अक्सर ई-कोलाई के विषैले पदार्थों से होता है, जो तेज़ सूजन पैदा करते हैं, या माइकोप्लाज़्मा से।",
        "यह आपात स्थिति है। तुरंत पशु चिकित्सक को बुलाएँ, क्योंकि गाय की जान जा सकती है।",
        "इंजेक्शन से एंटीबायोटिक, थन का इलाज, ड्रिप (तरल पदार्थ), सूजन-रोधी दवाएँ और बहुत बार दूध निकालना ज़रूरी होगा।",
        "झुंड को बचाने के लिए गाय को तुरंत अलग करें।",
        "माइकोप्लाज़्मा थनैला रोग पर एंटीबायोटिक असर नहीं करते, इसलिए शोध पत्र के अनुसार एकमात्र नियंत्रण गाय को जल्दी अलग करना या झुंड से हटाना है।",
        "थन के क्षतिग्रस्त ऊतक संक्रमण ख़त्म होने के बाद भी शायद कभी पूरी तरह ठीक न हों।",
      ],
    },
  },

  // ==========================================================================
  // MARATHI
  // ==========================================================================
  mr: {
    veryLow: {
      title: "अत्यंत कमी धोका",
      points: [
        "गाय निरोगी आहे, आणि दूध व कास सामान्य दिसतात.",
        "दैहिक पेशी संख्या (SCC) कमी आहे, म्हणजेच कोणताही लपलेला संसर्ग नाही.",
        "बिछाना कोरडा आणि स्वच्छ आहे, आणि दूध काढण्याचे यंत्र नीट चालते.",
        "कोणत्याही उपचाराची गरज नाही, आणि प्रतिजैविके (अँटिबायोटिक्स) वापरू नयेत.",
        "प्रत्येक वेळी दूध काढल्यानंतर सड निर्जंतुक द्रावणात बुडवा.",
        "खाद्य संतुलित ठेवा, त्यात व्हिटॅमिन ई, झिंक आणि सेलेनियम असावे, कारण शोधनिबंधात यांचा संबंध मजबूत रोगप्रतिकारशक्तीशी जोडला आहे.",
        "समस्या लवकर ओळखण्यासाठी नियमितपणे SCC तपासा.",
        "गोठा स्वच्छ, हवेशीर आणि गर्दी नसलेला ठेवा.",
      ],
    },
    low: {
      title: "कमी धोका",
      points: [
        "गाय निरोगी दिसते, पण काही धोकादायक घटक उपस्थित आहेत.",
        "उदाहरणे: ओला बिछाना, जास्त वयाची गाय, होल्स्टीन-फ्रिजियन सारखी जास्त दूध देणारी जात, किंवा उष्ण व दमट हंगाम.",
        "दूध किंवा कासेमध्ये अजूनही कोणतीही लक्षणे नाहीत.",
        "प्रतिजैविकांची गरज नाही. त्याऐवजी धोक्याचे कारण दूर करा.",
        "बिछाना अधिक वेळा बदला, हवा खेळती ठेवा आणि गर्दी कमी करा.",
        "दर 2 ते 4 आठवड्यांनी कॅलिफोर्निया मॅस्टायटिस टेस्ट (CMT) किंवा SCC द्वारे दुधाची तपासणी करा.",
        "विण्याच्या जवळच्या गायींची विशेष काळजी घ्या, कारण विण्याच्या आधीचे आणि नंतरचे 3 आठवडे सर्वात धोक्याचे असतात.",
        "पंचसूत्री योजनेप्रमाणे सड बुडवणे आणि यंत्राची देखभाल सुरू ठेवा.",
      ],
    },
    moderate: {
      title: "मध्यम धोका (लपलेला किंवा उप-नैदानिक कासदाह)",
      points: [
        "SCC वाढत आहे आणि दुधाचे प्रमाण हळूहळू घटत आहे.",
        "दूध आणि कास अजूनही सामान्य दिसतात, त्यामुळे संसर्ग सहज नजरेतून सुटतो.",
        "शोधनिबंधानुसार हा लपलेला प्रकार, दिसणाऱ्या कासदाहापेक्षा एकूण जास्त नुकसान करतो.",
        "आधी तपासणी करा: CMT करा आणि जंतू ओळखण्यासाठी दुधाचा नमुना कल्चरसाठी पाठवा.",
        "या गायीचे दूध सर्वात शेवटी काढा, आणि जंतू संसर्गजन्य असल्यास (स्टॅफ ऑरियस, स्ट्रेप अगॅलॅक्टिए) तिला वेगळे ठेवा.",
        "उपचार फक्त पशुवैद्यकाच्या सल्ल्याने करा, कारण काही जंतू, जसे कोअ‍ॅग्युलेज-निगेटिव्ह स्टॅफ, प्रतिजैविकांना चांगला प्रतिसाद देतात, तर स्टॅफ ऑरियस अनेकदा देत नाही.",
        "वनस्पतीजन्य उत्पादने (ओरेगॅनो तेल, हळदीचे मिश्रण) आणि प्रोबायोटिक्स मदत करू शकतात, पण ते अजून बहुतेक प्रयोगशाळा किंवा लहान चाचण्यांचे निष्कर्ष आहेत आणि पशुवैद्यकीय उपचारांची जागा घेऊ नयेत.",
        "संसर्ग बरा होत आहे का हे पाहण्यासाठी 2 आठवड्यांनी पुन्हा SCC तपासा.",
      ],
    },
    high: {
      title: "जास्त धोका (नैदानिक कासदाह)",
      points: [
        "कास लाल, सुजलेली किंवा गरम आहे, आणि दूध पाण्यासारखे पातळ असून त्यात गाठी किंवा गुठळ्या आहेत.",
        "दुधाचे प्रमाण स्पष्टपणे घटते.",
        "त्याच दिवशी पशुवैद्यकाला बोलवा.",
        "गायीला वेगळे करा, आणि जंतू व विषारी पदार्थ बाहेर काढण्यासाठी कास पूर्णपणे व वारंवार रिकामी करा.",
        "पशुवैद्य सहसा कासेत प्रतिजैविक सोडतात, आणि कास खूप कडक झाली असल्यास कधी कधी इंजेक्शनद्वारेही देतात.",
        "उपचारादरम्यान आणि औषधाचा प्रभाव संपेपर्यंतच्या संपूर्ण कालावधीत (विथड्रॉवल कालावधी) दूध फेकून द्या, म्हणजे ग्राहकांपर्यंत प्रतिजैविकांचे अंश पोहोचणार नाहीत.",
        "योग्य प्रतिजैविक निवडण्यासाठी दुधाचे कल्चर करा. बायोफिल्म तयार करणाऱ्या किंवा प्रतिरोधक जंतूंवर (MRSA) प्रतिजैविके काम करणार नाहीत असे होऊ शकते.",
        "संसर्ग वारंवार परत येत असल्यास, पंचसूत्री योजनेनुसार जुनाट प्रकरणांमध्ये गाय कळपातून काढून टाकण्याचा (कलिंग) विचार करा.",
      ],
    },
    severe: {
      title: "गंभीर किंवा जीवघेणा धोका",
      points: [
        "गायीला ताप आहे, ती अशक्त आहे किंवा चारा खात नाही, आणि कास कडक, गरम आणि अतिशय वेदनादायक आहे.",
        "दूध पाण्यासारखे, रक्तमिश्रित किंवा जवळजवळ बंद झालेले असू शकते.",
        "हे बहुतेकदा ई-कोलायच्या विषामुळे होते, जे तीव्र दाह निर्माण करते, किंवा मायकोप्लाझ्मामुळे.",
        "ही आणीबाणी आहे. तात्काळ पशुवैद्यकाला बोलवा, कारण गाय दगावू शकते.",
        "इंजेक्शनद्वारे प्रतिजैविके, कासेवरील उपचार, सलाईन (द्रव पदार्थ), दाहनाशक औषधे आणि खूप वारंवार दूध काढणे आवश्यक असेल.",
        "कळपाचे संरक्षण करण्यासाठी गायीला त्वरित वेगळे करा.",
        "मायकोप्लाझ्मा कासदाहावर प्रतिजैविके काम करत नाहीत, म्हणून शोधनिबंधानुसार एकमेव नियंत्रण म्हणजे गायीला लवकर वेगळे करणे किंवा कळपातून काढून टाकणे.",
        "संसर्ग गेल्यानंतरही कासेच्या खराब झालेल्या ऊती कदाचित कधीच पूर्णपणे बऱ्या होणार नाहीत.",
      ],
    },
  },

  // ==========================================================================
  // TELUGU
  // ==========================================================================
  te: {
    veryLow: {
      title: "చాలా తక్కువ ప్రమాదం",
      points: [
        "ఆవు ఆరోగ్యంగా ఉంది, పాలు మరియు పొదుగు సాధారణంగా కనిపిస్తున్నాయి.",
        "సోమాటిక్ కణాల సంఖ్య (SCC) తక్కువగా ఉంది, కాబట్టి దాగి ఉన్న ఇన్ఫెక్షన్ లేదు.",
        "పరుపు పొడిగా, శుభ్రంగా ఉంది, పాలు పితికే యంత్రం బాగా పనిచేస్తోంది.",
        "ఎలాంటి చికిత్స అవసరం లేదు, యాంటీబయాటిక్స్ వాడకూడదు.",
        "ప్రతిసారి పాలు పితికిన తర్వాత చనుమొనలను క్రిమిసంహారక ద్రావణంలో ముంచండి.",
        "దాణాను సమతుల్యంగా ఉంచండి, అందులో విటమిన్ ఇ, జింక్, సెలీనియం ఉండాలి, ఎందుకంటే పరిశోధనా పత్రం వీటిని బలమైన రోగనిరోధక శక్తితో ముడిపెడుతోంది.",
        "సమస్యలను ముందుగానే గుర్తించడానికి క్రమం తప్పకుండా SCC పరీక్షించండి.",
        "కొట్టాన్ని శుభ్రంగా, గాలి ఆడేలా, రద్దీ లేకుండా ఉంచండి.",
      ],
    },
    low: {
      title: "తక్కువ ప్రమాదం",
      points: [
        "ఆవు ఆరోగ్యంగా కనిపిస్తోంది, కానీ కొన్ని ప్రమాద కారకాలు ఉన్నాయి.",
        "ఉదాహరణలు: తడి పరుపు, వయసు మీరిన ఆవు, హోల్‌స్టీన్-ఫ్రీజియన్ వంటి ఎక్కువ పాలిచ్చే జాతి, లేదా వేడి, తేమతో కూడిన కాలం.",
        "పాలలో లేదా పొదుగులో ఇంకా ఎలాంటి లక్షణాలు లేవు.",
        "యాంటీబయాటిక్స్ అవసరం లేదు. బదులుగా ప్రమాదానికి కారణాన్ని సరిచేయండి.",
        "పరుపును తరచుగా మార్చండి, గాలి ప్రసరణ మెరుగుపరచండి, రద్దీని తగ్గించండి.",
        "ప్రతి 2 నుండి 4 వారాలకు కాలిఫోర్నియా మాస్టైటిస్ టెస్ట్ (CMT) లేదా SCC తో పాలను పరీక్షించండి.",
        "ఈనడానికి దగ్గరగా ఉన్న ఆవులకు ప్రత్యేక శ్రద్ధ ఇవ్వండి, ఎందుకంటే ఈనడానికి ముందు, తర్వాత 3 వారాలు అత్యంత ప్రమాదకరం.",
        "ఐదు అంశాల ప్రణాళికలో చెప్పినట్లుగా చనుమొనలు ముంచడం, యంత్రం నిర్వహణ కొనసాగించండి.",
      ],
    },
    moderate: {
      title: "మధ్యస్థ ప్రమాదం (దాగి ఉన్న లేదా సబ్-క్లినికల్ పొదుగు వాపు)",
      points: [
        "SCC పెరుగుతోంది, పాల దిగుబడి నెమ్మదిగా తగ్గుతోంది.",
        "పాలు, పొదుగు ఇంకా సాధారణంగానే కనిపిస్తున్నాయి, కాబట్టి ఇన్ఫెక్షన్‌ను గుర్తించడం కష్టం.",
        "పరిశోధనా పత్రం ప్రకారం, కనిపించే పొదుగు వాపు కంటే ఈ దాగి ఉన్న రూపం ఎక్కువ మొత్తం నష్టాన్ని కలిగిస్తుంది.",
        "ముందుగా పరీక్ష చేయండి: CMT చేసి, క్రిమిని గుర్తించడానికి పాల నమూనాను కల్చర్‌కు పంపండి.",
        "ఈ ఆవు పాలు చివరగా పితకండి, క్రిమి అంటువ్యాధి కలిగించేది అయితే (స్టాఫ్ ఆరియస్, స్ట్రెప్ అగాలాక్టియే) దాన్ని వేరుగా ఉంచండి.",
        "పశువైద్యుని సలహాతో మాత్రమే చికిత్స చేయండి, ఎందుకంటే కోఅగ్యులేజ్-నెగటివ్ స్టాఫ్ వంటి కొన్ని క్రిములు యాంటీబయాటిక్స్‌కు బాగా స్పందిస్తాయి, కానీ స్టాఫ్ ఆరియస్ తరచుగా స్పందించదు.",
        "మొక్కల ఉత్పత్తులు (ఒరేగానో నూనె, పసుపు మిశ్రమం), ప్రోబయోటిక్స్ సహాయపడవచ్చు, కానీ అవి ఇంకా ఎక్కువగా ప్రయోగశాల లేదా చిన్న పరీక్షల ఫలితాలే, పశువైద్య సంరక్షణకు ప్రత్యామ్నాయం కావు.",
        "ఇన్ఫెక్షన్ తగ్గుతోందో లేదో చూడటానికి 2 వారాల తర్వాత మళ్ళీ SCC పరీక్షించండి.",
      ],
    },
    high: {
      title: "అధిక ప్రమాదం (క్లినికల్ పొదుగు వాపు)",
      points: [
        "పొదుగు ఎర్రగా, వాచి లేదా వేడిగా ఉంది, పాలు నీళ్ళలా పలచగా ఉండి, ముక్కలు లేదా గడ్డలు ఉన్నాయి.",
        "పాల దిగుబడి స్పష్టంగా తగ్గుతుంది.",
        "అదే రోజు పశువైద్యుడిని పిలవండి.",
        "ఆవును వేరు చేసి, క్రిములు, విషపదార్థాలు బయటకు పోవడానికి పొదుగును పూర్తిగా, తరచుగా పితకండి.",
        "పశువైద్యుడు సాధారణంగా పొదుగులోకి యాంటీబయాటిక్స్ ఇస్తారు, పొదుగు బాగా బిగుసుకుపోతే కొన్నిసార్లు ఇంజెక్షన్ ద్వారా కూడా ఇస్తారు.",
        "చికిత్స సమయంలో, మందు ప్రభావం పూర్తిగా పోయే వరకు (విత్‌డ్రాయల్ కాలం) పాలను పారబోయండి, తద్వారా వినియోగదారులకు యాంటీబయాటిక్ అవశేషాలు చేరవు.",
        "సరైన యాంటీబయాటిక్ ఎంచుకోవడానికి పాల కల్చర్ చేయించండి. బయోఫిల్మ్ ఏర్పరిచే లేదా నిరోధక క్రిములపై (MRSA) యాంటీబయాటిక్స్ పనిచేయకపోవచ్చు.",
        "ఇన్ఫెక్షన్ మళ్ళీ మళ్ళీ వస్తుంటే, ఐదు అంశాల ప్రణాళిక సూచించినట్లుగా దీర్ఘకాలిక కేసులలో ఆవును మంద నుండి తొలగించడం (కల్లింగ్) గురించి ఆలోచించండి.",
      ],
    },
    severe: {
      title: "తీవ్రమైన లేదా ప్రాణాంతక ప్రమాదం",
      points: [
        "ఆవుకు జ్వరం ఉంది, బలహీనంగా ఉంది లేదా మేత తినడం లేదు, పొదుగు గట్టిగా, వేడిగా, చాలా నొప్పిగా ఉంది.",
        "పాలు నీళ్ళలా, రక్తంతో కూడినవిగా ఉండవచ్చు లేదా దాదాపు రాకపోవచ్చు.",
        "ఇది తరచుగా బలమైన వాపును కలిగించే ఈ-కోలై విషపదార్థాల వల్ల, లేదా మైకోప్లాస్మా వల్ల వస్తుంది.",
        "ఇది అత్యవసర పరిస్థితి. వెంటనే పశువైద్యుడిని పిలవండి, ఎందుకంటే ఆవు చనిపోయే ప్రమాదం ఉంది.",
        "ఇంజెక్షన్ ద్వారా యాంటీబయాటిక్స్, పొదుగుకు చికిత్స, సెలైన్ ద్రవాలు, వాపు నివారణ మందులు, చాలా తరచుగా పాలు పితకడం అవసరమవుతాయి.",
        "మందను కాపాడటానికి ఆవును వెంటనే వేరు చేయండి.",
        "మైకోప్లాస్మా పొదుగు వాపుకు యాంటీబయాటిక్స్ పనిచేయవు, కాబట్టి పరిశోధనా పత్రం ప్రకారం ఏకైక నియంత్రణ త్వరగా వేరు చేయడం లేదా మంద నుండి తొలగించడం.",
        "ఇన్ఫెక్షన్ పోయిన తర్వాత కూడా దెబ్బతిన్న పొదుగు కణజాలం ఎప్పటికీ పూర్తిగా కోలుకోకపోవచ్చు.",
      ],
    },
  },
};

// ----------------------------------------------------------------------------
// UI TEXT used by the report panel, disclaimer and the voice assistant
// ----------------------------------------------------------------------------
const UI = {
  en: {
    reportTitle: "Risk score report",
    scoreRange: "Score range",
    disclaimerTitle: "Clinical disclaimer",
    disclaimer:
      "This is decision-support information, not a diagnosis. Always consult a registered veterinarian for correct treatment and medication.",
    assistantName: "SOMATIC Assistant",
    hint: "Voice assistant",
    speaking: "Speaking…",
    paused: "Paused",
    pause: "Pause",
    resume: "Resume",
    stop: "Stop",
    unsupported: "Voice is not supported in this browser.",
    noVoice: "No Indian English voice found on this device. Using the default voice.",
    voiceLabel: "Voice",
    cowFallback: "the cow",
    pointWord: "Point",
    lead: "Here is what this means, and what you should do.",
    intro: (cow, score, title) =>
      `Health summary for ${cow}. The final risk score is ${score} percent. Risk level: ${title}.`,
    sensors: (ph, temp, cond) =>
      `Sensor readings: pH ${ph}, temperature ${temp} degrees Celsius, conductivity ${cond} milli Siemens.`,
  },
  hi: {
    reportTitle: "जोखिम स्कोर रिपोर्ट",
    scoreRange: "स्कोर सीमा",
    disclaimerTitle: "नैदानिक अस्वीकरण",
    disclaimer:
      "यह सहायक जानकारी है, निदान नहीं। सही इलाज और दवा के लिए हमेशा पंजीकृत पशु चिकित्सक की सलाह लें।",
    assistantName: "सोमैटिक सहायक",
    hint: "वॉयस असिस्टेंट",
    speaking: "बोल रहा है…",
    paused: "रुका हुआ",
    pause: "रोकें",
    resume: "फिर शुरू करें",
    stop: "बंद करें",
    unsupported: "इस ब्राउज़र में आवाज़ समर्थित नहीं है।",
    noVoice: "इस डिवाइस पर हिन्दी आवाज़ नहीं मिली। डिफ़ॉल्ट आवाज़ इस्तेमाल हो रही है।",
    voiceLabel: "आवाज़",
    cowFallback: "गाय",
    pointWord: "बिंदु",
    lead: "इसका क्या मतलब है और आपको क्या करना चाहिए, यह सुनिए।",
    intro: (cow, score, title) =>
      `${cow} का स्वास्थ्य सारांश। अंतिम जोखिम स्कोर ${score} प्रतिशत है। जोखिम स्तर: ${title}।`,
    sensors: (ph, temp, cond) =>
      `सेंसर रीडिंग: पीएच ${ph}, तापमान ${temp} डिग्री सेल्सियस, चालकता ${cond} मिली सीमेंस।`,
  },
  mr: {
    reportTitle: "धोका स्कोअर अहवाल",
    scoreRange: "स्कोअर श्रेणी",
    disclaimerTitle: "वैद्यकीय अस्वीकरण",
    disclaimer:
      "ही सहायक माहिती आहे, निदान नाही. योग्य उपचार आणि औषधांसाठी नेहमी नोंदणीकृत पशुवैद्यकाचा सल्ला घ्या.",
    assistantName: "सोमॅटिक सहाय्यक",
    hint: "व्हॉइस असिस्टंट",
    speaking: "बोलत आहे…",
    paused: "थांबवले",
    pause: "थांबवा",
    resume: "पुन्हा सुरू करा",
    stop: "बंद करा",
    unsupported: "या ब्राउझरमध्ये आवाज समर्थित नाही.",
    noVoice: "या डिव्हाइसवर मराठी आवाज सापडला नाही. डिफॉल्ट आवाज वापरला जात आहे.",
    voiceLabel: "आवाज",
    cowFallback: "गाय",
    pointWord: "मुद्दा",
    lead: "याचा अर्थ काय आणि तुम्ही काय करावे ते ऐका.",
    intro: (cow, score, title) =>
      `${cow} चा आरोग्य सारांश. अंतिम धोका स्कोअर ${score} टक्के आहे. धोक्याची पातळी: ${title}.`,
    sensors: (ph, temp, cond) =>
      `सेन्सर रीडिंग: पीएच ${ph}, तापमान ${temp} अंश सेल्सिअस, संवाहकता ${cond} मिली सीमेन्स.`,
  },
  te: {
    reportTitle: "ప్రమాద స్కోర్ నివేదిక",
    scoreRange: "స్కోర్ పరిధి",
    disclaimerTitle: "వైద్య నిరాకరణ",
    disclaimer:
      "ఇది సహాయక సమాచారం మాత్రమే, వ్యాధి నిర్ధారణ కాదు. సరైన చికిత్స, మందుల కోసం ఎల్లప్పుడూ నమోదిత పశువైద్యుని సలహా తీసుకోండి.",
    assistantName: "సోమాటిక్ సహాయకుడు",
    hint: "వాయిస్ అసిస్టెంట్",
    speaking: "మాట్లాడుతోంది…",
    paused: "ఆపబడింది",
    pause: "పాజ్",
    resume: "మళ్ళీ ప్రారంభించండి",
    stop: "ఆపివేయండి",
    unsupported: "ఈ బ్రౌజర్‌లో వాయిస్ మద్దతు లేదు.",
    noVoice: "ఈ పరికరంలో తెలుగు వాయిస్ కనిపించలేదు. డిఫాల్ట్ వాయిస్ వాడుతున్నాం.",
    voiceLabel: "వాయిస్",
    cowFallback: "ఆవు",
    pointWord: "అంశం",
    lead: "దీని అర్థం ఏమిటి, మీరు ఏమి చేయాలి అనేది వినండి.",
    intro: (cow, score, title) =>
      `${cow} ఆరోగ్య సారాంశం. తుది ప్రమాద స్కోర్ ${score} శాతం. ప్రమాద స్థాయి: ${title}.`,
    sensors: (ph, temp, cond) =>
      `సెన్సార్ రీడింగ్‌లు: పీహెచ్ ${ph}, ఉష్ణోగ్రత ${temp} డిగ్రీల సెల్సియస్, వాహకత ${cond} మిల్లీ సీమెన్స్.`,
  },
};

// ----------------------------------------------------------------------------
// Accessors (always fall back to English so nothing can ever be undefined)
// ----------------------------------------------------------------------------
export function getUiText(lang) {
  return UI[lang] || UI.en;
}

export function getReportContent(lang, bandId) {
  return (REPORTS[lang] && REPORTS[lang][bandId]) || REPORTS.en[bandId];
}

// ----------------------------------------------------------------------------
// Speech helpers
// ----------------------------------------------------------------------------

// Split at sentence ends ( . ! ? । ) but NOT at abbreviations like "Staph. aureus"
// (a full stop followed by a lowercase Latin letter is not a sentence end).
function splitSentences(text) {
  const out = [];
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "." || ch === "!" || ch === "?" || ch === "।") {
      const rest = text.slice(i + 1);
      const m = rest.match(/^\s+(\S)/);
      if (m && !/[a-z]/.test(m[1])) {
        out.push(text.slice(start, i + 1));
        const skipped = rest.length - rest.replace(/^\s+/, "").length;
        start = i + 1 + skipped;
        i = start - 1;
      }
    }
  }
  const tail = text.slice(start);
  if (tail.trim()) out.push(tail);
  return out.map((s) => s.trim()).filter(Boolean);
}

function hardSplit(text, limit) {
  if (text.length <= limit) return [text];
  const words = text.split(" ");
  const out = [];
  let buf = "";
  for (const w of words) {
    if (buf && `${buf} ${w}`.length > limit) {
      out.push(buf);
      buf = w;
    } else {
      buf = buf ? `${buf} ${w}` : w;
    }
  }
  if (buf) out.push(buf);
  return out;
}

// Browsers (especially Chrome) cut off long utterances, so we speak in short pieces.
export function splitLong(text, max = 170) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return [];
  if (clean.length <= max) return [clean];

  const out = [];
  let buf = "";
  for (const sentence of splitSentences(clean)) {
    if (buf && `${buf} ${sentence}`.length > max) {
      out.push(buf);
      buf = sentence;
    } else {
      buf = buf ? `${buf} ${sentence}` : sentence;
    }
  }
  if (buf) out.push(buf);
  return out.flatMap((piece) => hardSplit(piece, 240));
}

const isNum = (v) => v !== null && v !== undefined && v !== "" && Number.isFinite(Number(v));

// Builds the list of short pieces the assistant speaks, in the chosen language.
export function buildSpeechChunks({ lang, cowName, score, bandId, sensors }) {
  const ui = getUiText(lang);
  const report = getReportContent(lang, bandId);
  const rounded = Math.round(Number(score) || 0);

  const chunks = [ui.intro(cowName || ui.cowFallback, rounded, report.title)];

  if (sensors && isNum(sensors.ph) && isNum(sensors.temperature) && isNum(sensors.conductivity)) {
    chunks.push(
      ui.sensors(Number(sensors.ph), Number(sensors.temperature), Number(sensors.conductivity))
    );
  }

  chunks.push(ui.lead);
  report.points.forEach((point, i) => chunks.push(`${ui.pointWord} ${i + 1}. ${point}`));
  chunks.push(ui.disclaimer);

  return chunks.flatMap((c) => splitLong(c));
}
