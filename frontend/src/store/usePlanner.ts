import { create } from "zustand";

/* ---------- Types ---------- */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday

export interface Course {
  id: string;
  name: string;
}

export interface Slot {
  id: string;
  courseId: string;
  dayOfWeek: DayOfWeek;
  start: string; // "HH:mm"
  end: string; // "HH:mm"
  room?: string | null;
}

export interface PlacedItem {
  courseId: string;
  courseName: string;
  dayOfWeek: DayOfWeek;
  start: string;
  end: string;
  // Always present
  room: string | null;
}

export interface SolveResponse {
  placed: PlacedItem[];
  reasoning?: string;
}

/* ---------- Helpers ---------- */
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const norm = (s: string) => s.trim().toLowerCase();

/* ---------- Backend API ---------- */

type BackendSolveResponse = {
  items: { courseId: string; slotId: string }[];
  score: number;
  reasoning: string;
};

const api = {
  solve: async (courses: Course[], slots: Slot[]): Promise<SolveResponse> => {
    if (courses.length === 0 || slots.length === 0) {
      return { placed: [], reasoning: "No courses or slots provided." };
    }

    const body = {
      courses: courses.map((c) => ({
        id: c.id,
        code: c.name,
        name: c.name,
      })),
      slots: slots.map((s) => ({
        id: s.id,
        courseId: s.courseId,
        dayOfWeek: s.dayOfWeek,
        startTime: s.start,
        endTime: s.end,
        room: s.room ?? undefined,
      })),
      preferences: {},
    };

    const res = await fetch("http://localhost:4000/api/solve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Backend error ${res.status}: ${text}`);
    }

    const data: BackendSolveResponse = await res.json();

    // Backend: items = {courseId, slotId}
    // UI: placed = slot with course name
    const raw = data.items.map((it): PlacedItem | null => {
      const slot = slots.find((s) => s.id === it.slotId);
      const course = courses.find((c) => c.id === it.courseId);
      if (!slot || !course) return null;

      return {
        courseId: course.id,
        courseName: course.name,
        dayOfWeek: slot.dayOfWeek,
        start: slot.start,
        end: slot.end,
        room: slot.room ?? null,
      };
    });

    // Type guard for filtering nulls
    const placed: PlacedItem[] = raw.filter(
      (x): x is PlacedItem => x !== null
    );

    return { placed, reasoning: data.reasoning };
  },
};

/* ---------- Zustand Store ---------- */
type State = {
  courses: Course[];
  slots: Slot[];
  placed: PlacedItem[];
  loading: boolean;
  error?: string;
  reasoning?: string;
};

type Actions = {
  addCourse: (name: string) => void;
  addCourseAndReturn: (name: string) => Course;
  addSlotLocal: (slot: Omit<Slot, "id">) => void;
  removeSlot: (id: string) => void;
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
  reasoning: undefined,

  addCourse: (name) => {
    const n = name.trim();
    if (!n) return;
    const exists = get().courses.find((c) => norm(c.name) === norm(n));
    if (exists) return;
    const newCourse: Course = { id: `c_${++cid}`, name: n };
    set((s) => ({ courses: [...s.courses, newCourse], error: undefined }));
  },

  addCourseAndReturn: (name) => {
    const n = name.trim();
    if (!n) {
      const fallback: Course = { id: `c_${++cid}`, name: "Untitled" };
      set((s) => ({ courses: [...s.courses, fallback], error: undefined }));
      return fallback;
    }
    const found = get().courses.find((c) => norm(c.name) === norm(n));
    if (found) return found;

    const newCourse: Course = { id: `c_${++cid}`, name: n };
    set((s) => ({ courses: [...s.courses, newCourse], error: undefined }));
    return newCourse;
  },

  addSlotLocal: (sNoId) => {
    if (toMin(sNoId.end) <= toMin(sNoId.start)) {
      set({ error: "End time must be after start time." });
      return;
    }
    const dup = get().slots.find(
      (x) =>
        x.courseId === sNoId.courseId &&
        x.dayOfWeek === sNoId.dayOfWeek &&
        x.start === sNoId.start &&
        x.end === sNoId.end
    );
    if (dup) {
      set({ error: "This section already exists." });
      return;
    }

    const newSlot: Slot = { ...sNoId, id: `s_${++sid}` };
    set((s) => ({ slots: [...s.slots, newSlot], error: undefined }));
  },

  removeSlot: (id) => {
    set((s) => ({ slots: s.slots.filter((sl) => sl.id !== id) }));
  },

  solveNow: async () => {
    const { courses, slots } = get();
    if (courses.length === 0 || slots.length === 0) {
      set({
        error: "Önce en az bir ders ve slot ekle.",
        placed: [],
        reasoning: undefined,
      });
      return;
    }

    set({ loading: true, error: undefined });
    try {
      const res = await api.solve(courses, slots);
      set({
        placed: res.placed,
        reasoning: res.reasoning,
        loading: false,
        error: undefined,
      });
    } catch (e: any) {
      set({
        loading: false,
        error: e?.message || "Solve failed",
      });
    }
  },

  reset: () =>
    set({
      courses: [],
      slots: [],
      placed: [],
      reasoning: undefined,
      error: undefined,
    }),
}));
