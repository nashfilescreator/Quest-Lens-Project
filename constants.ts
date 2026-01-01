
import { Quest, QuestDifficulty, QuestType, MarketItem, Material, Recipe, UserStats, Team, WorldEvent, AppSettings, AppRole, CreatorTheme } from './types';

export interface LevelConfig {
  curricula: string[];
  grades: string[];
  subjects: string[];
}

export const CREATOR_THEMES: CreatorTheme[] = ['Sci-Fi', 'Fantasy', 'Modern', 'Historical', 'Nature'];

export const COUNTRY_ACADEMIC_MAP: Record<string, {
  curriculumLabel: string;
  gradeLabel: string;
  default: LevelConfig;
  levelOverrides?: Partial<Record<'Primary' | 'Secondary' | 'Higher' | 'Professional' | 'Lifelong Learner', LevelConfig>>;
}> = {
  'USA': {
    curriculumLabel: 'Curriculum',
    gradeLabel: 'Grade',
    default: {
      curricula: ['Common Core', 'State Standards', 'AP'],
      grades: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      subjects: ['Math', 'Science', 'History', 'English Language Arts', 'Art', 'Geography', 'Civics'],
    },
    levelOverrides: {
      'Higher': {
        curricula: ['Undergraduate', 'Graduate'],
        grades: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
        subjects: ['Computer Science', 'Biology', 'Literature', 'Physics', 'Economics', 'Psychology', 'Engineering'],
      }
    }
  },
  'UK': {
    curriculumLabel: 'Syllabus',
    gradeLabel: 'Year',
    default: {
      curricula: ['National Curriculum', 'GCSE', 'A-Level', 'IB'],
      grades: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13'],
      subjects: ['Mathematics', 'English Literature', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Computing', 'Modern Languages'],
    },
  },
  'Kenya': {
    curriculumLabel: 'System',
    gradeLabel: 'Level',
    default: {
      curricula: ['CBC', '8-4-4', 'IGCSE'],
      grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Junior Secondary', 'Form 1', 'Form 2', 'Form 3', 'Form 4'],
      subjects: ['Mathematics', 'English', 'Kiswahili', 'Integrated Science', 'Social Studies', 'CRE/IRE', 'Agriculture', 'Creative Arts'],
    },
  },
  'Uganda': {
    curriculumLabel: 'Curriculum',
    gradeLabel: 'Class',
    default: {
      curricula: ['UNEB', 'Cambridge'],
      grades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
      subjects: ['Literacy', 'Science', 'Social Studies', 'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Geography'],
    },
  },
  'Tanzania': {
    curriculumLabel: 'Syllabus',
    gradeLabel: 'Level',
    default: {
      curricula: ['NECTA', 'International'],
      grades: ['Standard 1', 'Standard 2', 'Standard 3', 'Standard 4', 'Standard 5', 'Standard 6', 'Standard 7', 'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Form 6'],
      subjects: ['Kiswahili', 'English', 'Mathematics', 'Science', 'Social Studies', 'Civics', 'History', 'Geography'],
    },
  },
  'Nigeria': {
    curriculumLabel: 'Curriculum',
    gradeLabel: 'Level',
    default: {
      curricula: ['NERDC', 'WAEC', 'NECO'],
      grades: ['Primary 1-6', 'JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'],
      subjects: ['Mathematics', 'English Studies', 'Basic Science', 'Social Studies', 'Civic Education', 'Biology', 'Chemistry', 'Physics', 'Economics'],
    },
  },
  'South Africa': {
    curriculumLabel: 'CAPS',
    gradeLabel: 'Grade',
    default: {
      curricula: ['Department of Basic Education', 'IEB'],
      grades: ['Grade R', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
      subjects: ['Mathematics', 'English Home Language', 'Natural Sciences', 'Social Sciences', 'Life Orientation', 'Technology', 'Economic Management Sciences'],
    },
  },
  'India': {
    curriculumLabel: 'Board',
    gradeLabel: 'Class',
    default: {
      curricula: ['CBSE', 'ICSE', 'State Board', 'IB'],
      grades: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
      subjects: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Environmental Studies', 'Sanskrit', 'Computer Applications'],
    },
  },
  'Japan': {
    curriculumLabel: 'Course of Study',
    gradeLabel: 'Grade',
    default: {
      curricula: ['MEXT Standard'],
      grades: ['Elementary 1-6', 'Junior High 1-3', 'Senior High 1-3'],
      subjects: ['Japanese', 'Social Studies', 'Arithmetic', 'Science', 'Life Studies', 'Music', 'Arts and Crafts', 'Physical Education', 'English'],
    },
  },
  'France': {
    curriculumLabel: 'Programme',
    gradeLabel: 'Classe',
    default: {
      curricula: ['Éducation Nationale', 'Baccalauréat'],
      grades: ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'],
      subjects: ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences et Technologie', 'Arts Plastiques', 'Éducation Musicale', 'Langue Vivante'],
    },
  },
  'Canada': {
    curriculumLabel: 'Curriculum',
    gradeLabel: 'Grade',
    default: {
      curricula: ['Provincial Standards', 'French Immersion'],
      grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
      subjects: ['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'French', 'Health and Career Education', 'Fine Arts'],
    },
  },
  'Germany': {
    curriculumLabel: 'Lehrplan',
    gradeLabel: 'Klasse',
    default: {
      curricula: ['Gymnasium', 'Realschule', 'Hauptschule'],
      grades: ['Klasse 1', 'Klasse 2', 'Klasse 3', 'Klasse 4', 'Klasse 5', 'Klasse 6', 'Klasse 7', 'Klasse 8', 'Klasse 9', 'Klasse 10', 'Klasse 11', 'Klasse 12', 'Klasse 13'],
      subjects: ['Deutsch', 'Mathematik', 'Sachunterricht', 'Englisch', 'Biologie', 'Chemie', 'Physik', 'Geschichte', 'Geografie', 'Kunst'],
    },
  },
  'International': {
    curriculumLabel: 'Curriculum',
    gradeLabel: 'Year',
    default: {
      curricula: ['IB', 'Cambridge International', 'Edexcel'],
      grades: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13'],
      subjects: ['Mathematics', 'Combined Sciences', 'Humanities', 'Languages', 'The Arts', 'Global Perspectives', 'Theory of Knowledge'],
    },
  },
};

export const MATERIALS: Material[] = [
  { id: 'mat_scrap', name: 'Recycled Parts', rarity: 'Common', count: 0, image: 'https://image.pollinations.ai/prompt/simple%20pile%20of%20recycled%20metal%20parts%20flat%20icon?width=100&height=100&nologo=true' },
  { id: 'mat_neon', name: 'Color Tube', rarity: 'Uncommon', count: 0, image: 'https://image.pollinations.ai/prompt/colorful%20glass%20vial%20simple%20icon?width=100&height=100&nologo=true' },
  { id: 'mat_chip', name: 'Processing Chip', rarity: 'Rare', count: 0, image: 'https://image.pollinations.ai/prompt/computer%20chip%20gold%20simple%20icon?width=100&height=100&nologo=true' },
  { id: 'mat_core', name: 'Energy Source', rarity: 'Legendary', count: 0, image: 'https://image.pollinations.ai/prompt/bright%20glowing%20sphere%20simple%20icon?width=100&height=100&nologo=true' },
];

export const RECIPES: Recipe[] = [
  {
    id: 'rec_radar',
    name: 'Discovery Booster',
    resultItemId: 'radar_plus',
    ingredients: [{ materialId: 'mat_scrap', count: 3 }, { materialId: 'mat_neon', count: 1 }],
    duration: 3000,
    description: "Increases your finding range by 50% for 30 minutes."
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  dailyQuestLimit: 15,
  questFrequency: 'Daily',
  notifications: true,
  sound: true,
  haptics: true,
  autoSavePhotos: false,
  profileVisibility: 'Public',
  country: 'USA'
};

export const INITIAL_STATS: UserStats = {
  username: 'Explorer',
  avatarSeed: 'Felix',
  role: 'Novice',
  level: 1,
  xp: 0,
  studyXp: 0,
  coins: 120,
  streak: 0,
  winStreak: 0,
  influence: 0,
  totalWins: 0,
  rank: 'Newcomer',
  inventory: [],
  activeBuffs: [],
  activeQuestIds: [],
  completedQuestIds: [],
  journal: [],
  transactions: [],
  artifacts: [],
  materials: [],
  friends: [],
  badges: [],
  teamInvites: [],
  notifications: [],
  outgoingFriendRequests: [],
  incomingFriendRequests: [],
  skillCooldowns: {},
  activeRoles: [],
  roleAffinity: { Explorer: 0, Competitor: 0, Creator: 0, Student: 0 },
  rolePreferences: {
    Explorer: { terrain: 'Mixed', range: 'Walking' },
    Competitor: { duelFrequency: 'Balanced', intensity: 3 },
    Creator: { defaultTheme: 'Modern', autoPublish: true },
    Student: { academicLevel: 'Secondary', curriculum: '', grade: '', subjects: [], syncGrounding: true, isAutoCalibrated: false }
  },
  settings: INITIAL_SETTINGS
};

export const MARKET_ITEMS: MarketItem[] = [
  {
    id: 'boost_xp',
    name: 'Experience Boost',
    description: 'Earn 2x points for 1 hour.',
    price: 50,
    category: 'powerup',
    image: 'https://image.pollinations.ai/prompt/colorful%20bottle%20friendly%20icon?width=200&height=200&nologo=true'
  }
];

export const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 6000, 12000, 25000, 50000];
