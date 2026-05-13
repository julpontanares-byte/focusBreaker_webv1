'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTimer } from '@/lib/timer-context'
import { TimerStorageManager } from '@/lib/timer-storage'
import { DEFAULT_SETTINGS, TimerSettings } from '@/lib/timer-types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, RotateCcw, Download, Upload } from 'lucide-react'

export default function SettingsPage() {
  const { state, updateSettings } = useTimer()
  const [settings, setSettings] = useState<TimerSettings>(state.settings)
  const [saved, setSaved] = useState(false)

  const handleSettingChange = (key: keyof TimerSettings, value: any) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    setSaved(false)
  }

  const handleSave = () => {
    updateSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS)
    setSaved(false)
  }

  const handleResetAndApply = () => {
    setSettings(DEFAULT_SETTINGS)
    updateSettings(DEFAULT_SETTINGS)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = () => {
    const data = TimerStorageManager.exportData()
    const element = document.createElement('a')
    element.setAttribute('href', `data:text/json;charset=utf-8,${encodeURIComponent(data)}`)
    element.setAttribute('download', `focusBreaker-backup-${new Date().toISOString().split('T')[0]}.json`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/timer">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Session Durations */}
        <Card className="p-6 bg-card border border-border rounded-lg space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">Session Durations</h2>
            <p className="text-sm text-muted-foreground">Customize your work and break session times</p>
          </div>

          <div className="space-y-4">
            {/* Work Duration */}
            <DurationSetting
              label="Work Session"
              value={settings.workDuration}
              min={1}
              max={60}
              onChange={(val) => handleSettingChange('workDuration', val)}
            />

            {/* Short Break */}
            <DurationSetting
              label="Short Break"
              value={settings.shortBreak}
              min={1}
              max={30}
              onChange={(val) => handleSettingChange('shortBreak', val)}
            />

            {/* Long Break */}
            <DurationSetting
              label="Long Break"
              value={settings.longBreak}
              min={1}
              max={60}
              onChange={(val) => handleSettingChange('longBreak', val)}
            />

            {/* Sessions Before Long Break */}
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">
                Sessions Before Long Break
              </label>
              <input
                type="range"
                min="2"
                max="6"
                value={settings.sessionsBeforeLongBreak}
                onChange={(e) => handleSettingChange('sessionsBeforeLongBreak', parseInt(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Long break after <strong>{settings.sessionsBeforeLongBreak}</strong> work sessions
              </p>
            </div>
          </div>
        </Card>

        {/* Notifications & Preferences */}
        <Card className="p-6 bg-card border border-border rounded-lg space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">Preferences</h2>
            <p className="text-sm text-muted-foreground">Customize your focus experience</p>
          </div>

          <div className="space-y-4">
            <ToggleSetting
              label="Enable Sound Notifications"
              description="Play sound when session completes"
              checked={settings.soundEnabled}
              onChange={(val) => handleSettingChange('soundEnabled', val)}
            />

            <ToggleSetting
              label="Enable Browser Notifications"
              description="Show browser notifications for session completion"
              checked={settings.notificationEnabled}
              onChange={(val) => handleSettingChange('notificationEnabled', val)}
            />

            <ToggleSetting
              label="Auto-start Next Session"
              description="Automatically start next session when timer completes"
              checked={settings.autoStartNextSession}
              onChange={(val) => handleSettingChange('autoStartNextSession', val)}
            />

            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded text-foreground"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-6 bg-card border border-border rounded-lg space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">Data Management</h2>
            <p className="text-sm text-muted-foreground">Backup or reset your data</p>
          </div>

          <div className="space-y-3">
            <Button onClick={handleExport} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>

            <Button
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.json'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = (event) => {
                    const result = event.target?.result as string
                    if (TimerStorageManager.importData(result)) {
                      window.location.reload()
                    }
                  }
                  reader.readAsText(file)
                }
                input.click()
              }}
              variant="outline"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>

            <Button
              onClick={() => {
                if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                  TimerStorageManager.clearAllData()
                  window.location.reload()
                }
              }}
              variant="outline"
              className="w-full bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/30"
            >
              Clear All Data
            </Button>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 sticky bottom-0 bg-background border-t border-border p-4 -mx-4">
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saved ? 'Saved!' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </main>
  )
}

function DurationSetting({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-foreground block mb-2">{label}</label>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer"
        />
        <div className="w-16 text-right">
          <Input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
            className="text-right font-mono"
          />
        </div>
        <span className="text-sm text-muted-foreground min-w-fit">min</span>
      </div>
    </div>
  )
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
      </label>
    </div>
  )
}
