// Events API layer — connects to backend server
import dayjs from 'dayjs'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

function mapServerEvent(ev) {
  // Convert server event format to calendar format
  // Server uses: { _id, title, date, description, type }
  // Calendar expects: { id, title, start, end, extendedProps: { description } }
  
  // Helper: detect date-only string (YYYY-MM-DD)
  const isDateOnly = (s) => typeof s === 'string' && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(s)

  // If already in calendar format, normalize end if date-only (FullCalendar expects exclusive end)
  if (ev.start) {
    let endVal = ev.end || ev.start
    if (isDateOnly(endVal)) {
      // Convert inclusive end (user-entered) to exclusive end for FullCalendar
      endVal = dayjs(endVal).add(1, 'day').format('YYYY-MM-DD')
    }
    return { 
      id: ev._id || ev.id, 
      title: ev.title, 
      start: ev.start, 
      end: endVal, 
      extendedProps: ev.extendedProps || {} 
    }
  }
  
  // Convert from old format (date) to new format (start/end)
  let startVal = ev.date || ev.start
  let endVal = ev.date || ev.end || ev.start
  if (isDateOnly(endVal)) {
    // Convert inclusive end to exclusive
    endVal = dayjs(endVal).add(1, 'day').format('YYYY-MM-DD')
  }

  return {
    id: ev._id || ev.id,
    title: ev.title,
    start: startVal,
    end: endVal,
    extendedProps: {
      description: ev.description || '',
      type: ev.type || 'event'
    }
  }
}

export async function getEvents() {
  try {
    const res = await fetch(`${API_URL}/events`, {
      credentials: 'include' // Include cookies for CORS
    })
    
    // Check if response is JSON
    let data
    const contentType = res.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await res.json()
    } else {
      const text = await res.text()
      throw new Error(`Server returned non-JSON response: ${text}`)
    }
    
    if (!res.ok) {
      const errorMessage = data.message || data.error || `Server error: ${res.status} ${res.statusText}`
      throw new Error(errorMessage)
    }
    
    // Handle both array response and {success, events} response
    const events = Array.isArray(data) ? data : (data.events || [])
    console.log('[eventsApi] getEvents (server) ->', events)
    return events.map(mapServerEvent)
  } catch (err) {
    console.error('[eventsApi] getEvents server error', err)
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Please make sure the backend server is running on port 4000.')
    }
    throw err
  }
}

export async function createEvent(payload) {
  try {
    // Convert calendar format to server format
    const serverPayload = {
      title: payload.title,
      date: payload.start, // Use start as date for backward compatibility
      start: payload.start,
      end: payload.end || payload.start,
      description: payload.extendedProps?.description || '',
      type: payload.extendedProps?.type || 'event',
      extendedProps: payload.extendedProps || {}
    }
    
    console.log('[eventsApi] createEvent sending:', serverPayload)
    console.log('[eventsApi] API URL:', `${API_URL}/events`)
    
    const res = await fetch(`${API_URL}/events`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(serverPayload),
      credentials: 'include' // Include cookies for CORS
    })
    
    // Check if response is JSON
    let responseData
    const contentType = res.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      responseData = await res.json()
    } else {
      const text = await res.text()
      throw new Error(`Server returned non-JSON response: ${text}`)
    }
    
    if (!res.ok) {
      const errorMessage = responseData.message || responseData.error || `Server error: ${res.status} ${res.statusText}`
      console.error('[eventsApi] createEvent server error response:', responseData)
      throw new Error(errorMessage)
    }
    
    // Handle both {success, event} and direct event response
    const event = responseData.event || responseData
    console.log('[eventsApi] created (server)', event)
    return mapServerEvent(event)
  } catch (err) {
    console.error('[eventsApi] createEvent error:', err)
    // Provide more helpful error messages
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Please make sure the backend server is running on port 4000.')
    }
    throw err
  }
}

export async function updateEvent(id, updates) {
  try {
    // Convert calendar format to server format
    const serverPayload = {
      title: updates.title,
      date: updates.start, // Use start as date for backward compatibility
      start: updates.start,
      end: updates.end || updates.start,
      description: updates.extendedProps?.description || '',
      type: updates.extendedProps?.type || 'event',
      extendedProps: updates.extendedProps || {}
    }
    
    const res = await fetch(`${API_URL}/events/${id}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(serverPayload),
      credentials: 'include'
    })
    if (!res.ok) throw new Error('Network error')
    const updated = await res.json()
    
    // Handle both {success, event} and direct event response
    const event = updated.event || updated
    console.log('[eventsApi] updated (server)', event)
    return mapServerEvent(event)
  } catch (err) {
    console.error('[eventsApi] updateEvent server error', err)
    throw err
  }
}

export async function deleteEvent(id) {
  try {
    const res = await fetch(`${API_URL}/events/${id}`, { 
      method: 'DELETE',
      credentials: 'include'
    })
    if (!res.ok) throw new Error('Network error')
    console.log('[eventsApi] deleted (server)', id)
    return true
  } catch (err) {
    console.error('[eventsApi] deleteEvent server error', err)
    throw err
  }
}
