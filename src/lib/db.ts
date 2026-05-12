import { User, Resource, Progress, WallPost, JournalEntry, FinanceEntry, AcademicEvent, TalkPost, Booking } from "./types";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const DATA_DIR = process.env.VERCEL ? "/tmp/.data" : path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

interface Store {
  users: User[];
  resources: Resource[];
  progress: Progress[];
  surveyData: import("./types").SurveyChartData[];
  wallPosts?: WallPost[];
  journalEntries?: JournalEntry[];
  finances?: FinanceEntry[];
  academicEvents?: AcademicEvent[];
  talkPosts?: TalkPost[];
  bookings?: Booking[];
  nextUserId: number;
  nextResourceId: number;
  nextProgressId: number;
  nextWallPostId?: number;
  nextJournalId?: number;
  nextFinanceId?: number;
  nextAcademicEventId?: number;
  nextTalkPostId?: number;
  nextBookingId?: number;
}

function readStore(): Store {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }
  } catch {}
  if (process.env.VERCEL) {
    try {
      const deployedDb = path.join(process.cwd(), ".data", "db.json");
      if (fs.existsSync(deployedDb)) {
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.copyFileSync(deployedDb, DATA_FILE);
        return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      }
    } catch {}
  }
  return getDefaultStore();
}

function writeStore(store: Store) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function getDefaultStore(): Store {
  const seedPassword = bcrypt.hashSync("password", 10);
  return {
    users: [
      { id: "1", name: "Admin User", email: "admin@mindcare.com", password: seedPassword, role: "admin", lastActive: new Date().toISOString(), modulesCompleted: 0, createdAt: new Date().toISOString() },
      { id: "2", name: "Sarah Johnson", email: "sarah@example.com", password: seedPassword, role: "student", lastActive: new Date().toISOString(), modulesCompleted: 3, createdAt: new Date().toISOString() },
      { id: "3", name: "Mike Chen", email: "mike@example.com", password: seedPassword, role: "student", lastActive: new Date().toISOString(), modulesCompleted: 1, createdAt: new Date().toISOString() },
      { id: "4", name: "Emily Davis", email: "emily@example.com", password: seedPassword, role: "student", lastActive: new Date().toISOString(), modulesCompleted: 5, createdAt: new Date().toISOString() },
    ],
    resources: [
      { id: "r1", title: "Guided Morning Meditation", category: "Video", url: "https://www.youtube.com/watch?v=ZToicYcHIOU", embedUrl: "https://www.youtube.com/embed/ZToicYcHIOU", sortOrder: 0, createdAt: new Date().toISOString() },
      { id: "r2", title: "Understanding Anxiety", category: "Article", url: "", sortOrder: 1, body: "Academic anxiety is a common experience among students of all ages. It manifests as persistent worry, self-doubt, and physical tension that arise in response to academic demands. While some level of stress can be motivating, chronic anxiety can impair concentration, memory, and overall performance.\n\n## What Causes Academic Anxiety?\n\nThe root causes of academic anxiety are often multifaceted. They can include perfectionism, fear of failure, high parental or institutional expectations, and previous negative academic experiences. Students may also face pressure from competitive environments, tight deadlines, and the overwhelming volume of coursework. Understanding these triggers is the first step toward managing them effectively.\n\n## Practical Strategies for Managing Anxiety\n\nDeveloping a structured routine can significantly reduce feelings of overwhelm. Break your study sessions into manageable chunks using the Pomodoro Technique—25 minutes of focused work followed by a 5-minute break. Incorporate regular physical activity into your day, even if it is just a 10-minute walk. Exercise releases endorphins that naturally combat stress and improve cognitive function.\n\nMindfulness and grounding exercises are powerful tools for managing anxiety in the moment. When you notice anxious thoughts arising, practice the 5-4-3-2-1 technique: acknowledge 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. This simple exercise helps anchor you in the present moment and reduces the intensity of anxious feelings.\n\n## When to Seek Support\n\nRemember that experiencing anxiety does not mean you are failing. It is a sign that you care deeply about your education and personal growth. If anxiety begins to interfere with your daily functioning, sleep, or relationships, consider reaching out to a counselor or mental health professional. Your institution likely offers free or low-cost mental health services.", createdAt: new Date().toISOString() },
      { id: "r3", title: "Calm Ocean Sounds for Sleep", category: "Audio", url: "", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", sortOrder: 2, body: "Close your eyes and imagine you are standing at the edge of a peaceful shoreline. The gentle rhythm of waves rolling in and out creates a natural lullaby that has soothed humans for millennia. Ocean sounds are rich in low-frequency tones that help slow down brainwave activity, making it easier to transition from a wakeful state into restful sleep.\n\nListening to ocean sounds can lower cortisol levels, reduce blood pressure, and quiet a racing mind. For best results, find a comfortable position, set the volume to a gentle level, and allow the rhythmic sound of the water to guide your breathing. Inhale deeply as the wave approaches, exhale slowly as it recedes. Let go of the day's tension with each breath.", createdAt: new Date().toISOString() },
      { id: "r4", title: "Breathing Exercises for Stress Relief", category: "Video", url: "https://www.youtube.com/watch?v=a3N10Z1P3Tc", embedUrl: "https://www.youtube.com/embed/a3N10Z1P3Tc", sortOrder: 3, createdAt: new Date().toISOString() },
      { id: "r5", title: "Cognitive Behavioral Therapy Basics", category: "Article", url: "", body: "Cognitive Behavioral Therapy (CBT) is a practical, evidence-based approach to understanding and changing unhelpful thought patterns and behaviors. Developed in the 1960s by Dr. Aaron Beck, CBT is built on the core principle that our thoughts, feelings, and behaviors are interconnected, and that by changing one, we can positively influence the others.\n\n## The Cognitive Triangle\n\nAt the heart of CBT lies the cognitive triangle: Thoughts lead to Feelings, which lead to Behaviors, which in turn reinforce Thoughts. For example, if you think 'I am going to fail this exam' (Thought), you may feel anxious and hopeless (Feeling), which might lead you to avoid studying (Behavior). This avoidance then reinforces the original thought that you will fail, creating a negative cycle.\n\n## Identifying Cognitive Distortions\n\nCognitive distortions are patterns of thinking that are inaccurate or exaggerated. Common distortions include catastrophizing (assuming the worst will happen), all-or-nothing thinking (seeing things in black-and-white terms), and mind reading (assuming you know what others think about you). The first step in CBT is learning to recognize these patterns when they occur.\n\n## Practical CBT Techniques\n\nOne effective technique is thought recording. When you notice a distressing emotion, pause and write down: the situation, your automatic thought, the emotion you felt, and evidence that supports or contradicts the thought. Then, try to reframe the thought in a more balanced way. For instance, instead of 'I will fail this presentation,' try 'I have prepared thoroughly, and it is normal to feel nervous. I will do my best, and that is enough.'\n\nCBT is most effective when practiced consistently over time. Consider working with a trained therapist who can guide you through the process and help you develop personalized strategies for managing your mental health.", sortOrder: 4, createdAt: new Date().toISOString() },
    ],
    progress: [],
    surveyData: [],
    wallPosts: [],
    journalEntries: [],
    finances: [],
    academicEvents: [],
    talkPosts: [],
    bookings: [],
    nextUserId: 5,
    nextResourceId: 6,
    nextProgressId: 1,
    nextWallPostId: 1,
    nextJournalId: 1,
    nextFinanceId: 1,
    nextAcademicEventId: 1,
    nextTalkPostId: 1,
    nextBookingId: 1,
  };
}

export function getUsers(): User[] {
  return readStore().users;
}

export function getUserByEmail(email: string): User | undefined {
  return readStore().users.find((u) => u.email === email);
}

export function getUserById(id: string): User | undefined {
  return readStore().users.find((u) => u.id === id);
}

export function createUser(name: string, email: string, password: string, role: "student" | "admin"): User {
  const store = readStore();
  const user: User = {
    id: String(store.nextUserId++),
    name, email, password, role,
    lastActive: new Date().toISOString(),
    modulesCompleted: 0,
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  writeStore(store);
  return user;
}

export function getResources(): Resource[] {
  const resources = readStore().resources;
  resources.sort((a, b) => (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity));
  return resources;
}

export function getResourceById(id: string): Resource | undefined {
  return readStore().resources.find((r) => r.id === id);
}

export function createResource(title: string, category: "Video" | "Audio" | "Article", url: string, audioUrl?: string, body?: string): Resource {
  const store = readStore();
  let embedUrl: string | undefined;
  if (category === "Video" && url.includes("youtube.com/watch")) {
    const match = url.match(/v=([^&]+)/);
    if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}`;
  }
  const resource: Resource = {
    id: `r${store.nextResourceId++}`,
    title, category, url, embedUrl, audioUrl, body,
    sortOrder: store.resources.length,
    createdAt: new Date().toISOString(),
  };
  store.resources.push(resource);
  writeStore(store);
  return resource;
}

export function deleteResource(id: string): boolean {
  const store = readStore();
  const index = store.resources.findIndex((r) => r.id === id);
  if (index === -1) return false;
  store.resources.splice(index, 1);
  writeStore(store);
  return true;
}

export function reorderResources(orderedIds: string[]): Resource[] {
  const store = readStore();
  const ordered: Resource[] = [];
  for (let i = 0; i < orderedIds.length; i++) {
    const r = store.resources.find((res) => res.id === orderedIds[i]);
    if (r) {
      r.sortOrder = i;
      ordered.push(r);
    }
  }
  store.resources = ordered;
  writeStore(store);
  return ordered;
}

export function getProgress(): Progress[] {
  return readStore().progress;
}

export function getProgressByUser(userId: string): Progress[] {
  return readStore().progress.filter((p) => p.userId === userId);
}

export function createProgress(userId: string, resourceId: string): Progress {
  const store = readStore();
  const entry: Progress = {
    id: `p${store.nextProgressId++}`,
    userId, resourceId,
    interactedAt: new Date().toISOString(),
  };
  store.progress.push(entry);
  const user = store.users.find((u) => u.id === userId);
  if (user) {
    const uniqueResources = new Set(store.progress.filter((p) => p.userId === userId).map((p) => p.resourceId));
    user.modulesCompleted = uniqueResources.size;
    user.lastActive = new Date().toISOString();
  }
  writeStore(store);
  return entry;
}

export function getStudents(): User[] {
  return readStore().users.filter((u) => u.role === "student");
}

export function getSurveyData(): import("./types").SurveyChartData[] {
  return readStore().surveyData || [];
}

export function addSurveyData(data: import("./types").SurveyChartData) {
  const store = readStore();
  if (!store.surveyData) store.surveyData = [];
  store.surveyData.push(data);
  writeStore(store);
}

export function deleteSurveyData(id: string) {
  const store = readStore();
  store.surveyData = (store.surveyData || []).filter((c: any) => c.id !== id);
  writeStore(store);
}

export function clearSurveyData() {
  const store = readStore();
  store.surveyData = [];
  writeStore(store);
}

// Wall of Hope
export function getWallPosts(): WallPost[] {
  return readStore().wallPosts || [];
}

export function createWallPost(message: string): WallPost {
  const store = readStore();
  if (!store.nextWallPostId) store.nextWallPostId = (store.wallPosts?.length || 0) + 1;
  const post: WallPost = {
    id: `w${store.nextWallPostId++}`,
    message: message.slice(0, 200),
    createdAt: new Date().toISOString(),
  };
  if (!store.wallPosts) store.wallPosts = [];
  store.wallPosts.unshift(post);
  writeStore(store);
  return post;
}

export function deleteWallPost(id: string) {
  const store = readStore();
  store.wallPosts = (store.wallPosts || []).filter((p) => p.id !== id);
  writeStore(store);
}

// Journal
export function getJournalEntries(userId: string): JournalEntry[] {
  return (readStore().journalEntries || []).filter((e) => e.userId === userId);
}

// --- Finances ---
export function getFinances(userId: string): FinanceEntry[] {
  return (readStore().finances || []).filter((f) => f.userId === userId);
}

export function createFinance(userId: string, data: { type: string; category: string; amount: number; note: string; date: string }): FinanceEntry {
  const store = readStore();
  if (!store.nextFinanceId) store.nextFinanceId = (store.finances?.length || 0) + 1;
  const entry: FinanceEntry = {
    id: `f${store.nextFinanceId++}`,
    userId,
    type: data.type as "income" | "expense",
    category: data.category,
    amount: data.amount,
    note: data.note,
    date: data.date,
    createdAt: new Date().toISOString(),
  };
  if (!store.finances) store.finances = [];
  store.finances.unshift(entry);
  writeStore(store);
  return entry;
}

export function deleteFinance(id: string, userId: string) {
  const store = readStore();
  store.finances = (store.finances || []).filter((f) => !(f.id === id && f.userId === userId));
  writeStore(store);
}

// --- Academic Events ---
export function getAcademicEvents(userId: string): AcademicEvent[] {
  return (readStore().academicEvents || []).filter((e) => e.userId === userId);
}

export function createAcademicEvent(userId: string, data: { title: string; start: string; end?: string; type: string }): AcademicEvent {
  const store = readStore();
  if (!store.nextAcademicEventId) store.nextAcademicEventId = (store.academicEvents?.length || 0) + 1;
  const event: AcademicEvent = {
    id: `a${store.nextAcademicEventId++}`,
    userId,
    title: data.title,
    start: data.start,
    end: data.end,
    type: data.type as "exam" | "assignment" | "class" | "other",
    createdAt: new Date().toISOString(),
  };
  if (!store.academicEvents) store.academicEvents = [];
  store.academicEvents.push(event);
  writeStore(store);
  return event;
}

export function deleteAcademicEvent(id: string, userId: string) {
  const store = readStore();
  store.academicEvents = (store.academicEvents || []).filter((e) => !(e.id === id && e.userId === userId));
  writeStore(store);
}

// --- Talk Campus (anonymous - no userId) ---
export function getTalkPosts(): TalkPost[] {
  return readStore().talkPosts || [];
}

export function createTalkPost(message: string): TalkPost {
  const store = readStore();
  if (!store.nextTalkPostId) store.nextTalkPostId = (store.talkPosts?.length || 0) + 1;
  const post: TalkPost = {
    id: `t${store.nextTalkPostId++}`,
    message: message.slice(0, 500),
    createdAt: new Date().toISOString(),
  };
  if (!store.talkPosts) store.talkPosts = [];
  store.talkPosts.unshift(post);
  writeStore(store);
  return post;
}

export function deleteTalkPost(id: string) {
  const store = readStore();
  store.talkPosts = (store.talkPosts || []).filter((p) => p.id !== id);
  writeStore(store);
}

// --- Bookings (anonymous - no userId) ---
export function createBooking(date: string, time: string, counselor: string, token: string): Booking {
  const store = readStore();
  if (!store.nextBookingId) store.nextBookingId = (store.bookings?.length || 0) + 1;
  const booking: Booking = {
    id: `b${store.nextBookingId++}`,
    token,
    date,
    time,
    counselor,
    createdAt: new Date().toISOString(),
  };
  if (!store.bookings) store.bookings = [];
  store.bookings.push(booking);
  writeStore(store);
  return booking;
}

export function getBookings(): Booking[] {
  return readStore().bookings || [];
}

export function getBookingByToken(token: string): Booking | undefined {
  return (readStore().bookings || []).find((b) => b.token === token);
}

export function updateBooking(id: string, updates: { status?: string; notes?: string }): Booking | null {
  const store = readStore();
  const booking = (store.bookings || []).find((b) => b.id === id);
  if (!booking) return null;
  if (updates.status) booking.status = updates.status as "cancelled" | "no-show";
  if (updates.notes !== undefined) booking.notes = updates.notes;
  writeStore(store);
  return booking;
}

export function deleteBooking(id: string) {
  const store = readStore();
  store.bookings = (store.bookings || []).filter((b) => b.id !== id);
  writeStore(store);
}

export function createJournalEntry(userId: string, prompt: string, content: string): JournalEntry {
  const store = readStore();
  if (!store.nextJournalId) store.nextJournalId = (store.journalEntries?.length || 0) + 1;
  const entry: JournalEntry = {
    id: `j${store.nextJournalId++}`,
    userId, prompt, content,
    createdAt: new Date().toISOString(),
  };
  if (!store.journalEntries) store.journalEntries = [];
  store.journalEntries.unshift(entry);
  writeStore(store);
  return entry;
}
