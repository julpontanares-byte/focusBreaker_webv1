# focusBreaker Timer App

A standalone, client-side Pomodoro timer web application built with Next.js and React. No backend required—all data is stored in localStorage for offline functionality.

## Features

### Timer Page (`/timer`)
- Large, readable countdown timer with animated progress ring
- Work/break mode switching with visual indicators (teal for work, green for breaks)
- Quick action buttons: pause/resume, reset, snooze (+5m), skip, take break
- Session counter showing current position in work cycle
- Real-time timer updates every second

### Customizable Settings (`/timer/settings`)
- **Work Duration**: 1-60 minutes (default 25)
- **Short Break**: 1-30 minutes (default 5)
- **Long Break**: 1-60 minutes (default 15)
- **Sessions Before Long Break**: 2-6 cycles (default 4)
- Sound notifications toggle
- Browser notification toggle
- Auto-start next session toggle
- Theme selector (light/dark)
- Export/import data as JSON
- Reset to defaults button

### Session History (`/timer/history`)
- View all sessions with timestamps and durations
- Filter: Today vs All Time
- Session quality badges (Perfect, Skipped, etc.)
- Delete individual sessions
- Session status icons (completed, skipped, in-progress)
- Break compliance percentage per session

### Analytics Dashboard (`/timer/analytics`)
- **Key Metrics**: Total sessions, focus hours, current streak, break compliance %
- **Secondary Stats**: Perfect sessions, breaks taken, average session length
- **Weekly Chart**: Visual bar chart of activity for the past 7 days
- **Insights**: Contextual feedback on break compliance and performance
- **Trend Analysis**: Automatic insights based on your performance

## Architecture

### State Management
- **TimerContext** (`lib/timer-context.tsx`): Centralized timer state and actions
- **TimerStorageManager** (`lib/timer-storage.ts`): localStorage persistence layer
- **TimerTypes** (`lib/timer-types.ts`): TypeScript types for timer data

### Key Components
- **TimerDisplay** (`components/timer-display.tsx`): Large timer with progress ring
- **TimerActions** (`components/timer-actions.tsx`): Quick action buttons (skip, take break, snooze)

### Data Model
```typescript
TimerSession {
  id: string
  mode: 'work' | 'short-break' | 'long-break'
  duration: number (minutes)
  startTime: ISO string
  endTime?: ISO string
  skipped: boolean
  quality: 'perfect' | 'good' | 'skipped'
  completed: boolean
}

TimerSettings {
  workDuration: number
  shortBreak: number
  longBreak: number
  sessionsBeforeLongBreak: number
  soundEnabled: boolean
  notificationEnabled: boolean
  theme: 'light' | 'dark'
  autoStartNextSession: boolean
  lastModified: ISO string
}
```

### localStorage Keys
- `fb_timer_settings` - User configuration
- `fb_timer_sessions` - Complete session history
- `fb_timer_daily_stats` - Per-day statistics

## User Flow

1. **Start Timer**: Click play button to begin a 25-minute work session
2. **Complete Session**: Timer counts down and plays notification when complete
3. **Take Action**: Skip, snooze, or take a break immediately
4. **Automatic Progression**: After work session, automatically switches to break mode
5. **Long Breaks**: After N sessions, offers a longer break (default: every 4 sessions)
6. **Track Progress**: View history and analytics to see your patterns

## Customization Examples

### Change to 50-minute work sessions + 10-minute breaks:
1. Go to Settings
2. Set Work Session to 50 minutes
3. Set Short Break to 10 minutes
4. Click Save Settings

### Enable notifications and auto-start:
1. Go to Settings
2. Toggle "Enable Sound Notifications"
3. Toggle "Enable Browser Notifications"
4. Toggle "Auto-start Next Session"
5. Click Save Settings

### Export your data:
1. Go to Settings
2. Click "Export Data"
3. JSON file downloads with all sessions and settings

## Design System

The timer app matches focusBreaker's desktop aesthetic:
- **Primary Color**: Teal (`#1B7F79`) for work sessions
- **Secondary Color**: Emerald/Green (`#2A9B93`) for breaks
- **Accent Color**: Brown (`#8B5E3C`)
- **Background**: Warm beige (`#F2EDE3`)
- **Text**: Near-black (`#1E2D2C`)

### Responsive Breakpoints
- Mobile: 320px+ (single column)
- Tablet: 768px+ (2-column layouts)
- Desktop: 1024px+ (full 3-column layouts)

## Performance

- **Timer Accuracy**: ±1 second (updated every 1s via JavaScript)
- **Load Time**: <2 seconds (fully client-side)
- **Offline Support**: 100% (all data in localStorage)
- **Memory**: ~1-2MB for 1000+ sessions

## Notifications

### Sound Notification
- Uses Web Audio API fallback if audio file unavailable
- Frequency: 800Hz tone, 0.5-second duration
- Can be disabled in settings

### Browser Notification
- Requires browser permission
- Shows: "focusBreaker - [Work/Break] session complete!"
- Can be disabled in settings

## Data Export/Import

### Export
- Exports as JSON with all sessions, settings, and stats
- Filename: `focusBreaker-backup-YYYY-MM-DD.json`
- Can be backed up or shared

### Import
- Upload a previously exported JSON file
- Overwrites current data with imported data
- Requires confirmation

## Troubleshooting

### Timer not counting down
- Check if browser supports localStorage
- Verify sound/notification permissions
- Try refreshing the page

### Data not persisting
- Check localStorage is enabled
- Clear browser cache/cookies for the site
- Check if browser is in private mode (localStorage limited)

### Break compliance shows 0%
- Compliance is calculated from work sessions only
- Break sessions don't affect compliance %
- Complete work sessions with breaks taken to increase compliance

### Missing data after browser update
- localStorage data is browser/device-specific
- Use Export function to create backups
- Import previously exported JSON if needed

## Future Enhancements

- [ ] Service Worker for PWA support
- [ ] Sync across devices via cloud
- [ ] Advanced analytics with charts
- [ ] Pomodoro technique variants (custom cycle lengths)
- [ ] Integration with calendar for session scheduling
- [ ] Mobile app version (React Native)
- [ ] Team/collaborative timers
- [ ] Achievement badges and gamification

## Files Structure

```
app/timer/
├── page.tsx              # Main timer page
├── layout.tsx            # Timer layout with provider
├── settings/
│   └── page.tsx          # Settings page
├── history/
│   └── page.tsx          # Session history page
└── analytics/
    └── page.tsx          # Analytics dashboard

lib/
├── timer-types.ts        # TypeScript types
├── timer-storage.ts      # localStorage management
└── timer-context.tsx     # React Context for state

components/
├── timer-display.tsx     # Large timer component
└── timer-actions.tsx     # Quick action buttons
```

## License & Usage

This is a standalone web application. Deploy to Vercel, Netlify, or any static host. No backend dependencies required.
