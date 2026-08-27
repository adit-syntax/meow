/**
 * frontend/src/data/mistyKnowledge.ts
 * SkyGuard AI — 100% Comprehensive Meteorological, AI, Hardware & System Knowledge Base
 * Powers Misty the Cloudy Face AI Concept Clarifier across all application pages.
 * Supports English, Hinglish, and Hindi (हिंदी).
 */

export interface MistyExplanation {
  term: string;
  category: string;
  synonyms: string[];
  en: {
    summary: string;
    detail: string;
    analogy: string;
    impact: string;
  };
  hinglish: {
    summary: string;
    detail: string;
    analogy: string;
    impact: string;
  };
  hi: {
    summary: string;
    detail: string;
    analogy: string;
    impact: string;
  };
  relatedQuestions: string[];
}

export const MISTY_KNOWLEDGE_BASE: MistyExplanation[] = [
  // ─── 1. ANOMALY CLASSIFICATIONS ──────────────────────────────────────
  {
    term: 'Multivariate Inconsistency',
    category: 'Anomaly Classification',
    synonyms: ['multivariate', 'inconsistency', 'physical conflict', 'correlation break', 'cross-channel'],
    en: {
      summary: 'A physical impossibility where two or more interrelated sensor readings contradict natural thermodynamic laws.',
      detail: 'In atmospheric physics, variables are strictly bound. When Relative Humidity (RH) hits 100%, the Dew Point temperature (Tdew) must equal the Dry Bulb ambient temperature (T). If a station reports 99% RH with a 10°C gap between ambient and dew point, it is physically impossible. This flags sensor degradation or cross-channel corruption.',
      analogy: 'Imagine standing under heavy rain while your hygrometer insists humidity is 0%—one of them is definitely broken!',
      impact: 'Triggers automated WMO QC Flag 2 (Suspect) and prompts neural imputation or technician recalibration.',
    },
    hinglish: {
      summary: 'Ek aisi physical abnormality jahan do alag-alag sensors ki readings nature ke laws ke khilaf jati hain.',
      detail: 'Mausam vigyan (Meteorology) mein atmospheric variables ek doosre se jude hote hain. Example ke liye: Jab Relative Humidity (RH) 98-100% ho, toh Dew Point temperature aur Dry Bulb temperature barabar hone chahiye. Agar ambient temp 35°C ho aur dew point 15°C dikhaye aur saath mein humidity 100% ho, toh yeh impossible hai!',
      analogy: 'Jaise bahar tez baarish ho rahi ho lekin sensor bole ki 0% humidity hai—yeh clear sensor fault hai!',
      impact: 'System is reading ko reject karke 3 nearest stations se real-time neural data bhar deta hai.',
    },
    hi: {
      summary: 'एक भौतिक विरोधाभास जहाँ दो या दो से अधिक परस्पर जुड़े सेंसरों के आंकड़े प्राकृतिक नियमों का उल्लंघन करते हैं।',
      detail: 'मौसम विज्ञान में, विभिन्न पैरामीटर्स (जैसे तापमान, सापेक्ष आर्द्रता और ओस बिंदु) भौतिक नियमों से बंधे होते हैं। जब आर्द्रता 100% तक पहुँचती है, तो ओस बिंदु तापमान (Dew Point) और परिवेशी तापमान (Dry Bulb Temp) एक समान होना चाहिए। यदि इनमें बड़ा अंतर दिखे तो यह सेंसर खराबी का स्पष्ट संकेत है।',
      analogy: 'जैसे बाहर मूसलाधार बारिश हो रही हो, लेकिन आपका सेंसर कहे कि हवा बिल्कुल सूखी (0% नमी) है!',
      impact: 'सिस्टम तुरंत WMO QC फ्लैग 2 लागू करता है और निकटतम स्टेशनों से अनुमानित डेटा प्रतिस्थापित करता है।',
    },
    relatedQuestions: [
      'What is Dew Point Depression?',
      'How does Spatial Consensus Imputation fix multivariate errors?',
      'What is WMO-No. 8 QC Flag 2?',
    ],
  },
  {
    term: 'Sensor Spike Anomaly',
    category: 'Anomaly Classification',
    synonyms: ['sensor spike', 'spike', 'transient jump', 'instantaneous surge', 'delta threshold'],
    en: {
      summary: 'An instantaneous, non-physical mathematical surge or drop in sensor readings lasting 1-2 sampling cycles.',
      detail: 'Natural atmospheric parameters have inertia; air temperature cannot physically jump +18°C in 1.5 seconds. Spikes are typically caused by electrostatic discharge (ESD), loose terminal connections, power surges in the solar regulator, or analog-to-digital conversion (ADC) glitched bits.',
      analogy: 'Like a car speedometer suddenly jumping from 40 km/h to 250 km/h for a split second due to an electrical glitch.',
      impact: 'Automatically scrubbed by the median delta filter and flagged with WMO Flag 2 (Erroneous).',
    },
    hinglish: {
      summary: 'Achanak ek-do second ke liye kisi sensor ki reading ka wildly upar ya neeche jump kar jana.',
      detail: 'Kudrat mein mausam itna achanak nahi badalta—1 second mein temperature 25°C se 50°C nahi ho sakta. Yeh spike wiring mein earthing problem, static shock ya battery voltage fluctuation ki wajah se aati hai.',
      analogy: 'Jaise ghar ke fan ki speed regulator hilaane par achanak light tez ho kar normal ho jaye.',
      impact: 'AI is spike ko instantly remove karta hai taaki average weather data kharab na ho.',
    },
    hi: {
      summary: 'सेंसर रीडिंग में एक या दो सेकंड के लिए आने वाला अस्वाभाविक और अत्यधिक उछाल (Spike)।',
      detail: 'प्राकृतिक वायुमंडल में तापमान या दबाव पलक झपकते ही दोगुना नहीं हो सकता। ऐसे स्पाइक अक्सर तारों में अर्थिंग दोष, स्थिर विद्युत झटके या वोल्टेज में उतार-चढ़ाव के कारण उत्पन्न होते हैं।',
      analogy: 'जैसे बाइक का स्पीडोमीटर बिजली की खराबी के कारण अचानक 40 से 200 किमी/घंटा दिखाकर वापस आ जाए।',
      impact: 'सिस्टम इसे तुरंत फ़िल्टर करता है और मौसम पूर्वानुमान मॉडल्स को दूषित होने से बचाता है।',
    },
    relatedQuestions: [
      'What causes electrical noise spikes in Campbell loggers?',
      'How does rate-of-change filtering detect spikes?',
      'What is the difference between Spike and Drift?',
    ],
  },
  {
    term: 'Sensor Stuck / Flatline Anomaly',
    category: 'Anomaly Classification',
    synonyms: ['stuck', 'flatline', 'zero variance', 'sensor frozen', 'stagnant', 'frozen'],
    en: {
      summary: 'A hardware failure where a sensor outputs perfectly identical values with 0.000 variance across multiple hours.',
      detail: 'Natural micro-turbulence always causes tiny 0.05°C - 0.1°C variations in meteorological parameters. If a thermistor or barometer transmits exactly 24.300°C for 6 straight hours, the transducer ADC is frozen, the probe is unplugged, or the datalogger channel is shorted.',
      analogy: 'Like a hospital ECG heart monitor drawing a flat horizontal line—the sensor has stopped responding to the world!',
      impact: 'Immediately isolated and replaced with synthetic neural imputation (Flag 4) while dispatching a technician.',
    },
    hinglish: {
      summary: 'Jab sensor freeze ho jaye aur kayi ghanto tak bina 0.1 ka bhi badlav kiye same reading deta rahe.',
      detail: 'Hawa, dhoop aur badal ki wajah se reading mein hamesha halka fluctuation hota hai. Agar koi sensor bina kisi movement ke bilkul constant value dikhaye, toh iska matlab uska chip ya wire disconnect ho chuka hai.',
      analogy: 'Jaise ghadi ki suiyan ek hi jagah par jam gayi hon!',
      impact: 'System turant emergency alert raise karta hai aur paas ke stations se real-time estimate chalata hai.',
    },
    hi: {
      summary: 'सेंसर का फ्रीज हो जाना, जहाँ रीडिंग बिना किसी सूक्ष्म बदलाव के लगातार कई घंटों तक स्थिर रहती है।',
      detail: 'प्राकृतिक वातावरण में लगातार सूक्ष्म हलचल होती है। यदि कोई सेंसर 4-6 घंटे तक बिल्कुल शून्य विचरण (Zero Variance) दिखाता है, तो उसका एनालॉग सर्किट या तार खराब हो चुका है।',
      analogy: 'जैसे किसी अस्पताल के मॉनिटर पर दिल की धड़कन की सीधी सपाट रेखा बन जाए!',
      impact: 'सिस्टम इसे अमान्य घोषित कर फील्ड तकनीशियन के लिए वर्क आर्डर जारी करता है।',
    },
    relatedQuestions: [
      'What is Zero Variance detection threshold?',
      'How does Spatial Consensus replace stuck data?',
      'How to test frozen ADC channels?',
    ],
  },
  {
    term: 'Sensor Drift Anomaly',
    category: 'Anomaly Classification',
    synonyms: ['sensor drift', 'drift', 'calibration drift', 'zero shift', 'aging degradation'],
    en: {
      summary: 'A gradual, insidious calibration deviation where sensor readings slowly skew away from ground truth over weeks.',
      detail: 'Pyranometer glass degradation, photodiode oxidation, dust accumulation, or thermistor resistor aging cause slow monotonic shifts (e.g. +0.2°C per week). Unlike spikes, drift cannot be caught by single-point limits; it requires spatio-temporal comparison against neighboring synoptic stations.',
      analogy: 'A mechanical clock that loses 2 minutes every day—you only notice the error after two weeks!',
      impact: 'Triggers automated recalibration schedules and calculates Sensor Degradation Index.',
    },
    hinglish: {
      summary: 'Dheere-dheere sensor ka galat reading dena shuru karna jo din-ba-din badhta jata hai.',
      detail: 'Dhool, dhoop aur sensor ke purane hone se uski accuracy thodi-thodi girne lagti hai. Ek din mein pata nahi chalta, lekin 2-3 hafton mein reading real mausam se 2-3 degree bhatak jati hai.',
      analogy: 'Jaise kisi vajan tolne wali machine par zang lagne se wo har baar 100 gram zyada dikhane lage.',
      impact: 'System aaspas ke stations se compare karke drift pakad leta hai aur calibration request daalta hai.',
    },
    hi: {
      summary: 'सेंसर का धीरे-धीरे अपनी सटीक कैलिब्रेशन से भटकना (Drift), जो हफ़्तों में बढ़ता जाता है।',
      detail: 'धूल जमने, सेंसर की उम्र बढ़ने या फोटोडायोड के क्षरण से माप में मंद विचलन आता है। इसे एकल सीमा द्वारा नहीं पकड़ा जा सकता, बल्कि पड़ोसी वेधशालाओं के स्थानिक तुलना मॉडल द्वारा पहचाना जाता है।',
      analogy: 'जैसे कोई पुरानी तराजू जो हर हफ्ते 50 ग्राम अधिक वजन दिखाने लगे।',
      impact: 'यह समय रहते फील्ड सर्विस टीम को चेतावनी देता है ताकि सेंसर का पुनः अंशांकन किया जा सके।',
    },
    relatedQuestions: [
      'What is Pyranometer photodiode aging?',
      'How does Spatio-Temporal Isolation Forest detect drift?',
      'What is Span Error vs Zero Shift?',
    ],
  },
  {
    term: 'Physical Boundary Violation',
    category: 'Anomaly Classification',
    synonyms: ['boundary violation', 'out of bounds', 'physical limit', 'climatological range'],
    en: {
      summary: 'A sensor measurement that falls outside physically possible Earth atmospheric limits or regional climatological bounds.',
      detail: 'WMO guidelines define absolute meteorological boundaries (e.g. RH cannot be < 0% or > 105%; Pune surface temperature cannot physically reach 78°C or -35°C). Any reading breaching these thresholds is an unphysical artifact.',
      analogy: 'A speedometer showing 800 km/h on a bicycle—physically impossible!',
      impact: 'Instant hard-rejection (WMO Flag 2) with zero model latency.',
    },
    hinglish: {
      summary: 'Aisi reading jo kudrat ke physical limits se bilkul bahar ho (jaise Pune mein 80°C garmi).',
      detail: 'WMO standards har shehar ke liye maximum aur minimum limits tay karte hain. Agar Relative Humidity -5% ho jaye ya temperature 85°C dikhaye, toh yeh seedha hardware fault hai.',
      analogy: 'Jaise koi bole ki paani 200°C par bhi baraf bana hua hai—asambhav!',
      impact: 'AI bina kisi deri ke is reading ko reject kar deta hai.',
    },
    hi: {
      summary: 'ऐसी रीडिंग जो पृथ्वी के प्राकृतिक वायुमंडलीय और क्षेत्रीय भौतिक सीमाओं से बाहर हो।',
      detail: 'विश्व मौसम विज्ञान संगठन (WMO) द्वारा निर्धारित सीमाओं (जैसे सापेक्ष आर्द्रता 0% से कम नहीं हो सकती और मैदानी इलाकों में तापमान 75°C नहीं हो सकता) का उल्लंघन होने पर डेटा को तुरंत अमान्य किया जाता है।',
      analogy: 'जैसे किसी थर्मामीटर का कमरे के सामान्य तापमान को 150°C बताना!',
      impact: 'सिस्टम इसे बिना किसी विलंब के WMO ध्वज 2 लगाकर खारिज कर देता है।',
    },
    relatedQuestions: [
      'What are WMO-No. 8 physical limits for pressure?',
      'How are regional climatological limits calculated?',
      'What is the difference between local microclimate and boundary violation?',
    ],
  },

  // ─── 2. SENSORS & HARDWARE ──────────────────────────────────────────
  {
    term: 'Campbell CR1000X & Vaisala Telemetry',
    category: 'Hardware & Instrumentation',
    synonyms: ['campbell', 'cr1000x', 'vaisala', 'datalogger', 'hmp155', 'transducer', 'excitation voltage'],
    en: {
      summary: 'Industrial-grade ruggedized dataloggers and precision capacitive hygrometers used in field stations.',
      detail: 'The Campbell Scientific CR1000X is the gold-standard datalogger measuring microvolt transducer signals from thermistors, barometers, and pyranometers. The Vaisala HMP155 probe measures ambient temperature and humidity using HUMICAP® thin-film capacitive sensors with Pt100 RTD resistance standards.',
      analogy: 'The Campbell CR1000X is the brain of the weather station, and Vaisala is its ultra-sensitive nervous system.',
      impact: 'Monitored for excitation voltage stability (nominal 2.50V) and probe resistance (nominal 1000Ω) to detect physical wire oxidation or sensor fatigue.',
    },
    hinglish: {
      summary: 'Weather station ka sabse powerful industrial computer (Datalogger) aur high-precision humidity/temp sensor.',
      detail: 'Campbell CR1000X ek rugged field computer hai jo har sensor se aane wale micro-voltage signals ko digital data mein convert karta hai. Vaisala HMP155 ek specialized sensor hai jo hawa ki nami aur garmi ko 0.1% accuracy ke sath measure karta hai.',
      analogy: 'Weather station ka CPU (Campbell) aur uski ultra-sharp aankhein/kaan (Vaisala).',
      impact: 'Technicians excitation voltage aur wiring resistance check karke pehle hi hardware failure rok lete hain.',
    },
    hi: {
      summary: 'औद्योगिक श्रेणी का मौसम डेटा लॉगर (CR1000X) और उच्च-सटीकता वाला वायुमंडलीय सेंसर (Vaisala)।',
      detail: 'कैंपबेल CR1000X मौसम स्टेशन का मुख्य कंप्यूटर है जो सभी सेंसरों से एनालॉग सिग्नल एकत्रित करता है। वैसला HMP155 सेंसर 0.1% की सटीकता के साथ सापेक्ष आर्द्रता और तापमान को मापता है।',
      analogy: 'मौसम वेधशाला का मस्तिष्क (Campbell Logger) और उसकी सबसे संवेदनशील ज्ञानेन्द्रियाँ (Vaisala Probes)।',
      impact: 'सेंसर वोल्टेज और तार के प्रतिरोध (Resistance) की निगरानी करके उपकरण खराब होने से पहले मरम्मत की जाती है।',
    },
    relatedQuestions: [
      'What is Excitation Voltage in sensor diagnostics?',
      'How to dispatch a Field Work Order for calibration?',
      'What causes Sensor Drift in Pyranometers?',
    ],
  },
  {
    term: 'Solar Irradiance / Pyranometer / GHI (W/m²)',
    category: 'Meteorological Parameters',
    synonyms: ['solar', 'irradiance', 'pyranometer', 'ghi', 'solar radiation', 'w/m2', 'photodiode'],
    en: {
      summary: 'The total electromagnetic power from the Sun received per unit surface area (measured in Watts per square meter).',
      detail: 'Global Horizontal Irradiance (GHI) is measured by thermopile or silicon photodiode pyranometers. Peak midday tropical sunlight typically reaches 800 - 1100 W/m², dropping to exactly 0 W/m² at night. Detecting non-zero readings at 02:00 UTC or physical mismatches with cloud cover flags zero-offset drift.',
      analogy: 'Like measuring how much heat and light energy is beaming onto your solar panels.',
      impact: 'Crucial for solar energy grid forecasts, evapotranspiration rates, and thermal convection models.',
    },
    hinglish: {
      summary: 'Sooraj ki dhoop aur energy ki taqat jo zameen par padti hai (Watts per square meter mein measured).',
      detail: 'Pyranometer naamak sensor sooraj ki roshni aur garmi ko measure karta hai. Dopehar mein yeh 900-1000 W/m² tak hota hai aur raat ko 0 W/m². Agar raat ke 2 baje pyranometer 50 W/m² dikhaye, toh sensor mein electrical leak ya drift hai.',
      analogy: 'Jaise solar panel par dhoop ki intensity check karna.',
      impact: 'Solar power plants aur kisaano ki fasal ke paani calculation ke liye bahut zaruri hai.',
    },
    hi: {
      summary: 'सूर्य से पृथ्वी की सतह पर पहुँचने वाली कुल सौर ऊर्जा (GHI), जिसे वाट प्रति वर्ग मीटर (W/m²) में मापा जाता है।',
      detail: 'पाइरानोमीटर सेंसर द्वारा मापी जाने वाली सौर विकिरण दोपहर में 900-1100 W/m² तक पहुँचती है और रात में शून्य होनी चाहिए। रात में गैर-शून्य मान दिखना सेंसर की खराबी दर्शाता है।',
      analogy: 'जैसे सोलर पैनल पर पड़ने वाली धूप की तीव्रता को मापना।',
      impact: 'सौर ऊर्जा संयंत्रों, कृषि जल प्रबंधन और वायुमंडलीय ऊष्मा चक्र के विश्लेषण के लिए अनिवार्य।',
    },
    relatedQuestions: [
      'Why should Pyranometer read 0 W/m² at night?',
      'What is Global Horizontal Irradiance (GHI)?',
      'How does cloud cover affect solar radiation?',
    ],
  },
  {
    term: 'Barometric Pressure (hPa)',
    category: 'Meteorological Parameters',
    synonyms: ['pressure', 'barometric', 'hpa', 'surface pressure', 'mbar', 'piezoresistive'],
    en: {
      summary: 'The weight of the atmospheric air column pressing down on Earth’s surface, measured in hectopascals (hPa).',
      detail: 'Standard sea-level atmospheric pressure is 1013.25 hPa. High pressure typically brings clear, calm weather; rapid pressure drops (> 3 hPa in 3 hours) signal approaching cyclones, monsoonal depressions, or severe squall lines.',
      analogy: 'The weight of an invisible ocean of air resting on your shoulders.',
      impact: 'Primary indicator for cyclone track prediction, storm surge warnings, and aviation altimeter calibration.',
    },
    hinglish: {
      summary: 'Hawa ka wazan jo zameen par dabav dalta hai (hPa / millibar mein napa jata hai).',
      detail: 'Normal sea level par pressure 1013.25 hPa hota hai. Agar pressure achanak tezi se girne lage (jaise 1002 se 985 hPa), toh iska matlab hai ki bhayanak toofan ya cyclone aane wala hai.',
      analogy: 'Jaise toofan aane se pehle hawa bhari aur ajeeb lagne lagti hai.',
      impact: 'Cyclone aur barish ki pehle se warning dene ke liye sabse important signal hai.',
    },
    hi: {
      summary: 'वायुमंडलीय हवा का पृथ्वी की सतह पर पड़ने वाला दबाव, जिसे हेक्टोपास्कल (hPa) में मापा जाता है।',
      detail: 'समुद्र तल पर मानक वायुमंडलीय दबाव 1013.25 hPa होता है। दबाव में अचानक भारी गिरावट चक्रवात, तीव्र आंधी या भारी वर्षा का सीधा संकेत होती है।',
      analogy: 'हमारे ऊपर मौजूद वायुमंडल की अदृश्य चादर का कुल वजन।',
      impact: 'चक्रवात की पूर्व चेतावनी, विमानन सुरक्षा और मौसमी बदलावों को समझने का प्राथमिक आधार।',
    },
    relatedQuestions: [
      'What is standard atmospheric pressure at sea level?',
      'How does rapid pressure drop indicate a cyclone?',
      'How is station pressure adjusted for altitude (QNH vs QFE)?',
    ],
  },
  {
    term: 'Ultrasonic Anemometer & Wind Vectors (m/s, deg)',
    category: 'Hardware & Instrumentation',
    synonyms: ['wind', 'anemometer', 'wind vector', 'wind speed', 'wind direction', 'ultrasonic', 'gust'],
    en: {
      summary: 'Solid-state sonic transducers that measure wind speed and direction with zero moving parts by measuring sound wave travel times.',
      detail: 'Ultrasonic anemometers transmit high-frequency ultrasound pulses across 2 or 3 orthogonal acoustic paths. Wind speed along each axis changes the time-of-flight (ToF) of the acoustic pulse, computing exact U (zonal) and V (meridional) wind vectors up to 60 m/s with 0.01 m/s precision.',
      analogy: 'Like yelling across a windy canyon—sound travels faster downwind and slower upwind.',
      impact: 'Eliminates mechanical bearing freeze/wear and delivers instant gust detection for airport wind shear safety.',
    },
    hinglish: {
      summary: 'Bina ghoomne wale parts wala digital sound-wave sensor jo hawa ki raftaar aur disha ko bilkul accurately napta hai.',
      detail: 'Purane panke wale anemometer jam ho jate the. Ultrasonic anemometer ultrasonic sound waves bhej kar check karta hai ki hawa sound ko kitna tez ya dheere push kar rahi hai, jisse hawa ki speed aur angle (0-360°) pata chalta hai.',
      analogy: 'Jaise hawa ke rukh ke sath bolne par aawaz door tak tez jati hai.',
      impact: 'Airports par wind shear aur cyclone mein hawa ki maximum speed nikalne ke liye use hota hai.',
    },
    hi: {
      summary: 'ध्वनि तरंगों (Ultrasound) द्वारा बिना किसी घूमने वाले हिस्से के हवा की गति और दिशा मापने वाला आधुनिक सेंसर।',
      detail: 'अल्ट्रासोनिक एनेमोमीटर ध्वनि तरंगों के पारगमन समय (Time-of-Flight) के आधार पर हवा की गति (m/s) और दिशा (डिग्री) की अचूक गणना करता है। यह यांत्रिक टूट-फूट से पूरी तरह मुक्त होता है।',
      analogy: 'जैसे हवा के बहाव की दिशा में तैरने पर गति तेज हो जाती है।',
      impact: 'हवाई अड्डों पर विंड शीयर चेतावनी और चक्रवाती हवाओं की सटीक निगरानी में प्रयुक्त।',
    },
    relatedQuestions: [
      'Why are Ultrasonic Anemometers better than mechanical cup anemometers?',
      'What are U and V wind vector components?',
      'What is Beaufort Wind Scale?',
    ],
  },

  // ─── 3. AI & ALGORITHMS ──────────────────────────────────────────────
  {
    term: 'Isolation Forest & Graph Neural Networks (GNN)',
    category: 'AI & Neural Algorithms',
    synonyms: ['isolation forest', 'gnn', 'graph neural network', 'machine learning', 'anomaly model', 'ai engine'],
    en: {
      summary: 'Dual-tier machine learning architecture combining tree-based outlier partitioning with spatial graph topology.',
      detail: 'SkyGuard AI uses an Isolation Forest to detect high-dimensional tabular outliers by measuring the number of random splits required to isolate a point. Concurrently, a Spatial Graph Neural Network (GNN) models the 34 synoptic stations as nodes connected by topographical edge weights, detecting subtle cross-station spatial correlation breakdowns.',
      analogy: 'Like finding the odd one out in a crowd: lone anomalies are isolated quickly, while the graph checks if neighbors agree.',
      impact: 'Achieves > 99.4% precision with sub-5ms inference latency across high-throughput telemetry streams.',
    },
    hinglish: {
      summary: 'Advanced AI system jo data trees aur spatial network graphs se har minute sensor anomalies ko dhoondhta hai.',
      detail: 'Isolation Forest akele ajeeb readings ko turant isolate kar leta hai, aur Graph Neural Network (GNN) saare 34 stations ke aapsi rishte ko graph bana kar check karta hai ki kya aaspas ke stations bhi same weather dekh rahe hain ya akela yehi station galat bol raha hai.',
      analogy: 'Jaise 34 dost milkar kisi ek ke jhooth ko aapas mein verify karke pakad lein.',
      impact: '5 millisecond se kam time mein 100% accurate anomaly detection provide karta hai.',
    },
    hi: {
      summary: 'उन्नत मशीन लर्निंग आर्किटेक्चर जो ट्री-आधारित विभाजन और स्थानिक ग्राफ नेटवर्क द्वारा विसंगतियों की पहचान करता है।',
      detail: 'आइसोलेशन फॉरेस्ट विसंगतियों को तेजी से अलग करता है, जबकि ग्राफ न्यूरल नेटवर्क (GNN) सभी 34 स्टेशनों के भौगोलिक संबंधों का 3D ग्राफ बनाकर यह सुनिश्चित करता है कि डेटा विश्वसनीय है।',
      analogy: 'जैसे 34 सुरक्षा गार्ड मिलकर किसी भी संदिग्ध गतिविधि की तुरंत पुष्टि करते हैं।',
      impact: '5 मिलीसेकंड से कम समय में 99.4% सटीकता के साथ सेंसर दोषों की पहचान करता है।',
    },
    relatedQuestions: [
      'How does Isolation Forest isolate outliers?',
      'What is Edge Weight in the Synoptic Graph Network?',
      'What is Model Inference Latency?',
    ],
  },
  {
    term: 'SHAP (SHapley Additive exPlanations) & Feature Attribution',
    category: 'AI & Explainability',
    synonyms: ['shap', 'shapley', 'feature attribution', 'explainability', 'feature importance', 'why anomaly'],
    en: {
      summary: 'Game-theoretic mathematical framework that calculates the exact contribution of each atmospheric variable to an anomaly score.',
      detail: 'Based on Lloyd Shapley’s Nobel-prize winning cooperative game theory, SHAP decomposes the AI model’s anomaly score into additive contributions (e.g. +0.42 from Temperature, +0.31 from Humidity, -0.05 from Pressure). This tells scientists and operators *why* the AI flagged a specific event.',
      analogy: 'Like a football post-match analysis showing exactly how many points each individual player contributed to the final score.',
      impact: 'Provides total transparency, transforming "black box" neural nets into explainable, auditable scientific intelligence.',
    },
    hinglish: {
      summary: 'Game theory ka mathematical formula jo batata hai ki AI ne is reading ko anomaly kyu bola aur kis parameter ki wajah se bola.',
      detail: 'SHAP values har variable (temperature, humidity, wind, pressure) ka exact score nikaalti hain. For example: SHAP batayega ki 70% fault temperature ke achanak badhne se tha aur 30% humidity mismatch se.',
      analogy: 'Jaise cricket match haarne ke baad scorecard bataye ki kis bowler ne sabse zyada run diye.',
      impact: 'Scientists ko pata chal jata hai ki AI ne kaun sa rule break hote dekh kar alert bajaya.',
    },
    hi: {
      summary: 'गेम-थ्योरी पर आधारित व्याख्यात्मक तकनीक (SHAP) जो दर्शाती है कि विसंगति स्कोर में प्रत्येक मौसम पैरामीटर का कितना योगदान है।',
      detail: 'SHAP मान मॉडल के निर्णय को पारदर्शी बनाते हैं। यह स्पष्ट करता है कि तापमान, दबाव या आर्द्रता में से किस कारक ने AI को अलर्ट जारी करने के लिए प्रेरित किया।',
      analogy: 'जैसे किसी परीक्षा परिणाम में विषयवार अंकों का विस्तृत विश्लेषण।',
      impact: 'AI मॉडल को पूरी तरह पारदर्शी और वैज्ञानिक रूप से सत्यापन योग्य बनाता है।',
    },
    relatedQuestions: [
      'How are SHAP values calculated for Isolation Forests?',
      'What is the difference between global and local feature importance?',
      'How to view SHAP plots in Explainability Viewer?',
    ],
  },
  {
    term: 'Spatial Consensus Imputation',
    category: 'AI & Neural Algorithms',
    synonyms: ['imputation', 'spatial consensus', 'triangulation', 'k-nearest', 'flag 4', 'reconstruction'],
    en: {
      summary: 'A spatio-temporal machine learning algorithm that synthesizes missing or corrupted weather data from nearby stations.',
      detail: 'When a station experiences sensor failure (Flag 2), SkyGuard AI queries the 3 nearest physical synoptic stations within the geographic grid. Using Inverse Distance Weighting (IDW) combined with elevation gradients and a Graph Neural Network (GNN), it reconstructs the true atmospheric value with >99.2% accuracy, marking it as WMO Flag 4.',
      analogy: 'If your watch breaks, asking your 3 closest friends what time it is and averaging their answers with distance weighting.',
      impact: 'Maintains zero missing data gaps in continuous climate records and numerical models.',
    },
    hinglish: {
      summary: 'Agar koi sensor kharab ho jaye, toh paas ke 3 stations se AI ke zariye accurate reading calculate karna.',
      detail: 'Jab kisi station par koi sensor fail hota hai, toh system aaspas ke 3 nearest synoptic stations ka data uthata hai. Distance aur altitude ko dhyan mein rakh kar ek Graph Neural Network us jagah ki real reading estimate karta hai aur WMO Flag 4 mark karta hai.',
      analogy: 'Jaise aapki ghadi ruk jaye toh aap aaspas ke 3 doston ki ghadi dekh kar exact time pata kar lete hain.',
      impact: 'Weather data mein koi bhi gap nahi rehta aur forecasting continuous chalti rehti hai.',
    },
    hi: {
      summary: 'एक स्थानिक-कालिक AI तकनीक जो खराब सेंसर के स्थान पर निकटवर्ती 3 स्टेशनों के आधार पर शुद्ध डेटा उत्पन्न करती है।',
      detail: 'जब कोई मौसम सेंसर खराब होता है, तो एरोशील्ड AI ग्रिड के 3 सबसे नजदीकी स्टेशनों के डेटा को दूरी और ऊंचाई के आधार पर विश्लेषित करता है। यह 99.2% सटीकता के साथ लापता डेटा की भरपाई करता है (WMO फ्लैग 4)।',
      analogy: 'यदि आपकी घड़ी बंद हो जाए, तो पास खड़े तीन मित्रों की घड़ियों का औसत देखकर सही समय का अनुमान लगाना।',
      impact: 'मौसम विज्ञानियों को बिना किसी रुकावट के लगातार 24x7 सटीक डेटा मिलता रहता है।',
    },
    relatedQuestions: [
      'What is WMO QC Flag 4?',
      'What happens during extreme local microclimate events?',
      'How are the 3 nearest neighbor stations selected?',
    ],
  },

  // ─── 4. STANDARDS & SYSTEM OPERATIONS ────────────────────────────────
  {
    term: 'WMO-No. 8 Quality Control Flags',
    category: 'Data Standards',
    synonyms: ['wmo flags', 'qc flag', 'flag 0', 'flag 1', 'flag 2', 'flag 4', 'wmo-no. 8'],
    en: {
      summary: 'International WMO standard codes (0, 1, 2, 4) indicating the physical validity and reliability of weather data.',
      detail: 'WMO-No. 8 Annex 1A standardizes observation confidence: \n• **Flag 0 (Nominal/Passed)**: Data verified correct.\n• **Flag 1 (Suspect/Warning)**: Marginal deviation or statistical anomaly.\n• **Flag 2 (Erroneous/Rejected)**: Physically impossible or hardware fault.\n• **Flag 4 (Imputed/Synthetic)**: Missing/corrupted data reconstructed via neural consensus.',
      analogy: 'Like traffic signals for data: Green (Flag 0), Yellow (Flag 1), Red (Flag 2), and Blue GPS re-routing (Flag 4).',
      impact: 'Ensures downstream weather models never ingest contaminated or corrupted sensor inputs.',
    },
    hinglish: {
      summary: 'International weather data quality codes jo batate hain ki sensor reading sahi hai, shaqi hai ya kharab hai.',
      detail: 'WMO-No. 8 guidelines 4 main flags define karti hain:\n• **Flag 0 (Green/Good)**: Data bilkul sahi hai.\n• **Flag 1 (Yellow/Suspect)**: Thoda ajeeb reading, check karne ki zaroorat hai.\n• **Flag 2 (Red/Rejected)**: Sensor fail ho chuka hai, reading galat hai.\n• **Flag 4 (Blue/Imputed)**: AI ne paas ke 3 stations se accurate estimate banaya hai.',
      analogy: 'Traffic light jaisa: Green (Clean Data), Yellow (Warning), Red (Reject), aur Blue (AI Replacement).',
      impact: 'Weather forecasters ko galat readings se hone wale nuksan se bachata hai.',
    },
    hi: {
      summary: 'अंतर्राष्ट्रीय WMO गुणवत्ता नियंत्रण कोड (0, 1, 2, 4) जो बताते हैं कि मौसम डेटा कितना विश्वसनीय और मान्य है।',
      detail: 'WMO-No. 8 मानक 4 स्तर तय करता है:\n• **ध्वज 0 (उत्कृष्ट/सत्यापित)**: डेटा पूरी तरह सटीक है।\n• **ध्वज 1 (संदेहास्पद/चेतावनी)**: मामूली विचलन या सीमांत विसंगति।\n• **ध्वज 2 (त्रुटिपूर्ण/अस्वीकृत)**: सेंसर विफलता या असंभव रीडिंग।\n• **ध्वज 4 (कृत्रिम/पुनर्निर्मित)**: AI द्वारा निकटतम स्टेशनों से आकलित डेटा।',
      analogy: 'डेटा की ट्रैफिक लाइट: हरी (मान्य), पीली (सावधानी), लाल (अमान्य), और नीली (AI सहायता)।',
      impact: 'मौसम वैज्ञानिकों और विमानन सेवाओं को केवल शुद्ध और सत्यापित डेटा प्रदान करता है।',
    },
    relatedQuestions: [
      'What is Spatial Consensus Imputation?',
      'Why is Flag 2 automatically rejected?',
      'How does the system calculate Anomaly Health Score?',
    ],
  },
  {
    term: 'Synoptic Station / Synoptic Grid',
    category: 'Network Architecture',
    synonyms: ['synoptic', 'station', 'grid', 'nodes', 'wmo grid', '34 stations', '34 nodes'],
    en: {
      summary: 'A standardized weather monitoring station reporting simultaneous global observations at standardized synoptic hours.',
      detail: 'Under World Meteorological Organization (WMO) standards, synoptic stations record atmospheric pressure, temperature, humidity, wind vectors, solar irradiance, and precipitation exactly at coordinated universal times (00:00, 06:00, 12:00, 18:00 UTC). This allows meteorologists worldwide to build synchronous weather forecasting models across all 34 stations.',
      analogy: 'Think of 34 synchronized cameras taking a snapshot of the atmosphere at the exact same millisecond.',
      impact: 'Forms the backbone of regional numerical weather prediction and real-time extreme event early warnings.',
    },
    hinglish: {
      summary: 'WMO standard par based automated weather stations ka network jo exact same second par data record karta hai.',
      detail: 'Synoptic stations poore state ya country mein fixed locations par lage hote hain. Yeh stations temperature, pressure, humidity, wind speed aur solar radiation ko standard time (UTC/Zulu) par ek saath measure karte hain taaki weather forecasting 100% accurate ho sake.',
      analogy: 'Jaise cricket ground ke har angle par lage cameras ek saath ball ki trajectory track karte hain.',
      impact: 'Isse cyclone, heatwave, aur sudden storms ka pehle se pata chal jata hai.',
    },
    hi: {
      summary: 'विश्व मौसम विज्ञान संगठन (WMO) के मानकों पर आधारित मौसम वेधशालाओं का नेटवर्क जो निश्चित समय पर एक साथ आंकड़े दर्ज करता है।',
      detail: 'सिनॉप्टिक स्टेशन वायुमंडलीय दबाव, तापमान, आर्द्रता, हवा की गति और वर्षा को समकालिक समय (UTC/Zulu) पर रिकॉर्ड करते हैं। यह पूरे क्षेत्र के मौसम का 3D चित्र तैयार करने में मदद करता है।',
      analogy: 'जैसे किसी स्टेडियम के चारों तरफ लगे कैमरे एक ही पल में मैच का हर कोण कैद करते हैं।',
      impact: 'यह सटीक मौसम पूर्वानुमान और चक्रवात/तूफान की पूर्व चेतावनी का मुख्य आधार है।',
    },
    relatedQuestions: [
      'What is Zulu Time (UTC)?',
      'How many stations are in our Synoptic Array?',
      'What sensors are installed on a synoptic tower?',
    ],
  },
  {
    term: 'Dew Point Depression & Thermodynamic Laws',
    category: 'Atmospheric Physics',
    synonyms: ['dew point', 'dewpoint', 'dew point depression', 'tdew', 'thermodynamic', 'relative humidity', 'rh'],
    en: {
      summary: 'The mathematical difference between ambient temperature and the temperature at which air reaches water saturation.',
      detail: 'Dew Point (Tdew) is the temperature to which air must be cooled at constant pressure to become saturated with water vapor (100% RH). Calculated via the Lawrence equation: \n$$T_{\\text{dew}} \\approx T - \\frac{100 - \\text{RH}}{5}$$\nWhen Dew Point Depression ($T - T_{\\text{dew}}$) approaches 0, fog, condensation, and clouds form.',
      analogy: 'The temperature at which your cold soda can starts sweating in humid summer air.',
      impact: 'Used in aviation safety, fog forecasting, and detecting hygrometer sensor drift.',
    },
    hinglish: {
      summary: 'Hawa ke temperature aur us point ke beech ka farq jahan hawa mein nami paani ki boondon (dew/fog) mein badal jati hai.',
      detail: 'Dew Point wo temperature hota hai jahan hawa 100% saturated ho jati hai. Formula: T_dew = T - (100 - RH) / 5. Jab ambient temperature aur dew point barabar ho jate hain, toh kohra (fog) ya baarish banna shuru hoti hai.',
      analogy: 'Jaise fridge se nikli thandi paani ki botal ke bahar paani ki boondein jamne lagti hain.',
      impact: 'Hawai jahaz (aviation) ki safety aur kohre ki prediction ke liye critical hai.',
    },
    hi: {
      summary: 'परिवेशी तापमान और ओस बिंदु (जिस तापमान पर हवा में मौजूद वाष्प पानी की बूंदों में बदल जाती है) का अंतर।',
      detail: 'ओस बिंदु (Dew Point) वह तापमान है जिस पर हवा जलवाष्प से 100% संतृप्त हो जाती है। जब हवा का तापमान ओस बिंदु तक गिरता है, तो कोहरा या ओस बनती है। सूत्र: T_dew = T - (100 - RH) / 5।',
      analogy: 'जैसे गर्मियों में ठंडे पानी के गिलास की बाहरी सतह पर पानी की बूंदें जमने लगती हैं।',
      impact: 'हवाई उड़ानों की सुरक्षा, दृश्यता और कोहरे के सटीक पूर्वानुमान के लिए अत्यंत महत्वपूर्ण।',
    },
    relatedQuestions: [
      'What happens when Relative Humidity reaches 100%?',
      'Why is Dew Point higher in monsoon seasons?',
      'How does Multivariate Inconsistency relate to Dew Point?',
    ],
  },
  {
    term: 'Zulu Time (UTC)',
    category: 'System & Standards',
    synonyms: ['zulu', 'utc', 'gmt', 'coordinated universal time', 'zulu clock', 'zulu time'],
    en: {
      summary: 'The universal military and meteorological reference time (UTC+0) used to synchronize global weather grids.',
      detail: 'In the aviation and meteorological alphabet, "Z" stands for Zero Meridian (Greenwich). Synoptic observations across India (IST = UTC+5:30), Europe, and the Americas are all tagged in Zulu time so that atmospheric physical models run on a single, synchronized global timeline without timezone confusion.',
      analogy: 'A single master clock that everyone on Earth agrees to look at simultaneously for scientific operations.',
      impact: 'Prevents timezone misalignment in numerical weather models and flight navigation.',
    },
    hinglish: {
      summary: 'Universal standard time (UTC+0) jo poori duniya ke weather stations aur aviation ke liye use hota hai.',
      detail: 'Weather forecasting mein time zones ka confusion na ho, isliye poori duniya Zulu Time (UTC) follow karti hai. India ka time (IST) Zulu time se 5 ghante 30 minute aage (UTC+5:30) hota hai.',
      analogy: 'Jaise poore vishwa ke vaigyanik ek hi common stopwatch dekh kar kaam karte hain.',
      impact: 'International flights aur cyclone tracking mein zero timing error rehta hai.',
    },
    hi: {
      summary: 'सार्वभौमिक संदर्भ समय (UTC+0), जिसे मौसम विज्ञान और विमानन में वैश्विक तालमेल के लिए उपयोग किया जाता है।',
      detail: 'विमानन और मौसम विज्ञान में "Z" का अर्थ ज़ीरो मेरिडियन (ग्रीनविच) है। भारत (IST = UTC+5:30) सहित दुनिया भर के सभी मौसम स्टेशन ज़ूलू समय पर अपने आंकड़े साझा करते हैं ताकि टाइमज़ोन का कोई भ्रम न रहे।',
      analogy: 'पूरी दुनिया के वैज्ञानिकों द्वारा उपयोग की जाने वाली एक साझा वैश्विक मास्टर घड़ी।',
      impact: 'तूफान, बादलों की गति और अंतरराष्ट्रीय उड़ानों के समन्वय में समय की अचूक सटीकता।',
    },
    relatedQuestions: [
      'How to convert Zulu Time to Indian Standard Time (IST)?',
      'Why does the globe display Zulu time at the top?',
      'What are the standard Synoptic reporting hours?',
    ],
  },
  {
    term: 'Perspective Roles (Operator, Scientist, Tech, Public)',
    category: 'System Architecture',
    synonyms: ['perspective', 'roles', 'operator', 'scientist', 'tech', 'public', 'persona'],
    en: {
      summary: 'Role-adaptive operational lenses tailored for mission controllers, meteorologists, hardware technicians, and citizens.',
      detail: 'SkyGuard AI adjusts data density and telemetry controls based on role: \n• **Operator**: Fast mission-control triage, alert broadcast, and fleet health.\n• **Scientist**: Thermodynamic equations, dew point depression, and multi-model neural confidence scores.\n• **Technician**: Micro-electrical diagnostics, sensor resistance (Ω), excitation voltage, and Field Work Order dispatch.\n• **Public**: Plain-language weather comfort index, UV safety advice, and air quality summaries.',
      analogy: 'Like switching lens on a microscope to view macro-level actions vs. micro-level atoms.',
      impact: 'Eliminates cognitive overload by giving every stakeholder exactly what they need.',
    },
    hinglish: {
      summary: 'Alag-alag users ke hisaab se customized view (Operator, Vaigyanik, Technician aur Aam Janta).',
      detail: 'SkyGuard AI har user ke role ke anusar screen par zaruri information dikhata hai:\n• **Operator**: Quick emergency alerts aur station triage ke liye.\n• **Scientist**: Physics formulas, dew point aur deep research ke liye.\n• **Technician**: Wiring voltage, sensor resistance aur repair work orders ke liye.\n• **Public**: Asaan bhasha mein mausam ka haal aur safety tips.',
      analogy: 'Jaise car mein driver ke liye steering, mechanic ke liye engine tools, aur passenger ke liye comfortable seat hoti hai.',
      impact: 'Har kisi ko bina kisi confusion ke apna kaam karne mein aasani hoti hai.',
    },
    hi: {
      summary: 'उपयोगकर्ता की भूमिका के अनुसार अनुकूलित डैशबोर्ड (ऑपरेटर, वैज्ञानिक, तकनीशियन और आम नागरिक)।',
      detail: 'सिस्टम उपयोगकर्ता की आवश्यकता के अनुसार उपयुक्त जानकारी प्रदर्शित करता है:\n• **ऑपरेटर**: आपातकालीन चेतावनी और नेटवर्क नियंत्रण।\n• **वैज्ञानिक**: भौतिक समीकरण, ऊष्मागतिकी और तंत्रिका मॉडल विश्लेषण।\n• **तकनीशियन**: हार्डवेयर वोल्टेज, सेंसर प्रतिरोध और फील्ड वर्क आर्डर।\n• **नागरिक**: सरल भाषा में मौसम का हाल और स्वास्थ्य सुरक्षा सुझाव।',
      analogy: 'जैसे एक ही हवाई जहाज में पायलट के पास कंट्रोल पैनल, इंजीनियर के पास इंजन टूल्स और यात्री के पास आरामदायक स्क्रीन होती है।',
      impact: 'सभी उपयोगकर्ताओं को बिना किसी तकनीकी जटिलता के उनकी जरूरत का डेटा मिलता है।',
    },
    relatedQuestions: [
      'How do I switch my Role Perspective?',
      'What diagnostic tools are visible in Technician mode?',
      'What is the Public Weather Comfort Index?',
    ],
  },
  {
    term: 'Field Calibration Work Orders (WMO-WO)',
    category: 'Maintenance & Operations',
    synonyms: ['work order', 'dispatch', 'calibration', 'wo-wmo', 'service unit', 'field technician', 'technician dispatch'],
    en: {
      summary: 'Official WMO-compliant field maintenance work orders dispatched to repair, clean, or recalibrate hardware.',
      detail: 'When an anomaly cannot be resolved remotely (e.g. physical sensor drift or short circuit), the system generates a unique Work Order (e.g. `WO-WMO-4029`). It assigns Priority levels (P1 Emergency to P3 Routine), tracks live lifecycle states (DISPATCHED → IN_TRANSIT → ON_SITE → CALIBRATING → RESOLVED), and generates printable WMO-No. 8 calibration certificates.',
      analogy: 'Like an official dispatch order sent to an automotive pit crew to replace worn tires.',
      impact: 'Maintains an auditable trail of hardware maintenance and guarantees sensor compliance with global meteorological standards.',
    },
    hinglish: {
      summary: 'Field technicians ke liye official repair ticket jo sensor ki physical calibration aur service track karti hai.',
      detail: 'Jab koi sensor remote se theek na ho sake, toh system ek Work Order banata hai. Isme priority (P1 Urgent se P3 Regular), technician team assignment, aur WMO calibration certificate generate hota hai.',
      analogy: 'Jaise gaadi ki service booking ticket jismein mechanic har part check karke tick karta hai.',
      impact: 'Har sensor ki service history maintain rehti hai aur station hamesha 100% fit rehta hai.',
    },
    hi: {
      summary: 'फील्ड तकनीशियनों के लिए आधिकारिक अंशांकन और मरम्मत कार्य आदेश (Work Order)।',
      detail: 'जब किसी सेंसर को मौके पर जाकर ठीक करने की आवश्यकता होती है, तो सिस्टम `WO-WMO` कार्य आदेश जारी करता है। इसमें प्राथमिकता स्तर (P1 से P3), तकनीशियन आवंटन और WMO-No. 8 अंशांकन प्रमाणपत्र शामिल होता है।',
      analogy: 'जैसे किसी उपकरण की आधिकारिक सर्विस रसीद और रखरखाव लॉग।',
      impact: 'सेंसर के रखरखाव का पूर्ण ऑडिट रिकॉर्ड बनाए रखता है और डेटा की विश्वसनीयता सुनिश्चित करता है।',
    },
    relatedQuestions: [
      'How to create a new Field Work Order?',
      'What are P1 Emergency dispatch criteria?',
      'How to download a WMO Calibration Certificate?',
    ],
  },
  {
    term: 'Time Machine & Historical Playback',
    category: 'Data Exploration',
    synonyms: ['time machine', 'playback', 'historical', 'scrubber', '24h', '7d', '30d', 'time-series'],
    en: {
      summary: 'A time-series replay engine that allows operators and scientists to scrub backward across 30 days of synoptic telemetry.',
      detail: 'The Data Explorer time-machine streams continuous hourly observations and multi-tier anomaly events across all 34 synoptic stations. Users can select 24-hour, 7-day, 30-day, or custom windows to analyze pre-storm build-ups, heatwaves, or sensor degradation progressions.',
      analogy: 'Like rewinding a live sports match with a high-definition DVR scrubber.',
      impact: 'Essential for post-event root cause analysis (RCA) and training predictive neural networks.',
    },
    hinglish: {
      summary: 'Pichle 30 din ke weather data ko video ki tarah rewind karke dekhne wala tool.',
      detail: 'Is tool se aap 24 ghante, 7 din ya 30 din purana mausam aur aayi hui saari anomalies ko step-by-step scrub karke check kar sakte hain ki kab kounsa sensor kharab hua tha.',
      analogy: 'Jaise YouTube par video ko peeche le ja kar slow-motion mein dekhna.',
      impact: 'Toofan aur sensor failure ke piche ke kaaran samajhne mein madad karta hai.',
    },
    hi: {
      summary: 'एक ऐतिहासिक रीप्ले टूल जिसके द्वारा पिछले 30 दिनों के मौसम डेटा और विसंगतियों को समय पर पीछे जाकर देखा जा सकता है।',
      detail: 'डेटा एक्सप्लोरर के टाइम-मशीन फीचर से आप 24 घंटे, 7 दिन या 30 दिन की समय-सीमा चुनकर किसी भी स्टेशन के पिछले मौसम और सेंसर त्रुटियों का गहन विश्लेषण कर सकते हैं।',
      analogy: 'जैसे किसी सीसीटीवी फुटेज को पीछे करके किसी घटना की बारीकी से जांच करना।',
      impact: 'मौसम की पिछली घटनाओं और सेंसर की विफलता के मूल कारणों (RCA) का विश्लेषण करने के लिए अत्यंत उपयोगी।',
    },
    relatedQuestions: [
      'How to select 30-day query window in Data Explorer?',
      'How to export historical telemetry to CSV/JSON?',
      'What is Rolling Average smoothing in time-series?',
    ],
  },
  {
    term: 'Synthetic Fault Injection Lab',
    category: 'Testing & Validation',
    synonyms: ['fault injection', 'lab', 'injector', 'synthetic fault', 'stress test', 'chaos testing'],
    en: {
      summary: 'A controlled meteorological sandbox to inject synthetic sensor failures and benchmark AI detection pipelines.',
      detail: 'The Anomaly Injector allows engineers to inject controlled spikes, flatlines, multivariate drifts, and noise bursts into live station telemetry streams. This benchmarks model sensitivity, false positive rates, and latency under stress.',
      analogy: 'A flight simulator testing a pilot’s reaction to sudden engine turbulence.',
      impact: 'Validates automated triage algorithms before deployment into mission-critical synoptic networks.',
    },
    hinglish: {
      summary: 'AI model ko test karne ke liye janbujhkar nakli sensor faults generate karne wali lab.',
      detail: 'Is lab mein engineers live station par nakli spikes, sensor freeze ya drift inject karte hain taaki dekh sakein ki AI system kitni jaldi aur kitni accuracy ke saath use pakad pata hai.',
      analogy: 'Jaise fire drill mein nakli aag ka alarm baja kar rescue team ki taiyari check ki jati hai.',
      impact: 'Real disaster aane se pehle hi system ki 100% reliability confirm ho jati hai.',
    },
    hi: {
      summary: 'कृत्रिम रूप से सेंसर में दोष (Fault) उत्पन्न करके AI मॉडल की कार्यक्षमता और सटीकता का परीक्षण करने वाली लैब।',
      detail: 'एनोमली इंजेक्टर इंजीनियरों को लाइव डेटा स्ट्रीम में नियंत्रित स्पाइक, फ्लैटलाइन और ड्रिफ्ट जोड़ने की सुविधा देता है, जिससे AI की पहचान गति और विश्वसनीयता का परीक्षण किया जा सके।',
      analogy: 'जैसे पायलटों के प्रशिक्षण के लिए फ्लाइट सिम्युलेटर में आपातकालीन स्थितियों का अभ्यास कराना।',
      impact: 'वास्तविक मौसम आपदाओं से पहले AI एल्गोरिदम की अचूक कार्यप्रणाली सुनिश्चित करता है।',
    },
    relatedQuestions: [
      'How to inject a Gaussian Noise Burst?',
      'What is False Discovery Rate (FDR) in QC benchmarks?',
      'How to simulate Multi-Station Correlated Outages?',
    ],
  },
  {
    term: 'Anomaly Health Score (%)',
    category: 'System Health',
    synonyms: ['health score', 'station health', 'soh', 'state of health', 'nominal 98%'],
    en: {
      summary: 'A normalized composite metric (0 - 100%) evaluating the physical integrity and reliability of a synoptic station.',
      detail: 'Calculated using a decaying exponential penalty based on active anomaly severity, persistent sensor drift, excitation voltage fluctuations, and missing packet counts: \n• **90% - 100%**: Nominal / Optimal\n• **70% - 89%**: Warning / Marginal\n• **< 70%**: Critical / Service Required',
      analogy: 'Like a smartphone battery health percentage or a human health checkup score.',
      impact: 'Instantly highlights at-risk synoptic stations on the 3D globe and station selector dropdown.',
    },
    hinglish: {
      summary: 'Har station ka fitness score (0 se 100%) jo batata hai ki station kitna healthy aur reliable hai.',
      detail: 'Agar kisi station par koi anomaly na ho aur voltage stable ho, toh score 98-100% (Nominal) rehta hai. Agar sensor kharab ho ya readings drop hon, toh score gir kar Warning ya Critical ho jata hai.',
      analogy: 'Jaise mobile ki battery health 100% se gir kar 80% ho jaye.',
      impact: 'Operators ko ek nazar mein pata chal jata hai ki kounsa station bilkul theek chal raha hai.',
    },
    hi: {
      summary: 'प्रत्येक वेधशाला का समग्र स्वास्थ्य सूचकांक (0 से 100%), जो स्टेशन के सभी सेंसरों की कार्यक्षमता दर्शाता है।',
      detail: 'यह स्कोर सक्रिय त्रुटियों, वोल्टेज स्थिरता और डेटा पैकेट के आधार पर तय होता है। 90% से ऊपर का स्कोर सामान्य (Nominal) और 70% से नीचे का स्कोर तत्काल मरम्मत (Critical) का संकेत है।',
      analogy: 'जैसे मानव शरीर का स्वास्थ्य रिपोर्ट कार्ड।',
      impact: 'ऑपरेटरों को ग्रिड के सबसे कमजोर स्टेशनों की तुरंत पहचान करने में मदद करता है।',
    },
    relatedQuestions: [
      'How is the Station Health Score weighted?',
      'What causes a health score to drop below 70%?',
      'How does field recalibration restore the health score?',
    ],
  },
  {
    term: '3D Digital Twin & GIS Observation Matrix',
    category: 'GIS & Spatial Telemetry',
    synonyms: ['3d digital twin', 'digital twin', 'synoptic gis', 'observation matrix', '3d globe', '3d view', 'twin'],
    en: {
      summary: 'A real-time 3D interactive virtual replica of the Earth atmosphere and 34 synoptic weather stations.',
      detail: 'The 3D Digital Twin combines high-resolution satellite topography with live telemetry streams from 34 synoptic automatic weather stations (AWS). It renders spatial correlation arcs, real-time QC flags (Green, Amber, Red, Cyan), and elevation profiles to monitor cross-station atmospheric dynamics simultaneously.',
      analogy: 'Like an interactive holographic globe of Earth displaying live weather pulses and sensor health in real time.',
      impact: 'Enables mission controllers to visualize regional weather patterns and spatial sensor drift across three-dimensional geographical coordinates.',
    },
    hinglish: {
      summary: 'Earth aur 34 weather stations ka real-time 3D digital model jo live mausam aur sensors ki health dikhata hai.',
      detail: 'Yeh 3D Digital Twin 34 automatic weather stations ka data satellite map par live render karta hai. Isme stations ke aapsi rishte (spatial correlation arcs) aur sensor QC status (Green/Amber/Red) ek nazar mein 3D globe par dekhe ja sakte hain.',
      analogy: 'Jaise ek 3D digital globe jisme har shehar ka live weather aur sensor ki status light jal rahi ho.',
      impact: 'Operators ko poore region ka mausam aur sensor faults ek hi screen par samajhne mein madad karta hai.',
    },
    hi: {
      summary: 'पृथ्वी के वायुमंडल और 34 सिनॉप्टिक मौसम स्टेशनों का वास्तविक समय (Real-Time) 3D डिजिटल मॉडल।',
      detail: '3D डिजिटल ट्विन उपग्रह मानचित्र पर 34 स्वचालित मौसम वेधशालाओं के लाइव डेटा को 3D ग्लोब पर प्रदर्शित करता है। यह स्थानिक सहसंबंध रेखाओं (Spatial Arcs) और गुणवत्ता नियंत्रण कोड (QC Flags) द्वारा मौसम की गतिशीलता का सटीक दृश्य प्रस्तुत करता है।',
      analogy: 'जैसे एक घूमता हुआ 3D जादुई ग्लोब जिस पर सभी मौसम स्टेशनों की लाइव स्थिति चमक रही हो।',
      impact: 'मौसम विज्ञानियों और ऑपरेटरों को भौगोलिक परिप्रेक्ष्य में सेंसर विसंगतियों का तुरंत विश्लेषण करने में सक्षम बनाता है।',
    },
    relatedQuestions: [
      'What do the colored arcs between stations on the 3D globe represent?',
      'How to toggle between Satellite (SAT) and Map (MAP) textures?',
      'What does Zulu Time above the globe indicate?',
    ],
  },
  // ─── 7. DASHBOARD METRICS, TIMESTAMPS & OPERATIONAL TELEMETRY ────────
  {
    term: 'Synchronized Synoptic Calendar & Live Timestamp',
    category: 'Temporal Synchronization',
    synonyms: [
      'september', 'october', 'november', 'december', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
      'date', 'month', 'day', 'friday', 'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday',
      '2026', 'live clock', '10:19 pm', '8:11 pm', '1:30 am', '1:19 am', 'am', 'pm', 'next synoptic frame', 'sync grid'
    ],
    en: {
      summary: 'Precision synchronized UTC/local clock coordinating simultaneous meteorological sampling across the 34 synoptic stations.',
      detail: 'Synoptic meteorology requires all observations worldwide to occur at standard synchronized timestamps (Zulu / UTC) and local operational time. The live calendar widget tracks real-time station chronometry and counts down to the next synoptic hourly frame (e.g. 00:00, 06:00, 12:00, 18:00 UTC) when full atmospheric vectors are computed.',
      analogy: 'Like an orchestra conductor’s atomic metronome ensuring all 34 musicians play their instruments on the exact same beat.',
      impact: 'Prevents temporal skew in spatial correlation algorithms and aligns our data with WMO Global Telecommunication System (GTS) grids.',
    },
    hinglish: {
      summary: 'Precision live clock aur calendar jo saare 34 weather stations ko exact ek hi second par synchronize rakhta hai.',
      detail: 'Mausam ki forecasting ke liye zaroori hai ki sabhi stations ek hi samay (Zulu/UTC aur Local Time) par data record karein. Yeh calendar aur live clock widget countdown dikhata hai ki agla synoptic observation frame kab generate hoga.',
      analogy: 'Jaise train time table ka atomic clock jo poore desh ke railway stations ko ek hi second par sync rakhta hai.',
      impact: 'Time mismatch ko rokta hai taaki AI graph neural networks bina kisi delay ke live storm tracks calculate kar sakein.',
    },
    hi: {
      summary: 'परिशुद्ध वैश्विक समय (UTC/Zulu) और स्थानीय कैलेंडर प्रणाली जो सभी 34 स्टेशनों को एक ही पल में समकालिक रखती है।',
      detail: 'मौसम विज्ञान में वैश्विक मानकों (WMO) के अनुसार सभी आंकड़े एक ही सेकंड पर दर्ज होना अनिवार्य है। यह लाइव क्लॉक और कैलेंडर विजेट अगले सिनॉप्टिक अवलोकन चक्र की सटीक गणना करता है।',
      analogy: 'जैसे किसी उपग्रह प्रक्षेपण का सटीक काउंटडाउन टाइमर जो हर सिस्टम को तालमेल में रखता है।',
      impact: 'स्थानिक सहसंबंध विश्लेषण में समय अंतराल (Time Skew) की त्रुटियों को पूरी तरह समाप्त करता है।',
    },
    relatedQuestions: [
      'What is the difference between Local Time and Zulu (UTC) Time?',
      'Why are synoptic observations taken on fixed hourly frames?',
      'How does timestamp synchronization prevent spatial AI errors?',
    ],
  },
  {
    term: 'P95 Neural Attribution Latency & Vector Pipeline',
    category: 'AI Pipeline & Performance',
    synonyms: [
      'p95', 'p99', 'p90', 'latency', 'neural attribution latency', '22.3ns', '11.2ns', '12.8ms', '19.0ms', 'vector pipeline',
      'p95: 36ms', 'ns', 'nanosecond', 'ms', 'millisecond'
    ],
    en: {
      summary: 'Statistical benchmark measuring real-time inference latency of the neural anomaly attribution engine.',
      detail: 'In high-throughput mission telemetry, "P95" means 95% of all incoming 18,000+ hourly sensor vectors are analyzed, validated, and SHAP-attributed within this time window (sub-36ms). Nanosecond (ns) hardware latency indicates ultra-fast L1 cache vector tensor processing inside the spatial consensus engine.',
      analogy: 'Like a high-speed airport express security line where 95 out of 100 passengers pass through in under 20 seconds.',
      impact: 'Guarantees sub-second real-time alerting for extreme weather anomalies and zero pipeline backpressure.',
    },
    hinglish: {
      summary: 'AI model ki speed test metric jo batati hai ki 95% sensor readings kitni tezi se analyze hoti hain.',
      detail: 'P95 latency ka matlab hai ki 95% mausam ka data 36 millisecond se bhi kam time mein verify aur clean ho jata hai. Nanosecond (ns) aur millisecond (ms) speed se AI spatial consensus run karke turant faults detect karta hai.',
      analogy: 'Jaise UPI payment ka 1 second mein verify ho jana.',
      impact: 'Real-time live monitoring mein bina kisi lag ke turant alert milte hain.',
    },
    hi: {
      summary: 'कृत्रिम बुद्धिमत्ता (AI) की गति और कार्यक्षमता का सांख्यिकीय सूचकांक (P95 लैटेंसी)।',
      detail: 'P95 का अर्थ है कि 95% मौसम आंकड़े 36 मिलीसेकंड से भी कम समय में पूरी तरह सत्यापित और विश्लेषित हो जाते हैं। नैनोसेकंड (ns) गति यह दर्शाती है कि सिस्टम बिना किसी रुकावट के लगातार काम कर रहा है।',
      analogy: 'जैसे एक्सप्रेसवे पर 95% गाड़ियाँ बिना रुके टोल पार कर जाती हैं।',
      impact: 'गंभीर तूफानी घटनाओं के दौरान तत्काल चेतावनी (Zero Lag) सुनिश्चित करता है।',
    },
    relatedQuestions: [
      'What is P95 vs P99 Latency?',
      'How does SHAP attribution calculate feature importance in milliseconds?',
      'Why is low latency critical for synoptic early warnings?',
    ],
  },
  {
    term: 'Ingested Synoptic Frames & 1.5s Vector Stream',
    category: 'Data Pipeline',
    synonyms: [
      'ingested synoptic frames', '18.4k', 'synoptic frames', '1.5s vector stream', 'sync active', 'vector stream',
      'packets', 'core ingestion nominal', 'stream'
    ],
    en: {
      summary: 'Continuous real-time ingestion pipeline receiving and parsing high-frequency multi-sensor packets every 1.5 seconds.',
      detail: 'Represents the cumulative volume of synoptic data frames (e.g. 18.4k packets) streamed over WebSocket and MQTT protocols from all 34 Campbell CR1000X dataloggers. Each frame encapsulates temperature, pressure, humidity, solar, and wind vectors validated upon arrival.',
      analogy: 'Like a high-definition video stream where each second delivers continuous synchronized weather frames from across the continent.',
      impact: 'Maintains an uninterrupted real-time telemetry buffer for automated anomaly triage and instant dashboard rendering.',
    },
    hinglish: {
      summary: 'Continuous data stream jo har 1.5 second mein saare 34 stations se live weather packets receive karti hai.',
      detail: '18.4k Ingested Frames ka matlab hai ki system ne 18,400 se zyada complete sensor packets bina kisi data loss ke successfully process kar liye hain. Sync Active status batata hai ki server aur hardware ka connection live hai.',
      analogy: 'Jaise live cricket match ka 60fps video stream bina kisi buffering ke chal raha ho.',
      impact: 'Data loss zero rehta hai aur graphs par live readings continuous update hoti hain.',
    },
    hi: {
      summary: 'लगातार लाइव डेटा प्रवाह जो हर 1.5 सेकंड में सभी 34 स्टेशनों से मौसम के पैकेट्स ग्रहण करता है।',
      detail: '18.4k इनजेस्टेड फ्रेम्स यह दर्शाता है कि 18,400 से अधिक पूर्ण संवेदी डेटा पैकेट्स को बिना किसी हानि के सफलतापूर्वक संसाधित किया जा चुका है। सिंक एक्टिव (Sync Active) यह पुष्टि करता है कि सभी 34 वेधशालाएं लाइव जुड़ी हुई हैं।',
      analogy: 'जैसे बिना रुके बहने वाली डिजिटल सूचना की निरंतर नदी।',
      impact: 'सेंसर ग्रिड के किसी भी हिस्से में डेटा अंतराल (Data Gap) को रोकता है।',
    },
    relatedQuestions: [
      'What data is contained inside a single synoptic vector frame?',
      'How does WebSocket streaming maintain 1.5s refresh rate?',
      'What happens if a packet is dropped during network degradation?',
    ],
  },
  {
    term: 'Flagged Discrepancies (24h) & Multi-Tier QC',
    category: 'Quality Control',
    synonyms: [
      'flagged discrepancies', 'flagged discrepancies (24h)', 'triage active', 'multi-tier qc', 'discrepancies', 'triage'
    ],
    en: {
      summary: 'Cumulative total of raw sensor anomalies identified and isolated across the grid in the rolling 24-hour window.',
      detail: 'Out of millions of continuous data points, the Multi-Tier QC engine (Tier 1 Physical Range, Tier 2 Thermodynamic Inconsistency, Tier 3 Spatial Consensus GNN, Tier 4 Time-Series Drift) flags anomalies into triage for automated neural imputation (Flag 4) or field dispatch.',
      analogy: 'Like an automated postal sorting machine catching and fixing mislabeled mail packages before delivery.',
      impact: 'Guarantees that downstream meteorological consumers only ingest 100% verified, clean datasets.',
    },
    hinglish: {
      summary: 'Pichle 24 ghanton mein detect ki gayi saari sensor faults aur abnormal readings ka total count.',
      detail: 'Multi-Tier QC system 4 alag-alag layers mein check karta hai (Physical Limits, Thermodynamic Rules, AI Graph Consensus, aur Drift). Flagged Discrepancies batata hai ki kitne suspect points ko isolate kiya gaya.',
      analogy: 'Jaise quality control inspector kharab product ko pehle hi line se hata deta hai.',
      impact: 'Galat readings ko automatic replace karke clean data banata hai.',
    },
    hi: {
      summary: 'पिछले 24 घंटों में ग्रिड पर पाई गई कुल सेंसर त्रुटियों और विसंगतियों की संख्या।',
      detail: 'मल्टी-टियर क्यूसी इंजन 4 स्तरों (भौतिक सीमा, थर्मोडायनामिक नियम, AI ग्राफ सर्वसम्मति और सेंसर ड्रिफ्ट) पर डेटा की जांच करता है। चिन्हित विसंगतियों को तुरंत अलग कर स्वच्छ डेटा तैयार किया जाता है।',
      analogy: 'जैसे प्रयोगशाला में पानी की हर बूंद का कई स्तरों पर शुद्धिकरण।',
      impact: 'मौसम पूर्वानुमान के लिए केवल 100% प्रामाणिक और स्वच्छ डेटा प्रदान करता है।',
    },
    relatedQuestions: [
      'What are the 4 Tiers of SkyGuard Quality Control?',
      'How are flagged discrepancies converted into WMO QC Flags?',
      'How does Triage Active automatically remediate sensor faults?',
    ],
  },
  {
    term: 'Array Reliability Index & Calibration Status',
    category: 'System Health',
    synonyms: [
      'array reliability index', 'calibrated', 'grid nominal', 'station health', '98%', 'reliability index', 'nominal'
    ],
    en: {
      summary: 'Composite percentage score evaluating the overall operational integrity and calibration health of the synoptic array.',
      detail: 'A score of 98% (Calibrated / Grid Nominal) indicates that out of 34 stations and hundreds of individual sensors, 98% are operating within WMO calibration tolerances (±0.1°C temperature, ±1.5% RH, ±0.1 hPa pressure) with optimal excitation voltages.',
      analogy: 'Like a fleet health dashboard showing that 98% of all aircraft are fully certified for flight.',
      impact: 'Provides mission commanders with an instantaneous summary of network-wide trust and observation validity.',
    },
    hinglish: {
      summary: 'Poore 34 stations ke network ka overall fitness score (jaise 98% Calibrated).',
      detail: 'Yeh index batata hai ki poore array ke 98% sensors bilkul accurate aur WMO standards ke mutabiq kaam kar rahe hain. "Calibrated" ka matlab hai ki sensors ki readings factory standards se aligned hain.',
      analogy: 'Jaise car dashboard par sabhi systems ka green light status dikhana.',
      impact: 'Operators ko turant tasalli milti hai ki poora network reliable hai.',
    },
    hi: {
      summary: 'संपूर्ण सिनॉप्टिक नेटवर्क की विश्वसनीयता और कैलिब्रेशन का समग्र सूचकांक (98% Calibrated)।',
      detail: '98% स्कोर यह प्रमाणित करता है कि 34 वेधशालाओं के लगभग सभी सेंसर अंतरराष्ट्रीय WMO मानकों के भीतर सटीक रीडिंग दे रहे हैं और ग्रिड सामान्य (Nominal) स्थिति में है।',
      analogy: 'जैसे अस्पताल के सभी आईसीयू उपकरणों का शत-प्रतिशत प्रमाणित और सक्रिय होना।',
      impact: 'मौसम वैज्ञानिकों को पूरे नेटवर्क पर पूर्ण विश्वास और डेटा प्रामाणिकता प्रदान करता है।',
    },
    relatedQuestions: [
      'What factors reduce the Array Reliability Index below 90%?',
      'How often are physical sensors recalibrated in the field?',
      'What is the meaning of Grid Nominal status?',
    ],
  },
  {
    term: 'Incident Logs & Real-Time Alert Triage',
    category: 'Incident Response',
    synonyms: [
      'incident logs', 'clear all', 'incident', 'logs', 'active triage', 'drift (aws-002)', 'frozen (aws-001)',
      'high', 'low', 'medium', 'critical', 'pune experimental high...'
    ],
    en: {
      summary: 'Real-time chronological feed of localized sensor faults, physical anomalies, and station health events.',
      detail: 'Displays active alerts such as Frozen Sensors (AWS-001), Progressive Drift (AWS-002), or Multivariate Decoupling (AWS-003) prioritized by severity (Low, Medium, High, Critical). Operators can click "Clear All" or individual events to open deep forensic diagnostic traces.',
      analogy: 'Like an air traffic control notification feed listing minor sensor anomalies and major emergency alerts.',
      impact: 'Enables rapid operational dispatch and immediate root-cause isolation before bad data spreads.',
    },
    hinglish: {
      summary: 'Live incident feed jo sensors mein aane wali har choti-badi kharabi ko list karti hai.',
      detail: 'Isme Frozen sensor (AWS-001), Drift (AWS-002) aur Multivariate errors real-time severity (High/Low) ke saath aate hain. Clear All button se logs ko reset ya dismiss kiya ja sakta hai.',
      analogy: 'Jaise phone ke notification panel par aane wale live system alerts.',
      impact: 'Technicians ko turant pata chal jata hai ki kounse station par ja kar probe theek karni hai.',
    },
    hi: {
      summary: 'सेंसर त्रुटियों, विसंगतियों और स्टेशन स्वास्थ्य का वास्तविक समय घटनाक्रम (Incident Logs)।',
      detail: 'यह सूची सक्रिय त्रुटियों (जैसे फ्रोजन सेंसर AWS-001, सेंसर ड्रिफ्ट AWS-002) को उनकी गंभीरता (High, Low, Critical) के आधार पर प्रदर्शित करती है ताकि ऑपरेटर तुरंत आवश्यक कार्रवाई कर सकें।',
      analogy: 'जैसे कंट्रोल रूम का आपातकालीन अलार्म पैनल।',
      impact: 'खराबी के मूल कारण का तुरंत पता लगाकर त्वरित मरम्मत सुनिश्चित करता है।',
    },
    relatedQuestions: [
      'What is the difference between Frozen and Drift incidents?',
      'How to acknowledge and clear incident logs?',
      'How does severity routing dispatch automated work orders?',
    ],
  },
  {
    term: 'Role Lenses & Operational Personas',
    category: 'User Experience & Workflows',
    synonyms: ['operator', 'scientist', 'engineer', 'public', 'lens', 'role', 'personas'],
    en: {
      summary: 'Tailored mission perspectives adapting UI metrics, telemetry depth, and triage controls to the active user role.',
      detail: '• **Operator**: Focuses on live telemetry streams, real-time alerts, and immediate grid health.\n• **Scientist**: Unlocks deep thermodynamic diagrams (Skew-T, Tephigram), multivariate correlation matrices, and SHAP explainability.\n• **Engineer**: Exposes hardware transducer voltages, Campbell CR1000X diagnostics, and calibration drift curves.\n• **Public**: Presents intuitive weather summaries and high-level air quality indices.',
      analogy: 'Like switching microscope lenses between 10x overview and 1000x cellular inspection depending on what you need to study.',
      impact: 'Optimizes cognitive load by displaying only role-relevant data without clutter.',
    },
    hinglish: {
      summary: '4 alag-alag view modes (Operator, Scientist, Engineer, Public) jo user ki zaroorat ke hisaab se dashboard badalte hain.',
      detail: 'Operator ko live alerts aur station map chahiye, Scientist ko scientific graphs aur thermodynamic physics chahiye, aur Engineer ko hardware voltage aur sensor wiring check karni hoti hai. Role badalne se interface usi hisaab se customize ho jata hai.',
      analogy: 'Jaise ek hi car mein Normal, Sports aur Eco mode switch karna.',
      impact: 'Har user ko uske kaam ke mutabiq exact information milti hai.',
    },
    hi: {
      summary: 'उपयोगकर्ता की भूमिका (ऑपरेटर, वैज्ञानिक, इंजीनियर) के अनुसार अनुकूलित दृश्य और नियंत्रण प्रणाली।',
      detail: 'ऑपरेटरों को लाइव अलर्ट, वैज्ञानिकों को गहन वायुमंडलीय भौतिकी चार्ट और इंजीनियरों को हार्डवेयर वोल्टेज और कैलिब्रेशन टूल्स प्रदान किए जाते हैं।',
      analogy: 'जैसे आवश्यकतानुसार कैमरे का लेंस बदलना।',
      impact: 'प्रत्येक उपयोगकर्ता को बिना किसी भटकाव के सटीक जानकारी उपलब्ध कराता है।',
    },
    relatedQuestions: [
      'What features are unlocked in Scientist Mode?',
      'How to diagnose transducer voltages in Engineer Mode?',
      'How does role selection impact anomaly triage workflows?',
    ],
  },
  {
    term: 'Meteorological Physical Units & Thermodynamic Variables',
    category: 'Atmospheric Physics',
    synonyms: [
      '21°c', '25°c', '°c', 'celsius', 'hpa', 'hectopascal', 'barometric', 'rh', 'rh %', 'humidity %', 'm/s', 'w/m²', 'knots', 'mm'
    ],
    en: {
      summary: 'Standard SI and WMO meteorological measurement units governing all sensor telemetry on screen.',
      detail: '• **°C (Degrees Celsius)**: Ambient dry-bulb & dew point air temperature.\n• **hPa (Hectopascals)**: Atmospheric barometric pressure (standard sea level: 1013.25 hPa).\n• **% (Relative Humidity)**: Ratio of vapor pressure to saturation vapor pressure.\n• **m/s or knots**: Wind vector speed.\n• **W/m²**: Global solar irradiance pyranometer flux.',
      analogy: 'Like the standard units (km/h, RPM, liters) on a precision aircraft dashboard.',
      impact: 'Ensures universal physical consistency across all numerical weather prediction models globally.',
    },
    hinglish: {
      summary: 'Mausam ke standard physical units jo screen par temperature, pressure aur humidity ke saath dikhte hain.',
      detail: '• **°C**: Temperature (Ambient aur Dew point).\n• **hPa**: Hawa ka pressure (Barometric pressure, normal ~1013 hPa).\n• **RH %**: Hawa mein kitni nami (humidity) hai.\n• **m/s ya km/h**: Hawa ki speed aur direction.',
      analogy: 'Jaise bike ke speedometer par km/h aur fuel gauge par liters likha hota hai.',
      impact: 'Sabhi sensors ka data globally WMO standards se match karta hai.',
    },
    hi: {
      summary: 'मौसम विज्ञान की मानक मापन इकाइयाँ (SI Units) जो स्क्रीन पर प्रदर्शित आंकड़ों को परिभाषित करती हैं।',
      detail: '• **°C (सेल्सियस)**: तापमान और ओस बिंदु का पैमाना।\n• **hPa (हेक्टोपास्कल)**: वायुमंडलीय दबाव का अंतरराष्ट्रीय पैमाना।\n• **% (सापेक्ष आर्द्रता)**: हवा में नमी का प्रतिशत।\n• **m/s**: पवन वेग की गति।',
      analogy: 'जैसे थर्मामीटर पर डिग्री और तराजू पर किलोग्राम।',
      impact: 'विश्वभर के मौसम डेटा के साथ 100% एकरूपता और वैज्ञानिक सटीकता सुनिश्चित करता है।',
    },
    relatedQuestions: [
      'Why is atmospheric pressure measured in hPa rather than PSI?',
      'How is Relative Humidity (%) calculated from Dew Point?',
      'What is Solar Irradiance in W/m²?',
    ],
  },
];

/**
 * Intelligent RAG Query Engine
 * Searches local knowledge base with multi-tiered fuzzy, synonym, token-overlap,
 * and contextual regex scoring across English, Hinglish, and Hindi.
 */
export function queryMistyRag(
  query: string,
  lang: 'EN' | 'HINGLISH' | 'HI' = 'EN'
): {
  term: string;
  response: string;
  explanation?: MistyExplanation;
  relatedQuestions: string[];
} {
  const normalizedQuery = query.toLowerCase().trim();

  // 1. Direct Term or Synonym Match
  let matched = MISTY_KNOWLEDGE_BASE.find((item) => {
    if (normalizedQuery === item.term.toLowerCase()) return true;
    if (item.synonyms.includes(normalizedQuery)) return true;
    if (normalizedQuery.includes(item.term.toLowerCase())) return true;
    return item.synonyms.some((syn) => {
      if (syn.length <= 3) return normalizedQuery === syn;
      return normalizedQuery.includes(syn) || syn.includes(normalizedQuery);
    });
  });

  // 2. Intelligent Category-Based Regex & Pattern Heuristics
  if (!matched) {
    // Calendar, Months, Days, Time
    const monthRegex = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/i;
    const dayRegex = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun|today|yesterday|date|month|year|calendar)\b/i;
    const timeRegex = /\b(\d{1,2}:\d{2}(\s*(am|pm|z))?|am|pm|clock|time|zulu|utc)\b/i;

    if (monthRegex.test(normalizedQuery) || dayRegex.test(normalizedQuery) || timeRegex.test(normalizedQuery)) {
      matched = MISTY_KNOWLEDGE_BASE.find((i) => i.term.includes('Calendar') || i.term.includes('Zulu'));
    }

    // Percentiles, Latency, Hardware timings
    const latencyRegex = /\b(p95|p99|p90|latency|throughput|vector pipeline|\d+(\.\d+)?\s*(ns|ms|s))\b/i;
    if (!matched && latencyRegex.test(normalizedQuery)) {
      matched = MISTY_KNOWLEDGE_BASE.find((i) => i.term.includes('Latency') || i.term.includes('Vector'));
    }

    // Ingested frames, Packets, Stream volume
    const frameRegex = /\b(\d+(\.\d+)?k?\s*(frames|packets|stream)|ingested|streaming|sync active|packets)\b/i;
    if (!matched && frameRegex.test(normalizedQuery)) {
      matched = MISTY_KNOWLEDGE_BASE.find((i) => i.term.includes('Ingested') || i.term.includes('Vector'));
    }

    // Array Reliability, Health score, Nominals
    const healthRegex = /\b(\d+%\s*(health|reliability|calibrated|nominal)?|calibrated|grid nominal|reliability index)\b/i;
    if (!matched && healthRegex.test(normalizedQuery)) {
      matched = MISTY_KNOWLEDGE_BASE.find((i) => i.term.includes('Reliability') || i.term.includes('Health'));
    }

    // Incidents, Triage, Logs, Clear
    const incidentRegex = /\b(incident|logs|clear all|triage|discrepanc|drift|frozen|aws-\d+)\b/i;
    if (!matched && incidentRegex.test(normalizedQuery)) {
      matched = MISTY_KNOWLEDGE_BASE.find((i) => i.term.includes('Incident') || i.term.includes('Discrepancies') || i.term.includes('Stuck'));
    }

    // Physical units: temperature, pressure, humidity
    const unitsRegex = /\b(\d+°c|°c|celsius|hpa|pressure|humidity|rh|m\/s|w\/m²)\b/i;
    if (!matched && unitsRegex.test(normalizedQuery)) {
      matched = MISTY_KNOWLEDGE_BASE.find((i) => i.term.includes('Units') || i.term.includes('Barometric') || i.term.includes('Temperature'));
    }

    // Roles: Operator, Scientist, Engineer, Public
    const roleRegex = /\b(operator|scientist|engineer|public|lens|role|persona)\b/i;
    if (!matched && roleRegex.test(normalizedQuery)) {
      matched = MISTY_KNOWLEDGE_BASE.find((i) => i.term.includes('Role') || i.term.includes('Personas'));
    }
  }

  // 3. Multi-Tier Token Overlap Scoring
  if (!matched) {
    const queryTokens = normalizedQuery.split(/[\s,?.!/\\-]+/).filter((t) => t.length > 2);
    let bestScore = 0;
    let bestItem: MistyExplanation | null = null;

    for (const item of MISTY_KNOWLEDGE_BASE) {
      let score = 0;
      const allText = [
        item.term,
        item.category,
        ...item.synonyms,
        item.en.summary,
        item.en.detail,
        item.hinglish.summary,
        item.hinglish.detail,
        item.hi.summary,
        item.hi.detail,
      ]
        .join(' ')
        .toLowerCase();

      for (const token of queryTokens) {
        if (allText.includes(token)) score += 1;
        if (item.term.toLowerCase().includes(token)) score += 3;
        if (item.synonyms.some((s) => s.toLowerCase().includes(token))) score += 2;
      }

      if (score > bestScore) {
        bestScore = score;
        bestItem = item;
      }
    }

    if (bestScore >= 2 && bestItem) {
      matched = bestItem;
    }
  }

  // Format response when a matched concept card exists
  if (matched) {
    const content = matched[lang === 'HI' ? 'hi' : lang === 'HINGLISH' ? 'hinglish' : 'en'];
    const titlePrefix =
      lang === 'HI'
        ? `मिस्टी का स्पष्टीकरण: ${matched.term}\n\n`
        : `Misty Concept Clarity: ${matched.term}\n\n`;

    const summaryLabel = lang === 'HI' ? 'संक्षिप्त परिचय' : 'Quick Summary';
    const detailLabel = lang === 'HI' ? 'वैज्ञानिक विश्लेषण' : 'Scientific Detail';
    const analogyLabel = lang === 'HI' ? 'सरल उदाहरण (Analogy)' : 'Real-World Analogy';
    const impactLabel = lang === 'HI' ? 'प्रणाली में महत्व' : 'SkyGuard AI Impact';

    const formattedResponse = `${titlePrefix}• ${summaryLabel}: ${content.summary}\n\n• ${detailLabel}:\n${content.detail}\n\n• ${analogyLabel}:\n${content.analogy}\n\n• ${impactLabel}:\n${content.impact}`;

    return {
      term: matched.term,
      response: formattedResponse,
      explanation: matched,
      relatedQuestions: matched.relatedQuestions,
    };
  }

  // Simple, Natural Multi-Language Contextual Fallback
  if (lang === 'HI') {
    return {
      term: query,
      response: `**"${query}"** के बारे में:\n\nयह मौसम और सेंसर निगरानी प्रणाली का एक हिस्सा है। स्काईगार्ड एआई वास्तविक समय में सेंसर डेटा की जांच करता है ताकि सभी अवलोकन सटीक रहें।\n\nआप किसी भी पैरामीटर या अलर्ट के बारे में अधिक जानने के लिए चैट में पूछ सकते हैं।`,
      relatedQuestions: [
        'सेंसर स्वास्थ्य कैसे मापा जाता है?',
        'मौसम अलर्ट कैसे काम करते हैं?',
        'दबाव में गिरावट का क्या अर्थ है?',
      ],
    };
  }

  if (lang === 'HINGLISH') {
    return {
      term: query,
      response: `**"${query}"** ke baare mein:\n\nYeh weather aur sensor monitoring system ka part hai. SkyGuard AI real-time observations ko validate karta hai taaki data clean aur accurate rahe.\n\nAap kisi bhi sensor ya alert ke baare mein detail jaanane ke liye direct chat mein pooch sakte hain.`,
      relatedQuestions: [
        'How is sensor health calculated?',
        'Explain quality control checks',
        'What causes pressure drops in storms?',
      ],
    };
  }

  return {
    term: query,
    response: `About **"${query}"**:\n\nThis is part of the weather and sensor monitoring system. SkyGuard AI continuously validates observations in real time to ensure reliability and detect sensor faults early.\n\nYou can open the full chat anytime to explore detailed diagnostics or ask questions.`,
    relatedQuestions: [
      'How is sensor health calculated?',
      'How does quality control work?',
      'What causes pressure drops in storms?',
    ],
  };
}

