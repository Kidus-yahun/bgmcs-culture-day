import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type Registration = {
  id: number;
  name: string;
  email: string;
  outfit: string;
  image?: string;
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
    region: "Welayta (Southern Ethiopia)",
    description: "Recognized by its signature vibrant triple-band stripes of bright yellow, bold red, and deep black woven onto pristine white Shemma cotton, expressing unity and joyful celebration.",
    fabrics: ["Southern Woven Cotton", "Dyed Yarn Ribbons"],
    accessories: ["Matching Striped Shawl", "Cultural Beaded Necklace"]
  },
  {
    id: "sidama-attire",
    src: assetUrl("images/sidama_female.jpg"),
    backSrc: assetUrl("images/sidama_male.jpg"),
    alt: "Sidama Fichee-Chambalaalla Dress - Woven cotton with red, green, and yellow celebratory bands",
    label: "Sidama Celebration Dress",
    amharic: "የሲዳማ ባህላዊ ልብስ",
    region: "Sidama",
    description: "Celebrated during the New Year festival of Fichee-Chambalaalla. Distinctive woven cotton with red, green, and golden yellow bands symbolizing fertile soil, nature, and communal peace.",
    fabrics: ["Handmade Shemma", "Colored Cotton Bands"],
    accessories: ["Ceremonial Staff", "Woven Band Headband", "Beaded Bangles"]
  },
  {
    id: "afar-sanafil",
    src: assetUrl("images/afar_male.jpg"),
    backSrc: assetUrl("images/afar_female.jpg"),
    alt: "Afar Traditional Sanafil & Shawl - Iconic wrap-around skirt with indigo and crimson borders",
    label: "Afar Sanafil & Shawl",
    amharic: "የአፋር ባህላዊ ሳናፊል",
    region: "Afar (Danakil & Awash Basin)",
    description: "Iconic Sanafil wrap skirt with bold indigo and crimson borders, paired with lightweight white cotton body wrap and decorative silver dagger (Jile) sheath accessories.",
    fabrics: ["Breathable Muslin", "Indigo Dyed Weft", "Embroidered Sash"],
    accessories: ["Silver Jile Scabbard", "Afar Shash Headwrap", "Beaded Choker"]
  }
];

const INITIAL_DEMO_STUDENTS: Registration[] = [
  {
    id: 1,
    name: "Selamawit Tadesse",
    email: "selam.tadesse@school.edu.et",
    outfit: "Habesha Kemis & Netela",
    image: assetUrl("images/habesha_female.jpg"),
    date: "May 18"
  },
  {
    id: 2,
    name: "Dawit Yohannes",
    email: "dawit.y@school.edu.et",
    outfit: "Men's tunic suit & royal Kaba cloak",
    image: assetUrl("images/habesha_male.jpg"),
    date: "May 19"
  },
  {
    id: 3,
    name: "Chaltu Bekele",
    email: "chaltu.b@school.edu.et",
    outfit: "Oromo traditional attire (Wandabo & Caaccuu)",
    image: assetUrl("images/oromo_female.jpg"),
    date: "May 20"
  },
  {
    id: 4,
    name: "Kalkidan Berhe",
    email: "kalkidan.b@school.edu.et",
    outfit: "Tigrayan traditional attire (Zurya & Tilfi)",
    image: assetUrl("images/tigray_female.jpg"),
    date: "May 21"
  },
  {
    id: 5,
    name: "Yonas Mekonnen",
    email: "yonas.m@school.edu.et",
    outfit: "Dorze & Gamo master-woven attire",
    image: assetUrl("images/dorze_male.jpg"),
    date: "May 22"
  },
  {
    id: 6,
    name: "Muna Ahmed",
    email: "muna.ahmed@school.edu.et",
    outfit: "Harari traditional attire (Ashrafi & Velvet)",
    image: assetUrl("images/harari_female.jpg"),
    date: "May 23"
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: "Official Senior Batch Culture Day Attire Schedule & Guidelines",
    content: "Welcome Senior Batch 2026! Please ensure all registered cultural garments are steamed and prepared. Rehearsal for the cultural parade starts at 2:00 PM in the main hall. If you need assistance matching accessories (Netela, Kaba, Caaccuu), visit the committee booth.",
    author: "BGMCS Committee",
    date: "May 20, 2026",
    pinned: true
  },
  {
    id: 2,
    title: "Finalized Student Cultural Attire Assignments",
    content: "• Selamawit Tadesse ➔ Habesha Kemis & Netela (Highlands)\n• Dawit Yohannes ➔ Royal Kaba Cloak & Tunic (Royalty)\n• Chaltu Bekele ➔ Oromo Wandabo & Caaccuu (Oromia)\n• Kalkidan Berhe ➔ Tigray Tilfi & Zurya (Tigray)\n• Yonas Mekonnen ➔ Dorze & Gamo Master-Woven Gabi (Gamo)\n• Muna Ahmed ➔ Harari Cultural Attire (Harar Jugol)\n\nPlease check in with committee leads if you require accessory tailoring!",
    author: "Senior Committee Admin",
    date: "May 22, 2026",
    pinned: true
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

function App() {
  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    try {
      const saved = localStorage.getItem("bgmcs-registrations-v4");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_DEMO_STUDENTS;
    } catch {
      return INITIAL_DEMO_STUDENTS;
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

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem("bgmcs-announcements-v4");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState("");
  const [isSpinning360, setIsSpinning360] = useState(false);
  const [activeLook, setActiveLook] = useState(0);
  const [isFlippedToMale, setIsFlippedToMale] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<CulturalLook>(culturalLooks[0]);
  const [selectedOutfitInForm, setSelectedOutfitInForm] = useState("");

  // Admin Dashboard States
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem("bgmcs-admin-session") === "true";
  });
  const [adminPasscode, setAdminPasscode] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminTab, setAdminTab] = useState<"registrations" | "announcements" | "clothes">("registrations");
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
  const [annMessage, setAnnMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("bgmcs-registrations-v4", JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem("bgmcs-cultural-looks-v4", JSON.stringify(culturalLooks));
  }, [culturalLooks]);

  useEffect(() => {
    localStorage.setItem("bgmcs-announcements-v4", JSON.stringify(announcements));
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const outfitVal = String(form.get("outfit"));
    const matchedLook = culturalLooks.find((l) => outfitVal.includes(l.label) || l.label.includes(outfitVal));

    const entry: Registration = {
      id: Date.now(),
      name: String(form.get("name")),
      email: String(form.get("email")),
      outfit: outfitVal,
      image: preview || (matchedLook ? matchedLook.src : undefined),
      date: "Just now"
    };

    setRegistrations((current) => [entry, ...current]);
    setIsSubmitted(true);
    setFileName("");
    setPreview("");
    event.currentTarget.reset();
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

  function handleDeleteRegistration(id: number) {
    if (window.confirm("Are you sure you want to delete this senior registration?")) {
      setRegistrations(prev => prev.filter(r => r.id !== id));
    }
  }

  function exportCSV() {
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

  function handleAnnounceRoster() {
    const list = registrations.map(r => `• ${r.name} ➔ ${r.outfit}`).join("\n");
    const newAnn: Announcement = {
      id: Date.now(),
      title: `Official Senior Batch Cultural Attire Roster (${registrations.length} Seniors)`,
      content: `Here is the official lineup of confirmed cultural garments for Senior Culture Day:\n\n${list}\n\nPlease reach out to the committee if any accessory assistance is needed!`,
      author: "BGMCS Committee Admin",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      pinned: true
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    setAdminTab("announcements");
    setAnnMessage("Attire roster announced publicly!");
    setTimeout(() => setAnnMessage(""), 4000);
  }

  function handleCreateAnnouncement(e: FormEvent) {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;
    const newAnn: Announcement = {
      id: Date.now(),
      title: newAnnTitle,
      content: newAnnContent,
      author: newAnnAuthor || "BGMCS Senior Committee",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      pinned: newAnnPinned
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    setNewAnnTitle("");
    setNewAnnContent("");
    setAnnMessage("Announcement published successfully!");
    setTimeout(() => setAnnMessage(""), 4000);
  }

  function handleDeleteAnnouncement(id: number) {
    if (window.confirm("Delete this announcement?")) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
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
    setActiveLook(culturalLooks.length); // Immediately focus on the newly added outfit!
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

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Culture Day home">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>BGMCS Culture Day</strong>
            <small>Senior Batch ’26</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#story">Our story</a>
          <a href="#how-it-works">How it works</a>
          <a href="#looks">Cultural looks</a>
          <a href="#announcements">Announcements</a>
          <a href="#roster">Senior roster</a>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            className="admin-nav-btn"
            onClick={() => setIsAdminOpen(true)}
            aria-label="Open Admin Dashboard"
          >
            <Icon name="shield" />
            Admin Portal
          </button>
          <a className="nav-cta" href="#register">
            Register now <Icon name="arrow" />
          </a>
        </div>
      </header>

      <section className="hero" id="top">
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
              <span>+{Math.max(28, registrations.length + 28)}</span>
            </div>
            <p>
              <strong>Students are joining</strong>
              {culturalLooks.length} traditional regions ready to celebrate
            </p>
          </div>
        </div>

        <div className="hero-visual" id="looks">
          <div className="hero-pattern" />
          
          {/* Top Gender Switcher on 360 Card */}
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

          <div className="outfit-stage">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <button
              className={`outfit-card ${isFlippedToMale ? "flipped" : ""} ${isSpinning360 ? "spinning" : ""}`}
              type="button"
              onClick={() => {
                setIsSpinning360(false);
                setIsFlippedToMale((val) => !val);
              }}
              aria-label="Click to flip outfit between female and male looks"
              title="Click to flip between Female and Male look"
            >
              <span className="outfit-face outfit-front">
                <img src={selectedLook.src} alt={`${selectedLook.label} - Female Look`} />
              </span>
              <span className="outfit-face outfit-back">
                <img src={selectedLook.backSrc} alt={`${selectedLook.label} - Male Look`} />
              </span>
            </button>
          </div>

          <div className="look-caption">
            <span className="look-counter">{String(activeLook + 1).padStart(2, "0")} / {String(culturalLooks.length).padStart(2, "0")}</span>
          </div>

          <div className="look-controls">
            <button
              type="button"
              onClick={() =>
                setActiveLook((current) => (current - 1 + culturalLooks.length) % culturalLooks.length)
              }
              aria-label="Previous cultural look"
              title="Previous cultural look"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setIsSpinning360((value) => !value)}
              title={isSpinning360 ? "Pause 360° rotation" : "Play 360° rotation"}
            >
              {isSpinning360 ? "Pause 360°" : "Play 360°"}
            </button>
            <button
              type="button"
              className="choose-look-btn"
              onClick={() => handleChooseLook(selectedLook)}
              title={`Select ${selectedLook.label}`}
            >
              Choose this look
            </button>
            <button
              type="button"
              onClick={() => setActiveLook((current) => (current + 1) % culturalLooks.length)}
              aria-label="Next cultural look"
              title="Next cultural look"
            >
              →
            </button>
          </div>
        </div>
      </section>

      <section className="process-section" id="how-it-works">
        <div className="section-heading">
          <span className="section-kicker">Fair, simple, joyful</span>
          <h2>How the celebration works</h2>
          <p>
            Pick the tradition you would love to represent. We’ll make sure our final
            lineup celebrates the beautiful variety of Ethiopia.
          </p>
        </div>
        <div className="process-grid">
          <article>
            <span className="step-num">01</span>
            <h3>Explore & select</h3>
            <p>
              Browse our high-definition authentic photography of real Ethiopian women and men wearing traditional attire across the country.
            </p>
          </article>
          <article>
            <span className="step-num">02</span>
            <h3>Balanced diversity</h3>
            <p>
              If multiple students pick the same attire, our Lucky Wheel helps distribute styles fairly so every corner of Ethiopia is represented.
            </p>
          </article>
          <article>
            <span className="step-num">03</span>
            <h3>Senior stage shine</h3>
            <p>
              We celebrate our culture together on Friday, May 30, 2026, preserving photos, dances, and senior memories forever.
            </p>
          </article>
        </div>
      </section>

      <section className="registration-section" id="register">
        <div className="form-intro">
          <span className="section-kicker">Student Portal</span>
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
          {isSubmitted ? (
            <div className="success-state">
              <span><Icon name="check" /></span>
              <small>Registration received</small>
              <h2>You’re part of Culture Day.</h2>
              <p>
                Your choice has been saved in our senior roster on this device.
              </p>
              <button type="button" onClick={() => setIsSubmitted(false)}>
                Add another student
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-top">
                <div>
                  <span>BGMCS Culture Day ’26</span>
                  <h2>Register your choice</h2>
                </div>
                <span className="form-count">{registrations.length + 28} joined</span>
              </div>
              <div className="field-row">
                <label>
                  <span>Student full name</span>
                  <input name="name" type="text" placeholder="e.g. Selamawit Tadesse" required />
                </label>
                <label>
                  <span>Student email</span>
                  <input name="email" type="email" placeholder="student@school.edu.et" required />
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

              <button className="submit-button" type="submit">
                Confirm registration
              </button>
              <p className="privacy-note">Your details are only used by the Culture Day planning team.</p>
            </form>
          )}
        </div>
      </section>

      {/* Official Announcements Board */}
      <section className="process-section" id="announcements" style={{ background: "#ffffff", borderTop: "1px solid var(--line)" }}>
        <div className="section-heading">
          <span className="section-kicker">Official Committee Updates</span>
          <h2>Culture Day Announcements & Attire Assignments</h2>
          <p>
            Check here for committee broadcasts, guidelines, and official announcements on what each senior will wear.
          </p>
        </div>

        <div style={{ maxWidth: "880px", margin: "0 auto", padding: "0 20px" }}>
          {announcements.map((ann) => (
            <div key={ann.id} className={`announcement-card ${ann.pinned ? "pinned" : ""}`}>
              <div className="announcement-header">
                <div>
                  <h3 className="announcement-title">{ann.title}</h3>
                  <div className="announcement-meta">
                    <span>By {ann.author}</span>
                    <span>•</span>
                    <span>{ann.date}</span>
                    {ann.pinned && (
                      <span className="badge-tag" style={{ background: "#fef3c7", color: "#92400e" }}>
                        📌 Pinned Notice
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

      {/* Senior Batch Roster Gallery */}
      <section className="process-section" id="roster" style={{ background: "var(--cream)", borderTop: "1px solid var(--line)" }}>
        <div className="section-heading">
          <span className="section-kicker">Senior Batch Community</span>
          <h2>Registered Seniors Roster</h2>
          <p>
            See who has joined and what cultural attire they plan to celebrate with.
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
          {registrations.map((student) => (
            <div
              key={student.id}
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "16px",
                border: "1px solid var(--line)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img
                  src={student.image || assetUrl("images/habesha_female.jpg")}
                  alt={student.name}
                  style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--forest)" }}
                  onError={(e) => { (e.target as HTMLImageElement).src = assetUrl("images/habesha_female.jpg"); }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <strong style={{ display: "block", fontSize: "14px", color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {student.name}
                  </strong>
                  <small style={{ color: "var(--muted)", fontSize: "11px", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {student.email}
                  </small>
                </div>
              </div>

              <div style={{ background: "var(--paper)", padding: "10px", borderRadius: "10px", border: "1px solid var(--line)" }}>
                <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", display: "block" }}>
                  Selected Attire
                </span>
                <strong style={{ fontSize: "13px", color: "var(--forest)", display: "block", marginTop: "2px" }}>
                  {student.outfit}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span><strong>BGMCS Culture Day</strong><small>Senior Batch ’26</small></span>
        </a>
        <p>Made with pride for every story in our senior batch.</p>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setIsAdminOpen(true)}
            style={{ background: "transparent", border: "none", color: "var(--gold)", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}
          >
            Admin Dashboard 🔐
          </button>
          <a href="#register">Join the celebration ↑</a>
        </div>
      </footer>

      {/* ==========================================================================
          Admin Dashboard Modal
          ========================================================================== */}
      {isAdminOpen && (
        <div className="admin-overlay" onClick={() => setIsAdminOpen(false)}>
          <div className="admin-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="admin-header">
              <div>
                <h3>BGMCS Culture Day — Admin Portal</h3>
                <small style={{ color: "rgba(255,255,255,0.7)" }}>
                  Manage registrations, announce assignments, and add clothes to display
                </small>
              </div>
              <button
                type="button"
                className="admin-close-btn"
                onClick={() => setIsAdminOpen(false)}
                aria-label="Close Admin Modal"
              >
                ✕
              </button>
            </div>

            {!isAdminLoggedIn ? (
              <div style={{ padding: "40px 30px", textAlign: "center", maxWidth: "420px", margin: "0 auto" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#e6f4ea", color: "#137333", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Icon name="shield" />
                </div>
                <h4 style={{ fontSize: "20px", marginBottom: "8px", color: "#0b2a20" }}>Admin Authorization</h4>
                <p style={{ color: "#718096", fontSize: "13px", marginBottom: "20px" }}>
                  Enter the committee passcode to view student choices, post official announcements, and manage display clothes.
                </p>

                <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <input
                    type="password"
                    placeholder="Enter admin passcode"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      textAlign: "center"
                    }}
                    autoFocus
                  />
                  {adminError && (
                    <div style={{ color: "#dc2626", fontSize: "12px", fontWeight: 600 }}>
                      {adminError}
                    </div>
                  )}
                  <button type="submit" className="btn-gold" style={{ justifyContent: "center" }}>
                    Unlock Admin Dashboard
                  </button>
                  <small style={{ color: "#94a3b8", fontSize: "11px", marginTop: "4px" }}>
                    🔒 Authorized BGMCS Committee Members Only
                  </small>
                </form>
              </div>
            ) : (
              <>
                <div className="admin-tabs">
                  <button
                    type="button"
                    className={`admin-tab ${adminTab === "registrations" ? "active" : ""}`}
                    onClick={() => setAdminTab("registrations")}
                  >
                    📋 Senior Registrations ({registrations.length})
                  </button>
                  <button
                    type="button"
                    className={`admin-tab ${adminTab === "announcements" ? "active" : ""}`}
                    onClick={() => setAdminTab("announcements")}
                  >
                    📢 Attire Announcements ({announcements.length})
                  </button>
                  <button
                    type="button"
                    className={`admin-tab ${adminTab === "clothes" ? "active" : ""}`}
                    onClick={() => setAdminTab("clothes")}
                  >
                    👗 Add Display Clothes ({culturalLooks.length})
                  </button>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", paddingRight: "10px" }}>
                    <button
                      type="button"
                      onClick={handleAdminLogout}
                      style={{ background: "transparent", border: "none", color: "#e11d48", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                    >
                      Lock Portal 🔒
                    </button>
                  </div>
                </div>

                <div className="admin-body">
                  {/* TAB 1: REGISTRATIONS & CHOICES */}
                  {adminTab === "registrations" && (
                    <div>
                      {/* Metric cards */}
                      <div className="admin-stats">
                        <div className="admin-stat-card">
                          <span>Total Registered</span>
                          <strong>{registrations.length}</strong>
                        </div>
                        <div className="admin-stat-card">
                          <span>Active Clothes</span>
                          <strong>{culturalLooks.length}</strong>
                        </div>
                        <div className="admin-stat-card">
                          <span>Published Notices</span>
                          <strong>{announcements.length}</strong>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "12px", marginBottom: "20px" }}>
                        <div style={{ display: "flex", gap: "10px", flex: 1, minWidth: "260px" }}>
                          <input
                            type="text"
                            placeholder="Search by student name or email..."
                            value={adminSearch}
                            onChange={(e) => setAdminSearch(e.target.value)}
                            style={{
                              padding: "10px 14px",
                              borderRadius: "8px",
                              border: "1px solid #cbd5e1",
                              fontSize: "13px",
                              flex: 1
                            }}
                          />
                          <select
                            value={adminFilterOutfit}
                            onChange={(e) => setAdminFilterOutfit(e.target.value)}
                            style={{
                              padding: "10px 14px",
                              borderRadius: "8px",
                              border: "1px solid #cbd5e1",
                              fontSize: "13px",
                              background: "#fff"
                            }}
                          >
                            <option value="all">All Outfits</option>
                            {allOutfitOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            type="button"
                            className="btn-gold"
                            onClick={handleAnnounceRoster}
                            title="Publish this student attire lineup to the public announcements board"
                          >
                            <Icon name="megaphone" />
                            Announce Lineup
                          </button>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={exportCSV}
                            title="Export senior batch registrations to CSV file"
                          >
                            <Icon name="download" />
                            Export CSV
                          </button>
                        </div>
                      </div>

                      {/* Registrations Table */}
                      <div className="admin-table-container">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Photo</th>
                              <th>Student Name</th>
                              <th>Email Address</th>
                              <th>Cultural Attire Chosen</th>
                              <th>Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRegistrations.length === 0 ? (
                              <tr>
                                <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                                  No senior registrations found matching your search.
                                </td>
                              </tr>
                            ) : (
                              filteredRegistrations.map((student) => (
                                <tr key={student.id}>
                                  <td>
                                    <img
                                      src={student.image || assetUrl("images/habesha_female.jpg")}
                                      alt={student.name}
                                      style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", border: "1px solid #cbd5e1" }}
                                      onError={(e) => { (e.target as HTMLImageElement).src = assetUrl("images/habesha_female.jpg"); }}
                                    />
                                  </td>
                                  <td>
                                    <strong>{student.name}</strong>
                                  </td>
                                  <td style={{ color: "#64748b" }}>{student.email}</td>
                                  <td>
                                    <span className="badge-tag">
                                      {student.outfit}
                                    </span>
                                  </td>
                                  <td style={{ color: "#94a3b8", fontSize: "12px" }}>{student.date || "May 2026"}</td>
                                  <td>
                                    <button
                                      type="button"
                                      className="btn-danger"
                                      onClick={() => handleDeleteRegistration(student.id)}
                                      title="Delete registration"
                                    >
                                      Remove
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

                  {/* TAB 2: ANNOUNCEMENTS & ATTIRE BROADCASTS */}
                  {adminTab === "announcements" && (
                    <div>
                      {annMessage && (
                        <div style={{ background: "#dcfce7", color: "#166534", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: 600, fontSize: "13px" }}>
                          ✓ {annMessage}
                        </div>
                      )}

                      <div style={{ background: "#f8faf9", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", marginBottom: "28px" }}>
                        <h4 style={{ margin: "0 0 14px", color: "#0b2a20", fontSize: "16px" }}>
                          📢 Broadcast New Attire Announcement
                        </h4>
                        <form onSubmit={handleCreateAnnouncement} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <input
                            type="text"
                            placeholder="Announcement title (e.g., Final Cultural Attire Assignment for Seniors)"
                            value={newAnnTitle}
                            onChange={(e) => setNewAnnTitle(e.target.value)}
                            required
                            style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                          />
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

                  {/* TAB 3: ADD CLOTHES TO 3D DISPLAY */}
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
                        <form onSubmit={handleAddCustomCloth} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
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

                          {/* Female photo upload or URL */}
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

                          {/* Male photo upload or URL */}
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

                      {/* Current Display Clothes */}
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
