"use server";

import { revalidatePath } from "next/cache";

// Mock Data Store
let events = [
  {
    id: 1,
    title: "Pediatrician Checkup",
    date: "2026-01-13",
    type: "priority",
    completed: false,
  },
  {
    id: 2,
    title: "Call Insurance",
    date: "2026-01-25",
    type: "priority",
    completed: false,
  },
];

export async function getCalendarData() {
  // Logic to return events sorted by date
  return events.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

export async function addEvent(formData: FormData) {
  const newEvent = {
    id: Date.now(),
    title: formData.get("title") as string,
    date: formData.get("date") as string,
    type: formData.get("isPriority") === "true" ? "priority" : "event",
    completed: false,
  };

  events.push(newEvent);
  revalidatePath("/calendar");
  return { success: true };
}

export async function togglePriority(id: number) {
  const index = events.findIndex((e) => e.id === id);
  if (index !== -1) {
    events[index].completed = !events[index].completed;
  }
  revalidatePath("/calendar");
}
