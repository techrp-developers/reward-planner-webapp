// Static preview data. Keep event records separate from the calendar UI for API integration.
export const PREVIEW_WEEK = '2026-10-05';
export const occasionEvents = [
  { id: 'anniversary', title: 'Company anniversary', category: 'Celebrations', start: '2026-10-05', end: '2026-10-06', time: '10:00 AM', location: 'Main auditorium', description: 'Celebrate another year together with team stories, employee recognition and a shared lunch.', lane: 0, tone: 'peach' },
  { id: 'recognition', title: 'Team appreciation', category: 'Recognition', start: '2026-10-06', end: '2026-10-08', time: '3:00 PM', location: 'Online', description: 'Take a moment to recognise the colleagues who make a difference. Share a thank-you and celebrate team achievements.', lane: 1, tone: 'blue' },
  { id: 'wellness', title: 'Wellness workshop', category: 'Wellness', start: '2026-10-08', end: '2026-10-09', time: '11:00 AM', location: 'Wellness studio', description: 'Join a guided session on mindful movement and practical ways to build healthier everyday habits.', lane: 2, tone: 'mint' },
  { id: 'family', title: 'Family day', category: 'Celebrations', start: '2026-10-10', end: '2026-10-10', time: '10:30 AM', location: 'Office campus', description: 'Bring your loved ones for a relaxed day of games, good food and getting to know the team.', lane: 0, tone: 'lavender' },
  { id: 'learning', title: 'Financial wellbeing', category: 'Wellness', start: '2026-10-14', end: '2026-10-14', time: '2:00 PM', location: 'Online', description: 'An introductory session on budgeting, saving and planning for personal milestones.', lane: 1, tone: 'mint' },
  { id: 'milestones', title: 'Work anniversaries', category: 'Recognition', start: '2026-10-16', end: '2026-10-16', time: '4:00 PM', location: 'Main auditorium', description: 'Recognise the people and the milestones that have helped our team grow.', lane: 0, tone: 'blue' },
];

export function calendarDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date, count) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + count);
}

export function eventsInWeek(events, weekStart, category = 'All occasions') {
  const weekEnd = addDays(weekStart, 6);
  return events.filter(event => calendarDate(event.start) <= weekEnd && calendarDate(event.end) >= weekStart && (category === 'All occasions' || event.category === category));
}
