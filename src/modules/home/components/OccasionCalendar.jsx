import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, PartyPopper, Heart, Award, Clock, MapPin, ArrowUpRight } from 'lucide-react';
import { PREVIEW_WEEK, occasionEvents, calendarDate, addDays, eventsInWeek } from './occasionData';
import './OccasionCalendar.css';

const categoryIcons = { Celebrations: PartyPopper, Recognition: Award, Wellness: Heart };
const shortDate = date => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export default function OccasionCalendar() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [category, setCategory] = useState('All occasions');
  const [selectedId, setSelectedId] = useState(null);
  const weekStart = addDays(calendarDate(PREVIEW_WEEK), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const events = eventsInWeek(occasionEvents, weekStart, category);
  const selected = events.find(event => event.id === selectedId) || events[0];
  const SelectedIcon = selected ? categoryIcons[selected.category] : CalendarDays;

  return (
    <section className="occasions" aria-labelledby="occasions-title">
      <header className="occasions-heading">
        <div><p className="dashboard-eyebrow">MOMENTS THAT BRING US TOGETHER</p><h2 id="occasions-title">A little more to look forward to</h2><p>Celebrate milestones. Connect with your team. Make time for you.</p></div>
        <span className="occasion-preview">Sample schedule</span>
      </header>

      <div className="occasion-layout">
        <div className="occasion-calendar">
          <div className="occasion-toolbar">
            <h3><CalendarDays size={18} /> Occasion calendar</h3>
            <label className="occasion-filter"><span className="sr-only">Filter occasions</span><select value={category} onChange={event => setCategory(event.target.value)}>{['All occasions', 'Celebrations', 'Recognition', 'Wellness'].map(item => <option key={item}>{item}</option>)}</select></label>
          </div>
          <div className="occasion-week-controls">
            <p aria-live="polite">{shortDate(weekStart)} &ndash; {shortDate(days[6])}<span> {days[6].getFullYear()}</span></p>
            <div><button type="button" className="occasion-reset" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0}>Sample week</button><button type="button" aria-label="Previous week" onClick={() => setWeekOffset(value => value - 1)}><ChevronLeft size={17} /></button><button type="button" aria-label="Next week" onClick={() => setWeekOffset(value => value + 1)}><ChevronRight size={17} /></button></div>
          </div>
          <p className="occasion-scroll-hint">Swipe to explore the full week</p>
          <div className="occasion-grid-scroll" tabIndex={0} role="region" aria-label="Weekly occasion calendar">
            <div className="occasion-week-grid">
              {days.map((day, index) => <div className={`occasion-day ${index > 4 ? 'occasion-weekend' : ''}`} key={day.toISOString()} style={{ gridColumn: index + 1, gridRow: '1 / 5' }}><span>{day.toLocaleDateString('en-GB', { weekday: 'short' })}</span><strong>{String(day.getDate()).padStart(2, '0')}</strong></div>)}
              {events.map(event => {
                const startIndex = days.findIndex(day => day >= calendarDate(event.start));
                const endIndex = days.findLastIndex(day => day <= calendarDate(event.end));
                const Icon = categoryIcons[event.category];
                return <button key={event.id} type="button" className={`occasion-block occasion-${event.tone}`} style={{ gridColumn: `${startIndex + 1} / ${endIndex + 2}`, gridRow: event.lane + 2 }} onClick={() => setSelectedId(event.id)} aria-pressed={selected?.id === event.id} aria-controls="occasion-detail" aria-label={`${event.title}, ${shortDate(calendarDate(event.start))} to ${shortDate(calendarDate(event.end))}`}><Icon size={17} /><strong>{event.title}</strong><small>{event.start === event.end ? event.time : `${shortDate(calendarDate(event.start))} – ${shortDate(calendarDate(event.end))}`}</small></button>;
              })}
              {!events.length && <div className="occasion-empty"><CalendarDays size={26} /><strong>A little breathing room</strong><p>No sample occasions for this week or filter.</p></div>}
            </div>
          </div>
          <footer className="occasion-legend"><span><i className="legend-peach" />Celebrations</span><span><i className="legend-blue" />Recognition</span><span><i className="legend-mint" />Wellness</span></footer>
        </div>

        <aside className="occasion-agenda" aria-labelledby="occasion-agenda-title">
          <div className="occasion-agenda-heading"><div><p className="dashboard-eyebrow">ON THE CALENDAR</p><h3 id="occasion-agenda-title">This week</h3></div><span>{events.length} events</span></div>
          <div className="occasion-agenda-list">
            {events.map(event => <button type="button" key={event.id} onClick={() => setSelectedId(event.id)} aria-pressed={selected?.id === event.id} aria-controls="occasion-detail" className="occasion-agenda-item"><span className={`occasion-date occasion-${event.tone}`}><small>{calendarDate(event.start).toLocaleDateString('en-GB', { month: 'short' })}</small><strong>{calendarDate(event.start).getDate()}</strong></span><span><strong>{event.title}</strong><small>{event.time} · {event.location}</small></span><ArrowUpRight size={15} /></button>)}
            {!events.length && <p className="occasion-agenda-empty">Try another week or select all occasions to see more.</p>}
          </div>
          <div id="occasion-detail" className="occasion-detail" aria-live="polite">
            {selected ? <><span className="occasion-detail-category"><SelectedIcon size={14} />{selected.category}</span><h4>{selected.title}</h4><p>{selected.description}</p><div><span><Clock size={13} />{selected.time}</span><span><MapPin size={13} />{selected.location}</span></div></> : <><h4>Your next moment awaits</h4><p>Sample event details will appear here when you choose an occasion.</p></>}
          </div>
        </aside>
      </div>
    </section>
  );
}
