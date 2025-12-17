export type CourseInput = {
  id: string;
  code: string;
  name: string;
};

export type SlotInput = {
  id: string;
  courseId: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday...
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  room?: string;
};

export type PreferencesInput = {
  // Placeholder for future preferences
};

export type SolveItem = {
  courseId: string;
  slotId: string;
};

export type SolveResult = {
  items: SolveItem[];
  score: number;
  reasoning: string;
};

/* ---------- Helpers ---------- */

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function overlaps(a: SlotInput, b: SlotInput): boolean {
  if (a.dayOfWeek !== b.dayOfWeek) return false;
  const aStart = toMinutes(a.startTime);
  const aEnd = toMinutes(a.endTime);
  const bStart = toMinutes(b.startTime);
  const bEnd = toMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

function dayName(d: number): string {
  switch (d) {
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    case 0:
    default:
      return "Sunday";
  }
}

// "CS101-A" -> "CS101"
// "CS101 Intro to Programming" -> "CS101"
function baseCourseName(name: string): string {
  const dashIdx = name.indexOf("-");
  if (dashIdx > 0) {
    return name.slice(0, dashIdx).trim();
  }
  const spaceIdx = name.indexOf(" ");
  if (spaceIdx > 0) {
    return name.slice(0, spaceIdx).trim();
  }
  return name.trim();
}

/* ---------- Core solver: backtracking ---------- */

export function solveSchedule(
  courses: CourseInput[],
  slots: SlotInput[],
  _preferences?: PreferencesInput
): SolveResult {
  if (!courses.length || !slots.length) {
    return {
      items: [],
      score: 0,
      reasoning:
        "No courses or slots were provided, so I cannot build a timetable.",
    };
  }

  const courseById = new Map<string, CourseInput>();
  for (const c of courses) courseById.set(c.id, c);

  // Slot enriched with course names
  type RichSlot = SlotInput & {
    courseName: string;
    baseCourse: string;
  };

  const richSlots: RichSlot[] = slots
    .map((s) => {
      const c = courseById.get(s.courseId);
      if (!c) return null;
      return {
        ...s,
        courseName: c.name,
        baseCourse: baseCourseName(c.name),
      };
    })
    .filter((x): x is RichSlot => x !== null);

  if (!richSlots.length) {
    return {
      items: [],
      score: 0,
      reasoning:
        "Slots did not match any known courses, so I cannot build a timetable.",
    };
  }

  // Group all sections by base course (e.g., CS101)
  const groups = new Map<string, RichSlot[]>();
  for (const rs of richSlots) {
    if (!groups.has(rs.baseCourse)) groups.set(rs.baseCourse, []);
    groups.get(rs.baseCourse)!.push(rs);
  }

  const baseCourses = Array.from(groups.keys());

  type PartialSolution = {
    chosenSlots: RichSlot[];
    chosenBaseCourses: Set<string>;
  };

  let best: PartialSolution | null = null;

  function isCompatible(existing: RichSlot[], candidate: RichSlot): boolean {
    return existing.every((s) => !overlaps(s, candidate));
  }

  function scoreSolution(sol: PartialSolution): number {
    // Score: count of distinct base courses selected
    return sol.chosenBaseCourses.size;
  }

  function backtrack(index: number, current: PartialSolution) {
    if (index >= baseCourses.length) {
      if (!best || scoreSolution(current) > scoreSolution(best)) {
        best = {
          chosenSlots: [...current.chosenSlots],
          chosenBaseCourses: new Set(current.chosenBaseCourses),
        };
      }
      return;
    }

    const base = baseCourses[index];
    const options = groups.get(base) || [];

    // Option 1: skip this base course
    backtrack(index + 1, current);

    // Option 2: try each section for this base course
    for (const slot of options) {
      if (!isCompatible(current.chosenSlots, slot)) continue;
      current.chosenSlots.push(slot);
      current.chosenBaseCourses.add(base);
      backtrack(index + 1, current);
      current.chosenSlots.pop();
      current.chosenBaseCourses.delete(base);
    }
  }

  backtrack(0, {
    chosenSlots: [],
    chosenBaseCourses: new Set<string>(),
  });

  if (!best || best.chosenSlots.length === 0) {
    return {
      items: [],
      score: 0,
      reasoning:
        "Every combination of the provided sections leads to time conflicts, so I could not build a non-overlapping timetable.",
    };
  }

  // Convert best selection to SolveItems
  const items: SolveItem[] = best.chosenSlots.map((s) => ({
    courseId: s.courseId,
    slotId: s.id,
  }));

  // Build reasoning text
  const lines: string[] = [];
  lines.push(
    "I selected at most one section for each base course and avoided time overlaps for a single student."
  );
  lines.push("");
  lines.push("Chosen assignments:");
  for (const s of best.chosenSlots) {
    const c = courseById.get(s.courseId);
    const courseLabel = c ? c.name : s.courseName;
    lines.push(
      `- ${courseLabel}: ${dayName(s.dayOfWeek)} ${s.startTime} - ${s.endTime}${
        s.room ? ` in ${s.room}` : ""
      }`
    );
  }

  const skipped: string[] = [];
  for (const base of baseCourses) {
    const hasChosen = best.chosenSlots.some((s) => s.baseCourse === base);
    if (!hasChosen) skipped.push(base);
  }

  if (skipped.length > 0) {
    lines.push("");
    lines.push(
      `Some base courses could not be included without causing conflicts: ${skipped.join(
        ", "
      )}.`
    );
  }

  return {
    items,
    score: scoreSolution(best),
    reasoning: lines.join("\n"),
  };
}
