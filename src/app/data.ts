export interface Teacher {
  id: string;
  name: string;
  salutation: string;
  subject: string;
  designation: string;
  college: string;
  years: string;
  photo: string;
  bestAdvice: string;
  favoriteMemory: string;
  teachingStyle: string;
  personality: string;
  lifeLesson: string;
  howTheyShaped: string;
  skillsLearned: string;
  favoriteSaying?: string;
  contactEmail: string;
  initials: string;
  avatarColor: string;
  bgPattern: string;
}

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: "1",
    name: "Paras Shingadiya",
    salutation: "Paras Sir",
    subject: "Probability & Discrete Mathematics",
    designation: "Mathematics Professor",
    college: "Marwadi University",
    years: "2025 – 2026",
    photo: "C:\\Users\\sharm\\OneDrive\\Desktop\\MU\\TEACHERS\\Paras Sir.jpeg",
    bestAdvice: "Marks se zyada important hai seekhna",
    favoriteMemory: "Jab mera PS acche se samjh nahi paa raha tha unhone mujhe personally help kiya tha sikhne mai.",
    teachingStyle: "Real-life examples ke through complex concepts samjhate the.",
    personality: "Hamesha Focused the, Shant the.",
    lifeLesson: "Discipline, consistency and Focus.",
    howTheyShaped: "Aaj mai discipline and consistency ko acche se maintain unke vajah se kar pata hu.",
    skillsLearned: "Problem-solving aur critical thinking.",
    favoriteSaying: "Marks to acche le aooge rat ke but skills vo kaha se ayega!!",
    contactEmail: "paras.shingadiya112363@marwadiuniversity.ac.in",
    initials: "PS",
    avatarColor: "from-amber-100 to-amber-250 text-amber-900 border-amber-300",
    bgPattern: "bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"
  },
  {
    id: "2",
    name: "Reshma Sunil",
    salutation: "Reshma Mam",
    subject: "Advance Java Technology",
    designation: "Assistant Professor",
    college: "Marwadi University",
    years: "2025 – 2026",
    photo: "C:\\Users\\sharm\\OneDrive\\Desktop\\MU\\TEACHERS\\Reshma Mam.jpeg",
    bestAdvice: "Concepts ko sirf samjho mat sikho khud se try karo",
    favoriteMemory: "Mam itta accha padhati thi ki maine mam ke subject mai kabhi kam marks nahi laye.",
    teachingStyle: "Cool way mai samjhana smartly hard se hard concept samjha deti thi.",
    personality: "Hamesha Happy Rehti thi.",
    lifeLesson: "Be happy, and Play smartly.",
    howTheyShaped: "Unhone mujhe hamesha khus rehna sikhaya.",
    skillsLearned: "Smartly solving the hard problems.",
    favoriteSaying: "Tumhe Placement chahiye ki nahi",
    contactEmail: "reshma.sunil@marwadieducation.edu.in",
    initials: "RS",
    avatarColor: "from-amber-250 to-amber-400 text-amber-955 border-amber-400",
    bgPattern: "bg-[linear-gradient(45deg,#fffdf5_25%,#fefce8_25%,#fefce8_50%,#fffdf5_50%,#fffdf5_75%,#fefce8_75%)] [background-size:24px_24px]"
  },
  {
    id: "3",
    name: "Niraj Bhagchandani",
    salutation: "Niraj Sir",
    subject: "Computer Networking",
    designation: "Assistant Professor",
    college: "Marwadi University",
    years: "2025 – 2026",
    photo: "C:\\Users\\sharm\\OneDrive\\Desktop\\MU\\TEACHERS\\Niraj Sir.jpeg",
    bestAdvice: "Jo mazak banaye usse dikhao ki tum kar sakte ho",
    favoriteMemory: "Mujhe sir kabhi samjh hi nahi aye itte jyada dedicated apne kaam ko leke Unbelivable.",
    teachingStyle: "Simple and Easy way.",
    personality: "Self focused the sir.",
    lifeLesson: "Sir ne bataya tha Solutions to hai but hume khojne ki jarurt hai.",
    howTheyShaped: "Unhone mujhe apne goals ke liye bina haar mane kaam karna sikhaya.",
    skillsLearned: "Making best roadmaps and Planning.",
    favoriteSaying: "Main hu na beta aap mujhe batao",
    contactEmail: "niraj.bhagchandani@marwadieducation.edu.in",
    initials: "NB",
    avatarColor: "from-amber-50 to-amber-200 text-amber-900 border-amber-300",
    bgPattern: "bg-[radial-gradient(#d97706_0.8px,transparent_0.8px)] [background-size:12px_12px]"
  },
  {
    id: "4",
    name: "Charmy Vora",
    salutation: "Charmy Mam",
    subject: "Advance Web Technology",
    designation: "Assistant Professor",
    college: "Marwadi University",
    years: "2025 – 2026",
    photo: "C:\\Users\\sharm\\OneDrive\\Desktop\\MU\\TEACHERS\\Charmy Mam.jpeg",
    bestAdvice: "Try to karo phir dekhenge ki fail hota hai ya pass",
    favoriteMemory: "Mam ke lab sessions are unforgettable.",
    teachingStyle: "Practical Way.",
    personality: "Happy and Chill.",
    lifeLesson: "Try karna jaruri hai ye mam ne mujhe samjhaya.",
    howTheyShaped: "Abhi unke help se hi mai itte sare projects bana paa rha hu.",
    skillsLearned: "Web Technology.",
    favoriteSaying: "Arey ye itna easy to hai try to karo yaar tum",
    contactEmail: "charmy.vora@marwadieducation.edu.in",
    initials: "CV",
    avatarColor: "from-amber-200 to-amber-350 text-amber-955 border-amber-400",
    bgPattern: "bg-[linear-gradient(to_right,#fefce8_1px,transparent_1px),linear-gradient(to_bottom,#fefce8_1px,transparent_1px)] [background-size:20px_20px]"
  },
  {
    id: "5",
    name: "Dr. Dhara Joshi",
    salutation: "Dhara Mam",
    subject: "Artificial Intelligence",
    designation: "Assistant Professor",
    college: "Marwadi University",
    years: "5th Semester (Current)",
    photo: "C:\\Users\\sharm\\OneDrive\\Desktop\\MU\\TEACHERS\\Dhara Mam.jpeg",
    bestAdvice: "AI systems are built on human logic; master the core concepts first.",
    favoriteMemory: "Main abhi mam se 5th sem mai padh raha hu, toh abhi unke saath aur memories banana baaki hai!",
    teachingStyle: "Project-centric teaching with hands-on logical debugging.",
    personality: "Empathetic, supportive, and highly knowledgeable.",
    lifeLesson: "Technology evolves rapidly, but foundational logic remains forever.",
    howTheyShaped: "Abhi sikhna shuru hi kiya hai, par unki guideship me project dynamic solutions banane ke liye bohot excited hu!",
    skillsLearned: "Mastering logic building for Artificial Intelligence systems.",
    favoriteSaying: "logic build up karo",
    contactEmail: "dhara.joshi@marwadieducation.edu.in",
    initials: "DJ",
    avatarColor: "from-amber-100 to-amber-300 text-amber-900 border-amber-300",
    bgPattern: "bg-[radial-gradient(ellipse_at_center,#fff_0%,#fffdf5_70%,#fefce8_100%)]"
  },
  {
    id: "6",
    name: "Kajal Tanchak",
    salutation: "Kajal Mam",
    subject: "Data Analysis of Algorithms",
    designation: "Assistant Professor",
    college: "Marwadi University",
    years: "5th Semester (Current)",
    photo: "C:\\Users\\sharm\\OneDrive\\Desktop\\MU\\TEACHERS\\Kajal Mam.jpeg",
    bestAdvice: "Simplify the problem statement on paper before writing any code.",
    favoriteMemory: "Main abhi mam se 5th sem mai padh rha hu, abhi toh unke sath memory banana shuru hua hai, aage bohot kuch seekhna hai!",
    teachingStyle: "Very detailed step-by-step trace and analytical dry runs.",
    personality: "Patient, detailed, and highly encouraging.",
    lifeLesson: "Optimization takes time, practice, and repetition.",
    howTheyShaped: "Looking forward to building strong analytical and algorithm design skills under her mentorship this semester.",
    skillsLearned: "Currently learning dry-running and algorithm complexity analysis step-by-step.",
    favoriteSaying: "dry run karke dekho",
    contactEmail: "kajalben.tanchak@marwadieducation.edu.in",
    initials: "KT",
    avatarColor: "from-amber-200 to-amber-300 text-amber-955 border-amber-450",
    bgPattern: "bg-[radial-gradient(#b45309_0.8px,transparent_0.8px)] [background-size:14px_14px]"
  }
];
