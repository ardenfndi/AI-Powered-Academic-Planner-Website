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
const padTime = (val: string) => {
  const parts = val.split(":").map((p) => p.trim());
  const h = parts[0] ?? "00";
  const m = parts[1] ?? "00";
  const hh = String(Number(h)).padStart(2, "0");
  const mm = String(Number(m)).padStart(2, "0");
  return `${hh}:${mm}`;
};
const normalizeDay = (d: number): DayOfWeek => {
  // Convert 0-6 (Sun-Sat) to 1-7 (Mon-Sun) expected by UI; clamp within 0..6 first
  const clamped = Math.max(0, Math.min(6, Math.trunc(d)));
  const asUi = ((clamped + 6) % 7) + 1; // shift so Monday=1
  return asUi as DayOfWeek;
};

/* ---------- Backend API ---------- */

type BackendSolveResponse = {
  items: { courseId: string; slotId: string }[];
  score: number;
  reasoning: string;
};

const API_BASE = "http://localhost:4000";

const api = {
  fetchAll: async (): Promise<{ courses: Course[]; slots: Slot[] }> => {
    const res = await fetch(`${API_BASE}/api/courses`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Backend error ${res.status}: ${text}`);
    }
    const data: Array<Course & { slots: any[] }> = await res.json();
    const courses: Course[] = data.map((c) => ({
      id: String(c.id),
      name: c.name,
    }));
    const slots: Slot[] = data.flatMap((c) =>
      (c.slots || []).map((s) => ({
        id: String(s.id),
        courseId: String(s.courseId),
        dayOfWeek: s.dayOfWeek as DayOfWeek,
        start: s.startTime,
        end: s.endTime,
        room: s.room ?? null,
      })),
    );
    return { courses, slots };
  },

  addCourse: async (name: string): Promise<Course> => {
    const res = await fetch(`${API_BASE}/api/courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code: name }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Backend error ${res.status}: ${text}`);
    }
    const c = await res.json();
    return { id: String(c.id), name: c.name };
  },

  addSlot: async (slot: Omit<Slot, "id">): Promise<Slot> => {
    const res = await fetch(`${API_BASE}/api/slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: slot.courseId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.start,
        endTime: slot.end,
        room: slot.room ?? undefined,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Backend error ${res.status}: ${text}`);
    }
    const s = await res.json();
    return {
      id: String(s.id),
      courseId: String(s.courseId),
      dayOfWeek: s.dayOfWeek,
      start: s.startTime,
      end: s.endTime,
      room: s.room ?? null,
    };
  },

  deleteSlot: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/slots/${id}`, {
      method: "DELETE",
    });
    if (!res.ok && res.status !== 204) {
      const text = await res.text();
      throw new Error(`Backend error ${res.status}: ${text}`);
    }
  },

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

    const res = await fetch(`${API_BASE}/api/solve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Backend error ${res.status}: ${text}`);
    }

    const data: BackendSolveResponse = await res.json();

    const raw = data.items.map((it): PlacedItem | null => {
      const slot = slots.find((s) => s.id === String(it.slotId));
      const course = courses.find((c) => c.id === String(it.courseId));
      if (!slot || !course) return null;

      return {
        courseId: course.id,
        courseName: course.name,
        dayOfWeek: normalizeDay(slot.dayOfWeek),
        start: padTime(slot.start),
        end: padTime(slot.end),
        room: slot.room ?? null,
      };
    });

    const placed: PlacedItem[] = raw.filter((x): x is PlacedItem => x !== null);

    // Debug visibility for development
    console.log("[solve] api response", data);
    console.log("[solve] mapped placed", placed);

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
  addCourse: (name: string) => Promise<void>;
  addCourseAndReturn: (name: string) => Promise<Course>;
  addSlotLocal: (slot: Omit<Slot, "id">) => Promise<void>;
  removeSlot: (id: string) => Promise<void>;
  solveNow: () => Promise<void>;
  reset: () => void;
  init: () => Promise<void>;
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

  init: async () => {
    try {
      const data = await api.fetchAll();
      cid = Math.max(0, ...data.courses.map((c) => Number(c.id) || 0));
      sid = Math.max(0, ...data.slots.map((s) => Number(s.id) || 0));
      set({
        courses: data.courses,
        slots: data.slots,
        error: undefined,
      });
    } catch (err: any) {
      set({ error: err?.message || "Failed to load data" });
    }
  },

  addCourse: async (name) => {
    const n = name.trim();
    if (!n) return;
    const exists = get().courses.find((c) => norm(c.name) === norm(n));
    if (exists) return;
    const course = await api.addCourse(n);
    set((s) => ({ courses: [...s.courses, course], error: undefined }));
  },

  addCourseAndReturn: (name) => {
    const n = name.trim() || "Untitled";
    const found = get().courses.find((c) => norm(c.name) === norm(n));
    if (found) return Promise.resolve(found);
    return api.addCourse(n).then((course) => {
      set((s) => ({ courses: [...s.courses, course], error: undefined }));
      return course;
    });
  },

  addSlotLocal: async (sNoId) => {
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
    if (dup) return;

    try {
      const created = await api.addSlot(sNoId);
      set((s) => ({ slots: [...s.slots, created], error: undefined }));
    } catch (err: any) {
      set({ error: err?.message || "Failed to add slot" });
    }
  },

  removeSlot: async (id) => {
    try {
      await api.deleteSlot(id);
      set((s) => ({ slots: s.slots.filter((sl) => sl.id !== id) }));
    } catch (err: any) {
      set({ error: err?.message || "Failed to remove slot" });
    }
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
