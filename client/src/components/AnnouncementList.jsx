import React from 'react'
import AnnouncementCard from './AnnouncementCard'

export default function AnnouncementList({ items = [], onDelete, showDelete = false }) {
  if (!items.length) {
    return <p className="announcement-empty">No announcements at the moment.</p>
  }

  return (
    <section className="announcement-list">
      {items.map((a) => (
        <AnnouncementCard
          key={a._id || a.id}
          {...a}
          onDelete={onDelete}
          showDelete={showDelete}
        />
      ))}
    </section>
  )
}
