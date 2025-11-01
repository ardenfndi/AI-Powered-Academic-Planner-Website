import { create } from "zustand";

/* ---------- Types ---------- */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Pazar

export interface Course { id: string; name: string; }

export interface Slot {
  id: string;
  courseId: string;
  dayOfWeek: DayOfWeek;
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
  room?: string | null;
}

export interface PlacedItem {
  courseId: string;
  courseName: string;
  dayOfWeek: DayOfWeek;
  start: string;
  end: string;
  room?: string | null;
}

export interface SolveResponse { placed: PlacedItem[]; }

/* ---------- Helpers ---------- */
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/* ---------- Mock API (şimdilik) ---------- */
const api = {
  solve: async (courses: Course[], slots: Slot[]): Promise<SolveResponse> => {
    const placed: PlacedItem[] = slots.map(s => {
      const c = courses.find(x => x.id === s.courseId);
      return {
        courseId: s.courseId,
        courseName: c?.name ?? "Bilinmeyen",
        dayOfWeek: s.dayOfWeek,
        start: s.start,
        end: s.end,
        room: s.room ?? null
      };
    });
    return new Promise(res => setTimeout(() => res({ placed }), 200));
  }
};

/* ---------- Zustand Store ---------- */
type State = {
  courses: Course[];
  slots: Slot[];
  placed: PlacedItem[];
  loading: boolean;
  error?: string;
};

type Actions = {
  addCourse: (name: string) => void;
  addSlotLocal: (slot: Omit<Slot, "id">) => void;
  solveNow: () => Promise<void>;
  reset: () => void;
};

let cid = 0;
let sid = 0;

export const usePlanner = create<State & Actions>((set, get) => ({
  courses: [],
  slots: [],
  placed: [],
  loading: false,
  error: undefined,

  addCourse: (name) => {
    const n = name.trim();
    if (!n) return;
    const newCourse: Course = { id: `c_${++cid}`, name: n };
    set(s => ({ courses: [...s.courses, newCourse], error: undefined }));
  },

  addSlotLocal: (sNoId) => {
    // Basit saat kontrolü
    if (toMin(sNoId.end) <= toMin(sNoId.start)) {
      set({ error: "End time must be after start time." });
      return;
    }
    const newSlot: Slot = { ...sNoId, id: `s_${++sid}` };
    set(s => ({ slots: [...s.slots, newSlot], error: undefined }));
  },

  solveNow: async () => {
    const { courses, slots } = get();
    set({ loading: true, error: undefined });
    try {
      const res = await api.solve(courses, slots);
      set({ placed: res.placed, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message || "Solve failed" });
    }
  },

  reset: () => set({ courses: [], slots: [], placed: [], error: undefined })
}));
