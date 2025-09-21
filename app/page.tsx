"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Drop this file in Next.js (App Router) as app/page.tsx
 * Assumes you place transparent logos at:
 *   public/brand/sweetbasil.png  (Sweet Basil mark, transparent)
 *   public/brand/lyfe.png        (LYFE Hotels mark, transparent)
 * Accent color: #1B3F3F
 */

const ACCENT = "#1B3F3F";

// ---------------- Data (trimmed but faithful to the vibe) ----------------

type MenuItem = {
  name: string;
  subtitle?: string;
  desc?: string;
  price: string;
};
type MenuSection = {
  id: string;
  title: string;
  subtitle?: string;
  items: MenuItem[];
};

const SECTIONS: MenuSection[] = [
  {
    id: "cold",
    title: "Cold / Starters",
    items: [
      {
        name: "Pla-Salmon",
        subtitle: "(Salmon Tartare)",
        desc: "Gastro-style tartare with Thai ingredients and crispy rice paper.",
        price: "950",
      },
      {
        name: "Phuket Pra-Tuna",
        subtitle: "(Yellowfin Tuna)",
        desc: "Bird's eye chilli spice and Thai dressing.",
        price: "875",
      },
      {
        name: "Somtum-Kung",
        subtitle: "(Papaya Salad with Shrimp)",
        desc: "Traditional green papaya salad with shrimp and tamarind sauce.",
        price: "550",
      },
      {
        name: "Yum-Pon-La-Maii",
        subtitle: "(Fruit Salad with Shrimp)",
        desc: "Guava, green apple, pineapple, grapes, bird's eye chilli, cashew.",
        price: "550",
      },
      {
        name: "Yum-Woon-Seen",
        subtitle: "(Mix Sea Food Salad)",
        desc: "Glass noodles with shrimp, fish & squid; lime, garlic, chilli dressing.",
        price: "750",
      },
      {
        name: "Laab-Kai",
        subtitle: "(Chicken Salad)",
        desc: "Spicy minced chicken with herbs, roasted rice & chilli powder.",
        price: "650",
      },
      {
        name: "Nam-Tok-Pla",
        subtitle: "(Fish Salad)",
        desc: "Crispy-fried snapper; bird's eye chilli, roasted rice, mint & coriander.",
        price: "700",
      },
      {
        name: "Yum-Ta-Khai-Gung",
        subtitle: "(Shrimp Salad with Lemongrass)",
        desc: "Aromatic spice with fresh mint & shallots.",
        price: "750",
      },
      {
        name: "Yum-Tang-Moo",
        subtitle: "(Watermelon Salad with Dry Fish & Shrimp)",
        desc: "Refreshing, minty, homemade sauce & herbs.",
        price: "550",
      },
    ],
  },
  {
    id: "grilled",
    title: "Grilled & Crispy",
    items: [
      {
        name: "Po-Pei-Pak",
        subtitle: "(Vegetable Spring Rolls)",
        desc: "Crispy veg rolls with Thai sweet chilli sauce.",
        price: "700",
      },
      {
        name: "Po-Pai-Kung-Tood",
        subtitle: "(Shrimp Spring Rolls)",
        desc: "Crispy shrimp spring rolls with Thai sweet chilli.",
        price: "850",
      },
      {
        name: "Phu-Nim-Tod-Kha-Teem",
        subtitle: "(Soft Shell Crab Tempura)",
        desc: "With black pepper sauce & Thai spicy sauce.",
        price: "1500",
      },
      {
        name: "Pla-Muuk-Tod-Groob",
        subtitle: "(Calamari with Thai Herb)",
        desc: "Crispy calamari marinated with lemongrass, kaffir lime & paprika.",
        price: "900",
      },
      {
        name: "Goon Tod Sood Ma Kham",
        subtitle: "(Crispy Prawns with Tamarind Glaze)",
        desc: "Deep-fried prawns with tamarind glaze & shallots.",
        price: "1400",
      },
      {
        name: "Hoi Tod",
        subtitle: "(Bangkok Street-Style Fried Mussels)",
        desc: "With bean sprouts & Chinese chives.",
        price: "1600",
      },
      {
        name: "Goon Chup Pang Tod",
        subtitle: "(Shrimps Popcorn)",
        desc: "Butter flour & panko crumbs; garlic mayo.",
        price: "1100",
      },
      {
        name: "Gai-Sa-Tay",
        subtitle: "(Chicken Satay)",
        desc: "Grilled; peanut sauce & pickled vinegar.",
        price: "750",
      },
      {
        name: "Khea Yang Laan Na",
        subtitle: "(Signature Sweet Basil Grilled Lamb Rack)",
        desc: "Lanna-style recipe with aromatic curry sauce.",
        price: "2200",
      },
      {
        name: "Lobster-Phow-Nam-Jim-Seafood",
        subtitle: "(Surat Thani Grilled Lobster)",
        desc: "Southern seafood; mint, coriander, tamarind, peanuts & spicy sauce.",
        price: "2500",
      },
    ],
  },
  {
    id: "curry",
    title: "Soup & Curry & Steam",
    subtitle: "Served with steamed jasmine rice",
    items: [
      {
        name: "Tomyum-Kung",
        subtitle: "(Clear or Coconut cream soup)",
        desc: "Classic Thai soup with prawns, lemongrass, galangal & kaffir lime.",
        price: "600",
      },
      {
        name: "Tom Kha Gai",
        subtitle: "(Coconut Chicken Soup)",
        desc: "Coconut milk, galangal, lemongrass, mushrooms & roasted chilli oil.",
        price: "550",
      },
      {
        name: "Gang Keaw Wan Gai",
        subtitle: "(Green Curry Chicken)",
        desc: "Green paste, baby eggplants, basil, coconut milk.",
        price: "950",
      },
      {
        name: "Gang Pet Ped Yang",
        subtitle: "(Red Duck Curry with Lychees)",
        desc: "Grilled duck, red curry & coconut milk; lychees & pineapple.",
        price: "1200",
      },
      {
        name: "Massaman Kha Kea",
        subtitle: "(Massaman Lamb Shanks Curry)",
        desc: "Heirloom recipe; sous-vide lamb with coconut milk & warm spices.",
        price: "1800",
      },
      {
        name: "Gang Kari Gai",
        subtitle: "(Yellow Chicken Curry)",
        desc: "Yellow curry paste with potatoes, onions, cardamom & bay leaf.",
        price: "950",
      },
      {
        name: "Haw Mok",
        subtitle: "(Samui Steamed Curry Fish Mousse in Coconut)",
        desc: "Whole coconut steamed; red curry powder, egg & coconut milk.",
        price: "1200",
      },
      {
        name: "Goon Ob Woon Sen",
        subtitle: "(Steamed Prawns with Glass Noodle)",
        desc: "Ginger, garlic, peppercorns & sesame oil.",
        price: "1250",
      },
    ],
  },
  {
    id: "wok",
    title: "Wok",
    subtitle: "Served with steamed jasmine rice",
    items: [
      {
        name: "Pad-Thai",
        desc: "Stir-fried rice noodles with egg, bean sprouts & tofu; peanuts & lime.",
        price: "950/850",
      },
      {
        name: "Pad-Mee-Hook-Kean",
        desc: "Egg noodles with peppers, kale & onions; curry sauce.",
        price: "950/1050/850",
      },
      {
        name: "Khow-Pad-Sup-Pa-Rod",
        desc: "Thai pineapple fried rice (prawns/squid/chicken).",
        price: "850/750/650",
      },
      {
        name: "Kkow-Pad",
        desc: "Thai fried rice (prawns/squid/chicken).",
        price: "800/750/700",
      },
      {
        name: "Khow-Pad-Ho-Ra-Pa",
        desc: "Jasmine rice with Thai basil & bird's eye chillies.",
        price: "800/750/700",
      },
      {
        name: "Pad-Kra-Pow",
        desc: "Stir-fried sweet basil; garlic & hot basil.",
        price: "800/750/700",
      },
      {
        name: "Pad-Med-Ma-Mung",
        desc: "Stir-fried cashew nuts (choice proteins).",
        price: "1400/1200/1000/900",
      },
      {
        name: "Pad-Pong-Ka-Lee",
        desc: "Stir-fried curry powder; onions & coconut milk.",
        price: "950/850/850",
      },
    ],
  },
  {
    id: "dessert",
    title: "Dessert",
    items: [
      {
        name: "Thai-Mong-Kud",
        subtitle: "(Siam Cha Da Alaska)",
        desc: "Jackfruit ice cream & Thai tea sauce.",
        price: "550",
      },
      {
        name: "Khoy-Bod-Chee",
        subtitle: "(Banana with Coconut Milk)",
        desc: "Warm coconut milk broth; crispy coconut & coconut ice cream.",
        price: "550",
      },
      {
        name: "Pod-La-Mi-Ruum",
        subtitle: "(Fruit Platter)",
        desc: "Refreshing fruits & coconut ice cream.",
        price: "450",
      },
      {
        name: "Ta-Khai-Cream Brulee",
        subtitle: "(Siam Lemon Glass Cream Brulee)",
        desc: "Crème brûlée with lemongrass twist & sticky rice.",
        price: "395",
      },
      {
        name: "Ka-Nom-Toy",
        subtitle: "(Siam Pudding Coconut Milk)",
        desc: "Coconut milk with pandan sauce & coconut tuile.",
        price: "395",
      },
      {
        name: "Fuk-Tong-Oob",
        subtitle: "(Siam Pumpkin)",
        desc: "Roasted pumpkin dessert; maple syrup & almond seeds.",
        price: "395",
      },
      {
        name: "Bou-Loy",
        subtitle: "(Siam Rice Balls in Sweet Coconut Milk)",
        desc: "Coconut milk soup with glutinous rice balls, taro & sweet potato.",
        price: "650",
      },
    ],
  },
  {
    id: "veg",
    title: "Vegetarian & Vegan",
    subtitle: "Cold / Starters",
    items: [
      {
        name: "Po-Pei-Pak",
        subtitle: "(Vegetable Spring Rolls)",
        desc: "Crispy rolls with sweet chilli & plum dip.",
        price: "750",
      },
      {
        name: "Pak-Thod",
        subtitle: "(Vegetable Tempura Thai Style)",
        desc: "Crispy babycorn, carrots & broccoli; sweet soy.",
        price: "750",
      },
      {
        name: "Lab-Had-Tod",
        subtitle: "(Mushroom with Tofu Thai Salad)",
        desc: "Grilled oyster mushrooms with herbs & roasted rice.",
        price: "750",
      },
      {
        name: "Som-Tom-Jea",
        subtitle: "(Papaya Thai Salad)",
        desc: "Green papaya, long beans, cashews; tamarind.",
        price: "550",
      },
      {
        name: "Yum-Tang-Som-O",
        subtitle: "(Pomelo Thai Salad)",
        desc: "Tart & spicy with peanuts and toasted coconut.",
        price: "750",
      },
      {
        name: "Yum-Pod-La-Mai-J",
        subtitle: "(Fruit Thai Salad)",
        desc: "Guava, pineapple, rose apple, grapes; cashew & cherry tomatoes.",
        price: "550",
      },
    ],
  },
  {
    id: "veg-wok",
    title: "Wok & Noodle & Rice & Curry",
    items: [
      {
        name: "Pad-Puk-Bong",
        subtitle: "(Thai Stir Fried Morning Glory)",
        desc: "Hot chillies, garlic, oyster mushroom sauce & soy.",
        price: "850",
      },
      {
        name: "Pad-Bok-Choy",
        subtitle: "(Thai Stir-Fried Bok Choy)",
        desc: "Garlic, oyster mushroom sauce & soy.",
        price: "850",
      },
      {
        name: "Pad-Med-Ma-Moung",
        subtitle: "(Tofu Crispy with Cashew Nut)",
        desc: "Tofu, dried chillies, baby corn & cashews; tamarind soy.",
        price: "850",
      },
      {
        name: "Pad-Pew-Waan-Puk",
        subtitle: "(Vegetables Stir-Fried with Sweet & Sour)",
        desc: "Pineapple, peppers, cashew & carrots.",
        price: "850",
      },
      {
        name: "Pad-Puk-Roum",
        subtitle: "(Thai Vegetable Stir Fried)",
        desc: "Broccoli, carrots, mushrooms & garlic.",
        price: "850",
      },
      {
        name: "Khow-Pad-Bai-Ka-Praw",
        subtitle: "(Sweet Basil Spicy Fried Rice)",
        desc: "Jasmine rice; Thai basil & bird's eye chillies.",
        price: "575",
      },
      {
        name: "Khow-Pad-Sup-Pa-Rod",
        subtitle: "(Thai Pineapple Fried Rice)",
        desc: "Pineapple chunks, cashews, raisins; curry powder.",
        price: "625",
      },
      {
        name: "Khow-Pad-Puk",
        subtitle: "(Thai Vegetable Fried Rice)",
        desc: "Broccoli, baby corn, carrots, spring onions & garlic.",
        price: "550",
      },
      {
        name: "Pad-Mee-Hok-Kien-Pak",
        subtitle: "(Egg Noodles with Vegetables)",
        desc: "Egg noodles; peanuts, soy & sesame oil.",
        price: "575",
      },
      {
        name: "Pad-Thai-Puk",
        subtitle: "(Padthai Vegetable Stir Fried)",
        desc: "Stir-fried rice noodles with tofu & bean sprouts.",
        price: "575",
      },
      {
        name: "Massamon-Jae",
        subtitle: "(Phuket Massaman Vegetables with Tofu Curry)",
        desc: "Southern Thai massaman with coconut milk & spices.",
        price: "950",
      },
      {
        name: "Tomyum-Jea",
        subtitle: "(Clear or Coconut Cream Soup)",
        desc: "Lemongrass, galangal, mushrooms; coriander & tomato.",
        price: "425",
      },
    ],
  },
];

// ---------------- UI Pieces ----------------

const Heading: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => (
  <div className="mb-8">
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-slate-200" />
      <h2 className="text-xl md:text-2xl tracking-wide font-semibold text-slate-900 whitespace-nowrap">
        {title}
      </h2>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
    {subtitle && (
      <p className="text-sm text-slate-500 italic mt-2 text-center">
        {subtitle}
      </p>
    )}
  </div>
);

const MenuCard: React.FC<MenuItem> = ({ name, subtitle, desc, price }) => (
  <div className="py-4 border-b border-slate-100 last:border-none">
    <div className="flex items-baseline justify-between gap-6">
      <div>
        <h3 className="text-[1.05rem] md:text-lg font-medium text-slate-900">
          {name}{" "}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </h3>
        {desc && (
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">{desc}</p>
        )}
      </div>
      <div className="text-right min-w-[72px]" style={{ color: ACCENT }}>
        <strong>{price}</strong>
      </div>
    </div>
  </div>
);

const SectionBlock: React.FC<MenuSection> = ({
  id,
  title,
  subtitle,
  items,
}) => (
  <section id={id} className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-14">
    <Heading title={title} subtitle={subtitle} />
    <div className="bg-white rounded-[20px] shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-slate-200 p-4 sm:p-6">
      {items.map((it, i) => (
        <MenuCard key={`${id}-${i}`} {...it} />
      ))}
    </div>
  </section>
);

const GlitchOverlay: React.FC<{ show: boolean; onDone: () => void }> = ({
  show,
  onDone,
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 grid place-items-center bg-white text-slate-900"
      >
        <div className="text-center">
          <img
            src="/sweetbasi.png"
            alt="Sweet Basil"
            className="h-9 w-auto mx-auto mb-4"
          />
          <div className="text-base text-slate-600">
            Unlocking special challenge…
          </div>
          <div
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border"
            style={{ borderColor: ACCENT, color: ACCENT }}
          >
            A little surprise is loading
          </div>
        </div>
        <AutoAdvance delay={1200} onDone={onDone} />
      </motion.div>
    )}
  </AnimatePresence>
);

const AutoAdvance: React.FC<{ delay: number; onDone: () => void }> = ({
  delay,
  onDone,
}) => {
  useEffect(() => {
    const t = setTimeout(onDone, delay);
    return () => clearTimeout(t);
  }, [delay, onDone]);
  return null;
};

// ---------------- Page ----------------

export default function Page() {
  const [showOverlay, setShowOverlay] = useState(false);
  const redirected = useRef(false);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const max = el.scrollHeight - el.clientHeight;
      const ratio = max > 0 ? scrolled / max : 0;
      if (ratio >= 0.8 && !redirected.current) {
        redirected.current = true;
        setShowOverlay(true);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navigateToChallenge = () => {
    window.location.href = "/challenge";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/sweetbasil.png"
              alt="Sweet Basil"
              className="h-7 w-auto"
            />
            <span className="sr-only">Sweet Basil</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm text-slate-700">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="transition-colors hover:opacity-80"
                style={{ color: ACCENT }}
              >
                {s.title}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-20">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[2.5rem] md:text-[3.25rem] leading-tight font-semibold text-slate-900"
          >
            Thai cuisine, refined.
          </motion.h1>
          <p className="mt-5 max-w-2xl text-slate-600">
            A considered selection of regional Thai classics. Scroll at your
            leisure. When you have taken it all in, something special unlocks.
          </p>
        </div>
      </section>

      {/* Sections */}
      {SECTIONS.map((sec) => (
        <SectionBlock key={sec.id} {...sec} />
      ))}

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-10 flex items-center justify-between gap-6 text-xs text-slate-500">
          <p>
            Taxes as applicable. Prices are in INR. For allergies or
            intolerances, please inform our team.
          </p>
          <img
            src="/lyfe.png"
            alt="LYFE Hotels"
            className="h-6 w-auto opacity-80"
          />
        </div>
      </footer>

      {/* Glitch overlay + redirect */}
      <GlitchOverlay show={showOverlay} onDone={navigateToChallenge} />
    </div>
  );
}
