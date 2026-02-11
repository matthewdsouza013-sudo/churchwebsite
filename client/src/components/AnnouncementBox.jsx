import React, { useEffect, useState } from 'react'
import * as announcementsApi from '../api/announcements'

export default function AnnouncementBox({ title = 'Sunday Announcement' }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await announcementsApi.getAnnouncements()
        if (mounted) {
          setItems(data)
        }
      } catch (err) {
        console.error('Error loading announcements:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="announcement-wrapper">
      <div className="announcement-box" role="region" aria-label={title}>
        <header className="announcement-header">
          <h2>{title}</h2>
        </header>
        <div className="announcement-body">
          {loading && <p className="announcement-muted">Loading announcements...</p>}
          {!loading && !items.length && <p className="announcement-muted">No announcements yet.</p>}
          {!loading && items.length > 0 && (
            <ul className="announcement-demo-list">
              {items.map((it) => (
                <li key={it._id} className="announcement-demo-item">
                  <span className="announcement-demo-date">
                    {new Date(it.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </span>
                  <span className="announcement-demo-text">{it.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
