export interface FlashcardImage {
  name: string;
  url: string;
}

export interface FlashcardItem {
  id: string;
  term: string;
  def: string;
  img?: FlashcardImage | null;
  mastery?: "new" | "learning" | "mastered";
}

export interface FlashcardSet {
  id: string;
  name: string;
  desc: string;
  flashcards: FlashcardItem[];
  number: number;
  created: string;
  by: string;
  mode: "edit" | "study";
  subject?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface QuizSet {
  id: string;
  name: string;
  desc: string;
  questions: QuizQuestion[];
  mode: "create" | "preview" | "attempt";
  timeStamp: string;
  by: string;
  lastScore?: number;
  lastAttempted?: string;
  subject?: string;
}

export interface UserProfile {
  userName: string;
  theme: "device" | "light" | "dark";
  createdOn: string;
  userId: string;
  pfp: {
    file: string;
    url: string;
  };
  fullName: string;
  gender: string;
  dob: string;
  email: string;
  tel: string;
  level: string;
  isBetaUser: boolean;
  isPremiumUser: boolean;
  flashcards: FlashcardSet[];
  quizzes: QuizSet[];
  studyMinutes?: number;
}

export const PLAN_LIMITS = {
  free: {
    maxSets: 7,
    maxItemsPerSet: 20,
    maxPdfMb: 5,
    priceNgn: 0,
    priceLabel: "₦0",
  },
  premium: {
    maxSets: Infinity,
    maxItemsPerSet: 50,
    maxPdfMb: 15,
    priceNgn: 5000,
    priceLabel: "₦5,000",
    betaPriceNgn: 2500,
    betaPriceLabel: "₦2,500",
  },
} as const;

export const BETA_USERS = [
  { firstName: "Muhammad Jamshaid", lastName: "Ali", email: "jamshaid8081@gmail.com" },
  { firstName: "Deen", lastName: "", email: "Sharafadeenadewale35@gmail.com" },
  { firstName: "Dhanamjay", lastName: "", email: "kanipakkamdhanamjay@gmail.com" },
  { firstName: "Mrunank", lastName: "Pawar", email: "mrunankpawar05@gmail.com" },
  { firstName: "Levi", lastName: "", email: "Levinstar116@gmail.com" },
  { firstName: "Kehinde", lastName: "David", email: "omotosokehinde2002@gmail.com" },
  { firstName: "Oluwatobiloba", lastName: "", email: "oluwatobilobafemi25@gmail.com" },
  { firstName: "Heesak", lastName: "", email: "adesuyiojo04@gmail.com" },
  { firstName: "Temiloluwa", lastName: "Akintade", email: "akintadetemi19@gmail.com" },
  { firstName: "abhi", lastName: "", email: "abhi394040@gmail.com" },
  { firstName: "God'sfavour", lastName: "", email: "engineeringtheimpossible5@gmail.com" },
  { firstName: "Robust", lastName: "King", email: "paulabodunrin03@gmail.com" },
  { firstName: "Daniel", lastName: "Akinade", email: "danielscholaressay04@gmail.com" },
  { firstName: "Christiana", lastName: "Ilesanmi", email: "ilesanmichristiana29@gmail.com" },
];

export const STARTER_FLASHCARDS: FlashcardSet[] = [
  {
    id: "starter-bio-cell",
    name: "Cellular Respiration & ATP",
    desc: "Core metabolic pathways, electron transport, and ATP synthesis.",
    subject: "Biology",
    number: 5,
    created: "2026-09-10",
    by: "community@efiqo.app",
    mode: "study",
    flashcards: [
      {
        id: "c1",
        term: "Glycolysis",
        def: "Cytosolic breakdown of one glucose molecule into two pyruvate molecules, yielding a net gain of 2 ATP and 2 NADH.",
        mastery: "mastered",
      },
      {
        id: "c2",
        term: "Oxidative Phosphorylation",
        def: "ATP generation in the inner mitochondrial membrane driven by the proton motive force across ATP synthase.",
        mastery: "learning",
      },
      {
        id: "c3",
        term: "Substrate-Level Phosphorylation",
        def: "Direct transfer of a phosphate group from a high-energy phosphorylated intermediate to ADP to form ATP.",
        mastery: "new",
      },
      {
        id: "c4",
        term: "Citric Acid Cycle (Krebs)",
        def: "Mitochondrial matrix cycle oxidizing acetyl-CoA to CO2 while producing 3 NADH, 1 FADH2, and 1 GTP per turn.",
        mastery: "new",
      },
      {
        id: "c5",
        term: "Chemiosmosis",
        def: "Diffusion of protons down their electrochemical gradient through ATP synthase to power ATP synthesis.",
        mastery: "new",
      },
    ],
  },
  {
    id: "starter-econ-macro",
    name: "Macroeconomic Policy & Equilibrium",
    desc: "Monetary tools, fiscal multipliers, and aggregate demand dynamics.",
    subject: "Economics",
    number: 4,
    created: "2026-09-14",
    by: "community@efiqo.app",
    mode: "study",
    flashcards: [
      {
        id: "e1",
        term: "Open Market Operations",
        def: "Central bank buying or selling of government securities to expand or contract commercial bank reserves.",
        mastery: "mastered",
      },
      {
        id: "e2",
        term: "Fiscal Multiplier",
        def: "Ratio of total change in real GDP to an initial autonomous change in government spending: 1 / (1 - MPC).",
        mastery: "new",
      },
      {
        id: "e3",
        term: "Crowding Out",
        def: "Reduction in private investment caused by higher real interest rates resulting from deficit government borrowing.",
        mastery: "new",
      },
      {
        id: "e4",
        term: "Phillips Curve",
        def: "Short-run inverse relationship between inflation and unemployment rates, holding inflation expectations constant.",
        mastery: "learning",
      },
    ],
  },
];

export const STARTER_QUIZZES: QuizSet[] = [
  {
    id: "starter-quiz-neuro",
    name: "Neuroanatomy Fundamentals",
    desc: "Rapid assessment on action potentials, synaptic transmission, and cortical lobes.",
    subject: "Neuroscience",
    mode: "create",
    timeStamp: "2026-09-18",
    by: "community@efiqo.app",
    questions: [
      {
        question: "Which ion influx primarily drives the rapid depolarization phase of a neuronal action potential?",
        options: ["Potassium (K+)", "Sodium (Na+)", "Chloride (Cl-)", "Magnesium (Mg2+)"],
        answer: "Sodium (Na+)",
        explanation: "Voltage-gated Na+ channels open rapidly once threshold is reached, allowing Na+ to rush into the axon down its electrochemical gradient.",
      },
      {
        question: "Which structure acts as the primary relay station for sensory information traveling to the cerebral cortex?",
        options: ["Cerebellum", "Thalamus", "Hippocampus", "Amygdala"],
        answer: "Thalamus",
        explanation: "All sensory pathways except olfaction synapse in specific thalamic nuclei before projecting to primary sensory cortices.",
      },
      {
        question: "Schwann cells form myelin sheaths around axons in which division of the nervous system?",
        options: ["Central nervous system", "Peripheral nervous system", "Enteric cortex only", "Ventricular ependyma"],
        answer: "Peripheral nervous system",
        explanation: "Schwann cells myelinate individual axons in the PNS, whereas oligodendrocytes myelinate multiple CNS axons.",
      },
      {
        question: "Damage to Broca's area in the dominant frontal lobe most characteristically impairs:",
        options: ["Speech production and fluency", "Auditory comprehension", "Visual spatial mapping", "Balance and gait"],
        answer: "Speech production and fluency",
        explanation: "Broca's area in the inferior frontal gyrus coordinates motor speech output; lesions cause expressive aphasia with relatively intact comprehension.",
      },
    ],
  },
];
