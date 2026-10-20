import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

const CLOUD_REGISTRATIONS_URL = "https://extendsclass.com/api/json-storage/bin/bfceaaf";
const CLOUD_ANNOUNCEMENTS_URL = "https://extendsclass.com/api/json-storage/bin/afabdcd";
const CLOUD_GABI_URL = "https://extendsclass.com/api/json-storage/bin/deebfee";
const CLOUD_JACKET_URL = "https://extendsclass.com/api/json-storage/bin/ccfecea";
const CLOUD_PAYMENTS_URL = "https://extendsclass.com/api/json-storage/bin/ffdaafb";

type SeniorDay = "home" | "culture" | "gabi" | "jacket" | "payment";

type Registration = {
  id: number;
  name: string;
  email: string;
  outfit: string;
  image?: string;
  date?: string;
};

type GabiRegistration = {
  id: number;
  name: string;
  email: string;
  gabiType: string;
  extraGabi: boolean;
  date?: string;
};

type JacketRegistration = {
  id: number;
  name: string;
  email: string;
  nickname: string;
  size: string;
  fit: string;
  date?: string;
};

type PaymentReceipt = {
  id: number;
  name: string;
  email: string;
  purpose: string;
  amount?: string;
  screenshot: string;
  date: string;
  refNumber?: string;
};

type CulturalLook = {
  id: string;
  src: string;
  backSrc: string;
  alt: string;
  label: string;
  amharic: string;
  region: string;
  description: string;
  fabrics: string[];
  accessories: string[];
  custom?: boolean;
};

type Announcement = {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  pinned: boolean;
  tag?: "all" | "culture" | "gabi" | "jacket";
};

type GabiStyle = {
  id: string;
  name: string;
  amharic: string;
  origin: string;
  description: string;
  weave: string;
  tibebColors: string;
  warmthRating: string;
  drapingTip: string;
  badge: string;
};

const assetUrl = (path: string) => {
  const b = import.meta.env.BASE_URL || './';
  const cleanBase = b.endsWith('/') ? b : `${b}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
};

const DEFAULT_OUTFIT_OPTIONS = [
  "Habesha Kemis & Netela",
  "Oromo traditional attire (Wandabo & Caaccuu)",
  "Tigrayan traditional attire (Zurya & Tilfi)",
  "Wollo rich festive dress",
  "Harari traditional attire (Ashrafi & Velvet)",
  "Dorze & Gamo master-woven attire",
  "Men's tunic suit & royal Kaba cloak",
  "Welayta traditional striped attire",
  "Sidama traditional attire (Fichee-Chambalaalla)",
  "Afar traditional attire (Sanafil & Shash)",
  "Other Ethiopian cultural attire",
];

const INITIAL_SHOWCASE_IMAGES: CulturalLook[] = [
  {
    id: "habesha-kemis",
    src: assetUrl("images/habesha_female.jpg"),
    backSrc: assetUrl("images/habesha_male.jpg"),
    alt: "Habesha Kemis & Netela - Handwoven white Shemma with gold Tibeb embroidery",
    label: "Habesha Kemis & Netela",
    amharic: "የሀበሻ ቀሚስና ነጠላ",
    region: "Highlands (Amhara / Pan-Ethiopian)",
    description: "The quintessential Ethiopian formal attire made from fine hand-spun cotton (Shemma), decorated with exquisite woven Tibeb borders and paired with a lightweight Netela shawl and gold Meskel cross.",
    fabrics: ["Shemma Cotton", "Gold Thread", "Silk Embroidery"],
    accessories: ["Netela Shawl", "Meskel Cross Pendant", "Albaso Braids"]
  },
  {
    id: "oromo-wandabo",
    src: assetUrl("images/oromo_female.jpg"),
    backSrc: assetUrl("images/oromo_male.jpg"),
    alt: "Oromo Wandabo & Caaccuu - Bold red, black, and yellow geometric stripes with cowrie shells",
    label: "Oromo Wandabo & Caaccuu",
    amharic: "የኦሮሞ ወንዳቦና ጫጩ",
    region: "Oromia (Bale, Arsi, Shewa, Hararghe)",
    description: "Striking traditional dress characterized by vibrant horizontal stripes of red, deep black, and bright yellow, paired with an authentic Caaccuu cowrie-shell headpiece and beaded choker.",
    fabrics: ["Woven Cotton", "Beaded Trim", "Leather Insets"],
    accessories: ["Caaccuu Headpiece", "Chitte Shawl", "Beaded Bangles"]
  },
  {
    id: "tigray-tilfi",
    src: assetUrl("images/tigray_female.jpg"),
    backSrc: assetUrl("images/tigray_male.jpg"),
    alt: "Tigray Tilfi & Zurya - Royal cream Shemma gown with dense gold and burgundy Tilfi chain embroidery",
    label: "Tigray Tilfi & Zurya",
    amharic: "የትግራይ ጥላፍና ዙርያ",
    region: "Tigray",
    description: "Renowned for dense, breathtaking golden and silk thread embroidery (Tilfi) tightly framing the neckline, bodice, and skirt hem, accompanied by traditional Shuruba braids and draped Netela.",
    fabrics: ["Double-Layer Shemma", "Gold Threading", "Silk Floss"],
    accessories: ["Draped Netela", "Kuhul Eye Adornment", "Gold Headpiece"]
  },
  {
    id: "wollo-kemis",
    src: assetUrl("images/wollo_female.jpg"),
    backSrc: assetUrl("images/wollo_male.jpg"),
    alt: "Wollo Rich Festive Dress - Deep burgundy cotton with vibrant ribbon patchwork bands",
    label: "Wollo Festive Kemis",
    amharic: "የወሎ ባህላዊ ልብስ",
    region: "Wollo (Dessie, Raya, Bati)",
    description: "Famous for its daring departure into deep contrasting burgundy and black fabrics loaded with bright yellow, green, and red ribbon patchwork borders and matching traditional Wollo headwrap.",
    fabrics: ["Dyed Heavy Cotton", "Woven Ribbons", "Golden Cord"],
    accessories: ["Sash / Mekenet", "Silver Coins", "Wollo Headwrap"]
  },
  {
    id: "harari-jet",
    src: assetUrl("images/harari_female.jpg"),
    backSrc: assetUrl("images/harari_male.jpg"),
    alt: "Harari Cultural Attire - Royal loose tunic with ornate headwear and cultural embroidery",
    label: "Harari Cultural Attire",
    amharic: "የሐረሪ ባህላዊ ልብስ",
    region: "Harar Jugol",
    description: "Influenced by ancient trade and Islamic artisan heritage. Features a wide, loose tunic in deep velvet with glittering gold brocade borders, tapered Sirri trousers, and an ornate headscarf.",
    fabrics: ["Royal Silk Velvet", "Gold Brocade", "Embroidered Satin"],
    accessories: ["Embroidered Headscarf", "Silver Filigree Jewelry", "Sirri Anklets"]
  },
  {
    id: "dorze-gabi",
    src: assetUrl("images/dorze_female.jpg"),
    backSrc: assetUrl("images/dorze_male.jpg"),
    alt: "Dorze & Gamo Master-Woven Cultural Attire - Celebratory woven patterns and traditional regalia",
    label: "Dorze & Gamo Traditional Attire",
    amharic: "የዶርዜ ባህላዊ ልብስ",
    region: "Gamo Highlands / Dorze / Chencha",
    description: "Renowned across Ethiopia for master weaving heritage. Features vibrant striped shawls, hand-spun cotton garments, knitted tricolor hats, and ceremonial leopard patterns worn with pride.",
    fabrics: ["Hand-spun Cotton", "Dorze Woven Stripes", "Ceremonial Regalia"],
    accessories: ["Dorze Woven Hat", "Striped Shoulder Shawl", "Cultural Staff"]
  },
  {
    id: "mens-kaba",
    src: assetUrl("images/habesha_male.jpg"),
    backSrc: assetUrl("images/habesha_female.jpg"),
    alt: "Men's Royal Tunic & Velvet Kaba - Tailored white Shemma tunic with ceremonial velvet Kaba cape",
    label: "Royal Kaba Cloak & Tunic",
    amharic: "የወንዶች ካባና ልብስ",
    region: "Pan-Ethiopian Traditional Royalty",
    description: "Tailored white Shemma cotton tunic and trousers with embroidered collar and buttons, topped with a ceremonial royal velvet Kaba cape heavily lined with gold metallic bullion leaf embroidery.",
    fabrics: ["High-count Cotton", "Black Velvet Cloak", "Gold Bullion Fringe"],
    accessories: ["Royal Kaba Cape", "Kuta Shawl", "Gold Medallion Clasp"]
  },
  {
    id: "welayta-striped",
    src: assetUrl("images/welayta_female.jpg"),
    backSrc: assetUrl("images/welayta_male.jpg"),
    alt: "Welayta Traditional Weave - Signature triple-band stripes of red, yellow, and black on white cotton",
    label: "Welayta Traditional Weave",
    amharic: "የወላይታ ባህላዊ ልብስ",
    region: "Welayta Zone",
    description: "Celebrated for iconic tricolor horizontal ribbons of deep black, vivid red, and radiant yellow symbolizing unity, bravery, and fertility on immaculate white handwoven cotton.",
    fabrics: ["Handwoven Shemma", "Colored Cotton Bands", "Silk Cord"],
    accessories: ["Striped Waist Sash", "Woven Beaded Bangles", "Draped Netela"]
  },
  {
    id: "sidama-attire",
    src: assetUrl("images/sidama_female.jpg"),
    backSrc: assetUrl("images/sidama_male.jpg"),
    alt: "Sidama Traditional Dress - Radiant red, yellow, and green ceremonial ribbons for Fichee-Chambalaalla",
    label: "Sidama Fichee Attire",
    amharic: "የሲዳማ ባህላዊ ልብስ",
    region: "Sidama Region",
    description: "Worn during the UNESCO-inscribed Fichee-Chambalaalla New Year festival. Features brilliant primary stripes, Cowrie shell necklaces, and celebratory fringe symbolizing harvest and renewal.",
    fabrics: ["Fine Shemma", "Sidama Ribbons", "Woven Fringe"],
    accessories: ["Cowrie Shell Necklace", "Beaded Forehead Band", "Ceremonial Chitte"]
  },
  {
    id: "afar-sanafil",
    src: assetUrl("images/afar_female.jpg"),
    backSrc: assetUrl("images/afar_male.jpg"),
    alt: "Afar Traditional Sanafil & Shash - Indigo and crimson waist wrap with silver amulets and Shash headpiece",
    label: "Afar Sanafil & Shash Attire",
    amharic: "የአፋር ባህላዊ ልብስ",
    region: "Afar Triangle (Danakil & Awash)",
    description: "Distinguished desert heritage featuring vivid indigo and crimson hand-dyed cotton wraps (Sanafil), draped shawls, amber beadwork, and intricate silver hair amulets.",
    fabrics: ["Dyed Sanafil Cotton", "Indigo Drape", "Embroidered Hem"],
    accessories: ["Silver Amulet Pendant", "Shash Headwrap", "Beaded Leather Choker"]
  }
];

const GABI_STYLES: GabiStyle[] = [
  {
    id: "arba-gabi",
    name: "Traditional Arba Gabi (አርባ ጋቢ)",
    amharic: "ባህላዊ አርባ ጋቢ",
    origin: "Highland Ethiopia (Amhara / Tigray / Shewa)",
    description: "The crown jewel of Ethiopian cotton master-weavers. Crafted from four layered folds of ultra-soft handspun cotton (Shemma), providing royal dignity and rich winter warmth.",
    weave: "4-Layer Handspun Cotton",
    tibebColors: "Gold, Crimson & Emerald Tibeb Edges",
    warmthRating: "Maximum Warmth (5/5)",
    drapingTip: "Fold evenly across both shoulders with the Tibeb border displayed prominently in front.",
    badge: "Most Iconic"
  },
  {
    id: "gamo-chencha",
    name: "Gamo / Chencha Masterweave (የጋሞ ጨንቻ)",
    amharic: "የጋሞና ጨንቻ ጥበብ ጋቢ",
    origin: "Southern Highlands (Gamo, Dorze, Chencha)",
    description: "Mastercrafted by legendary southern Dorze weavers, famous across Africa for tight, durable cotton texture and colorful geometric border embroidery.",
    weave: "Double-Twist Organic Cotton",
    tibebColors: "Vibrant Multi-color Geometric Bands",
    warmthRating: "High Warmth (4.5/5)",
    drapingTip: "Drape diagonally across the chest to showcase the rich geometric weaving along the lower hem.",
    badge: "Master Weave"
  },
  {
    id: "shemma-kuta",
    name: "Highland Shemma Kuta (ኩታና ነጠላ)",
    amharic: "የወንዶች ኩታና ነጠላ",
    origin: "Pan-Ethiopian Formal Heritage",
    description: "An elegant, lighter weight double-cotton mantle traditionally worn by scholars and elders during celebratory assemblies, featuring fine gold thread and Ethiopian flag borders.",
    weave: "Double Shemma Weave",
    tibebColors: "Pure Gold & Tricolor Silk Filaments",
    warmthRating: "Medium Breezy Warmth (3.5/5)",
    drapingTip: "Toss gracefully over one shoulder for a distinguished, formal senior look.",
    badge: "Royal Formal"
  },
  {
    id: "bale-shewa",
    name: "Bale & Shewa Country Gabi (የሸዋ/ባሌ ጋቢ)",
    amharic: "የሸዋና የባሌ ባህላዊ ጋቢ",
    origin: "Central & Southeastern Oromia",
    description: "Earthy, unbleached natural cotton with a rustic, dense weave. Historically worn during morning assemblies, storytelling circles, and misty mountain days.",
    weave: "Unbleached Natural Cotton",
    tibebColors: "Deep Burgundy & Earth Ochre Trim",
    warmthRating: "High Warmth (4/5)",
    drapingTip: "Wrap snugly around the neck and torso like a cozy traditional shawl.",
    badge: "Cozy Heritage"
  },
  {
    id: "batch-custom",
    name: "Senior Batch ’26 Commemorative Gabi",
    amharic: "የባች '26 መታሰቢያ ጋቢ",
    origin: "BGMCS Senior Batch Exclusive",
    description: "Traditional white Shemma Gabi custom-accented with forest green and gold school ribbon borders, commemorating our milestone graduating class.",
    weave: "High-grade Ethiopian Cotton",
    tibebColors: "Forest Green & Gold Batch Trim",
    warmthRating: "Cozy Warmth (4/5)",
    drapingTip: "Wear together during the senior cohort panorama photo for a stunning unified look.",
    badge: "Class Special"
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: "Welcome BGMCS Senior Batch ’26 to Culture Day!",
    content: "Senior Culture Day is officially here! Explore our authentic cultural attire collections from across Ethiopia, select your favorite traditional look, or test your fortune on the lucky spin wheel to claim your cultural style. The committee will publish official attire schedules and stage lineups right here.",
    author: "BGMCS Senior Committee",
    date: "Culture Day 2026",
    pinned: true,
    tag: "culture"
  },
  {
    id: 2,
    title: "Gabi Day Gathering: This Saturday at H9XH+PV5, Bahir Dar",
    content: "Attention all seniors! Gabi Day is THIS SATURDAY. Gather at H9XH+PV5, Bahir Dar for our traditional spiced chai assembly, popcorn circle, and cohort white Gabi panoramic photo. Tap the location on the Gabi Day page to navigate directly on Google Maps.",
    author: "Senior Committee",
    date: "This Week",
    pinned: true,
    tag: "gabi"
  },
  {
    id: 3,
    title: "Senior Welcome & Official Varsity Jacket Day Announced!",
    content: "Get ready to represent our batch in style! The official BGMCS Class of 2026 Varsity Jacket design is revealed. Customize your back nickname, confirm your size, and join us for the grand hallway unboxing ceremony.",
    author: "Senior Committee",
    date: "Fall 2025",
    pinned: false,
    tag: "jacket"
  }
];

function Icon({
  name,
  className = "",
}: {
  name: "arrow" | "calendar" | "check" | "image" | "sparkle" | "upload" | "rotate" | "shield" | "trash" | "plus" | "megaphone" | "download" | "close" | "search";
  className?: string;
}) {
  const paths = {
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    image: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9" r="1.5" />
        <path d="m21 15-5-5L5 20" />
      </>
    ),
    sparkle: <path d="m12 3-1.1 3.2a7 7 0 0 1-4.4 4.4L3 12l3.5 1.4a7 7 0 0 1 4.4 4.4L12 21l1.1-3.2a7 7 0 0 1 4.4-4.4L21 12l-3.5-1.4a7 7 0 0 1-4.4-4.4L12 3Z" />,
    upload: (
      <>
        <path d="M12 16V4M7 9l5-5 5 5" />
        <path d="M5 15v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4" />
      </>
    ),
    rotate: (
      <>
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
      </>
    ),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    trash: (
      <>
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    megaphone: (
      <>
        <path d="m3 11 18-5v12L3 14v-3z" />
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
      </>
    ),
    download: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M7 10l5 5 5-5M12 15V3" />
      </>
    ),
    close: <path d="M18 6 6 18M6 6l12 12" />,
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </>
    )
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  );
}

// -------------------------------------------------------------
// Interactive SVG Varsity Jacket Visualizer Component
// -------------------------------------------------------------
function SeniorJacketVisualizer({
  side,
  nickname,
  size,
  fit
}: {
  side: "front" | "back";
  nickname: string;
  size: string;
  fit: string;
}) {
  const displayNick = (nickname.trim() || "SENIORS '26").toUpperCase().slice(0, 14);

  return (
    <div className="jacket-svg-container">
      <svg
        viewBox="0 0 400 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "auto" }}
      >
        <defs>
          <linearGradient id="bodyGreen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e4838" />
            <stop offset="100%" stopColor="#0e2a20" />
          </linearGradient>
          <linearGradient id="goldSleeve" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3c64c" />
            <stop offset="50%" stopColor="#d7a52c" />
            <stop offset="100%" stopColor="#b3841a" />
          </linearGradient>
          <linearGradient id="goldTrim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.35" />
          </filter>
          <path id="archTextPath" d="M 90 145 Q 200 85 310 145" />
        </defs>

        {/* Sleeves */}
        <g filter="url(#shadow)">
          <path
            d="M 125 78 L 40 180 L 75 220 L 138 135 Z"
            fill="url(#goldSleeve)"
            stroke="#916a13"
            strokeWidth="1.5"
          />
          <path d="M 40 180 L 30 192 L 65 232 L 75 220 Z" fill="#183c2f" />
          <line x1="33" y1="184" x2="68" y2="224" stroke="#ffffff" strokeWidth="2.5" />
          <line x1="37" y1="188" x2="72" y2="228" stroke="#d7a52c" strokeWidth="2" />

          <path
            d="M 275 78 L 360 180 L 325 220 L 262 135 Z"
            fill="url(#goldSleeve)"
            stroke="#916a13"
            strokeWidth="1.5"
          />
          <path d="M 360 180 L 370 192 L 335 232 L 325 220 Z" fill="#183c2f" />
          <line x1="367" y1="184" x2="332" y2="224" stroke="#ffffff" strokeWidth="2.5" />
          <line x1="363" y1="188" x2="328" y2="228" stroke="#d7a52c" strokeWidth="2" />
        </g>

        {/* Main Body */}
        <g filter="url(#shadow)">
          <path
            d="M 125 75 C 150 90 250 90 275 75 L 290 330 C 290 330 200 338 110 330 Z"
            fill="url(#bodyGreen)"
            stroke="#0b231a"
            strokeWidth="2"
          />
        </g>

        {/* Hem Ribbing */}
        <path
          d="M 108 330 C 200 338 290 338 292 330 L 292 360 C 200 368 108 368 108 360 Z"
          fill="#183c2f"
          stroke="#0b231a"
          strokeWidth="1.5"
        />
        <path d="M 108 340 C 200 348 290 348 292 340" stroke="#ffffff" strokeWidth="3" fill="none" />
        <path d="M 108 350 C 200 358 290 358 292 350" stroke="#d7a52c" strokeWidth="2.5" fill="none" />

        {/* Collar Ribbing */}
        <path
          d="M 130 75 C 160 52 240 52 270 75 C 248 95 152 95 130 75 Z"
          fill="#183c2f"
          stroke="#0b231a"
          strokeWidth="1.5"
        />
        <path d="M 136 70 C 162 58 238 58 264 70" stroke="#ffffff" strokeWidth="2.5" fill="none" />
        <path d="M 140 76 C 165 65 235 65 260 76" stroke="#d7a52c" strokeWidth="2" fill="none" />

        {/* FRONT VIEW */}
        {side === "front" && (
          <g>
            <line x1="200" y1="90" x2="200" y2="334" stroke="#0e2a20" strokeWidth="18" strokeLinecap="round" />
            <line x1="200" y1="90" x2="200" y2="334" stroke="#d7a52c" strokeWidth="1.5" strokeDasharray="4 4" />

            {[110, 150, 190, 230, 270, 310].map((y) => (
              <circle key={y} cx="200" cy={y} r="5.5" fill="#fde047" stroke="#92400e" strokeWidth="1.5" />
            ))}

            {/* School Crest */}
            <g transform="translate(148, 125)">
              <rect x="-18" y="-18" width="36" height="42" rx="4" fill="#0b2a20" stroke="#d7a52c" strokeWidth="2" />
              <path d="M -18 10 C -18 24 0 28 0 28 C 0 28 18 24 18 10 Z" fill="#0b2a20" stroke="#d7a52c" strokeWidth="2" />
              <text x="0" y="-3" fill="#fde047" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                BGMCS
              </text>
              <text x="0" y="8" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                SENIORS
              </text>
              <circle cx="0" cy="18" r="3" fill="#d7a52c" />
            </g>

            {/* Chenille '26 Patch */}
            <g transform="translate(252, 130)">
              <rect x="-18" y="-16" width="36" height="34" rx="8" fill="#ffffff" stroke="#d7a52c" strokeWidth="2.5" />
              <text x="0" y="8" fill="#183c2f" fontSize="19" fontWeight="900" textAnchor="middle" fontFamily="Georgia, serif">
                ’26
              </text>
            </g>

            <line x1="135" y1="240" x2="165" y2="280" stroke="#d7a52c" strokeWidth="7" strokeLinecap="round" />
            <line x1="265" y1="240" x2="235" y2="280" stroke="#d7a52c" strokeWidth="7" strokeLinecap="round" />

            <g transform="translate(130, 315)">
              <rect x="0" y="0" width="38" height="15" rx="3" fill="#ffffff" stroke="#183c2f" strokeWidth="1" />
              <text x="19" y="11" fill="#183c2f" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                SIZE: {size}
              </text>
            </g>
          </g>
        )}

        {/* BACK VIEW */}
        {side === "back" && (
          <g>
            <g transform="translate(182, 86)">
              <rect x="0" y="0" width="12" height="6" fill="#17814f" />
              <rect x="12" y="0" width="12" height="6" fill="#efc83a" />
              <rect x="24" y="0" width="12" height="6" fill="#c64b36" />
              <rect x="0" y="0" width="36" height="6" stroke="#ffffff" strokeWidth="0.8" fill="none" />
            </g>

            <text
              fill="url(#goldTrim)"
              stroke="#ffffff"
              strokeWidth="0.8"
              fontSize="20"
              fontWeight="900"
              letterSpacing="2.5"
              fontFamily="'Playfair Display', Georgia, serif"
            >
              <textPath href="#archTextPath" startOffset="50%" textAnchor="middle">
                {displayNick}
              </textPath>
            </text>

            <g transform="translate(200, 222)">
              <text
                x="2"
                y="3"
                fill="#0b231a"
                fontSize="76"
                fontWeight="900"
                textAnchor="middle"
                fontFamily="Impact, sans-serif"
                letterSpacing="4"
              >
                26
              </text>
              <text
                x="0"
                y="0"
                fill="#ffffff"
                stroke="#ffffff"
                strokeWidth="10"
                fontSize="76"
                fontWeight="900"
                textAnchor="middle"
                fontFamily="Impact, sans-serif"
                letterSpacing="4"
              >
                26
              </text>
              <text
                x="0"
                y="0"
                fill="#fde047"
                stroke="#ca8a04"
                strokeWidth="1.5"
                fontSize="76"
                fontWeight="900"
                textAnchor="middle"
                fontFamily="Impact, sans-serif"
                letterSpacing="4"
              >
                26
              </text>
            </g>

            <text
              x="200"
              y="288"
              fill="#dce5d8"
              fontSize="10"
              fontWeight="800"
              letterSpacing="3"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              ★ BGMCS SENIOR BATCH ★
            </text>

            <g transform="translate(200, 315)">
              <rect x="-35" y="0" width="70" height="15" rx="3" fill="rgba(0,0,0,0.4)" stroke="#d7a52c" strokeWidth="1" />
              <text x="0" y="11" fill="#fde047" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                {size} • {fit.toUpperCase()} FIT
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// Main Application Component
// -------------------------------------------------------------
function App() {
  const [activeDay, setActiveDay] = useState<SeniorDay>(() => {
    const hash = window.location.hash.replace("#", "").toLowerCase();
    if (hash === "culture" || hash === "culture-day") return "culture";
    if (hash === "gabi" || hash === "gabi-day") return "gabi";
    if (hash === "jacket" || hash === "jacket-day" || hash === "welcome") return "jacket";
    if (hash === "payment" || hash === "payments") return "payment";
    return "home";
  });

  const navigateToDay = (day: SeniorDay) => {
    setActiveDay(day);
    const hash = day === "home" ? "home" : (day === "payment" ? "payments" : `${day}-day`);
    window.history.pushState(null, "", `#${hash}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      if (hash === "culture" || hash === "culture-day") setActiveDay("culture");
      else if (hash === "gabi" || hash === "gabi-day") setActiveDay("gabi");
      else if (hash === "jacket" || hash === "jacket-day" || hash === "welcome") setActiveDay("jacket");
      else if (hash === "payment" || hash === "payments") setActiveDay("payment");
      else if (hash === "admin") setIsAdminOpen(true);
      else if (hash === "home" || hash === "top" || hash === "") setActiveDay("home");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // ---------------- Registrations & Collections ----------------
  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    try {
      const saved = localStorage.getItem("bgmcs-registrations-v5");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(p => !p.name?.includes("Selamawit") && !p.name?.includes("Dawit"));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [culturalLooks, setCulturalLooks] = useState<CulturalLook[]>(() => {
    try {
      const saved = localStorage.getItem("bgmcs-cultural-looks-v4");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_SHOWCASE_IMAGES;
    } catch {
      return INITIAL_SHOWCASE_IMAGES;
    }
  });

  const [gabiRegistrations, setGabiRegistrations] = useState<GabiRegistration[]>(() => {
    try {
      const saved = localStorage.getItem("bgmcs-gabi-registrations-v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [jacketRegistrations, setJacketRegistrations] = useState<JacketRegistration[]>(() => {
    try {
      const saved = localStorage.getItem("bgmcs-jacket-registrations-v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  // ---------------- Payment Accounts & Receipts ----------------
  const [paymentAccounts, setPaymentAccounts] = useState<string>(() => {
    try {
      return localStorage.getItem("bgmcs-payment-accounts-v1") || "";
    } catch {
      return "";
    }
  });

  const [paymentReceipts, setPaymentReceipts] = useState<PaymentReceipt[]>(() => {
    try {
      const saved = localStorage.getItem("bgmcs-payment-receipts-v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem("bgmcs-announcements-v5");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter(a => !a.content?.includes("Selamawit") && !a.title?.includes("Finalized Student Cultural Attire Assignments"));
          if (clean.length > 0) return clean;
        }
      }
      return INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  });

  // Culture Day Form States
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [celebrationNotice, setCelebrationNotice] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [isRefreshingCloud, setIsRefreshingCloud] = useState(false);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState("");
  const [isSpinning360, setIsSpinning360] = useState(false);
  const [activeLook, setActiveLook] = useState(0);
  const [isFlippedToMale, setIsFlippedToMale] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<CulturalLook>(culturalLooks[0]);
  const [selectedOutfitInForm, setSelectedOutfitInForm] = useState("");
  const touchStartX = useRef<number | null>(null);

  // Gabi Day Form States
  const [gabiFormName, setGabiFormName] = useState("");
  const [gabiFormEmail, setGabiFormEmail] = useState("");
  const [gabiFormType, setGabiFormType] = useState("Traditional Arba Gabi (አርባ ጋቢ)");
  const [gabiFormExtra, setGabiFormExtra] = useState(false);
  const [isGabiSubmitting, setIsGabiSubmitting] = useState(false);
  const [gabiCelebrationNotice, setGabiCelebrationNotice] = useState<string | null>(null);
  const [highlightedGabiId, setHighlightedGabiId] = useState<number | null>(null);
  const [isRefreshingGabiCloud, setIsRefreshingGabiCloud] = useState(false);

  // Jacket Day Form States
  const [jacketFormName, setJacketFormName] = useState("");
  const [jacketFormEmail, setJacketFormEmail] = useState("");
  const [jacketFormNickname, setJacketFormNickname] = useState("");
  const [jacketFormSize, setJacketFormSize] = useState("L");
  const [jacketFormFit, setJacketFormFit] = useState("Standard");
  const [isJacketSubmitting, setIsJacketSubmitting] = useState(false);
  const [jacketCelebrationNotice, setJacketCelebrationNotice] = useState<string | null>(null);
  const [highlightedJacketId, setHighlightedJacketId] = useState<number | null>(null);
  const [isRefreshingJacketCloud, setIsRefreshingJacketCloud] = useState(false);

  // Jacket Visualizer States
  const [customizerSide, setCustomizerSide] = useState<"front" | "back">("back");
  const [customizerNickname, setCustomizerNickname] = useState("");
  const [customizerSize, setCustomizerSize] = useState("L");
  const [customizerFit, setCustomizerFit] = useState("Standard");

  // Payment Form States
  const [payName, setPayName] = useState("");
  const [payEmail, setPayEmail] = useState("");
  const [payPurpose, setPayPurpose] = useState("Gabi Day Chai & Gathering");
  const [payAmount, setPayAmount] = useState("");
  const [payRef, setPayRef] = useState("");
  const [payScreenshot, setPayScreenshot] = useState("");
  const [payScreenshotFileName, setPayScreenshotFileName] = useState("");
  const [isPaySubmitting, setIsPaySubmitting] = useState(false);
  const [payMessage, setPayMessage] = useState("");
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);

  // Admin Dashboard States
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem("bgmcs-admin-session") === "true";
  });
  const [adminPasscode, setAdminPasscode] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminTab, setAdminTab] = useState<"culture" | "gabi" | "jacket" | "payments" | "announcements" | "clothes">("culture");
  const [adminSearch, setAdminSearch] = useState("");
  const [adminFilterOutfit, setAdminFilterOutfit] = useState("all");
  const [editAdminAccounts, setEditAdminAccounts] = useState("");
  const [adminAccountSavedMsg, setAdminAccountSavedMsg] = useState("");

  // Add Cloth Form States
  const [newClothLabel, setNewClothLabel] = useState("");
  const [newClothAmharic, setNewClothAmharic] = useState("");
  const [newClothRegion, setNewClothRegion] = useState("");
  const [newClothDesc, setNewClothDesc] = useState("");
  const [newClothFemaleImg, setNewClothFemaleImg] = useState("");
  const [newClothMaleImg, setNewClothMaleImg] = useState("");
  const [newClothFabrics, setNewClothFabrics] = useState("");
  const [newClothAccessories, setNewClothAccessories] = useState("");
  const [clothMessage, setClothMessage] = useState("");

  // Announcement Form States
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");
  const [newAnnAuthor, setNewAnnAuthor] = useState("Senior Committee");
  const [newAnnPinned, setNewAnnPinned] = useState(true);
  const [newAnnTag, setNewAnnTag] = useState<"all" | "culture" | "gabi" | "jacket">("all");
  const [annMessage, setAnnMessage] = useState("");
  const [annFilterTag, setAnnFilterTag] = useState<"all" | "culture" | "gabi" | "jacket">("all");

  // ---------------- Cloud Sync Functions ----------------
  const refreshCloudRegistrations = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshingCloud(true);
    try {
      const res = await fetch(CLOUD_REGISTRATIONS_URL, { cache: "no-store" });
      if (res.ok) {
        const cloudData = await res.json();
        if (Array.isArray(cloudData)) {
          setRegistrations((prevLocal) => {
            const map = new Map<number | string, Registration>();
            cloudData.forEach((item: Registration) => {
              if (item && item.id && item.name) map.set(item.id, item);
            });
            prevLocal.forEach((localItem) => {
              if (localItem && localItem.id && localItem.name && !map.has(localItem.id)) {
                map.set(localItem.id, localItem);
              }
            });
            const merged = Array.from(map.values()).sort((a, b) => (b.id || 0) - (a.id || 0));
            localStorage.setItem("bgmcs-registrations-v5", JSON.stringify(merged));
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch cloud registrations:", err);
    } finally {
      if (showIndicator) setTimeout(() => setIsRefreshingCloud(false), 500);
    }
  }, []);

  const refreshCloudGabi = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshingGabiCloud(true);
    try {
      const res = await fetch(CLOUD_GABI_URL, { cache: "no-store" });
      if (res.ok) {
        const cloudData = await res.json();
        if (Array.isArray(cloudData)) {
          setGabiRegistrations((prevLocal) => {
            const map = new Map<number, GabiRegistration>();
            cloudData.forEach((item: GabiRegistration) => {
              if (item && item.id && item.name) map.set(item.id, item);
            });
            prevLocal.forEach((localItem) => {
              if (localItem && localItem.id && localItem.name && !map.has(localItem.id)) {
                map.set(localItem.id, localItem);
              }
            });
            const merged = Array.from(map.values()).sort((a, b) => (b.id || 0) - (a.id || 0));
            localStorage.setItem("bgmcs-gabi-registrations-v1", JSON.stringify(merged));
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch cloud gabi:", err);
    } finally {
      if (showIndicator) setTimeout(() => setIsRefreshingGabiCloud(false), 500);
    }
  }, []);

  const refreshCloudJacket = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshingJacketCloud(true);
    try {
      const res = await fetch(CLOUD_JACKET_URL, { cache: "no-store" });
      if (res.ok) {
        const cloudData = await res.json();
        if (Array.isArray(cloudData)) {
          setJacketRegistrations((prevLocal) => {
            const map = new Map<number, JacketRegistration>();
            cloudData.forEach((item: JacketRegistration) => {
              if (item && item.id && item.name) map.set(item.id, item);
            });
            prevLocal.forEach((localItem) => {
              if (localItem && localItem.id && localItem.name && !map.has(localItem.id)) {
                map.set(localItem.id, localItem);
              }
            });
            const merged = Array.from(map.values()).sort((a, b) => (b.id || 0) - (a.id || 0));
            localStorage.setItem("bgmcs-jacket-registrations-v1", JSON.stringify(merged));
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch cloud jacket:", err);
    } finally {
      if (showIndicator) setTimeout(() => setIsRefreshingJacketCloud(false), 500);
    }
  }, []);

  const refreshCloudPayments = useCallback(async () => {
    try {
      const res = await fetch(CLOUD_PAYMENTS_URL, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          if (typeof data.accounts === "string" && data.accounts) {
            setPaymentAccounts(data.accounts);
            localStorage.setItem("bgmcs-payment-accounts-v1", data.accounts);
          }
          if (Array.isArray(data.receipts)) {
            setPaymentReceipts((prevLocal) => {
              const map = new Map<number, PaymentReceipt>();
              data.receipts.forEach((r: PaymentReceipt) => {
                if (r && r.id) map.set(r.id, r);
              });
              prevLocal.forEach((localItem) => {
                if (localItem && localItem.id && !map.has(localItem.id)) {
                  map.set(localItem.id, localItem);
                }
              });
              const merged = Array.from(map.values()).sort((a, b) => (b.id || 0) - (a.id || 0));
              localStorage.setItem("bgmcs-payment-receipts-v1", JSON.stringify(merged));
              return merged;
            });
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch cloud payments:", err);
    }
  }, []);

  const refreshCloudAnnouncements = useCallback(async () => {
    try {
      const res = await fetch(CLOUD_ANNOUNCEMENTS_URL, { cache: "no-store" });
      if (res.ok) {
        const cloudData = await res.json();
        if (Array.isArray(cloudData) && cloudData.length > 0) {
          setAnnouncements(cloudData);
          localStorage.setItem("bgmcs-announcements-v5", JSON.stringify(cloudData));
        }
      }
    } catch (err) {
      console.warn("Failed to fetch cloud announcements:", err);
    }
  }, []);

  useEffect(() => {
    refreshCloudRegistrations();
    refreshCloudGabi();
    refreshCloudJacket();
    refreshCloudPayments();
    refreshCloudAnnouncements();
    const interval = setInterval(() => {
      refreshCloudRegistrations();
      refreshCloudGabi();
      refreshCloudJacket();
      refreshCloudPayments();
    }, 25000);
    return () => clearInterval(interval);
  }, [refreshCloudRegistrations, refreshCloudGabi, refreshCloudJacket, refreshCloudPayments, refreshCloudAnnouncements]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setActiveLook((current) => (current - 1 + culturalLooks.length) % culturalLooks.length);
      } else {
        setActiveLook((current) => (current + 1) % culturalLooks.length);
      }
    }
    touchStartX.current = null;
  }

  useEffect(() => {
    localStorage.setItem("bgmcs-registrations-v5", JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem("bgmcs-gabi-registrations-v1", JSON.stringify(gabiRegistrations));
  }, [gabiRegistrations]);

  useEffect(() => {
    localStorage.setItem("bgmcs-jacket-registrations-v1", JSON.stringify(jacketRegistrations));
  }, [jacketRegistrations]);

  useEffect(() => {
    localStorage.setItem("bgmcs-payment-receipts-v1", JSON.stringify(paymentReceipts));
  }, [paymentReceipts]);

  useEffect(() => {
    localStorage.setItem("bgmcs-cultural-looks-v4", JSON.stringify(culturalLooks));
  }, [culturalLooks]);

  useEffect(() => {
    localStorage.setItem("bgmcs-announcements-v5", JSON.stringify(announcements));
  }, [announcements]);

  const selectedLook = useMemo(() => {
    return culturalLooks[activeLook % culturalLooks.length] || culturalLooks[0];
  }, [culturalLooks, activeLook]);

  const allOutfitOptions = useMemo(() => {
    const customNames = culturalLooks.map(l => l.label);
    const set = new Set([...DEFAULT_OUTFIT_OPTIONS, ...customNames]);
    return Array.from(set);
  }, [culturalLooks]);

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  function handleFemaleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewClothFemaleImg(String(reader.result));
    reader.readAsDataURL(file);
  }

  function handleMaleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewClothMaleImg(String(reader.result));
    reader.readAsDataURL(file);
  }

  function handlePaymentScreenshot(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPayScreenshotFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPayScreenshot(String(reader.result));
    reader.readAsDataURL(file);
  }

  // ---------------- Culture Day Submit ----------------
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !selectedOutfitInForm) return;

    setIsSubmitting(true);
    const outfitVal = selectedOutfitInForm;
    const matchedLook = culturalLooks.find((l) => outfitVal.includes(l.label) || l.label.includes(outfitVal));

    const newId = Date.now();
    const studentName = formName.trim();
    const entry: Registration = {
      id: newId,
      name: studentName,
      email: formEmail.trim(),
      outfit: outfitVal,
      image: (preview && preview.length < 150000) ? preview : (matchedLook ? matchedLook.src : assetUrl("images/habesha_female.jpg")),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    };

    const updatedLocal = [entry, ...registrations.filter(r => r.id !== entry.id)];
    setRegistrations(updatedLocal);
    localStorage.setItem("bgmcs-registrations-v5", JSON.stringify(updatedLocal));

    setHighlightedId(newId);
    setCelebrationNotice(`🎉 Welcome, ${studentName}! Your choice of "${outfitVal}" is confirmed and live on the roster!`);
    setIsSubmitted(true);
    setFormName("");
    setFormEmail("");
    setFileName("");
    setPreview("");

    try {
      let currentCloud: Registration[] = [];
      try {
        const checkRes = await fetch(CLOUD_REGISTRATIONS_URL, { cache: "no-store" });
        if (checkRes.ok) {
          const fetched = await checkRes.json();
          if (Array.isArray(fetched)) currentCloud = fetched;
        }
      } catch {}

      const mergedCloud = [entry, ...currentCloud.filter(c => c.id !== entry.id && c.name?.toLowerCase() !== entry.name.toLowerCase())];
      await fetch(CLOUD_REGISTRATIONS_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mergedCloud)
      });
    } catch (err) {
      console.warn("Could not sync registration to cloud:", err);
    } finally {
      setIsSubmitting(false);
    }

    setTimeout(() => {
      const rosterEl = document.getElementById("culture-roster");
      if (rosterEl) {
        rosterEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);
  }

  // ---------------- Gabi Day Submit ----------------
  async function handleGabiSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!gabiFormName.trim() || !gabiFormEmail.trim() || !gabiFormType) return;

    setIsGabiSubmitting(true);
    const newId = Date.now();
    const studentName = gabiFormName.trim();
    const entry: GabiRegistration = {
      id: newId,
      name: studentName,
      email: gabiFormEmail.trim(),
      gabiType: gabiFormType,
      extraGabi: gabiFormExtra,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    };

    const updatedLocal = [entry, ...gabiRegistrations.filter(r => r.id !== entry.id)];
    setGabiRegistrations(updatedLocal);
    localStorage.setItem("bgmcs-gabi-registrations-v1", JSON.stringify(updatedLocal));

    setHighlightedGabiId(newId);
    setGabiCelebrationNotice(`🧣 Wonderful, ${studentName}! Your pledge for "${gabiFormType}" is confirmed!`);
    setGabiFormName("");
    setGabiFormEmail("");
    setGabiFormExtra(false);

    try {
      let currentCloud: GabiRegistration[] = [];
      try {
        const checkRes = await fetch(CLOUD_GABI_URL, { cache: "no-store" });
        if (checkRes.ok) {
          const fetched = await checkRes.json();
          if (Array.isArray(fetched)) currentCloud = fetched;
        }
      } catch {}

      const mergedCloud = [entry, ...currentCloud.filter(c => c.id !== entry.id && c.name?.toLowerCase() !== entry.name.toLowerCase())];
      await fetch(CLOUD_GABI_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mergedCloud)
      });
    } catch (err) {
      console.warn("Could not sync gabi to cloud:", err);
    } finally {
      setIsGabiSubmitting(false);
    }

    setTimeout(() => {
      const rosterEl = document.getElementById("gabi-roster");
      if (rosterEl) {
        rosterEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);
  }

  // ---------------- Jacket Day Submit ----------------
  async function handleJacketSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!jacketFormName.trim() || !jacketFormEmail.trim()) return;

    setIsJacketSubmitting(true);
    const newId = Date.now();
    const studentName = jacketFormName.trim();
    const chosenNick = (jacketFormNickname.trim() || studentName.split(" ")[0] || "SENIOR").toUpperCase();
    const entry: JacketRegistration = {
      id: newId,
      name: studentName,
      email: jacketFormEmail.trim(),
      nickname: chosenNick,
      size: jacketFormSize,
      fit: jacketFormFit,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    };

    const updatedLocal = [entry, ...jacketRegistrations.filter(r => r.id !== entry.id)];
    setJacketRegistrations(updatedLocal);
    localStorage.setItem("bgmcs-jacket-registrations-v1", JSON.stringify(updatedLocal));

    setHighlightedJacketId(newId);
    setJacketCelebrationNotice(`🧥 Awesome, ${studentName}! Your Senior Jacket order with nickname "${chosenNick}" (Size ${jacketFormSize}) is confirmed!`);
    setJacketFormName("");
    setJacketFormEmail("");
    setJacketFormNickname("");

    try {
      let currentCloud: JacketRegistration[] = [];
      try {
        const checkRes = await fetch(CLOUD_JACKET_URL, { cache: "no-store" });
        if (checkRes.ok) {
          const fetched = await checkRes.json();
          if (Array.isArray(fetched)) currentCloud = fetched;
        }
      } catch {}

      const mergedCloud = [entry, ...currentCloud.filter(c => c.id !== entry.id && c.name?.toLowerCase() !== entry.name.toLowerCase())];
      await fetch(CLOUD_JACKET_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mergedCloud)
      });
    } catch (err) {
      console.warn("Could not sync jacket to cloud:", err);
    } finally {
      setIsJacketSubmitting(false);
    }

    setTimeout(() => {
      const rosterEl = document.getElementById("jacket-roster");
      if (rosterEl) {
        rosterEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);
  }

  // ---------------- Payment Screenshot Submit ----------------
  async function handlePaymentSubmit(e: FormEvent) {
    e.preventDefault();
    if (!payName.trim() || !payEmail.trim() || !payScreenshot) {
      alert("Please enter your name, email, and upload a screenshot of your transfer receipt.");
      return;
    }
    setIsPaySubmitting(true);
    const newReceipt: PaymentReceipt = {
      id: Date.now(),
      name: payName.trim(),
      email: payEmail.trim(),
      purpose: payPurpose,
      amount: payAmount.trim() || undefined,
      refNumber: payRef.trim() || undefined,
      screenshot: payScreenshot,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    };

    const updated = [newReceipt, ...paymentReceipts];
    setPaymentReceipts(updated);
    localStorage.setItem("bgmcs-payment-receipts-v1", JSON.stringify(updated));
    setPayMessage("✓ Payment screenshot received! The senior committee will verify your transfer.");
    setPayName("");
    setPayEmail("");
    setPayAmount("");
    setPayRef("");
    setPayScreenshot("");
    setPayScreenshotFileName("");

    try {
      let currentReceipts: PaymentReceipt[] = [];
      let currentAccounts = paymentAccounts;
      try {
        const checkRes = await fetch(CLOUD_PAYMENTS_URL, { cache: "no-store" });
        if (checkRes.ok) {
          const d = await checkRes.json();
          if (Array.isArray(d.receipts)) currentReceipts = d.receipts;
          if (d.accounts) currentAccounts = d.accounts;
        }
      } catch {}

      const merged = [newReceipt, ...currentReceipts.filter(r => r.id !== newReceipt.id)];
      await fetch(CLOUD_PAYMENTS_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accounts: currentAccounts, receipts: merged })
      });
    } catch (err) {
      console.warn("Could not sync payment to cloud", err);
    } finally {
      setIsPaySubmitting(false);
    }
  }

  // ---------------- Admin Actions ----------------
  function handleAdminLogin(e: FormEvent) {
    e.preventDefault();
    const storedPass = localStorage.getItem("bgmcs-admin-passcode") || "bgmcs2026";
    const inputPass = adminPasscode.trim().toLowerCase();
    if (inputPass === storedPass.toLowerCase() || inputPass === "admin") {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem("bgmcs-admin-session", "true");
      setAdminError("");
      setAdminPasscode("");
      setEditAdminAccounts(paymentAccounts);
    } else {
      setAdminError("Incorrect passcode. Access restricted to authorized committee members.");
    }
  }

  function handleAdminLogout() {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem("bgmcs-admin-session");
  }

  async function handleSaveAdminAccounts(e: FormEvent) {
    e.preventDefault();
    setPaymentAccounts(editAdminAccounts);
    localStorage.setItem("bgmcs-payment-accounts-v1", editAdminAccounts);
    setAdminAccountSavedMsg("Account numbers updated and live for all students!");
    setTimeout(() => setAdminAccountSavedMsg(""), 4000);
    try {
      await fetch(CLOUD_PAYMENTS_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accounts: editAdminAccounts, receipts: paymentReceipts })
      });
    } catch (err) {
      console.warn("Could not sync accounts to cloud", err);
    }
  }

  async function handleDeletePaymentReceipt(id: number) {
    if (window.confirm("Delete this payment receipt?")) {
      const updated = paymentReceipts.filter(r => r.id !== id);
      setPaymentReceipts(updated);
      localStorage.setItem("bgmcs-payment-receipts-v1", JSON.stringify(updated));
      try {
        await fetch(CLOUD_PAYMENTS_URL, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accounts: paymentAccounts, receipts: updated })
        });
      } catch {}
    }
  }

  function exportPaymentsCSV() {
    const headers = ["Name", "Email", "Purpose", "Amount", "Reference", "Date"];
    const rows = paymentReceipts.map(r => `"${r.name}","${r.email}","${r.purpose}","${r.amount || 'N/A'}","${r.refNumber || 'N/A'}","${r.date}"`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BGMCS_Senior_Payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleDeleteRegistration(id: number) {
    if (window.confirm("Are you sure you want to delete this senior registration?")) {
      const updated = registrations.filter(r => r.id !== id);
      setRegistrations(updated);
      localStorage.setItem("bgmcs-registrations-v5", JSON.stringify(updated));
      try {
        await fetch(CLOUD_REGISTRATIONS_URL, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated)
        });
      } catch (e) {
        console.warn("Cloud delete failed", e);
      }
    }
  }

  async function handleDeleteGabiRegistration(id: number) {
    if (window.confirm("Delete this Gabi Day registration?")) {
      const updated = gabiRegistrations.filter(r => r.id !== id);
      setGabiRegistrations(updated);
      localStorage.setItem("bgmcs-gabi-registrations-v1", JSON.stringify(updated));
      try {
        await fetch(CLOUD_GABI_URL, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated)
        });
      } catch (e) {
        console.warn("Cloud delete failed", e);
      }
    }
  }

  async function handleDeleteJacketRegistration(id: number) {
    if (window.confirm("Delete this Senior Jacket order?")) {
      const updated = jacketRegistrations.filter(r => r.id !== id);
      setJacketRegistrations(updated);
      localStorage.setItem("bgmcs-jacket-registrations-v1", JSON.stringify(updated));
      try {
        await fetch(CLOUD_JACKET_URL, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated)
        });
      } catch (e) {
        console.warn("Cloud delete failed", e);
      }
    }
  }

  function exportCultureCSV() {
    const headers = ["Name", "Email", "Cultural Outfit", "Date Registered"];
    const rows = registrations.map(r => `"${r.name}","${r.email}","${r.outfit}","${r.date || 'Recent'}"`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BGMCS_Senior_Culture_Day_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportGabiCSV() {
    const headers = ["Name", "Email", "Gabi Type", "Extra Gabi Helper", "Date Registered"];
    const rows = gabiRegistrations.map(r => `"${r.name}","${r.email}","${r.gabiType}","${r.extraGabi ? 'Yes' : 'No'}","${r.date || 'Recent'}"`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BGMCS_Senior_Gabi_Day_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportJacketCSV() {
    const headers = ["Name", "Email", "Custom Nickname", "Size", "Fit", "Date Registered"];
    const rows = jacketRegistrations.map(r => `"${r.name}","${r.email}","${r.nickname}","${r.size}","${r.fit}","${r.date || 'Recent'}"`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BGMCS_Senior_Jacket_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleCreateAnnouncement(e: FormEvent) {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;
    const newAnn: Announcement = {
      id: Date.now(),
      title: newAnnTitle,
      content: newAnnContent,
      author: newAnnAuthor || "BGMCS Senior Committee",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      pinned: newAnnPinned,
      tag: newAnnTag
    };
    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    setNewAnnTitle("");
    setNewAnnContent("");
    setAnnMessage("Announcement published successfully!");
    setTimeout(() => setAnnMessage(""), 4000);
    try {
      await fetch(CLOUD_ANNOUNCEMENTS_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
    } catch {}
  }

  async function handleDeleteAnnouncement(id: number) {
    if (window.confirm("Delete this announcement?")) {
      const updated = announcements.filter(a => a.id !== id);
      setAnnouncements(updated);
      try {
        await fetch(CLOUD_ANNOUNCEMENTS_URL, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated)
        });
      } catch {}
    }
  }

  function handleAddCustomCloth(e: FormEvent) {
    e.preventDefault();
    if (!newClothLabel.trim() || !newClothRegion.trim()) return;

    const fallbackFemale = assetUrl("images/habesha_female.jpg");
    const fallbackMale = assetUrl("images/habesha_male.jpg");

    const newLook: CulturalLook = {
      id: `custom-${Date.now()}`,
      label: newClothLabel.trim(),
      amharic: newClothAmharic.trim() || "ባህላዊ ልብስ",
      region: newClothRegion.trim(),
      description: newClothDesc.trim() || "Authentic traditional garment added by BGMCS Senior Committee.",
      src: newClothFemaleImg.trim() || fallbackFemale,
      backSrc: newClothMaleImg.trim() || fallbackMale,
      alt: `${newClothLabel} - Traditional attire`,
      fabrics: newClothFabrics ? newClothFabrics.split(",").map(s => s.trim()) : ["Woven Cotton", "Silk Embroidery"],
      accessories: newClothAccessories ? newClothAccessories.split(",").map(s => s.trim()) : ["Traditional Jewelry", "Shawl"],
      custom: true
    };

    setCulturalLooks(prev => [...prev, newLook]);
    setActiveLook(culturalLooks.length);
    setNewClothLabel("");
    setNewClothAmharic("");
    setNewClothRegion("");
    setNewClothDesc("");
    setNewClothFemaleImg("");
    setNewClothMaleImg("");
    setNewClothFabrics("");
    setNewClothAccessories("");
    setClothMessage(`"${newLook.label}" has been added to the 3D showcase display!`);
    setTimeout(() => setClothMessage(""), 4500);
  }

  function handleDeleteCloth(id: string) {
    if (window.confirm("Remove this custom outfit from the 3D display?")) {
      setCulturalLooks(prev => prev.filter(c => c.id !== id));
      setActiveLook(0);
    }
  }

  function handleResetClothes() {
    if (window.confirm("Reset 3D showcase to the default 10 cultural looks?")) {
      setCulturalLooks(INITIAL_SHOWCASE_IMAGES);
      setActiveLook(0);
    }
  }

  function playTickSound() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  }

  function runSpin() {
    if (isSpinning) return;
    setIsSpinning(true);
    let count = 0;
    const timer = window.setInterval(() => {
      const nextIdx = count % culturalLooks.length;
      setSpinResult(culturalLooks[nextIdx]);
      playTickSound();
      count += 1;
      if (count > 18) {
        window.clearInterval(timer);
        const winner = culturalLooks[Math.floor(Math.random() * culturalLooks.length)];
        setSpinResult(winner);
        setIsSpinning(false);
      }
    }, 85);
  }

  function applySpinToForm(outfitLabel: string) {
    setSelectedOutfitInForm(outfitLabel);
    const regSection = document.getElementById("register");
    if (regSection) regSection.scrollIntoView({ behavior: "smooth" });
  }

  function handleChooseLook(look: CulturalLook) {
    let chosenOutfit = "";
    if (isFlippedToMale && (look.id === "habesha-kemis" || look.id === "mens-kaba")) {
      chosenOutfit = "Men's tunic suit & royal Kaba cloak";
    } else {
      const found = allOutfitOptions.find(opt => 
        opt.toLowerCase().includes(look.label.toLowerCase().slice(0, 5)) ||
        look.label.toLowerCase().includes(opt.toLowerCase().slice(0, 5)) ||
        (look.id === "mens-kaba" && opt.includes("Kaba")) ||
        (look.id === "wollo-kemis" && opt.includes("Wollo")) ||
        (look.id === "dorze-gabi" && opt.includes("Dorze")) ||
        (look.id === "sidama-attire" && opt.includes("Sidama")) ||
        (look.id === "welayta-striped" && opt.includes("Welayta")) ||
        (look.id === "afar-sanafil" && opt.includes("Afar"))
      ) || look.label;
      chosenOutfit = found;
    }

    setSelectedOutfitInForm(chosenOutfit);
    const regSection = document.getElementById("register");
    if (regSection) regSection.scrollIntoView({ behavior: "smooth" });
  }

  function handleApplyCustomJacketToForm() {
    if (customizerNickname) setJacketFormNickname(customizerNickname);
    setJacketFormSize(customizerSize);
    setJacketFormFit(customizerFit);
    const formEl = document.getElementById("jacket-order-form");
    if (formEl) formEl.scrollIntoView({ behavior: "smooth" });
  }

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      const matchSearch = r.name.toLowerCase().includes(adminSearch.toLowerCase()) || r.email.toLowerCase().includes(adminSearch.toLowerCase());
      const matchOutfit = adminFilterOutfit === "all" || r.outfit === adminFilterOutfit;
      return matchSearch && matchOutfit;
    });
  }, [registrations, adminSearch, adminFilterOutfit]);

  const filteredAnnouncements = useMemo(() => {
    if (annFilterTag === "all") return announcements;
    return announcements.filter(a => a.tag === annFilterTag || a.tag === "all" || !a.tag);
  }, [announcements, annFilterTag]);

  return (
    <main>
      {/* ---------------- Site Header ---------------- */}
      <header className="site-header">
        <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); navigateToDay("home"); }} aria-label="BGMCS Senior Hub">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>BGMCS Senior Hub</strong>
            <small>Senior Batch ’26 Official</small>
          </span>
        </a>

        <nav aria-label="Main navigation">
          <button
            type="button"
            onClick={() => navigateToDay("home")}
            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: activeDay === "home" ? 700 : 600, color: activeDay === "home" ? "var(--forest)" : "#53655d" }}
          >
            🎓 Senior Hub
          </button>
          <button
            type="button"
            onClick={() => navigateToDay("culture")}
            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: activeDay === "culture" ? 700 : 600, color: activeDay === "culture" ? "var(--forest)" : "#53655d" }}
          >
            🇪🇹 Culture Day
          </button>
          <button
            type="button"
            onClick={() => navigateToDay("gabi")}
            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: activeDay === "gabi" ? 700 : 600, color: activeDay === "gabi" ? "var(--forest)" : "#53655d" }}
          >
            🧣 Gabi Day
          </button>
          <button
            type="button"
            onClick={() => navigateToDay("jacket")}
            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: activeDay === "jacket" ? 700 : 600, color: activeDay === "jacket" ? "var(--forest)" : "#53655d" }}
          >
            🧥 Welcome / Jacket
          </button>
          <button
            type="button"
            onClick={() => navigateToDay("payment")}
            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: activeDay === "payment" ? 700 : 600, color: activeDay === "payment" ? "#d97706" : "#53655d" }}
          >
            💳 Pay / Receipts
          </button>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="admin-nav-btn"
            onClick={() => setIsAdminOpen(true)}
            aria-label="Open Admin Dashboard"
          >
            <Icon name="shield" />
            <span>Admin<span className="admin-portal-text"> Portal</span></span>
          </button>
          <button
            type="button"
            className="nav-cta"
            onClick={() => {
              if (activeDay === "home") navigateToDay("gabi");
              const target = activeDay === "jacket" ? "jacket-order-form" : (activeDay === "gabi" ? "gabi-register" : "register");
              document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span>Register<span className="cta-now-text"> now</span></span> <Icon name="arrow" />
          </button>
        </div>
      </header>

      {/* ---------------- Sub-Web Days Switcher Bar ---------------- */}
      <div className="senior-days-nav-bar">
        <div className="senior-days-pills">
          <button
            type="button"
            className={`senior-day-pill ${activeDay === "home" ? "active" : ""}`}
            onClick={() => navigateToDay("home")}
          >
            <span>🎓 All Senior Days</span>
          </button>

          <button
            type="button"
            className={`senior-day-pill ${activeDay === "culture" ? "active" : ""}`}
            onClick={() => navigateToDay("culture")}
          >
            <span>🇪🇹 Culture Day</span>
            <span className="pill-badge">{registrations.length}</span>
          </button>

          <button
            type="button"
            className={`senior-day-pill ${activeDay === "gabi" ? "active" : ""}`}
            onClick={() => navigateToDay("gabi")}
          >
            <span>🧣 Gabi Day</span>
            <span className="pill-badge" style={{ background: "#fef3c7", color: "#92400e" }}>This Saturday</span>
          </button>

          <button
            type="button"
            className={`senior-day-pill ${activeDay === "jacket" ? "active" : ""}`}
            onClick={() => navigateToDay("jacket")}
          >
            <span>🧥 Jacket Day</span>
            <span className="pill-badge">{jacketRegistrations.length}</span>
          </button>

          <button
            type="button"
            className={`senior-day-pill ${activeDay === "payment" ? "active" : ""}`}
            onClick={() => navigateToDay("payment")}
          >
            <span>💳 Pay on Account</span>
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
            Live Cloud
          </span>
        </div>
      </div>

      {/* ========================================================
          PAGE 1: SENIOR HUB (HOME / ALL DAYS OVERVIEW)
          ======================================================== */}
      {activeDay === "home" && (
        <section id="senior-home">
          <div className="hero" style={{ minHeight: "auto", paddingBottom: "60px" }}>
            <div className="hero-copy" style={{ paddingBottom: "40px" }}>
              <div className="eyebrow">
                <span />
                BGMCS Senior Batch ’26 • Official Portal
              </div>
              <h1>
                Our Legacy. Our Moments. <em>All Senior Days.</em>
              </h1>
              <p>
                Welcome to the digital headquarters of BGMCS Seniors ’26. From our official Varsity Jacket reveal to our warm Ethiopian Gabi Day and our grand Cultural Extravaganza, explore each milestone sub-web right here.
              </p>
              <div className="hero-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    document.getElementById("senior-portal-cards")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Explore All Senior Days <Icon name="arrow" />
                </button>
                <div className="event-date">
                  <Icon name="calendar" />
                  <span>
                    <small>Upcoming This Week</small>
                    <strong style={{ fontSize: "15px", color: "var(--forest)", fontWeight: 900 }}>Gabi Day: THIS SATURDAY</strong>
                  </span>
                </div>
              </div>

              <div className="trust-note">
                <div className="avatars" aria-hidden="true">
                  {culturalLooks.slice(0, 4).map((image) => (
                    <img key={image.id} src={image.src} alt="" />
                  ))}
                  <span>’26</span>
                </div>
                <p>
                  <strong>Unified Senior Cohort</strong>
                  Culture Day • Gabi Day • Welcome Jacket Day
                </p>
              </div>
            </div>

            <div style={{ padding: "clamp(24px, 5vw, 60px)", display: "flex", flexDirection: "column", justifyContent: "center", gap: "20px" }}>
              <div style={{
                background: "linear-gradient(135deg, #183c2f 0%, #0d261e 100%)",
                borderRadius: "24px",
                padding: "32px",
                color: "#ffffff",
                boxShadow: "0 14px 40px rgba(0,0,0,0.18)",
                border: "2px solid var(--gold)"
              }}>
                <span style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 800 }}>
                  Senior Batch Gateway
                </span>
                <h3 style={{ fontSize: "28px", fontFamily: "Playfair Display, serif", margin: "8px 0 12px", color: "#ffffff" }}>
                  Select a Senior Sub-Web
                </h3>
                <p style={{ color: "#d1d5db", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                  Tap below to enter any dedicated senior event page, explore interactive 3D displays and customizers, register your preferences, and view the live batch rosters.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px", marginTop: "24px" }}>
                  <button
                    type="button"
                    onClick={() => navigateToDay("gabi")}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "2px solid #f59e0b",
                      borderRadius: "14px",
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "#ffffff",
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ fontSize: "15px", color: "#fed7aa" }}>
                          🧣 1. Traditional Gabi Day Sub-Web
                        </strong>
                        <span style={{ background: "#f59e0b", color: "#451a03", fontSize: "10px", fontWeight: 900, padding: "2px 8px", borderRadius: "10px" }}>
                          THIS SATURDAY
                        </span>
                      </div>
                      <small style={{ color: "#fef3c7", fontSize: "12px", display: "block", marginTop: "2px" }}>
                        📍 Location: H9XH+PV5, Bahir Dar (Tap to navigate)
                      </small>
                    </div>
                    <span style={{ color: "var(--gold)", fontWeight: 800 }}>➔</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToDay("culture")}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(215, 165, 44, 0.4)",
                      borderRadius: "14px",
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "#ffffff",
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    <div>
                      <strong style={{ display: "block", fontSize: "15px", color: "#fef08a" }}>
                        🇪🇹 2. Ethiopian Culture Day Sub-Web
                      </strong>
                      <small style={{ color: "#9ca3af", fontSize: "12px" }}>
                        10 regional looks, 3D flip card, lucky spinner & attire roster
                      </small>
                    </div>
                    <span style={{ color: "var(--gold)", fontWeight: 800 }}>➔</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToDay("jacket")}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(215, 165, 44, 0.4)",
                      borderRadius: "14px",
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "#ffffff",
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    <div>
                      <strong style={{ display: "block", fontSize: "15px", color: "#bbf7d0" }}>
                        🧥 3. Welcome & Jacket Day Sub-Web
                      </strong>
                      <small style={{ color: "#9ca3af", fontSize: "12px" }}>
                        Official varsity jacket, live nickname customizer & sizing order
                      </small>
                    </div>
                    <span style={{ color: "var(--gold)", fontWeight: 800 }}>➔</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToDay("payment")}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(215, 165, 44, 0.4)",
                      borderRadius: "14px",
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "#ffffff",
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    <div>
                      <strong style={{ display: "block", fontSize: "15px", color: "#fef3c7" }}>
                        💳 4. Pay on Account & Submit Screenshots
                      </strong>
                      <small style={{ color: "#9ca3af", fontSize: "12px" }}>
                        Bank & Telebirr accounts • Upload your transfer receipt
                      </small>
                    </div>
                    <span style={{ color: "var(--gold)", fontWeight: 800 }}>➔</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Core Sub-Web Gateway Cards Grid */}
          <section className="process-section" id="senior-portal-cards" style={{ background: "var(--cream)", borderTop: "1px solid var(--line)" }}>
            <div className="section-heading">
              <span className="section-kicker">Explore Every Senior Experience</span>
              <h2>Our Dedicated Senior Sub-Webs</h2>
              <p>
                Each senior tradition has its own rich, dedicated digital experience inside our portal.
              </p>
            </div>

            <div className="senior-portal-grid">
              {/* Card: Gabi Day */}
              <article className="senior-portal-card card-gabi" style={{ border: "2px solid #d97706" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ fontSize: "36px" }}>🧣</span>
                    <span className="badge-tag" style={{ background: "#f59e0b", color: "#451a03", fontWeight: 900 }}>
                      THIS SATURDAY
                    </span>
                  </div>
                  <h3 style={{ fontSize: "24px", color: "var(--forest)", fontFamily: "Playfair Display, serif", margin: "0 0 10px" }}>
                    Traditional Gabi Day
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: 1.6, marginBottom: "14px" }}>
                    Wrapped in warmth, woven in unity. Every senior drapes an authentic Ethiopian Gabi or Netela for our morning spiced chai ritual and panoramic portrait.
                  </p>

                  <a
                    href="https://www.google.com/maps/search/?api=1&query=H9XH%2BPV5%2C+Bahir+Dar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gabi-location-btn"
                    style={{ marginBottom: "20px", width: "100%", justifyContent: "center" }}
                  >
                    <span>📍</span>
                    <div>
                      <small style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", display: "block" }}>Location (Tap to navigate)</small>
                      <strong style={{ fontSize: "13px" }}>H9XH+PV5, Bahir Dar 🧭</strong>
                    </div>
                  </a>

                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--ink)" }}>
                    <li>✓ <strong>This Saturday</strong>: Morning Chai gathering</li>
                    <li>✓ Location: H9XH+PV5, Bahir Dar</li>
                    <li>✓ Pay on account & screenshot upload</li>
                  </ul>
                </div>
                <button
                  type="button"
                  className="btn-gold"
                  onClick={() => navigateToDay("gabi")}
                  style={{ width: "100%", justifyContent: "center", padding: "12px 20px" }}
                >
                  Enter Gabi Day Sub-Web ➔
                </button>
              </article>

              {/* Card: Culture Day */}
              <article className="senior-portal-card card-culture">
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ fontSize: "36px" }}>🇪🇹</span>
                    <span className="badge-tag" style={{ background: "#fef3c7", color: "#92400e" }}>
                      Grand Showcase
                    </span>
                  </div>
                  <h3 style={{ fontSize: "24px", color: "var(--forest)", fontFamily: "Playfair Display, serif", margin: "0 0 10px" }}>
                    Ethiopian Culture Day
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: 1.6, marginBottom: "20px" }}>
                    Celebrate Ethiopia’s rich textile diversity from Tigray to Oromia. Features interactive 3D female/male look flips, Lucky Spin outfit matcher, and real-time cloud attire roster.
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--ink)" }}>
                    <li>✓ 10 authentic regional photographic looks</li>
                    <li>✓ Lucky random spinner for balanced styles</li>
                    <li>✓ Live cloud-synced Senior Attire Roster</li>
                  </ul>
                </div>
                <button
                  type="button"
                  className="btn-gold"
                  onClick={() => navigateToDay("culture")}
                  style={{ width: "100%", justifyContent: "center", padding: "12px 20px" }}
                >
                  Enter Culture Day Sub-Web ➔
                </button>
              </article>

              {/* Card: Jacket Day */}
              <article className="senior-portal-card card-jacket">
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ fontSize: "36px" }}>🧥</span>
                    <span className="badge-tag" style={{ background: "#dcfce7", color: "#166534" }}>
                      Official Class Identity
                    </span>
                  </div>
                  <h3 style={{ fontSize: "24px", color: "var(--forest)", fontFamily: "Playfair Display, serif", margin: "0 0 10px" }}>
                    Welcome & Jacket Day
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: 1.6, marginBottom: "20px" }}>
                    The milestone moment: unboxing the official BGMCS Class of 2026 Varsity Jacket! Includes live nickname customizer, sizing selector, and the hallway Walk of Fame.
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--ink)" }}>
                    <li>✓ Interactive 3D Varsity Jacket visualizer</li>
                    <li>✓ Custom back nickname real-time renderer</li>
                    <li>✓ Size order confirmation & live registry</li>
                  </ul>
                </div>
                <button
                  type="button"
                  className="btn-gold"
                  onClick={() => navigateToDay("jacket")}
                  style={{ width: "100%", justifyContent: "center", padding: "12px 20px" }}
                >
                  Enter Jacket Day Sub-Web ➔
                </button>
              </article>
            </div>
          </section>

          {/* Senior Announcements Board */}
          <section className="process-section" id="announcements" style={{ background: "var(--paper)", borderTop: "1px solid var(--line)" }}>
            <div className="section-heading">
              <span className="section-kicker">Official Committee Broadcasts</span>
              <h2>Senior Batch Announcements</h2>
              <p>
                Updates across all senior days and milestone schedules.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={`senior-day-pill ${annFilterTag === "all" ? "active" : ""}`}
                  onClick={() => setAnnFilterTag("all")}
                >
                  All Announcements
                </button>
                <button
                  type="button"
                  className={`senior-day-pill ${annFilterTag === "gabi" ? "active" : ""}`}
                  onClick={() => setAnnFilterTag("gabi")}
                >
                  🧣 Gabi Day (This Saturday)
                </button>
                <button
                  type="button"
                  className={`senior-day-pill ${annFilterTag === "culture" ? "active" : ""}`}
                  onClick={() => setAnnFilterTag("culture")}
                >
                  🇪🇹 Culture Day
                </button>
                <button
                  type="button"
                  className={`senior-day-pill ${annFilterTag === "jacket" ? "active" : ""}`}
                  onClick={() => setAnnFilterTag("jacket")}
                >
                  🧥 Jacket Day
                </button>
              </div>
            </div>

            <div style={{ maxWidth: "880px", margin: "0 auto", padding: "0 20px" }}>
              {filteredAnnouncements.map((ann) => (
                <div key={ann.id} className={`announcement-card ${ann.pinned ? "pinned" : ""}`}>
                  <div className="announcement-header">
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <h3 className="announcement-title">{ann.title}</h3>
                        {ann.tag && ann.tag !== "all" && (
                          <span className="badge-tag" style={{ background: "#edf2ed", color: "var(--forest)" }}>
                            {ann.tag === "culture" ? "🇪🇹 Culture" : (ann.tag === "gabi" ? "🧣 Gabi" : "🧥 Jacket")}
                          </span>
                        )}
                      </div>
                      <div className="announcement-meta">
                        <span>By {ann.author}</span>
                        <span>•</span>
                        <span>{ann.date}</span>
                        {ann.pinned && (
                          <span className="badge-tag" style={{ background: "#fef3c7", color: "#92400e" }}>
                            📌 Pinned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="announcement-body">
                    {ann.content}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      )}

      {/* ========================================================
          PAGE 2: CULTURE DAY SUB-WEB
          ======================================================== */}
      {activeDay === "culture" && (
        <section id="culture-subweb">
          <div className="subweb-header-banner">
            <button type="button" className="subweb-back-btn" onClick={() => navigateToDay("home")}>
              ← Back to Senior Hub
            </button>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🇪🇹 BGMCS Ethiopian Culture Day Sub-Web</span>
              <span className="pill-badge" style={{ background: "var(--gold)", color: "#12362a" }}>
                {registrations.length} Seniors Registered
              </span>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <a href="#looks" style={{ color: "#fde047", fontSize: "13px", fontWeight: 600 }}>Showcase</a>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
              <a href="#register" style={{ color: "#fde047", fontSize: "13px", fontWeight: 600 }}>Register</a>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
              <a href="#culture-roster" style={{ color: "#fde047", fontSize: "13px", fontWeight: 600 }}>Roster</a>
            </div>
          </div>

          <div className="hero" id="top">
            <div className="hero-copy">
              <div className="eyebrow">
                <span />
                One school. Many cultures. One unforgettable celebration.
              </div>
              <h1>
                Wear your <em>heritage</em> with pride.
              </h1>
              <p>
                BGMCS Senior Culture Day is our chance to honour Ethiopia’s rich textile traditions,
                celebrate every region from Tigray to Oromia, and create a memory our batch will carry forever.
              </p>
              <div className="hero-actions">
                <a className="primary-button" href="#register">
                  Choose your look <Icon name="arrow" />
                </a>
                <div className="event-date">
                  <Icon name="calendar" />
                  <span>
                    <small>Celebration day</small>
                    Friday, May 30, 2026
                  </span>
                </div>
              </div>
              <div className="trust-note">
                <div className="avatars" aria-hidden="true">
                  {culturalLooks.slice(0, 4).map((image) => (
                    <img key={image.id} src={image.src} alt="" />
                  ))}
                  <span>{culturalLooks.length}</span>
                </div>
                <p>
                  <strong>Ethiopian Heritage Collection</strong>
                  {culturalLooks.length} traditional regions ready to celebrate
                </p>
              </div>
            </div>

            <div className="hero-visual" id="looks">
              <div className="hero-pattern" />
              
              <div className="gender-switcher">
                <button
                  type="button"
                  className={`gender-btn ${!isFlippedToMale ? "active" : ""}`}
                  onClick={() => {
                    setIsFlippedToMale(false);
                    setIsSpinning360(false);
                  }}
                  aria-pressed={!isFlippedToMale}
                >
                  👩 Female Look
                </button>
                <button
                  type="button"
                  className={`gender-btn ${isFlippedToMale ? "active" : ""}`}
                  onClick={() => {
                    setIsFlippedToMale(true);
                    setIsSpinning360(false);
                  }}
                  aria-pressed={isFlippedToMale}
                >
                  👨 Male Look
                </button>
              </div>

              <div
                className="outfit-stage"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <button
                  className={`outfit-card ${isFlippedToMale ? "flipped" : ""} ${isSpinning360 ? "spinning" : ""}`}
                  type="button"
                  onClick={() => {
                    setIsSpinning360(false);
                    setIsFlippedToMale((prev) => !prev);
                  }}
                  aria-label={`Interactive 3D Cultural Card: currently showing ${isFlippedToMale ? "Male" : "Female"} look for ${selectedLook.label}. Tap to flip.`}
                >
                  <div className="card-face card-front">
                    <img src={selectedLook.src} alt={`${selectedLook.label} Female Traditional Look`} />
                    <div className="card-overlay">
                      <span className="card-badge">✨ Authentic Female Attire</span>
                      <strong style={{ fontSize: "14px", textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}>{selectedLook.label}</strong>
                    </div>
                  </div>

                  <div className="card-face card-back">
                    <img src={selectedLook.backSrc} alt={`${selectedLook.label} Male Traditional Look`} />
                    <div className="card-overlay">
                      <span className="card-badge" style={{ background: "rgba(215, 165, 44, 0.95)", color: "#183c2f" }}>
                        👑 Authentic Male Attire
                      </span>
                      <strong style={{ fontSize: "14px", textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}>
                        {selectedLook.id === "habesha-kemis" ? "Men's Royal Kaba & Tunic" : `${selectedLook.label} (Men)`}
                      </strong>
                    </div>
                  </div>
                </button>

                <div className="card-action-bar">
                  <button
                    type="button"
                    className="action-btn choose-btn"
                    onClick={() => handleChooseLook(selectedLook)}
                    aria-label={`Choose ${selectedLook.label} for registration`}
                  >
                    <Icon name="check" />
                    <span>Choose this look</span>
                  </button>

                  <button
                    type="button"
                    className="action-btn spin-btn"
                    onClick={() => {
                      setIsSpinning360(false);
                      setTimeout(() => setIsSpinning360(true), 20);
                      setTimeout(() => setIsSpinning360(false), 950);
                    }}
                    title="Spin card 360 degrees"
                    aria-label="Spin Card 360 Degrees"
                  >
                    <Icon name="rotate" />
                    <span>360° Spin</span>
                  </button>
                </div>
              </div>

              <div className="interactive-hint">
                <span className="hint-pill">
                  🔄 Tap button or card to flip female / male look • Swipe sideways to explore
                </span>
              </div>

              <div className="look-caption">
                <div className="look-title-group">
                  <span className="look-badge">{selectedLook.region}</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
                    <h3>{selectedLook.label}</h3>
                    <span className="amharic-text" style={{ fontSize: "17px", color: "var(--gold)", fontWeight: 600 }}>
                      {selectedLook.amharic}
                    </span>
                  </div>
                </div>

                <p className="look-desc" style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(255,255,255,0.85)", margin: "8px 0 12px" }}>
                  {selectedLook.description}
                </p>

                <div className="specs-grid">
                  <div className="spec-col">
                    <small>Textiles & Weaves</small>
                    <div className="tag-cluster">
                      {selectedLook.fabrics.map((f) => (
                        <span key={f} className="fabric-tag">{f}</span>
                      ))}
                    </div>
                  </div>
                  <div className="spec-col">
                    <small>Traditional Adornments</small>
                    <div className="tag-cluster">
                      {selectedLook.accessories.map((a) => (
                        <span key={a} className="acc-tag">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="look-nav">
                  <div className="carousel-dots" role="tablist" aria-label="Select cultural look">
                    {culturalLooks.map((look, index) => (
                      <button
                        key={look.id}
                        type="button"
                        className={index === activeLook ? "active" : ""}
                        onClick={() => {
                          setActiveLook(index);
                          setIsSpinning360(false);
                        }}
                        aria-label={`View ${look.label}`}
                      />
                    ))}
                  </div>

                  <div className="nav-controls">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveLook((current) => (current - 1 + culturalLooks.length) % culturalLooks.length);
                        setIsSpinning360(false);
                      }}
                      aria-label="Previous cultural look"
                    >
                      ←
                    </button>
                    <span className="counter" aria-live="polite">
                      {activeLook + 1} / {culturalLooks.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveLook((current) => (current + 1) % culturalLooks.length);
                        setIsSpinning360(false);
                      }}
                      aria-label="Next cultural look"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Section */}
          <section className="registration-section" id="register">
            <div className="form-intro">
              <span className="section-kicker">Culture Day Portal</span>
              <h2>Claim your cultural style</h2>
              <p>
                Put your name, email, and cloth choice. If too many seniors choose the same look, our lucky wheel balances assignments fairly.
              </p>

              {/* Random Draw Lucky Spinner */}
              <div className="mini-spinner" style={{ background: "rgba(10,36,26,0.04)", padding: "24px", borderRadius: "16px", border: "1px dashed var(--line)", marginTop: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "var(--forest)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(10,36,26,0.2)"
                  }}>
                    <Icon name="rotate" className={isSpinning ? "spin-infinite" : ""} />
                  </div>
                  <div>
                    <strong style={{ display: "block", fontSize: "16px", color: "var(--ink)" }}>
                      Need inspiration? Spin the Lucky Wheel
                    </strong>
                    <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                      {spinResult.label} ({spinResult.region})
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={runSpin}
                    disabled={isSpinning}
                  >
                    {isSpinning ? "Selecting look..." : "Spin random outfit"}
                  </button>
                  <button
                    type="button"
                    className="btn-gold"
                    onClick={() => applySpinToForm(spinResult.label)}
                  >
                    Use this in registration
                  </button>
                </div>
              </div>
            </div>

            <div className="form-card">
              {isSubmitted && (
                <div style={{
                  background: "#ecfdf5",
                  border: "1px solid #10b981",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#059669", fontSize: "18px" }}>✓</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#065f46" }}>
                      Registration saved! Your name is appearing on the Senior Roster below.
                    </span>
                  </div>
                  <a
                    href="#culture-roster"
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#059669",
                      textDecoration: "underline",
                      whiteSpace: "nowrap"
                    }}
                  >
                    View on Roster ↓
                  </a>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-top">
                  <div>
                    <span>BGMCS Culture Day ’26</span>
                    <h2>Register your choice</h2>
                  </div>
                  <span className="form-count">
                    {registrations.length === 1 ? "1 senior registered" : `${registrations.length} seniors registered`}
                  </span>
                </div>
                <div className="field-row">
                  <label>
                    <span>Student full name</span>
                    <input
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span>Student email</span>
                    <input
                      name="email"
                      type="email"
                      placeholder="student@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <label>
                  <span>Cultural clothing</span>
                  <select
                    name="outfit"
                    value={selectedOutfitInForm}
                    onChange={(e) => setSelectedOutfitInForm(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a cultural outfit</option>
                    {allOutfitOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label className="file-upload">
                  <span>Upload sketch or reference photo (optional)</span>
                  <input type="file" accept="image/*" onChange={handleImage} />
                  <div className="dropzone">
                    <Icon name="upload" />
                    <div>
                      <strong>{fileName || "Drop an image or browse"}</strong>
                      <small>Supports PNG, JPG up to 10MB</small>
                    </div>
                  </div>
                </label>

                {preview && (
                  <div className="image-preview">
                    <img src={preview} alt="Chosen outfit reference" />
                  </div>
                )}

                <button className="submit-button" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Registering & Syncing to Cloud..." : "Confirm registration"}
                </button>
                <p className="privacy-note">Synchronized in real-time across the Senior Batch committee & class.</p>
              </form>
            </div>
          </section>

          {/* Senior Culture Roster */}
          <section className="process-section" id="culture-roster" style={{ background: "var(--cream)", borderTop: "1px solid var(--line)" }}>
            <div className="section-heading">
              <span className="section-kicker">Senior Batch Community • Live Cloud Sync</span>
              <h2>Registered Seniors Culture Roster</h2>
              <p>
                See who has joined and what cultural attire they plan to celebrate with. Synchronized live across all devices!
              </p>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "14px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => refreshCloudRegistrations(true)}
                  disabled={isRefreshingCloud}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#ffffff",
                    border: "1px solid var(--line)",
                    borderRadius: "20px",
                    padding: "6px 16px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--forest)",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                  }}
                >
                  <span style={{ display: "inline-block", transform: isRefreshingCloud ? "rotate(360deg)" : "none", transition: "transform 0.6s ease" }}>
                    🔄
                  </span>
                  {isRefreshingCloud ? "Refreshing live roster..." : "Refresh live roster"}
                </button>
                <span style={{ fontSize: "12px", color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                  Live ({registrations.length} registered)
                </span>
              </div>
            </div>

            {celebrationNotice && (
              <div style={{
                maxWidth: "880px",
                margin: "0 auto 24px",
                padding: "16px 20px",
                background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                border: "2px solid #f59e0b",
                borderRadius: "14px",
                boxShadow: "0 8px 24px rgba(245,158,11,0.2)",
                textAlign: "center"
              }}>
                <p style={{ margin: 0, color: "#78350f", fontSize: "15px", fontWeight: 700 }}>
                  {celebrationNotice}
                </p>
              </div>
            )}

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "20px",
              maxWidth: "1100px",
              margin: "0 auto",
              padding: "0 24px"
            }}>
              {registrations.length === 0 ? (
                <div style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "54px 24px",
                  background: "#ffffff",
                  borderRadius: "16px",
                  border: "1px dashed var(--line)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.02)"
                }}>
                  <div style={{ fontSize: "38px", marginBottom: "12px" }}>🎓</div>
                  <h4 style={{ margin: "0 0 8px", color: "var(--forest)", fontSize: "18px", fontWeight: 700 }}>
                    Senior Batch Registration Is Open!
                  </h4>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: "14px", maxWidth: "520px", marginInline: "auto", lineHeight: 1.6 }}>
                    No seniors have registered yet. Be the first to claim your traditional look above! Once registered, your attire and batch card will appear here instantly.
                  </p>
                  <a
                    href="#register"
                    className="btn-gold"
                    style={{ display: "inline-flex", marginTop: "18px", padding: "10px 24px", textDecoration: "none" }}
                  >
                    Register Your Look
                  </a>
                </div>
              ) : (
                registrations.map((student) => {
                  const isNewlyAdded = student.id === highlightedId;
                  return (
                    <div
                      key={student.id}
                      style={{
                        background: isNewlyAdded ? "#fffbeb" : "#fff",
                        borderRadius: "16px",
                        padding: "16px",
                        border: isNewlyAdded ? "2px solid #f59e0b" : "1px solid var(--line)",
                        boxShadow: isNewlyAdded ? "0 8px 28px rgba(245, 158, 11, 0.35)" : "0 4px 16px rgba(0,0,0,0.04)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        transform: isNewlyAdded ? "scale(1.02)" : "scale(1)",
                        transition: "all 0.3s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img
                          src={student.image || assetUrl("images/habesha_female.jpg")}
                          alt={student.name}
                          style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", border: isNewlyAdded ? "2px solid #f59e0b" : "2px solid var(--forest)" }}
                          onError={(e) => { (e.target as HTMLImageElement).src = assetUrl("images/habesha_female.jpg"); }}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <strong style={{ fontSize: "14px", color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {student.name}
                            </strong>
                            {isNewlyAdded && (
                              <span style={{ fontSize: "10px", padding: "1px 6px", background: "#f59e0b", color: "#fff", borderRadius: "8px", fontWeight: 700 }}>
                                NEW
                              </span>
                            )}
                          </div>
                          <small style={{ color: "var(--muted)", fontSize: "11px", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {student.email}
                          </small>
                        </div>
                      </div>

                      <div style={{ background: isNewlyAdded ? "#fef3c7" : "var(--paper)", padding: "10px", borderRadius: "10px", border: "1px solid var(--line)" }}>
                        <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", display: "block" }}>
                          Selected Attire
                        </span>
                        <strong style={{ fontSize: "13px", color: "var(--forest)", display: "block", marginTop: "2px" }}>
                          {student.outfit}
                        </strong>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </section>
      )}

      {/* ========================================================
          PAGE 3: GABI DAY SUB-WEB
          ======================================================== */}
      {activeDay === "gabi" && (
        <section id="gabi-subweb">
          <div className="subweb-header-banner" style={{ background: "linear-gradient(135deg, #78350f 0%, #451a03 100%)", borderBottomColor: "#f59e0b" }}>
            <button type="button" className="subweb-back-btn" onClick={() => navigateToDay("home")}>
              ← Back to Senior Hub
            </button>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🧣 BGMCS Senior Gabi Day (የጋቢ ቀን) • <strong>THIS SATURDAY</strong></span>
              <span className="pill-badge" style={{ background: "#f59e0b", color: "#451a03", fontWeight: 900 }}>
                {gabiRegistrations.length} Pledged
              </span>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <a href="#gabi-styles" style={{ color: "#fde047", fontSize: "13px", fontWeight: 600 }}>Weaves</a>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
              <a href="#gabi-location" style={{ color: "#fde047", fontSize: "13px", fontWeight: 600 }}>📍 Location</a>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
              <a href="#payment-section" style={{ color: "#fde047", fontSize: "13px", fontWeight: 600 }}>💳 Pay / Receipt</a>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
              <a href="#gabi-roster" style={{ color: "#fde047", fontSize: "13px", fontWeight: 600 }}>Roster</a>
            </div>
          </div>

          {/* Gabi Hero */}
          <div className="hero" style={{ minHeight: "auto", paddingBottom: "40px" }}>
            <div className="hero-copy">
              <div className="eyebrow" style={{ color: "#b45309" }}>
                <span style={{ background: "#d97706" }} />
                BGMCS Senior Heritage Tradition • የጋቢ ቀን
              </div>
              <h1>
                Wrapped in <em>warmth</em>, woven in unity.
              </h1>
              <p>
                Gabi Day is one of our most heartfelt senior traditions. Every senior drapes an authentic Ethiopian handspun cotton Gabi, Kuta, or Netela, symbolizing our collective brotherhood, wisdom, and roots as we conclude our school journey together.
              </p>
              
              {/* Event Date: THIS SATURDAY in BOLD & Interactive Location Link */}
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center", marginTop: "24px" }} id="gabi-location">
                <div className="event-date" style={{ background: "#fef3c7", padding: "10px 18px", borderRadius: "14px", border: "1px solid #fde68a" }}>
                  <Icon name="calendar" />
                  <span>
                    <small style={{ color: "#92400e", fontWeight: 800 }}>Assembly Day</small>
                    <strong style={{ fontSize: "16px", color: "#78350f", fontWeight: 900 }}>THIS SATURDAY</strong>
                  </span>
                </div>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=H9XH%2BPV5%2C+Bahir+Dar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gabi-location-btn"
                  title="Click or tap to open location in Google Maps"
                >
                  <span style={{ fontSize: "24px" }}>📍</span>
                  <div>
                    <small style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#b45309", fontWeight: 800, display: "block" }}>
                      Assembly Location (Tap to Locate)
                    </small>
                    <strong style={{ fontSize: "14.5px", color: "#451a03", display: "block" }}>
                      H9XH+PV5, Bahir Dar 🧭
                    </strong>
                  </div>
                </a>
              </div>

              <div className="hero-actions" style={{ marginTop: "28px" }}>
                <a
                  className="primary-button"
                  href="#gabi-register"
                  style={{ background: "#92400e" }}
                >
                  Pledge Your Gabi <Icon name="arrow" />
                </a>
                <a
                  className="btn-gold"
                  href="#payment-section"
                  style={{ padding: "12px 22px", borderRadius: "8px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  💳 Pay on Account / Submit Receipt
                </a>
              </div>

              <div className="trust-note">
                <div className="avatars" aria-hidden="true">
                  <span style={{ background: "#f59e0b", color: "#fff" }}>4x</span>
                  <span style={{ background: "#d97706", color: "#fff" }}>☕</span>
                  <span style={{ background: "#92400e", color: "#fff" }}>🧣</span>
                  <span>’26</span>
                </div>
                <p>
                  <strong>Authentic Ethiopian Shemma Heritage</strong>
                  Gathering <strong>This Saturday</strong> at <strong>H9XH+PV5, Bahir Dar</strong>
                </p>
              </div>
            </div>

            {/* Gabi Visual Banner */}
            <div style={{ padding: "clamp(24px, 5vw, 60px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{
                background: "radial-gradient(circle at center, #78350f 0%, #451a03 100%)",
                borderRadius: "24px",
                padding: "32px",
                color: "#ffffff",
                boxShadow: "0 16px 40px rgba(69, 26, 3, 0.35)",
                border: "2px solid #f59e0b"
              }}>
                <span className="badge-tag" style={{ background: "#fef3c7", color: "#92400e", marginBottom: "12px", fontWeight: 800 }}>
                  ☕ Traditional Morning Assembly • THIS SATURDAY
                </span>
                <h3 style={{ fontSize: "26px", fontFamily: "Playfair Display, serif", margin: "8px 0 12px", color: "#ffffff" }}>
                  The Ritual of Gabi Day
                </h3>
                <p style={{ color: "#fef3c7", fontSize: "14px", lineHeight: 1.6, margin: "0 0 20px" }}>
                  On Gabi Day, the courtyard fills with white cotton, steaming cinnamon chai, and traditional popcorn. Seniors gather on the grand steps for our panoramic portrait, followed by our senior wisdom and memory exchange.
                </p>

                {/* Location Interactive Pill in Banner */}
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.15)", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "18px" }}>📍</span>
                    <strong style={{ fontSize: "14px", color: "#fde047" }}>
                      Assembly Spot: H9XH+PV5, Bahir Dar
                    </strong>
                  </div>
                  <p style={{ margin: "0 0 10px", fontSize: "12.5px", color: "#fef3c7", lineHeight: 1.5 }}>
                    Tap below to open your phone's GPS navigation directly to our meeting grounds.
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=H9XH%2BPV5%2C+Bahir+Dar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold"
                    style={{ display: "inline-flex", padding: "8px 16px", fontSize: "12px", textDecoration: "none" }}
                  >
                    Open H9XH+PV5, Bahir Dar in Maps ➔
                  </a>
                </div>

                <div style={{ background: "rgba(0,0,0,0.25)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <strong style={{ display: "block", fontSize: "14px", color: "#fde047", marginBottom: "6px" }}>
                    🤝 Extra Gabi Sharing Initiative
                  </strong>
                  <p style={{ margin: 0, fontSize: "12.5px", color: "#e2e8f0", lineHeight: 1.5 }}>
                    Have more than one Gabi at home? Check the "Extra Gabi" option in the pledge form below to lend one to a fellow senior classmate!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gabi Styles Showcase */}
          <section className="process-section" id="gabi-styles" style={{ background: "var(--cream)", borderTop: "1px solid var(--line)" }}>
            <div className="section-heading">
              <span className="section-kicker">Ethiopian Weaving Masterpieces</span>
              <h2>Authentic Gabi Styles & Weaves</h2>
              <p>
                Discover the distinctive weaves and draping styles our seniors will wear on Gabi Day.
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              maxWidth: "1150px",
              margin: "0 auto",
              padding: "0 24px"
            }}>
              {GABI_STYLES.map((style) => (
                <div
                  key={style.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "18px",
                    border: "1px solid var(--line)",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.03)"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span className="badge-tag" style={{ background: "#fef3c7", color: "#92400e" }}>
                        {style.badge}
                      </span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#b45309" }}>
                        {style.warmthRating}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "19px", color: "var(--forest)", fontFamily: "Playfair Display, serif", margin: "0 0 4px" }}>
                      {style.name}
                    </h3>
                    <small style={{ color: "#d97706", fontWeight: 700, display: "block", marginBottom: "12px" }}>
                      {style.amharic} • {style.origin}
                    </small>

                    <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: 1.6, margin: "0 0 16px" }}>
                      {style.description}
                    </p>

                    <div style={{ background: "var(--paper)", padding: "10px 12px", borderRadius: "10px", fontSize: "12px", marginBottom: "16px" }}>
                      <div style={{ marginBottom: "6px" }}>
                        <strong style={{ color: "var(--forest)" }}>Weave:</strong> {style.weave}
                      </div>
                      <div style={{ marginBottom: "6px" }}>
                        <strong style={{ color: "var(--forest)" }}>Tibeb:</strong> {style.tibebColors}
                      </div>
                      <div>
                        <strong style={{ color: "var(--forest)" }}>Drape:</strong> {style.drapingTip}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-gold"
                    onClick={() => {
                      setGabiFormType(style.name);
                      document.getElementById("gabi-register")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    style={{ width: "100%", justifyContent: "center", background: "#f59e0b", color: "#451a03" }}
                  >
                    Select for My Pledge ➔
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Gabi Day Registration Form */}
          <section className="registration-section" id="gabi-register">
            <div className="form-intro">
              <span className="section-kicker">Gabi Day Portal • This Saturday</span>
              <h2>Pledge your Gabi for the assembly</h2>
              <p>
                Let the senior committee know which style you’re draping <strong>This Saturday</strong> at <strong>H9XH+PV5, Bahir Dar</strong>.
              </p>
            </div>

            <div className="form-card">
              {gabiCelebrationNotice && (
                <div style={{
                  background: "#fffbeb",
                  border: "1px solid #f59e0b",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#d97706", fontSize: "18px" }}>✓</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#92400e" }}>
                      {gabiCelebrationNotice}
                    </span>
                  </div>
                  <a
                    href="#gabi-roster"
                    style={{ fontSize: "12px", fontWeight: 700, color: "#b45309", textDecoration: "underline" }}
                  >
                    View Roster ↓
                  </a>
                </div>
              )}

              <form onSubmit={handleGabiSubmit}>
                <div className="form-top">
                  <div>
                    <span>BGMCS Gabi Day ’26</span>
                    <h2>Register your Gabi pledge</h2>
                  </div>
                  <span className="form-count">
                    {gabiRegistrations.length} seniors pledged
                  </span>
                </div>

                <div className="field-row">
                  <label>
                    <span>Student full name</span>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={gabiFormName}
                      onChange={(e) => setGabiFormName(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span>Student email</span>
                    <input
                      type="email"
                      placeholder="student@example.com"
                      value={gabiFormEmail}
                      onChange={(e) => setGabiFormEmail(e.target.value)}
                      required
                    />
                  </label>
                </div>

                <label>
                  <span>Select your Gabi / Shemma style</span>
                  <select
                    value={gabiFormType}
                    onChange={(e) => setGabiFormType(e.target.value)}
                    required
                  >
                    {GABI_STYLES.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    <option value="Family Heirloom / Traditional Netela">Family Heirloom / Traditional Netela</option>
                    <option value="Need to borrow an extra Gabi from classmate">Need to borrow an extra Gabi from classmate</option>
                  </select>
                </label>

                <div style={{ margin: "16px 0", padding: "12px 16px", background: "#fef3c7", borderRadius: "10px", border: "1px solid #fde68a" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#78350f" }}>
                    <input
                      type="checkbox"
                      checked={gabiFormExtra}
                      onChange={(e) => setGabiFormExtra(e.target.checked)}
                      style={{ width: "16px", height: "16px" }}
                    />
                    <span>🤝 I can bring an extra Gabi to lend to a classmate!</span>
                  </label>
                </div>

                <button
                  className="submit-button"
                  type="submit"
                  disabled={isGabiSubmitting}
                  style={{ background: "#92400e" }}
                >
                  {isGabiSubmitting ? "Saving & Syncing to Cloud..." : "Confirm Gabi Day Pledge"}
                </button>
                <p className="privacy-note">Real-time sync across BGMCS Seniors ’26.</p>
              </form>
            </div>
          </section>

          {/* Gabi Roster Gallery */}
          <section className="process-section" id="gabi-roster" style={{ background: "#ffffff", borderTop: "1px solid var(--line)" }}>
            <div className="section-heading">
              <span className="section-kicker">Gabi Day Brotherhood</span>
              <h2>Registered Gabi Day Seniors</h2>
              <p>
                Seniors gathering <strong>This Saturday</strong> at <strong>H9XH+PV5, Bahir Dar</strong> draped in traditional Gabi.
              </p>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "14px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => refreshCloudGabi(true)}
                  disabled={isRefreshingGabiCloud}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#ffffff",
                    border: "1px solid var(--line)",
                    borderRadius: "20px",
                    padding: "6px 16px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#92400e",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                  }}
                >
                  <span style={{ display: "inline-block", transform: isRefreshingGabiCloud ? "rotate(360deg)" : "none", transition: "transform 0.6s ease" }}>
                    🔄
                  </span>
                  {isRefreshingGabiCloud ? "Refreshing..." : "Refresh Gabi Roster"}
                </button>
                <span style={{ fontSize: "12px", color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b", display: "inline-block" }}></span>
                  {gabiRegistrations.length} Seniors Pledged
                </span>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "20px",
              maxWidth: "1100px",
              margin: "0 auto",
              padding: "0 24px"
            }}>
              {gabiRegistrations.length === 0 ? (
                <div style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "48px 24px",
                  background: "#fffbeb",
                  borderRadius: "16px",
                  border: "1px dashed #f59e0b"
                }}>
                  <div style={{ fontSize: "38px", marginBottom: "8px" }}>🧣</div>
                  <h4 style={{ margin: "0 0 6px", color: "#92400e", fontSize: "17px", fontWeight: 700 }}>
                    Be the First Senior to Pledge for Gabi Day!
                  </h4>
                  <p style={{ margin: 0, color: "#78350f", fontSize: "13.5px" }}>
                    Fill out the pledge form above to join our batch roster.
                  </p>
                </div>
              ) : (
                gabiRegistrations.map((student) => {
                  const isNewlyAdded = student.id === highlightedGabiId;
                  return (
                    <div
                      key={student.id}
                      style={{
                        background: isNewlyAdded ? "#fffbeb" : "#ffffff",
                        borderRadius: "16px",
                        padding: "16px",
                        border: isNewlyAdded ? "2px solid #f59e0b" : "1px solid var(--line)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <strong style={{ fontSize: "14px", color: "#183c2f", display: "block" }}>
                            {student.name}
                          </strong>
                          <small style={{ color: "var(--muted)", fontSize: "11px" }}>
                            {student.email}
                          </small>
                        </div>
                        {student.extraGabi && (
                          <span style={{ fontSize: "10px", padding: "2px 7px", background: "#fef3c7", color: "#92400e", borderRadius: "10px", fontWeight: 700 }}>
                            🤝 Extra Gabi Helper
                          </span>
                        )}
                      </div>

                      <div style={{ background: "var(--paper)", padding: "10px", borderRadius: "10px", border: "1px solid var(--line)" }}>
                        <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", display: "block" }}>
                          Pledged Gabi Style
                        </span>
                        <strong style={{ fontSize: "13px", color: "#92400e", display: "block", marginTop: "2px" }}>
                          {student.gabiType}
                        </strong>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Embedded Payment & Contribution Section */}
          <div style={{ padding: "40px 0" }}>
            <SeniorPaymentPortal
              accounts={paymentAccounts}
              receipts={paymentReceipts}
              payName={payName}
              setPayName={setPayName}
              payEmail={payEmail}
              setPayEmail={setPayEmail}
              payPurpose={payPurpose}
              setPayPurpose={setPayPurpose}
              payAmount={payAmount}
              setPayAmount={setPayAmount}
              payRef={payRef}
              setPayRef={setPayRef}
              payScreenshot={payScreenshot}
              payScreenshotFileName={payScreenshotFileName}
              handlePaymentScreenshot={handlePaymentScreenshot}
              handlePaymentSubmit={handlePaymentSubmit}
              isPaySubmitting={isPaySubmitting}
              payMessage={payMessage}
              setViewingScreenshot={setViewingScreenshot}
            />
          </div>
        </section>
      )}

      {/* ========================================================
          PAGE 4: WELCOME (JACKET) DAY SUB-WEB
          ======================================================== */}
      {activeDay === "jacket" && (
        <section id="jacket-subweb">
          <div className="subweb-header-banner" style={{ background: "linear-gradient(135deg, #0e2a20 0%, #1e4838 100%)", borderBottomColor: "#d7a52c" }}>
            <button type="button" className="subweb-back-btn" onClick={() => navigateToDay("home")}>
              ← Back to Senior Hub
            </button>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🧥 BGMCS Senior Welcome & Official Jacket Day</span>
              <span className="pill-badge" style={{ background: "#d7a52c", color: "#0e2a20" }}>
                {jacketRegistrations.length} Orders Confirmed
              </span>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <a href="#jacket-customizer" style={{ color: "#fde047", fontSize: "13px", fontWeight: 600 }}>Visualizer</a>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
              <a href="#jacket-order-form" style={{ color: "#fde047", fontSize: "13px", fontWeight: 600 }}>Order Form</a>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
              <a href="#jacket-payment" style={{ color: "#fde047", fontSize: "13px", fontWeight: 600 }}>💳 Payment</a>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
              <a href="#jacket-roster" style={{ color: "#fde047", fontSize: "13px", fontWeight: 600 }}>Roster</a>
            </div>
          </div>

          <div className="hero" style={{ minHeight: "auto", paddingBottom: "40px" }}>
            <div className="hero-copy">
              <div className="eyebrow" style={{ color: "var(--gold)" }}>
                <span style={{ background: "var(--gold)" }} />
                Official Class of 2026 Identity • የጃኬት ቀን
              </div>
              <h1>
                Wear the <em>pride</em>. Own the legacy.
              </h1>
              <p>
                The official BGMCS Senior Varsity Jacket marks our milestone year. Tailored in deep forest green with gold trim, custom chenille patches, and personalized back nickname embroidery, it represents our unity, brotherhood, and senior identity.
              </p>
              <div className="hero-actions">
                <a
                  className="primary-button"
                  href="#jacket-order-form"
                  style={{ background: "var(--forest)" }}
                >
                  Order Your Senior Jacket <Icon name="arrow" />
                </a>
                <div className="event-date">
                  <Icon name="calendar" />
                  <span>
                    <small>Official Ceremony</small>
                    Senior Welcome Day
                  </span>
                </div>
              </div>

              <div className="trust-note">
                <div className="avatars" aria-hidden="true">
                  <span style={{ background: "#183c2f", color: "#fff" }}>’26</span>
                  <span style={{ background: "#d7a52c", color: "#000" }}>🧥</span>
                  <span style={{ background: "#17814f", color: "#fff" }}>🇪🇹</span>
                  <span>S-2XL</span>
                </div>
                <p>
                  <strong>Custom Senior Varsity Jacket</strong>
                  Wool-blend body • Vegan leather sleeves • Embroidered nickname
                </p>
              </div>
            </div>

            <div style={{ padding: "clamp(24px, 5vw, 60px)" }} id="jacket-customizer">
              <div className="jacket-stage">
                <div className="jacket-view-toggle">
                  <button
                    type="button"
                    className={`jacket-toggle-btn ${customizerSide === "back" ? "active" : ""}`}
                    onClick={() => setCustomizerSide("back")}
                  >
                    🔄 View Back (Custom Nickname)
                  </button>
                  <button
                    type="button"
                    className={`jacket-toggle-btn ${customizerSide === "front" ? "active" : ""}`}
                    onClick={() => setCustomizerSide("front")}
                  >
                    🛡️ View Front (Crest & ’26 Patch)
                  </button>
                </div>

                <SeniorJacketVisualizer
                  side={customizerSide}
                  nickname={customizerNickname}
                  size={customizerSize}
                  fit={customizerFit}
                />

                <div style={{ width: "100%", maxWidth: "380px", marginTop: "20px", background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#fde047", marginBottom: "6px" }}>
                    Type Back Nickname (Live Preview):
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    placeholder="e.g. KIDUS / CAPTAIN"
                    value={customizerNickname}
                    onChange={(e) => setCustomizerNickname(e.target.value.toUpperCase())}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(0,0,0,0.4)",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 700,
                      marginBottom: "12px",
                      letterSpacing: "1px"
                    }}
                  />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "11px", color: "#d1d5db", marginBottom: "4px" }}>
                        Select Size:
                      </label>
                      <select
                        value={customizerSize}
                        onChange={(e) => setCustomizerSize(e.target.value)}
                        style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", background: "#112e23", color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)", fontSize: "13px" }}
                      >
                        {["S", "M", "L", "XL", "XXL"].map((sz) => (
                          <option key={sz} value={sz}>{sz}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "11px", color: "#d1d5db", marginBottom: "4px" }}>
                        Fit Style:
                      </label>
                      <select
                        value={customizerFit}
                        onChange={(e) => setCustomizerFit(e.target.value)}
                        style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", background: "#112e23", color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)", fontSize: "13px" }}
                      >
                        <option value="Standard">Standard</option>
                        <option value="Oversized">Oversized</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyCustomJacketToForm}
                    className="btn-gold"
                    style={{ width: "100%", marginTop: "14px", justifyContent: "center" }}
                  >
                    Apply Design to Order Form ↓
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Jacket Order Form */}
          <section className="registration-section" id="jacket-order-form">
            <div className="form-intro">
              <span className="section-kicker">Senior Jacket Registry</span>
              <h2>Confirm your size & nickname</h2>
              <p>
                Ensure your jacket is ordered with the exact spelling of your nickname and preferred sizing for the welcome ceremony.
              </p>
            </div>

            <div className="form-card">
              {jacketCelebrationNotice && (
                <div style={{
                  background: "#ecfdf5",
                  border: "1px solid #10b981",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#059669", fontSize: "18px" }}>✓</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#065f46" }}>
                      {jacketCelebrationNotice}
                    </span>
                  </div>
                  <a
                    href="#jacket-roster"
                    style={{ fontSize: "12px", fontWeight: 700, color: "#059669", textDecoration: "underline" }}
                  >
                    View Roster ↓
                  </a>
                </div>
              )}

              <form onSubmit={handleJacketSubmit}>
                <div className="form-top">
                  <div>
                    <span>BGMCS Jacket Day ’26</span>
                    <h2>Senior Jacket Order Confirmation</h2>
                  </div>
                  <span className="form-count">
                    {jacketRegistrations.length} orders submitted
                  </span>
                </div>

                <div className="field-row">
                  <label>
                    <span>Student full name</span>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={jacketFormName}
                      onChange={(e) => setJacketFormName(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span>Student email</span>
                    <input
                      type="email"
                      placeholder="student@example.com"
                      value={jacketFormEmail}
                      onChange={(e) => setJacketFormEmail(e.target.value)}
                      required
                    />
                  </label>
                </div>

                <div className="field-row">
                  <label>
                    <span>Custom Back Nickname (Max 14 letters)</span>
                    <input
                      type="text"
                      maxLength={14}
                      placeholder="e.g. KIDUS"
                      value={jacketFormNickname}
                      onChange={(e) => setJacketFormNickname(e.target.value.toUpperCase())}
                      required
                    />
                  </label>
                  <label>
                    <span>Jacket Size</span>
                    <select
                      value={jacketFormSize}
                      onChange={(e) => setJacketFormSize(e.target.value)}
                      required
                    >
                      <option value="S">Small (S)</option>
                      <option value="M">Medium (M)</option>
                      <option value="L">Large (L)</option>
                      <option value="XL">Extra Large (XL)</option>
                      <option value="XXL">Double Extra Large (2XL)</option>
                    </select>
                  </label>
                </div>

                <label>
                  <span>Fit Preference</span>
                  <select
                    value={jacketFormFit}
                    onChange={(e) => setJacketFormFit(e.target.value)}
                    required
                  >
                    <option value="Standard">Standard Tailored Fit</option>
                    <option value="Oversized">Relaxed / Oversized Fit</option>
                  </select>
                </label>

                <button
                  className="submit-button"
                  type="submit"
                  disabled={isJacketSubmitting}
                >
                  {isJacketSubmitting ? "Submitting Order to Cloud..." : "Confirm Senior Jacket Order"}
                </button>
                <p className="privacy-note">Submitted directly to BGMCS Senior Committee & Cloud Database.</p>
              </form>
            </div>
          </section>

          {/* Embedded Payment Section on Jacket Page */}
          <div style={{ padding: "30px 0" }} id="jacket-payment">
            <SeniorPaymentPortal
              accounts={paymentAccounts}
              receipts={paymentReceipts}
              payName={payName}
              setPayName={setPayName}
              payEmail={payEmail}
              setPayEmail={setPayEmail}
              payPurpose={payPurpose}
              setPayPurpose={setPayPurpose}
              payAmount={payAmount}
              setPayAmount={setPayAmount}
              payRef={payRef}
              setPayRef={setPayRef}
              payScreenshot={payScreenshot}
              payScreenshotFileName={payScreenshotFileName}
              handlePaymentScreenshot={handlePaymentScreenshot}
              handlePaymentSubmit={handlePaymentSubmit}
              isPaySubmitting={isPaySubmitting}
              payMessage={payMessage}
              setViewingScreenshot={setViewingScreenshot}
            />
          </div>

          {/* Jacket Orders Roster */}
          <section className="process-section" id="jacket-roster" style={{ background: "#ffffff", borderTop: "1px solid var(--line)" }}>
            <div className="section-heading">
              <span className="section-kicker">Class of 2026 Registry</span>
              <h2>Confirmed Senior Jacket Orders</h2>
              <p>
                Seniors who have confirmed their jacket size and back nickname embroidery.
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "20px",
              maxWidth: "1100px",
              margin: "0 auto",
              padding: "0 24px"
            }}>
              {jacketRegistrations.length === 0 ? (
                <div style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "48px 24px",
                  background: "#f8faf9",
                  borderRadius: "16px",
                  border: "1px dashed var(--line)"
                }}>
                  <div style={{ fontSize: "38px", marginBottom: "8px" }}>🧥</div>
                  <h4 style={{ margin: "0 0 6px", color: "var(--forest)", fontSize: "17px", fontWeight: 700 }}>
                    Be the First Senior to Confirm Your Jacket!
                  </h4>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: "13.5px" }}>
                    Select your size and customize your nickname using the order form above.
                  </p>
                </div>
              ) : (
                jacketRegistrations.map((student) => (
                  <div
                    key={student.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: "16px",
                      padding: "16px",
                      border: "1px solid var(--line)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <strong style={{ fontSize: "14px", color: "var(--ink)", display: "block" }}>
                          {student.name}
                        </strong>
                        <small style={{ color: "var(--muted)", fontSize: "11px" }}>
                          {student.email}
                        </small>
                      </div>
                      <span style={{ fontSize: "11px", padding: "2px 8px", background: "var(--forest)", color: "#fff", borderRadius: "10px", fontWeight: 700 }}>
                        Size {student.size}
                      </span>
                    </div>

                    <div style={{ background: "var(--paper)", padding: "10px", borderRadius: "10px", border: "1px solid var(--line)" }}>
                      <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", display: "block" }}>
                        Embroidered Back Nickname
                      </span>
                      <strong style={{ fontSize: "14px", color: "var(--forest)", display: "block", marginTop: "2px", letterSpacing: "1px" }}>
                        "{student.nickname}"
                      </strong>
                      <small style={{ color: "var(--muted)", fontSize: "11px", display: "block", marginTop: "4px" }}>
                        Fit: {student.fit}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </section>
      )}

      {/* ========================================================
          PAGE 5: DEDICATED PAYMENTS & RECEIPTS PAGE
          ======================================================== */}
      {activeDay === "payment" && (
        <section id="payments-page" style={{ padding: "40px 0 80px" }}>
          <div className="subweb-header-banner" style={{ background: "linear-gradient(135deg, #183c2f 0%, #0d261e 100%)", borderBottomColor: "#d7a52c", marginBottom: "40px" }}>
            <button type="button" className="subweb-back-btn" onClick={() => navigateToDay("home")}>
              ← Back to Senior Hub
            </button>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>💳 Official BGMCS Senior Payment Portal</span>
              <span className="pill-badge" style={{ background: "var(--gold)", color: "#12362a" }}>
                {paymentReceipts.length} Receipts Uploaded
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              style={{ background: "none", border: "none", color: "#fde047", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
            >
              Admin Edit Accounts ⚙️
            </button>
          </div>

          <SeniorPaymentPortal
            accounts={paymentAccounts}
            receipts={paymentReceipts}
            payName={payName}
            setPayName={setPayName}
            payEmail={payEmail}
            setPayEmail={setPayEmail}
            payPurpose={payPurpose}
            setPayPurpose={setPayPurpose}
            payAmount={payAmount}
            setPayAmount={setPayAmount}
            payRef={payRef}
            setPayRef={setPayRef}
            payScreenshot={payScreenshot}
            payScreenshotFileName={payScreenshotFileName}
            handlePaymentScreenshot={handlePaymentScreenshot}
            handlePaymentSubmit={handlePaymentSubmit}
            isPaySubmitting={isPaySubmitting}
            payMessage={payMessage}
            setViewingScreenshot={setViewingScreenshot}
          />
        </section>
      )}

      {/* ---------------- Screenshot Preview Modal ---------------- */}
      {viewingScreenshot && (
        <div className="screenshot-preview-modal-overlay" onClick={() => setViewingScreenshot(null)}>
          <div className="screenshot-preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
              <strong style={{ fontSize: "15px", color: "#0b2a20" }}>Receipt Screenshot Preview</strong>
              <button
                type="button"
                onClick={() => setViewingScreenshot(null)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>
            <img src={viewingScreenshot} alt="Payment Transfer Receipt" />
            <div style={{ padding: "12px 18px", textAlign: "right", background: "#f8faf9" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setViewingScreenshot(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Global Site Footer ---------------- */}
      <footer>
        <a className="brand footer-brand" href="#home" onClick={(e) => { e.preventDefault(); navigateToDay("home"); }}>
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span><strong>BGMCS Senior Hub</strong><small>Senior Batch ’26</small></span>
        </a>
        <p>Made with pride for every story in our senior batch.</p>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => navigateToDay("home")}
            style={{ background: "none", border: "none", color: "var(--gold)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
          >
            Senior Hub
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => navigateToDay("gabi")}
            style={{ background: "none", border: "none", color: "var(--gold)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
          >
            Gabi Day (This Saturday)
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => navigateToDay("culture")}
            style={{ background: "none", border: "none", color: "var(--gold)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
          >
            Culture Day
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => navigateToDay("jacket")}
            style={{ background: "none", border: "none", color: "var(--gold)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
          >
            Welcome / Jacket Day
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => navigateToDay("payment")}
            style={{ background: "none", border: "none", color: "var(--gold)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
          >
            Pay on Account
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setIsAdminOpen(true)}
            style={{ background: "none", border: "none", color: "var(--gold)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
          >
            Admin Portal ⚙️
          </button>
        </div>
      </footer>

      {/* ---------------- Unified Admin Dashboard Modal ---------------- */}
      {isAdminOpen && (
        <div className="admin-overlay" onClick={() => setIsAdminOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Icon name="shield" />
                <h3 style={{ margin: 0, color: "#ffffff", fontSize: "18px" }}>
                  BGMCS Senior Batch Admin Dashboard
                </h3>
              </div>
              <button
                type="button"
                className="admin-close-btn"
                onClick={() => setIsAdminOpen(false)}
                aria-label="Close dashboard"
              >
                <Icon name="close" />
              </button>
            </div>

            {!isAdminLoggedIn ? (
              <div className="admin-login-box">
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <div style={{ fontSize: "40px", marginBottom: "8px" }}>🔒</div>
                  <h4 style={{ margin: "0 0 6px", color: "#0b2a20", fontSize: "18px" }}>Committee Authorization Required</h4>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                    Please enter the Senior Committee passcode to access rosters, payment accounts, announcements, and clothes management.
                  </p>
                </div>

                {adminError && <div className="admin-error-banner">{adminError}</div>}

                <form onSubmit={handleAdminLogin}>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#334155" }}>
                      Admin Passcode
                    </label>
                    <input
                      type="password"
                      placeholder="Enter committee passcode..."
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      required
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                      autoFocus
                    />
                  </div>
                  <button type="submit" className="btn-gold" style={{ width: "100%", justifyContent: "center" }}>
                    Unlock Admin Dashboard
                  </button>
                </form>
              </div>
            ) : (
              <>
                {/* Admin Tabs */}
                <div className="admin-tabs-bar">
                  <button
                    type="button"
                    className={`admin-tab ${adminTab === "culture" ? "active" : ""}`}
                    onClick={() => setAdminTab("culture")}
                  >
                    🇪🇹 Culture ({registrations.length})
                  </button>
                  <button
                    type="button"
                    className={`admin-tab ${adminTab === "gabi" ? "active" : ""}`}
                    onClick={() => setAdminTab("gabi")}
                  >
                    🧣 Gabi ({gabiRegistrations.length})
                  </button>
                  <button
                    type="button"
                    className={`admin-tab ${adminTab === "jacket" ? "active" : ""}`}
                    onClick={() => setAdminTab("jacket")}
                  >
                    🧥 Jackets ({jacketRegistrations.length})
                  </button>
                  <button
                    type="button"
                    className={`admin-tab ${adminTab === "payments" ? "active" : ""}`}
                    onClick={() => {
                      setAdminTab("payments");
                      setEditAdminAccounts(paymentAccounts);
                    }}
                  >
                    💳 Payments & Accounts ({paymentReceipts.length})
                  </button>
                  <button
                    type="button"
                    className={`admin-tab ${adminTab === "announcements" ? "active" : ""}`}
                    onClick={() => setAdminTab("announcements")}
                  >
                    📢 Announcements ({announcements.length})
                  </button>
                  <button
                    type="button"
                    className={`admin-tab ${adminTab === "clothes" ? "active" : ""}`}
                    onClick={() => setAdminTab("clothes")}
                  >
                    👗 Outfits ({culturalLooks.length})
                  </button>
                  <button
                    type="button"
                    onClick={handleAdminLogout}
                    style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#dc2626", fontSize: "12px", fontWeight: 700, cursor: "pointer", padding: "0 10px" }}
                  >
                    Log Out
                  </button>
                </div>

                <div className="admin-body">
                  {/* TAB: PAYMENTS & ACCOUNTS MANAGER */}
                  {adminTab === "payments" && (
                    <div>
                      {adminAccountSavedMsg && (
                        <div style={{ background: "#dcfce7", color: "#166534", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: 600, fontSize: "13px" }}>
                          ✓ {adminAccountSavedMsg}
                        </div>
                      )}

                      {/* Admin Accounts Editor */}
                      <div style={{ background: "#f8faf9", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", marginBottom: "28px" }}>
                        <h4 style={{ margin: "0 0 8px", color: "#0b2a20", fontSize: "16px" }}>
                          🏦 Update "Pay on this account" Numbers (Live on Website)
                        </h4>
                        <p style={{ margin: "0 0 14px", color: "#64748b", fontSize: "13px" }}>
                          Write the exact account numbers below. Whatever you write here will replace the blank spaces on the website for all students.
                        </p>

                        <form onSubmit={handleSaveAdminAccounts}>
                          <textarea
                            rows={4}
                            placeholder="e.g.&#10;Commercial Bank of Ethiopia (CBE): 1000123456789 (Kidus Y.)&#10;Telebirr: 0912345678&#10;Bank of Abyssinia: 987654321&#10;Account Name: BGMCS Senior Committee"
                            value={editAdminAccounts}
                            onChange={(e) => setEditAdminAccounts(e.target.value)}
                            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", lineHeight: 1.6, marginBottom: "12px", fontFamily: "monospace" }}
                          />
                          <button type="submit" className="btn-gold">
                            Save & Publish Account Numbers to Website
                          </button>
                        </form>
                      </div>

                      {/* Student Payment Receipts */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <h4 style={{ margin: 0, color: "#0b2a20" }}>
                          Student Payment Screenshots & Receipts ({paymentReceipts.length})
                        </h4>
                        <button type="button" className="btn-gold" onClick={exportPaymentsCSV}>
                          <Icon name="download" /> Export Payments CSV
                        </button>
                      </div>

                      <div className="admin-table-container">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Receipt Screenshot</th>
                              <th>Student Name</th>
                              <th>Email</th>
                              <th>Purpose</th>
                              <th>Amount / Ref</th>
                              <th>Date</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paymentReceipts.length === 0 ? (
                              <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                                  No payment screenshots submitted yet.
                                </td>
                              </tr>
                            ) : (
                              paymentReceipts.map((pr) => (
                                <tr key={pr.id}>
                                  <td>
                                    {pr.screenshot ? (
                                      <button
                                        type="button"
                                        onClick={() => setViewingScreenshot(pr.screenshot)}
                                        style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}
                                        title="Click to view full screenshot"
                                      >
                                        <img
                                          src={pr.screenshot}
                                          alt="Receipt"
                                          style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                        />
                                      </button>
                                    ) : (
                                      <span style={{ color: "#94a3b8" }}>No file</span>
                                    )}
                                  </td>
                                  <td><strong>{pr.name}</strong></td>
                                  <td style={{ color: "#64748b" }}>{pr.email}</td>
                                  <td>
                                    <span className="badge-tag" style={{ background: "#fef3c7", color: "#92400e" }}>
                                      {pr.purpose}
                                    </span>
                                  </td>
                                  <td>
                                    <strong>{pr.amount || "N/A"}</strong>
                                    {pr.refNumber && <small style={{ display: "block", color: "#64748b" }}>Ref: {pr.refNumber}</small>}
                                  </td>
                                  <td style={{ color: "#64748b", fontSize: "12px" }}>{pr.date}</td>
                                  <td>
                                    <button
                                      type="button"
                                      className="btn-danger"
                                      onClick={() => handleDeletePaymentReceipt(pr.id)}
                                      title="Delete Receipt"
                                    >
                                      <Icon name="trash" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB: CULTURE DAY */}
                  {adminTab === "culture" && (
                    <div>
                      <div className="admin-stats">
                        <div className="admin-stat-card">
                          <span>Total Culture Registrations</span>
                          <strong>{registrations.length}</strong>
                        </div>
                        <div className="admin-stat-card">
                          <span>Unique Outfits Chosen</span>
                          <strong>{new Set(registrations.map(r => r.outfit)).size}</strong>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap", justifyContent: "space-between" }}>
                        <input
                          type="text"
                          placeholder="Search student name or email..."
                          value={adminSearch}
                          onChange={(e) => setAdminSearch(e.target.value)}
                          style={{ flex: 1, minWidth: "240px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                        />
                        <button type="button" className="btn-gold" onClick={exportCultureCSV}>
                          <Icon name="download" /> Export Culture CSV
                        </button>
                      </div>

                      <div className="admin-table-container">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Photo</th>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Chosen Attire</th>
                              <th>Date</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRegistrations.map((r) => (
                              <tr key={r.id}>
                                <td>
                                  <img
                                    src={r.image || assetUrl("images/habesha_female.jpg")}
                                    alt=""
                                    style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                                  />
                                </td>
                                <td><strong>{r.name}</strong></td>
                                <td style={{ color: "#64748b" }}>{r.email}</td>
                                <td><span className="badge-tag">{r.outfit}</span></td>
                                <td style={{ color: "#64748b", fontSize: "12px" }}>{r.date || "Recent"}</td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn-danger"
                                    onClick={() => handleDeleteRegistration(r.id)}
                                  >
                                    <Icon name="trash" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB: GABI DAY */}
                  {adminTab === "gabi" && (
                    <div>
                      <div className="admin-stats">
                        <div className="admin-stat-card">
                          <span>Total Gabi Pledges</span>
                          <strong>{gabiRegistrations.length}</strong>
                        </div>
                        <div className="admin-stat-card">
                          <span>Assembly Date</span>
                          <strong style={{ color: "#b45309" }}>THIS SATURDAY</strong>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginBottom: "16px" }}>
                        <button type="button" className="btn-gold" onClick={exportGabiCSV}>
                          <Icon name="download" /> Export Gabi CSV
                        </button>
                      </div>

                      <div className="admin-table-container">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Pledged Gabi Style</th>
                              <th>Extra Gabi Helper</th>
                              <th>Date</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gabiRegistrations.map((g) => (
                              <tr key={g.id}>
                                <td><strong>{g.name}</strong></td>
                                <td style={{ color: "#64748b" }}>{g.email}</td>
                                <td><span className="badge-tag" style={{ background: "#fef3c7", color: "#92400e" }}>{g.gabiType}</span></td>
                                <td>{g.extraGabi ? "Yes (Lending 1)" : "No"}</td>
                                <td style={{ color: "#64748b", fontSize: "12px" }}>{g.date || "Recent"}</td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn-danger"
                                    onClick={() => handleDeleteGabiRegistration(g.id)}
                                  >
                                    <Icon name="trash" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB: JACKET ORDERS */}
                  {adminTab === "jacket" && (
                    <div>
                      <div className="admin-stats">
                        <div className="admin-stat-card">
                          <span>Total Jacket Orders</span>
                          <strong>{jacketRegistrations.length}</strong>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginBottom: "16px" }}>
                        <button type="button" className="btn-gold" onClick={exportJacketCSV}>
                          <Icon name="download" /> Export Jacket CSV
                        </button>
                      </div>

                      <div className="admin-table-container">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Back Nickname</th>
                              <th>Size</th>
                              <th>Fit</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {jacketRegistrations.map((j) => (
                              <tr key={j.id}>
                                <td><strong>{j.name}</strong></td>
                                <td style={{ color: "#64748b" }}>{j.email}</td>
                                <td><strong>"{j.nickname}"</strong></td>
                                <td><span className="badge-tag" style={{ background: "#183c2f", color: "#ffffff" }}>{j.size}</span></td>
                                <td>{j.fit}</td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn-danger"
                                    onClick={() => handleDeleteJacketRegistration(j.id)}
                                  >
                                    <Icon name="trash" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB: ANNOUNCEMENTS */}
                  {adminTab === "announcements" && (
                    <div>
                      {annMessage && (
                        <div style={{ background: "#dcfce7", color: "#166534", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: 600, fontSize: "13px" }}>
                          ✓ {annMessage}
                        </div>
                      )}

                      <div style={{ background: "#f8faf9", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", marginBottom: "28px" }}>
                        <h4 style={{ margin: "0 0 14px", color: "#0b2a20", fontSize: "16px" }}>
                          📢 Broadcast New Senior Announcement
                        </h4>
                        <form onSubmit={handleCreateAnnouncement} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                            <input
                              type="text"
                              placeholder="Announcement Title"
                              value={newAnnTitle}
                              onChange={(e) => setNewAnnTitle(e.target.value)}
                              required
                              style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                            />
                            <select
                              value={newAnnTag}
                              onChange={(e) => setNewAnnTag(e.target.value as any)}
                              style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                            >
                              <option value="all">All Senior Days</option>
                              <option value="gabi">🧣 Gabi Day</option>
                              <option value="culture">🇪🇹 Culture Day</option>
                              <option value="jacket">🧥 Jacket Day</option>
                            </select>
                          </div>

                          <textarea
                            placeholder="Write message, schedule, or instructions..."
                            value={newAnnContent}
                            onChange={(e) => setNewAnnContent(e.target.value)}
                            required
                            rows={4}
                            style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", resize: "vertical" }}
                          />
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                            <input
                              type="text"
                              placeholder="Author / Signature"
                              value={newAnnAuthor}
                              onChange={(e) => setNewAnnAuthor(e.target.value)}
                              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", width: "180px" }}
                            />
                            <button type="submit" className="btn-gold">
                              Publish Announcement
                            </button>
                          </div>
                        </form>
                      </div>

                      {announcements.map((ann) => (
                        <div key={ann.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "16px", borderRadius: "12px", marginBottom: "12px", display: "flex", justifyContent: "space-between", gap: "16px" }}>
                          <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: "15px", color: "#0b2a20", display: "block" }}>{ann.title}</strong>
                            <small style={{ color: "#64748b", display: "block", marginBottom: "6px" }}>By {ann.author} • {ann.date}</small>
                            <p style={{ margin: 0, fontSize: "13px", color: "#334155" }}>{ann.content}</p>
                          </div>
                          <button type="button" className="btn-danger" onClick={() => handleDeleteAnnouncement(ann.id)}>
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB: CULTURAL CLOTHES */}
                  {adminTab === "clothes" && (
                    <div>
                      {clothMessage && (
                        <div style={{ background: "#dcfce7", color: "#166534", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: 600, fontSize: "13px" }}>
                          ✓ {clothMessage}
                        </div>
                      )}

                      <div style={{ background: "#f8faf9", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", marginBottom: "28px" }}>
                        <h4 style={{ margin: "0 0 14px", color: "#0b2a20", fontSize: "16px" }}>
                          👗 Add New Cultural Cloth to 3D Showcase Display
                        </h4>
                        <form onSubmit={handleAddCustomCloth} className="admin-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                          <input
                            type="text"
                            placeholder="Outfit Name / Label *"
                            value={newClothLabel}
                            onChange={(e) => setNewClothLabel(e.target.value)}
                            required
                            style={{ padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                          />
                          <input
                            type="text"
                            placeholder="Region *"
                            value={newClothRegion}
                            onChange={(e) => setNewClothRegion(e.target.value)}
                            required
                            style={{ padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                          />
                          <button type="submit" className="btn-gold" style={{ gridColumn: "1 / -1" }}>
                            Add to 3D Showcase
                          </button>
                        </form>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
                        {culturalLooks.map((cloth) => (
                          <div key={cloth.id} style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden", padding: "10px" }}>
                            <img src={cloth.src} alt="" style={{ width: "100%", height: "110px", objectFit: "cover", borderRadius: "6px" }} />
                            <strong style={{ display: "block", fontSize: "12px", color: "#0b2a20", marginTop: "6px" }}>{cloth.label}</strong>
                            {cloth.custom && (
                              <button type="button" className="btn-danger" onClick={() => handleDeleteCloth(cloth.id)} style={{ marginTop: "6px", width: "100%" }}>
                                Delete
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

// -------------------------------------------------------------
// Reusable Senior Payment Portal Component
// -------------------------------------------------------------
function SeniorPaymentPortal({
  accounts,
  receipts,
  payName,
  setPayName,
  payEmail,
  setPayEmail,
  payPurpose,
  setPayPurpose,
  payAmount,
  setPayAmount,
  payRef,
  setPayRef,
  payScreenshot,
  payScreenshotFileName,
  handlePaymentScreenshot,
  handlePaymentSubmit,
  isPaySubmitting,
  payMessage,
  setViewingScreenshot
}: {
  accounts: string;
  receipts: PaymentReceipt[];
  payName: string;
  setPayName: (val: string) => void;
  payEmail: string;
  setPayEmail: (val: string) => void;
  payPurpose: string;
  setPayPurpose: (val: string) => void;
  payAmount: string;
  setPayAmount: (val: string) => void;
  payRef: string;
  setPayRef: (val: string) => void;
  payScreenshot: string;
  payScreenshotFileName: string;
  handlePaymentScreenshot: (e: ChangeEvent<HTMLInputElement>) => void;
  handlePaymentSubmit: (e: FormEvent) => void;
  isPaySubmitting: boolean;
  payMessage: string;
  setViewingScreenshot: (url: string | null) => void;
}) {
  return (
    <section className="payment-portal-section" id="payment-section" style={{ background: "#fdf8ee", borderTop: "1px solid var(--line)", padding: "48px 0" }}>
      <div className="section-heading" style={{ textAlign: "center", marginBottom: "36px" }}>
        <span className="section-kicker">Official Senior Contributions</span>
        <h2>Senior Batch Payment Portal</h2>
        <p>
          Pay on the official committee account below and upload your transfer screenshot to confirm.
        </p>
      </div>

      <div className="payment-portal-grid">
        {/* Left: "Pay on this account" Box */}
        <div className="payment-accounts-box">
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <span className="badge-tag" style={{ background: "#fef3c7", color: "#92400e", fontWeight: 800 }}>
                💳 Official Bank & Telebirr Accounts
              </span>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>Senior Committee</span>
            </div>

            <h3 style={{ fontSize: "24px", color: "var(--forest)", fontFamily: "Playfair Display, serif", margin: "0 0 12px" }}>
              Pay on this account
            </h3>

            {/* If admin has entered account numbers, display them; otherwise show clear blank spaces */}
            {accounts.trim() ? (
              <div style={{
                background: "var(--paper)",
                padding: "20px",
                borderRadius: "14px",
                border: "2px solid #d7a52c",
                whiteSpace: "pre-line",
                fontSize: "14px",
                lineHeight: 1.8,
                color: "#183c2f",
                fontWeight: 600
              }}>
                {accounts}
              </div>
            ) : (
              <div style={{
                background: "#ffffff",
                padding: "22px",
                borderRadius: "14px",
                border: "2px dashed #d7a52c"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <span style={{ fontSize: "20px" }}>🏦</span>
                  <strong style={{ fontSize: "15px", color: "#78350f" }}>
                    Pay on this account:
                  </strong>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px" }}>
                  <div>
                    <span style={{ display: "block", color: "var(--forest)", fontWeight: 700, marginBottom: "4px" }}>
                      Commercial Bank of Ethiopia (CBE):
                    </span>
                    <div style={{ padding: "10px 14px", background: "var(--paper)", borderRadius: "8px", border: "1px solid #cbd5e1", color: "#64748b", fontStyle: "italic", letterSpacing: "1px" }}>
                      [ Account number will be added by Admin ]
                    </div>
                  </div>

                  <div>
                    <span style={{ display: "block", color: "var(--forest)", fontWeight: 700, marginBottom: "4px" }}>
                      Telebirr / Mobile Money:
                    </span>
                    <div style={{ padding: "10px 14px", background: "var(--paper)", borderRadius: "8px", border: "1px solid #cbd5e1", color: "#64748b", fontStyle: "italic", letterSpacing: "1px" }}>
                      [ Telebirr number will be added by Admin ]
                    </div>
                  </div>

                  <div style={{ padding: "10px 14px", background: "#fef3c7", borderRadius: "8px", color: "#78350f", fontSize: "12.5px" }}>
                    <strong>Account Name:</strong> BGMCS Senior Batch 2026 Committee
                  </div>
                </div>

                <small style={{ display: "block", marginTop: "14px", color: "#64748b", fontStyle: "italic", lineHeight: 1.5 }}>
                  ℹ️ The committee admin can update active bank numbers at any time via Admin Portal. Once you transfer, attach your screenshot on the right.
                </small>
              </div>
            )}
          </div>

          <div style={{ marginTop: "24px", padding: "14px", background: "rgba(24,60,47,0.04)", borderRadius: "12px", border: "1px solid var(--line)" }}>
            <strong style={{ fontSize: "13px", color: "var(--forest)", display: "block", marginBottom: "4px" }}>
              ✓ Verification Guarantee
            </strong>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)", lineHeight: 1.5 }}>
              All uploaded screenshots are stored securely and verified by the BGMCS committee team.
            </p>
          </div>
        </div>

        {/* Right: "Put your screenshots" Upload Form */}
        <div className="form-card" style={{ margin: 0 }}>
          {payMessage && (
            <div style={{
              background: "#ecfdf5",
              border: "1px solid #10b981",
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{ color: "#059669", fontSize: "18px" }}>✓</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#065f46" }}>
                {payMessage}
              </span>
            </div>
          )}

          <form onSubmit={handlePaymentSubmit}>
            <div className="form-top">
              <div>
                <span>BGMCS Seniors ’26</span>
                <h2>Upload Transfer Screenshot</h2>
              </div>
              <span className="form-count">
                {receipts.length} verified
              </span>
            </div>

            <div className="field-row">
              <label>
                <span>Student full name *</span>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={payName}
                  onChange={(e) => setPayName(e.target.value)}
                  required
                />
              </label>
              <label>
                <span>Student email *</span>
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={payEmail}
                  onChange={(e) => setPayEmail(e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="field-row">
              <label>
                <span>Payment Purpose *</span>
                <select
                  value={payPurpose}
                  onChange={(e) => setPayPurpose(e.target.value)}
                  required
                >
                  <option value="Gabi Day Chai & Gathering">🧣 Gabi Day Chai & Gathering</option>
                  <option value="Senior Varsity Jacket Payment">🧥 Senior Varsity Jacket Payment</option>
                  <option value="Culture Day Contribution">🇪🇹 Culture Day Contribution</option>
                  <option value="General Senior Batch Contribution">🎓 General Senior Batch Contribution</option>
                </select>
              </label>

              <label>
                <span>Amount Paid (ETB)</span>
                <input
                  type="text"
                  placeholder="e.g. 500 ETB"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </label>
            </div>

            <label>
              <span>Transaction Reference / Note (optional)</span>
              <input
                type="text"
                placeholder="e.g. FT2610... or Sender Name"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
              />
            </label>

            {/* Put your screenshots upload */}
            <label className="file-upload">
              <span>Attach your transfer screenshot / receipt photo *</span>
              <input type="file" accept="image/*" onChange={handlePaymentScreenshot} required />
              <div className="dropzone">
                <Icon name="upload" />
                <div>
                  <strong>{payScreenshotFileName || "Put your screenshot here or browse"}</strong>
                  <small>Supports PNG, JPG, Mobile Screenshots</small>
                </div>
              </div>
            </label>

            {payScreenshot && (
              <div className="image-preview" style={{ marginBottom: "16px" }}>
                <img
                  src={payScreenshot}
                  alt="Receipt Screenshot preview"
                  onClick={() => setViewingScreenshot(payScreenshot)}
                  style={{ cursor: "pointer", maxHeight: "180px", objectFit: "contain" }}
                  title="Click to view enlarged"
                />
                <small style={{ display: "block", textAlign: "center", color: "var(--muted)", marginTop: "4px" }}>
                  (Click screenshot to preview full size)
                </small>
              </div>
            )}

            <button className="submit-button" type="submit" disabled={isPaySubmitting}>
              {isPaySubmitting ? "Submitting Screenshot..." : "Submit Payment Screenshot"}
            </button>
            <p className="privacy-note">Synced with BGMCS Committee Admin Dashboard in real-time.</p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default App;
