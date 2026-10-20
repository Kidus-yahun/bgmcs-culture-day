import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

const CLOUD_REGISTRATIONS_URL = "https://extendsclass.com/api/json-storage/bin/bfceaaf";
const CLOUD_ANNOUNCEMENTS_URL = "https://extendsclass.com/api/json-storage/bin/afabdcd";
const CLOUD_GABI_URL = "https://extendsclass.com/api/json-storage/bin/deebfee";
const CLOUD_JACKET_URL = "https://extendsclass.com/api/json-storage/bin/ccfecea";

type SeniorDay = "home" | "culture" | "gabi" | "jacket";

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
    title: "Senior Welcome & Official Varsity Jacket Day Announced!",
    content: "Get ready to represent our batch in style! The official BGMCS Class of 2026 Varsity Jacket design is revealed. Customize your back nickname, confirm your size, and join us for the grand hallway unboxing ceremony.",
    author: "Senior Committee",
    date: "Fall 2025",
    pinned: true,
    tag: "jacket"
  },
  {
    id: 3,
    title: "Gabi Day Morning Assembly & Spiced Chai Gathering",
    content: "Wrapped in warmth and brotherhood! Gabi Day celebration date is set. Bring your handspun Arba Gabi, Kuta, or Netela for our cohort white gabi panorama photo on the grand courtyard steps.",
    author: "Senior Committee",
    date: "Spring 2026",
    pinned: false,
    tag: "gabi"
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
          {/* Gradients */}
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
          {/* Curved Text Path for Back Arched Nickname */}
          <path id="archTextPath" d="M 90 145 Q 200 85 310 145" />
        </defs>

        {/* Sleeves (Left & Right) */}
        <g filter="url(#shadow)">
          {/* Left Sleeve */}
          <path
            d="M 125 78 L 40 180 L 75 220 L 138 135 Z"
            fill="url(#goldSleeve)"
            stroke="#916a13"
            strokeWidth="1.5"
          />
          {/* Left Sleeve Cuff Ribbing */}
          <path d="M 40 180 L 30 192 L 65 232 L 75 220 Z" fill="#183c2f" />
          <line x1="33" y1="184" x2="68" y2="224" stroke="#ffffff" strokeWidth="2.5" />
          <line x1="37" y1="188" x2="72" y2="228" stroke="#d7a52c" strokeWidth="2" />

          {/* Right Sleeve */}
          <path
            d="M 275 78 L 360 180 L 325 220 L 262 135 Z"
            fill="url(#goldSleeve)"
            stroke="#916a13"
            strokeWidth="1.5"
          />
          {/* Right Sleeve Cuff Ribbing */}
          <path d="M 360 180 L 370 192 L 335 232 L 325 220 Z" fill="#183c2f" />
          <line x1="367" y1="184" x2="332" y2="224" stroke="#ffffff" strokeWidth="2.5" />
          <line x1="363" y1="188" x2="328" y2="228" stroke="#d7a52c" strokeWidth="2" />
        </g>

        {/* Main Body Torso */}
        <g filter="url(#shadow)">
          <path
            d="M 125 75 C 150 90 250 90 275 75 L 290 330 C 290 330 200 338 110 330 Z"
            fill="url(#bodyGreen)"
            stroke="#0b231a"
            strokeWidth="2"
          />
        </g>

        {/* Striped Ribbed Bottom Hem */}
        <path
          d="M 108 330 C 200 338 290 338 292 330 L 292 360 C 200 368 108 368 108 360 Z"
          fill="#183c2f"
          stroke="#0b231a"
          strokeWidth="1.5"
        />
        <path d="M 108 340 C 200 348 290 348 292 340" stroke="#ffffff" strokeWidth="3" fill="none" />
        <path d="M 108 350 C 200 358 290 358 292 350" stroke="#d7a52c" strokeWidth="2.5" fill="none" />

        {/* Striped Ribbed Collar */}
        <path
          d="M 130 75 C 160 52 240 52 270 75 C 248 95 152 95 130 75 Z"
          fill="#183c2f"
          stroke="#0b231a"
          strokeWidth="1.5"
        />
        <path d="M 136 70 C 162 58 238 58 264 70" stroke="#ffffff" strokeWidth="2.5" fill="none" />
        <path d="M 140 76 C 165 65 235 65 260 76" stroke="#d7a52c" strokeWidth="2" fill="none" />

        {/* FRONT VIEW DETAILS */}
        {side === "front" && (
          <g>
            {/* Center Snap Placket */}
            <line x1="200" y1="90" x2="200" y2="334" stroke="#0e2a20" strokeWidth="18" strokeLinecap="round" />
            <line x1="200" y1="90" x2="200" y2="334" stroke="#d7a52c" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Snap Buttons */}
            {[110, 150, 190, 230, 270, 310].map((y) => (
              <circle key={y} cx="200" cy={y} r="5.5" fill="#fde047" stroke="#92400e" strokeWidth="1.5" />
            ))}

            {/* Left Chest: BGMCS Crest Shield */}
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

            {/* Right Chest: Chenille '26 Varsity Patch */}
            <g transform="translate(252, 130)">
              <rect x="-18" y="-16" width="36" height="34" rx="8" fill="#ffffff" stroke="#d7a52c" strokeWidth="2.5" />
              <text x="0" y="8" fill="#183c2f" fontSize="19" fontWeight="900" textAnchor="middle" fontFamily="Georgia, serif">
                ’26
              </text>
            </g>

            {/* Front Slash Pockets */}
            <line x1="135" y1="240" x2="165" y2="280" stroke="#d7a52c" strokeWidth="7" strokeLinecap="round" />
            <line x1="135" y1="240" x2="165" y2="280" stroke="#92400e" strokeWidth="1" />
            <line x1="265" y1="240" x2="235" y2="280" stroke="#d7a52c" strokeWidth="7" strokeLinecap="round" />
            <line x1="265" y1="240" x2="235" y2="280" stroke="#92400e" strokeWidth="1" />

            {/* Bottom Size Label */}
            <g transform="translate(130, 315)">
              <rect x="0" y="0" width="38" height="15" rx="3" fill="#ffffff" stroke="#183c2f" strokeWidth="1" />
              <text x="19" y="11" fill="#183c2f" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                SIZE: {size}
              </text>
            </g>
          </g>
        )}

        {/* BACK VIEW DETAILS */}
        {side === "back" && (
          <g>
            {/* Top Collar Mini Ethiopian Flag Ribbon */}
            <g transform="translate(182, 86)">
              <rect x="0" y="0" width="12" height="6" fill="#17814f" />
              <rect x="12" y="0" width="12" height="6" fill="#efc83a" />
              <rect x="24" y="0" width="12" height="6" fill="#c64b36" />
              <rect x="0" y="0" width="36" height="6" stroke="#ffffff" strokeWidth="0.8" fill="none" />
            </g>

            {/* Arched Bold Athlete Nickname */}
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

            {/* Giant Collegiate Athletic Numeral '26' */}
            <g transform="translate(200, 222)">
              {/* Drop shadow numeral */}
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
              {/* White outer stroke */}
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
              {/* Gold inner numeral */}
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

            {/* Lower Back Subtitle */}
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

            {/* Size & Fit Tag Tab */}
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
  // Navigation State
  const [activeDay, setActiveDay] = useState<SeniorDay>(() => {
    const hash = window.location.hash.replace("#", "").toLowerCase();
    if (hash === "culture" || hash === "culture-day") return "culture";
    if (hash === "gabi" || hash === "gabi-day") return "gabi";
    if (hash === "jacket" || hash === "jacket-day" || hash === "welcome") return "jacket";
    return "home";
  });

  const navigateToDay = (day: SeniorDay) => {
    setActiveDay(day);
    const hash = day === "home" ? "home" : `${day}-day`;
    window.history.pushState(null, "", `#${hash}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      if (hash === "culture" || hash === "culture-day") setActiveDay("culture");
      else if (hash === "gabi" || hash === "gabi-day") setActiveDay("gabi");
      else if (hash === "jacket" || hash === "jacket-day" || hash === "welcome") setActiveDay("jacket");
      else if (hash === "admin") setIsAdminOpen(true);
      else if (hash === "home" || hash === "top" || hash === "") setActiveDay("home");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // ---------------- Culture Day Registrations ----------------
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

  // ---------------- Gabi Day Registrations ----------------
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

  // ---------------- Jacket Day Registrations ----------------
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

  // ---------------- Announcements ----------------
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

  // Form & Interaction States: Culture Day
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

  // Form & Interaction States: Gabi Day
  const [gabiFormName, setGabiFormName] = useState("");
  const [gabiFormEmail, setGabiFormEmail] = useState("");
  const [gabiFormType, setGabiFormType] = useState("Traditional Arba Gabi (አርባ ጋቢ)");
  const [gabiFormExtra, setGabiFormExtra] = useState(false);
  const [isGabiSubmitting, setIsGabiSubmitting] = useState(false);
  const [gabiCelebrationNotice, setGabiCelebrationNotice] = useState<string | null>(null);
  const [highlightedGabiId, setHighlightedGabiId] = useState<number | null>(null);
  const [isRefreshingGabiCloud, setIsRefreshingGabiCloud] = useState(false);

  // Form & Interaction States: Welcome / Jacket Day
  const [jacketFormName, setJacketFormName] = useState("");
  const [jacketFormEmail, setJacketFormEmail] = useState("");
  const [jacketFormNickname, setJacketFormNickname] = useState("");
  const [jacketFormSize, setJacketFormSize] = useState("L");
  const [jacketFormFit, setJacketFormFit] = useState("Standard");
  const [isJacketSubmitting, setIsJacketSubmitting] = useState(false);
  const [jacketCelebrationNotice, setJacketCelebrationNotice] = useState<string | null>(null);
  const [highlightedJacketId, setHighlightedJacketId] = useState<number | null>(null);
  const [isRefreshingJacketCloud, setIsRefreshingJacketCloud] = useState(false);

  // Live Jacket Visualizer Interactive Customizer
  const [customizerSide, setCustomizerSide] = useState<"front" | "back">("back");
  const [customizerNickname, setCustomizerNickname] = useState("");
  const [customizerSize, setCustomizerSize] = useState("L");
  const [customizerFit, setCustomizerFit] = useState("Standard");

  // Admin Dashboard States
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem("bgmcs-admin-session") === "true";
  });
  const [adminPasscode, setAdminPasscode] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminTab, setAdminTab] = useState<"culture" | "gabi" | "jacket" | "announcements" | "clothes">("culture");
  const [adminSearch, setAdminSearch] = useState("");
  const [adminFilterOutfit, setAdminFilterOutfit] = useState("all");

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

  // New Announcement Form States
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");
  const [newAnnAuthor, setNewAnnAuthor] = useState("Senior Committee");
  const [newAnnPinned, setNewAnnPinned] = useState(true);
  const [newAnnTag, setNewAnnTag] = useState<"all" | "culture" | "gabi" | "jacket">("all");
  const [annMessage, setAnnMessage] = useState("");
  const [annFilterTag, setAnnFilterTag] = useState<"all" | "culture" | "gabi" | "jacket">("all");

  // ---------------- Cloud Fetch & Merge Hooks ----------------
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
              if (item && item.id && item.name) {
                map.set(item.id, item);
              }
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
    refreshCloudAnnouncements();
    const interval = setInterval(() => {
      refreshCloudRegistrations();
      refreshCloudGabi();
      refreshCloudJacket();
    }, 25000);
    return () => clearInterval(interval);
  }, [refreshCloudRegistrations, refreshCloudGabi, refreshCloudJacket, refreshCloudAnnouncements]);

  // Touch handlers for mobile swipe
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
    if (regSection) {
      regSection.scrollIntoView({ behavior: "smooth" });
    }
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
    if (regSection) {
      regSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleApplyCustomJacketToForm() {
    if (customizerNickname) {
      setJacketFormNickname(customizerNickname);
    }
    setJacketFormSize(customizerSize);
    setJacketFormFit(customizerFit);
    const formEl = document.getElementById("jacket-order-form");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Admin Actions
  function handleAdminLogin(e: FormEvent) {
    e.preventDefault();
    const storedPass = localStorage.getItem("bgmcs-admin-passcode") || "bgmcs2026";
    const inputPass = adminPasscode.trim().toLowerCase();
    if (inputPass === storedPass.toLowerCase() || inputPass === "admin") {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem("bgmcs-admin-session", "true");
      setAdminError("");
      setAdminPasscode("");
    } else {
      setAdminError("Incorrect passcode. Access restricted to authorized committee members.");
    }
  }

  function handleAdminLogout() {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem("bgmcs-admin-session");
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
              if (activeDay === "home") navigateToDay("culture");
              const regTarget = activeDay === "jacket" ? "jacket-order-form" : (activeDay === "gabi" ? "gabi-register" : "register");
              document.getElementById(regTarget)?.scrollIntoView({ behavior: "smooth" });
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
            <span>🎓 All Senior Days Hub</span>
            <span className="pill-badge">Overview</span>
          </button>

          <button
            type="button"
            className={`senior-day-pill ${activeDay === "culture" ? "active" : ""}`}
            onClick={() => navigateToDay("culture")}
          >
            <span>🇪🇹 Culture Day</span>
            <span className="pill-badge">{registrations.length} Joined</span>
          </button>

          <button
            type="button"
            className={`senior-day-pill ${activeDay === "gabi" ? "active" : ""}`}
            onClick={() => navigateToDay("gabi")}
          >
            <span>🧣 Gabi Day</span>
            <span className="pill-badge">{gabiRegistrations.length} Pledged</span>
          </button>

          <button
            type="button"
            className={`senior-day-pill ${activeDay === "jacket" ? "active" : ""}`}
            onClick={() => navigateToDay("jacket")}
          >
            <span>🧥 Welcome / Jacket Day</span>
            <span className="pill-badge">{jacketRegistrations.length} Orders</span>
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
            Cloud Synced
          </span>
        </div>
      </div>

      {/* ========================================================
          PAGE 1: SENIOR HUB (HOME / ALL DAYS OVERVIEW)
          ======================================================== */}
      {activeDay === "home" && (
        <section id="senior-home">
          {/* Main Hero */}
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
                    <small>Graduation Milestone</small>
                    Class of 2026
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

            {/* Hero Visual Collage / Gateway Preview */}
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
                        🇪🇹 1. Ethiopian Culture Day Sub-Web
                      </strong>
                      <small style={{ color: "#9ca3af", fontSize: "12px" }}>
                        10 regional looks, 3D flip card, lucky spinner & attire roster
                      </small>
                    </div>
                    <span style={{ color: "var(--gold)", fontWeight: 800 }}>➔</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToDay("gabi")}
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
                      <strong style={{ display: "block", fontSize: "15px", color: "#fed7aa" }}>
                        🧣 2. Traditional Gabi Day Sub-Web
                      </strong>
                      <small style={{ color: "#9ca3af", fontSize: "12px" }}>
                        Arba Gabi, Chencha weaves, chai circle & warmth pledge
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
                </div>
              </div>
            </div>
          </div>

          {/* 3 Core Sub-Web Gateway Cards Grid */}
          <section className="process-section" id="senior-portal-cards" style={{ background: "var(--cream)", borderTop: "1px solid var(--line)" }}>
            <div className="section-heading">
              <span className="section-kicker">Explore Every Senior Experience</span>
              <h2>Our Dedicated Senior Sub-Webs</h2>
              <p>
                Each senior tradition has its own rich, dedicated digital experience inside our portal.
              </p>
            </div>

            <div className="senior-portal-grid">
              {/* Card 1: Culture Day */}
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

              {/* Card 2: Gabi Day */}
              <article className="senior-portal-card card-gabi">
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ fontSize: "36px" }}>🧣</span>
                    <span className="badge-tag" style={{ background: "#ffedd5", color: "#9a3412" }}>
                      Heritage Warmth
                    </span>
                  </div>
                  <h3 style={{ fontSize: "24px", color: "var(--forest)", fontFamily: "Playfair Display, serif", margin: "0 0 10px" }}>
                    Traditional Gabi Day
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: 1.6, marginBottom: "20px" }}>
                    Wrapped in warmth, woven in unity. Every senior wears an authentic handspun Ethiopian Gabi or Netela for our morning spiced chai ritual and cohort panoramic portrait.
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--ink)" }}>
                    <li>✓ 5 iconic Gabi weaves & draping styles</li>
                    <li>✓ Morning Chai & Bunna circle traditions</li>
                    <li>✓ Gabi Style pledge & Extra-Gabi sharing network</li>
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

              {/* Card 3: Welcome & Jacket Day */}
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

          {/* Senior Milestone Roadmap */}
          <section className="process-section" style={{ background: "#ffffff", borderTop: "1px solid var(--line)" }}>
            <div className="section-heading">
              <span className="section-kicker">Senior Batch ’26 Timeline</span>
              <h2>The Journey of Our Final Year</h2>
              <p>
                From our first day together to the final stage walk, here is how we commemorate every senior milestone.
              </p>
            </div>

            <div className="process-grid" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
              <article>
                <span className="step-num">01</span>
                <h3>Welcome & Jacket Day</h3>
                <p>
                  Senior batch welcome assembly, unboxing the forest green & gold varsity jackets, and hallway walk of fame.
                </p>
              </article>
              <article>
                <span className="step-num">02</span>
                <h3>Gabi Day & Chai Assembly</h3>
                <p>
                  Draped in handspun Ethiopian white cotton, sharing morning spiced tea, stories, and our cohort panorama.
                </p>
              </article>
              <article>
                <span className="step-num">03</span>
                <h3>Ethiopian Culture Day</h3>
                <p>
                  The grand celebration honoring 10 regional cultures with authentic garments, music, dance, and cultural feast.
                </p>
              </article>
              <article>
                <span className="step-num">04</span>
                <h3>Commencement & Ball</h3>
                <p>
                  Walking across the graduation stage, receiving diplomas, tossing caps, and stepping into the future.
                </p>
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
                  className={`senior-day-pill ${annFilterTag === "culture" ? "active" : ""}`}
                  onClick={() => setAnnFilterTag("culture")}
                >
                  🇪🇹 Culture Day
                </button>
                <button
                  type="button"
                  className={`senior-day-pill ${annFilterTag === "gabi" ? "active" : ""}`}
                  onClick={() => setAnnFilterTag("gabi")}
                >
                  🧣 Gabi Day
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
              <span>🧣 BGMCS Senior Gabi Day Sub-Web (የጋቢ ቀን)</span>
              <span className="pill-badge" style={{ background: "#f59e0b", color: "#451a03" }}>
                {gabiRegistrations.length} Pledged
              </span>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <a href="#gabi-styles" style={{ color: "#fde047", fontSize: "13px", fontWeight: 600 }}>Weaves</a>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
              <a href="#gabi-register" style={{ color: "#fde047", fontSize: "13px", fontWeight: 600 }}>Pledge</a>
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
              <div className="hero-actions">
                <a
                  className="primary-button"
                  href="#gabi-register"
                  style={{ background: "#92400e" }}
                >
                  Pledge Your Gabi <Icon name="arrow" />
                </a>
                <div className="event-date">
                  <Icon name="calendar" />
                  <span>
                    <small>Senior Gabi Assembly</small>
                    Morning Spiced Chai Gathering
                  </span>
                </div>
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
                  Four-layer Arba Gabi, Chencha Tibeb, Kuta drapes & morning chai
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
                <span className="badge-tag" style={{ background: "#fef3c7", color: "#92400e", marginBottom: "12px" }}>
                  ☕ Traditional Morning Assembly
                </span>
                <h3 style={{ fontSize: "26px", fontFamily: "Playfair Display, serif", margin: "8px 0 12px", color: "#ffffff" }}>
                  The Ritual of Gabi Day
                </h3>
                <p style={{ color: "#fef3c7", fontSize: "14px", lineHeight: 1.6, margin: "0 0 20px" }}>
                  On Gabi Day, the courtyard fills with white cotton, steaming cinnamon chai, and traditional popcorn. Seniors gather on the grand steps for our panoramic portrait, followed by our senior wisdom and memory exchange.
                </p>

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
              <span className="section-kicker">Gabi Day Portal</span>
              <h2>Pledge your Gabi for the assembly</h2>
              <p>
                Let the senior committee know which style you’re draping, and whether you have an extra Gabi to share with a classmate.
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
                Seniors who have confirmed their traditional white Gabi attire for our morning gathering.
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
              <span>🧥 BGMCS Senior Welcome & Official Jacket Day Sub-Web</span>
              <span className="pill-badge" style={{ background: "#d7a52c", color: "#0e2a20" }}>
                {jacketRegistrations.length} Orders Confirmed
              </span>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <a href="#jacket-customizer" style={{ color: "#fde047", fontSize: "13px", fontWeight: 600 }}>Visualizer</a>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
              <a href="#jacket-order-form" style={{ color: "#fde047", fontSize: "13px", fontWeight: 600 }}>Order Form</a>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
              <a href="#jacket-roster" style={{ color: "#fde047", fontSize: "13px", fontWeight: 600 }}>Jacket Roster</a>
            </div>
          </div>

          {/* Jacket Hero */}
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

            {/* Interactive Live Jacket Customizer Stage */}
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

                {/* SVG Visualizer */}
                <SeniorJacketVisualizer
                  side={customizerSide}
                  nickname={customizerNickname}
                  size={customizerSize}
                  fit={customizerFit}
                />

                {/* Live Customizer Controls */}
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

          {/* Jacket Details & Specifications */}
          <section className="process-section" style={{ background: "var(--cream)", borderTop: "1px solid var(--line)" }}>
            <div className="section-heading">
              <span className="section-kicker">Tailored Class Heritage</span>
              <h2>Senior Jacket Specifications</h2>
              <p>
                Every detail of the official BGMCS Class of 2026 Varsity Jacket is built for lifetime memories.
              </p>
            </div>

            <div className="process-grid" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
              <article>
                <span className="step-num">01</span>
                <h3>Heavyweight Wool & Leather</h3>
                <p>
                  Rich forest green body crafted from insulating wool blend, paired with gold vegan leather sleeves and athletic rib knit cuffs.
                </p>
              </article>
              <article>
                <span className="step-num">02</span>
                <h3>Embroidered BGMCS Crest</h3>
                <p>
                  High-definition gold embroidery of the official BGMCS school crest shield on the left chest.
                </p>
              </article>
              <article>
                <span className="step-num">03</span>
                <h3>Chenille ’26 Patch</h3>
                <p>
                  Raised 3D chenille varsity numbers on the right chest celebrating our graduation year.
                </p>
              </article>
              <article>
                <span className="step-num">04</span>
                <h3>Personalized Back Nickname</h3>
                <p>
                  Your unique chosen senior nickname arched across the shoulders in varsity collegiate gold lettering.
                </p>
              </article>
            </div>
          </section>

          {/* Senior Jacket Order Form */}
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

          {/* Senior Jacket Orders Roster */}
          <section className="process-section" id="jacket-roster" style={{ background: "#ffffff", borderTop: "1px solid var(--line)" }}>
            <div className="section-heading">
              <span className="section-kicker">Class of 2026 Registry</span>
              <h2>Confirmed Senior Jacket Orders</h2>
              <p>
                Seniors who have confirmed their jacket size and back nickname embroidery.
              </p>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "14px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => refreshCloudJacket(true)}
                  disabled={isRefreshingJacketCloud}
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
                  <span style={{ display: "inline-block", transform: isRefreshingJacketCloud ? "rotate(360deg)" : "none", transition: "transform 0.6s ease" }}>
                    🔄
                  </span>
                  {isRefreshingJacketCloud ? "Refreshing..." : "Refresh Jacket Orders"}
                </button>
                <span style={{ fontSize: "12px", color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                  {jacketRegistrations.length} Orders Confirmed
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
                jacketRegistrations.map((student) => {
                  const isNewlyAdded = student.id === highlightedJacketId;
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
                  );
                })
              )}
            </div>
          </section>
        </section>
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
            onClick={() => navigateToDay("culture")}
            style={{ background: "none", border: "none", color: "var(--gold)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
          >
            Culture Day
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => navigateToDay("gabi")}
            style={{ background: "none", border: "none", color: "var(--gold)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
          >
            Gabi Day
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
                    Please enter the Senior Committee passcode to access rosters, announcements, and clothes management.
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
                    🇪🇹 Culture Day ({registrations.length})
                  </button>
                  <button
                    type="button"
                    className={`admin-tab ${adminTab === "gabi" ? "active" : ""}`}
                    onClick={() => setAdminTab("gabi")}
                  >
                    🧣 Gabi Day ({gabiRegistrations.length})
                  </button>
                  <button
                    type="button"
                    className={`admin-tab ${adminTab === "jacket" ? "active" : ""}`}
                    onClick={() => setAdminTab("jacket")}
                  >
                    🧥 Jacket Orders ({jacketRegistrations.length})
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
                    👗 Cultural Outfits ({culturalLooks.length})
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
                  {/* TAB 1: CULTURE DAY REGISTRATIONS */}
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
                        <div className="admin-stat-card">
                          <span>Active 3D Display Outfits</span>
                          <strong>{culturalLooks.length}</strong>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: "10px", flex: 1, minWidth: "260px" }}>
                          <input
                            type="text"
                            placeholder="Search student name or email..."
                            value={adminSearch}
                            onChange={(e) => setAdminSearch(e.target.value)}
                            style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                          />
                          <select
                            value={adminFilterOutfit}
                            onChange={(e) => setAdminFilterOutfit(e.target.value)}
                            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                          >
                            <option value="all">All Outfits</option>
                            {allOutfitOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            className="btn-gold"
                            onClick={exportCultureCSV}
                          >
                            <Icon name="download" /> Export CSV
                          </button>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => refreshCloudRegistrations(true)}
                          >
                            <Icon name="rotate" /> Sync Cloud
                          </button>
                        </div>
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
                            {filteredRegistrations.length === 0 ? (
                              <tr>
                                <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                                  No registered seniors match the search query.
                                </td>
                              </tr>
                            ) : (
                              filteredRegistrations.map((r) => (
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
                                  <td>
                                    <span className="badge-tag">{r.outfit}</span>
                                  </td>
                                  <td style={{ color: "#64748b", fontSize: "12px" }}>{r.date || "Recent"}</td>
                                  <td>
                                    <button
                                      type="button"
                                      className="btn-danger"
                                      onClick={() => handleDeleteRegistration(r.id)}
                                      title="Delete Registration"
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

                  {/* TAB 2: GABI DAY REGISTRATIONS */}
                  {adminTab === "gabi" && (
                    <div>
                      <div className="admin-stats">
                        <div className="admin-stat-card">
                          <span>Total Gabi Pledges</span>
                          <strong>{gabiRegistrations.length}</strong>
                        </div>
                        <div className="admin-stat-card">
                          <span>Extra Gabi Helpers</span>
                          <strong>{gabiRegistrations.filter(g => g.extraGabi).length}</strong>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginBottom: "16px" }}>
                        <button type="button" className="btn-gold" onClick={exportGabiCSV}>
                          <Icon name="download" /> Export Gabi CSV
                        </button>
                        <button type="button" className="btn-primary" onClick={() => refreshCloudGabi(true)}>
                          <Icon name="rotate" /> Sync Cloud
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
                            {gabiRegistrations.length === 0 ? (
                              <tr>
                                <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                                  No Gabi Day registrations yet.
                                </td>
                              </tr>
                            ) : (
                              gabiRegistrations.map((g) => (
                                <tr key={g.id}>
                                  <td><strong>{g.name}</strong></td>
                                  <td style={{ color: "#64748b" }}>{g.email}</td>
                                  <td><span className="badge-tag" style={{ background: "#fef3c7", color: "#92400e" }}>{g.gabiType}</span></td>
                                  <td>
                                    {g.extraGabi ? (
                                      <span className="badge-tag" style={{ background: "#dcfce7", color: "#166534" }}>Yes (Lending 1)</span>
                                    ) : (
                                      <span style={{ color: "#94a3b8" }}>No</span>
                                    )}
                                  </td>
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
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: JACKET ORDERS */}
                  {adminTab === "jacket" && (
                    <div>
                      <div className="admin-stats">
                        <div className="admin-stat-card">
                          <span>Total Jacket Orders</span>
                          <strong>{jacketRegistrations.length}</strong>
                        </div>
                        <div className="admin-stat-card">
                          <span>Sizes Breakdown</span>
                          <span style={{ fontSize: "12px", color: "var(--forest)", marginTop: "4px", display: "block" }}>
                            S: {jacketRegistrations.filter(j => j.size === "S").length} | M: {jacketRegistrations.filter(j => j.size === "M").length} | L: {jacketRegistrations.filter(j => j.size === "L").length} | XL: {jacketRegistrations.filter(j => j.size === "XL").length} | 2XL: {jacketRegistrations.filter(j => j.size === "XXL").length}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginBottom: "16px" }}>
                        <button type="button" className="btn-gold" onClick={exportJacketCSV}>
                          <Icon name="download" /> Export Jacket CSV
                        </button>
                        <button type="button" className="btn-primary" onClick={() => refreshCloudJacket(true)}>
                          <Icon name="rotate" /> Sync Cloud
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
                              <th>Date</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {jacketRegistrations.length === 0 ? (
                              <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                                  No Senior Jacket orders submitted yet.
                                </td>
                              </tr>
                            ) : (
                              jacketRegistrations.map((j) => (
                                <tr key={j.id}>
                                  <td><strong>{j.name}</strong></td>
                                  <td style={{ color: "#64748b" }}>{j.email}</td>
                                  <td>
                                    <strong style={{ color: "#0b2a20", letterSpacing: "1px" }}>"{j.nickname}"</strong>
                                  </td>
                                  <td>
                                    <span className="badge-tag" style={{ background: "#183c2f", color: "#ffffff" }}>{j.size}</span>
                                  </td>
                                  <td>{j.fit}</td>
                                  <td style={{ color: "#64748b", fontSize: "12px" }}>{j.date || "Recent"}</td>
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
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: ANNOUNCEMENTS */}
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
                              placeholder="Announcement Title (e.g. Schedule for Gabi Day Assembly)"
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
                              <option value="all">Category: All Senior Days</option>
                              <option value="culture">Category: 🇪🇹 Culture Day</option>
                              <option value="gabi">Category: 🧣 Gabi Day</option>
                              <option value="jacket">Category: 🧥 Jacket Day</option>
                            </select>
                          </div>

                          <textarea
                            placeholder="Write message, who wears what, guidelines, or schedule..."
                            value={newAnnContent}
                            onChange={(e) => setNewAnnContent(e.target.value)}
                            required
                            rows={4}
                            style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", resize: "vertical" }}
                          />
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                              <input
                                type="text"
                                placeholder="Author / Signature"
                                value={newAnnAuthor}
                                onChange={(e) => setNewAnnAuthor(e.target.value)}
                                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", width: "180px" }}
                              />
                              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                                <input
                                  type="checkbox"
                                  checked={newAnnPinned}
                                  onChange={(e) => setNewAnnPinned(e.target.checked)}
                                />
                                📌 Pin this notice to top
                              </label>
                            </div>
                            <button type="submit" className="btn-gold">
                              Publish to Board
                            </button>
                          </div>
                        </form>
                      </div>

                      <h4 style={{ margin: "0 0 14px", color: "#0b2a20" }}>Active Announcements ({announcements.length})</h4>
                      <div>
                        {announcements.map((ann) => (
                          <div key={ann.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "16px", borderRadius: "12px", marginBottom: "12px", display: "flex", justifyContent: "space-between", gap: "16px" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                <strong style={{ fontSize: "15px", color: "#0b2a20" }}>{ann.title}</strong>
                                {ann.pinned && <span className="badge-tag" style={{ background: "#fef3c7", color: "#92400e" }}>Pinned</span>}
                                {ann.tag && <span className="badge-tag" style={{ background: "#f1f5f9", color: "#334155" }}>{ann.tag}</span>}
                              </div>
                              <small style={{ color: "#64748b", display: "block", marginBottom: "8px" }}>
                                By {ann.author} • {ann.date}
                              </small>
                              <p style={{ margin: 0, fontSize: "13px", color: "#334155", whiteSpace: "pre-line" }}>
                                {ann.content}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="btn-danger"
                              onClick={() => handleDeleteAnnouncement(ann.id)}
                              style={{ alignSelf: "flex-start" }}
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: CLOTHES IN 3D DISPLAY */}
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
                          <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "#334155" }}>
                              Outfit Name / Label *
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Gurage Cultural Kemis"
                              value={newClothLabel}
                              onChange={(e) => setNewClothLabel(e.target.value)}
                              required
                              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                            />
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "#334155" }}>
                              Amharic Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. የጉራጌ ባህላዊ ልብስ"
                              value={newClothAmharic}
                              onChange={(e) => setNewClothAmharic(e.target.value)}
                              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                            />
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "#334155" }}>
                              Ethiopian Region *
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Gurage / Southern Ethiopia"
                              value={newClothRegion}
                              onChange={(e) => setNewClothRegion(e.target.value)}
                              required
                              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                            />
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "#334155" }}>
                              Fabrics (comma separated)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Fine Cotton, Silk Border"
                              value={newClothFabrics}
                              onChange={(e) => setNewClothFabrics(e.target.value)}
                              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                            />
                          </div>

                          <div style={{ gridColumn: "1 / -1" }}>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "#334155" }}>
                              Garment Description & Heritage Story
                            </label>
                            <textarea
                              placeholder="Describe the cultural attire, weaving style, and celebration history..."
                              value={newClothDesc}
                              onChange={(e) => setNewClothDesc(e.target.value)}
                              rows={2}
                              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                            />
                          </div>

                          <div style={{ background: "#ffffff", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                            <strong style={{ display: "block", fontSize: "13px", color: "#0b2a20", marginBottom: "6px" }}>
                              👩 Female Look Photo
                            </strong>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFemaleUpload}
                              style={{ fontSize: "12px", marginBottom: "8px" }}
                            />
                            <input
                              type="url"
                              placeholder="Or paste Female Image URL..."
                              value={newClothFemaleImg.startsWith("data:") ? "" : newClothFemaleImg}
                              onChange={(e) => setNewClothFemaleImg(e.target.value)}
                              style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                            />
                            {newClothFemaleImg && (
                              <img
                                src={newClothFemaleImg}
                                alt="Female preview"
                                style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", marginTop: "8px", border: "1px solid #cbd5e1" }}
                              />
                            )}
                          </div>

                          <div style={{ background: "#ffffff", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                            <strong style={{ display: "block", fontSize: "13px", color: "#0b2a20", marginBottom: "6px" }}>
                              👨 Male Look Photo
                            </strong>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleMaleUpload}
                              style={{ fontSize: "12px", marginBottom: "8px" }}
                            />
                            <input
                              type="url"
                              placeholder="Or paste Male Image URL..."
                              value={newClothMaleImg.startsWith("data:") ? "" : newClothMaleImg}
                              onChange={(e) => setNewClothMaleImg(e.target.value)}
                              style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                            />
                            {newClothMaleImg && (
                              <img
                                src={newClothMaleImg}
                                alt="Male preview"
                                style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", marginTop: "8px", border: "1px solid #cbd5e1" }}
                              />
                            )}
                          </div>

                          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                            <button type="submit" className="btn-gold">
                              <Icon name="plus" />
                              Add to 3D Showcase Display
                            </button>
                          </div>
                        </form>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <h4 style={{ margin: 0, color: "#0b2a20" }}>Current Outfits in 3D Showcase ({culturalLooks.length})</h4>
                        <button
                          type="button"
                          onClick={handleResetClothes}
                          style={{ background: "transparent", border: "none", color: "#64748b", fontSize: "12px", cursor: "pointer", textDecoration: "underline" }}
                        >
                          Reset Outfits to Default 10
                        </button>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
                        {culturalLooks.map((cloth, idx) => (
                          <div
                            key={cloth.id}
                            style={{
                              background: "#ffffff",
                              borderRadius: "12px",
                              border: "1px solid #e2e8f0",
                              overflow: "hidden",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                            }}
                          >
                            <div style={{ position: "relative", height: "140px", background: "#f1f5f9" }}>
                              <img
                                src={cloth.src}
                                alt={cloth.label}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                              <span style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(0,0,0,0.65)", color: "#fff", fontSize: "10px", padding: "2px 6px", borderRadius: "4px" }}>
                                #{idx + 1}
                              </span>
                              {cloth.custom && (
                                <span style={{ position: "absolute", top: "8px", right: "8px", background: "#d4a024", color: "#0b2a20", fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                                  Custom
                                </span>
                              )}
                            </div>
                            <div style={{ padding: "10px 12px" }}>
                              <strong style={{ display: "block", fontSize: "13px", color: "#0b2a20", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {cloth.label}
                              </strong>
                              <small style={{ color: "#64748b", display: "block", fontSize: "11px", marginBottom: "8px" }}>
                                {cloth.region}
                              </small>
                              {cloth.custom && (
                                <button
                                  type="button"
                                  className="btn-danger"
                                  onClick={() => handleDeleteCloth(cloth.id)}
                                  style={{ width: "100%", padding: "4px 8px", fontSize: "11px" }}
                                >
                                  Remove Outfit
                                </button>
                              )}
                            </div>
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

export default App;
