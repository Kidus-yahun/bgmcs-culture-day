import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type Registration = {
  id: number;
  name: string;
  email: string;
  outfit: string;
  image?: string;
  date?: string;
};

const outfitOptions = [
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
};

const assetUrl = (path: string) => {
  const b = import.meta.env.BASE_URL || './';
  const cleanBase = b.endsWith('/') ? b : `${b}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
};

const showcaseImages: CulturalLook[] = [
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
    alt: "Harari Ashrafi & Velvet Tunic - Royal emerald-teal velvet loose tunic with gold brocade",
    label: "Harari Ashrafi Velvet",
    amharic: "የሐረሪ ባህላዊ ልብስ",
    region: "Harar Jugol",
    description: "Influenced by ancient trade and Islamic artisan heritage. Features a wide, loose tunic in deep velvet with glittering gold brocade borders, tapered Sirri trousers, and an ornate headscarf.",
    fabrics: ["Royal Silk Velvet", "Gold Brocade", "Embroidered Satin"],
    accessories: ["Embroidered Headscarf", "Silver Filigree Jewelry", "Sirri Anklets"]
  },
  {
    id: "dorze-gabi",
    src: assetUrl("images/dorze_male.jpg"),
    backSrc: assetUrl("images/dorze_female.jpg"),
    alt: "Dorze & Gamo Master-Woven Gabi - Heavy cotton with black-and-white chevron patterns",
    label: "Dorze Master-Woven Gabi",
    amharic: "የዶርዜ ጥበብ ጋቢ",
    region: "Gamo Highlands / Chencha",
    description: "Crafted by the renowned master weavers of Chencha and Dorze. Features stark geometric chevron weaves and red accent stripes on thick, soft 4-layer cotton Gabi blankets and tunic suits.",
    fabrics: ["Heavy Carded Cotton", "4-Ply Handspun Thread", "Natural Dyes"],
    accessories: ["Woven Shoulder Gabi", "Carved Wooden Staff", "Woven Hat"]
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

function Icon({
  name,
  className = "",
}: {
  name: "arrow" | "calendar" | "check" | "image" | "sparkle" | "upload" | "rotate";
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
      const saved = localStorage.getItem("culture-day-registrations-v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_DEMO_STUDENTS;
    } catch {
      return INITIAL_DEMO_STUDENTS;
    }
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [activeLook, setActiveLook] = useState(0);
  const [isFlippedToMale, setIsFlippedToMale] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<CulturalLook>(showcaseImages[0]);
  const [selectedOutfitInForm, setSelectedOutfitInForm] = useState("");

  useEffect(() => {
    localStorage.setItem("culture-day-registrations-v3", JSON.stringify(registrations));
  }, [registrations]);

  const selectedLook = useMemo(() => showcaseImages[activeLook], [activeLook]);

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const outfitVal = String(form.get("outfit"));
    const matchedLook = showcaseImages.find((l) => outfitVal.includes(l.label) || l.label.includes(outfitVal));

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
      const nextIdx = count % showcaseImages.length;
      setSpinResult(showcaseImages[nextIdx]);
      playTickSound();
      count += 1;
      if (count > 18) {
        window.clearInterval(timer);
        const winner = showcaseImages[Math.floor(Math.random() * showcaseImages.length)];
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
            <strong>Culture Day</strong>
            <small>Senior Batch ’26</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#story">Our story</a>
          <a href="#how-it-works">How it works</a>
          <a href="#looks">Cultural looks</a>
          <a href="#roster">Senior roster</a>
        </nav>
        <a className="nav-cta" href="#register">
          Register now <Icon name="arrow" />
        </a>
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
            Senior Culture Day is our chance to honour Ethiopia’s rich textile traditions,
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
              {showcaseImages.slice(0, 4).map((image) => (
                <img key={image.id} src={image.src} alt="" />
              ))}
              <span>+{Math.max(28, registrations.length + 28)}</span>
            </div>
            <p>
              <strong>Students are joining</strong>
              10 traditional regions ready to celebrate
            </p>
          </div>
        </div>

        <div className="hero-visual" id="looks">
          <div className="hero-pattern" />
          
          {/* Top Gender Switcher on 360 Card */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "16px", zIndex: 10 }}>
            <button
              type="button"
              onClick={() => setIsFlippedToMale(false)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                background: !isFlippedToMale ? "var(--forest)" : "rgba(255,255,255,0.7)",
                color: !isFlippedToMale ? "#fff" : "var(--ink)",
                border: "1px solid var(--line)",
                transition: "all 0.2s"
              }}
            >
              👩 Female Look
            </button>
            <button
              type="button"
              onClick={() => setIsFlippedToMale(true)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                background: isFlippedToMale ? "var(--forest)" : "rgba(255,255,255,0.7)",
                color: isFlippedToMale ? "#fff" : "var(--ink)",
                border: "1px solid var(--line)",
                transition: "all 0.2s"
              }}
            >
              👨 Male Look
            </button>
          </div>

          <div className={`outfit-stage ${isPaused ? "is-paused" : ""}`}>
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <button
              className="outfit-card"
              type="button"
              onClick={() => setIsPaused((value) => !value)}
              aria-label={isPaused ? "Resume outfit rotation" : "Pause outfit rotation"}
              title="Click to play or pause 360° spin"
            >
              <span className="outfit-face outfit-front">
                <img src={isFlippedToMale ? selectedLook.backSrc : selectedLook.src} alt={selectedLook.alt} />
              </span>
              <span className="outfit-face outfit-back">
                <img src={isFlippedToMale ? selectedLook.src : selectedLook.backSrc} alt={selectedLook.label} />
              </span>
            </button>
          </div>

          <div className="look-caption">
            <span>{String(activeLook + 1).padStart(2, "0")} / {String(showcaseImages.length).padStart(2, "0")}</span>
            <div>
              <strong>{selectedLook.label}</strong>
              <small>{selectedLook.region} · {selectedLook.amharic}</small>
            </div>
          </div>

          <div className="look-controls">
            <button
              type="button"
              onClick={() =>
                setActiveLook((current) => (current - 1 + showcaseImages.length) % showcaseImages.length)
              }
              aria-label="Previous cultural look"
            >
              ←
            </button>
            <button type="button" onClick={() => setIsPaused((value) => !value)}>
              {isPaused ? "Play 360°" : "Pause 360°"}
            </button>
            <button
              type="button"
              onClick={() => setActiveLook((current) => (current + 1) % showcaseImages.length)}
              aria-label="Next cultural look"
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
            <span className="step-number">01</span>
            <div className="step-icon"><Icon name="image" /></div>
            <h3>Choose your clothing</h3>
            <p>Name the cultural outfit you want to wear and add a reference photo if you have one.</p>
          </article>
          <article>
            <span className="step-number">02</span>
            <div className="step-icon"><Icon name="sparkle" /></div>
            <h3>We balance the choices</h3>
            <p>If too many students choose the same look, those names go into a transparent random draw.</p>
          </article>
          <article>
            <span className="step-number">03</span>
            <div className="step-icon"><Icon name="check" /></div>
            <h3>Celebrate together</h3>
            <p>Everyone receives a final look, so our senior batch represents more communities and traditions.</p>
          </article>
        </div>
      </section>

      <section className="registration-section" id="register">
        <div className="form-intro">
          <span className="section-kicker light">Your culture. Your story.</span>
          <h2>Save your cultural look.</h2>
          <p>
            Tell the planning team what you would like to wear. Images are optional,
            but they help us understand your exact traditional style.
          </p>
          <div className="fairness-card">
            <Icon name="sparkle" />
            <div>
              <strong>A fair final lineup</strong>
              <p>
                Same outfit choices are entered into a random draw. No favourites,
                no first-come advantage—just a balanced celebration.
              </p>
            </div>
          </div>

          {/* Interactive Random Draw Spinner with Authentic Model Preview */}
          <div className="mini-spinner" style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "stretch" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img
                src={spinResult.src}
                alt={spinResult.label}
                style={{ width: "48px", height: "48px", borderRadius: "10px", objectFit: "cover", border: "2px solid var(--gold)" }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <small style={{ color: "rgba(255,255,255,0.7)", display: "block" }}>Draw preview ({spinResult.region.split("(")[0]})</small>
                <strong className={isSpinning ? "is-shuffling" : ""} style={{ fontSize: "14px", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {spinResult.label}
                </strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={runSpin}
                disabled={isSpinning}
                style={{ flex: 1, padding: "8px 14px", background: "var(--gold)", color: "var(--forest-deep)", fontWeight: 700, borderRadius: "10px", border: "none", cursor: "pointer" }}
              >
                {isSpinning ? "🎲 Shuffling…" : "🎲 Spin for Random Draw"}
              </button>
              <button
                type="button"
                onClick={() => applySpinToForm(spinResult.label)}
                style={{ padding: "8px 12px", background: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 600, borderRadius: "10px", border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "12px" }}
                title="Select this drawn look in the form"
              >
                Use This
              </button>
            </div>
          </div>
        </div>

        <div className="form-card">
          {isSubmitted ? (
            <div className="success-message" role="status">
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
                  <span>Culture Day ’26</span>
                  <h2>Register your choice</h2>
                </div>
                <span className="form-count">{registrations.length + 28} joined</span>
              </div>
              <div className="field-row">
                <label>
                  <span>Full name</span>
                  <input name="name" type="text" placeholder="e.g. Hana Tesfaye" required />
                </label>
                <label>
                  <span>Email address</span>
                  <input name="email" type="email" placeholder="hana@school.edu.et" required />
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
                  {outfitOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="upload-field">
                <span>Reference image <small>Optional</small></span>
                <input type="file" accept="image/*" onChange={handleImage} />
                <span className="upload-box">
                  {preview ? (
                    <img src={preview} alt="Selected outfit preview" />
                  ) : (
                    <span className="upload-icon"><Icon name="upload" /></span>
                  )}
                  <span>
                    <strong>{fileName || "Drop an image or browse"}</strong>
                    <small>PNG or JPG · up to 8 MB</small>
                  </span>
                </span>
              </label>
              <label className="consent">
                <input type="checkbox" required />
                <span>
                  I understand my outfit may be included in a random draw if many
                  students choose the same cultural clothing.
                </span>
              </label>
              <button className="submit-button" type="submit">
                Save my choice <Icon name="arrow" />
              </button>
              <p className="privacy-note">Your details are only used by the Culture Day planning team.</p>
            </form>
          )}
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
          <span><strong>Culture Day</strong><small>Senior Batch ’26</small></span>
        </a>
        <p>Made with pride for every story in our senior batch.</p>
        <a href="#register">Join the celebration ↑</a>
      </footer>
    </main>
  );
}

export default App;
