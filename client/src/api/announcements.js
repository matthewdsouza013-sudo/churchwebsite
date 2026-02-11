// Announcements API layer — connects to backend server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export async function getAnnouncements() {
  try {
    const res = await fetch(`${API_URL}/announcements`, {
      credentials: 'include'
    })
    
    if (!res.ok) {
      const errorMessage = `Server error: ${res.status} ${res.statusText}`
      throw new Error(errorMessage)
    }
    
    const data = await res.json()
    return data
  } catch (err) {
    console.error('[announcementsApi] getAnnouncements error', err)
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Please make sure the backend server is running on port 4000.')
    }
    throw err
  }
}

export async function getAnnouncementById(id) {
  try {
    const res = await fetch(`${API_URL}/announcements/${id}`, {
      credentials: 'include'
    })
    
    if (!res.ok) {
      const errorMessage = `Server error: ${res.status} ${res.statusText}`
      throw new Error(errorMessage)
    }
    
    const data = await res.json()
    return data
  } catch (err) {
    console.error('[announcementsApi] getAnnouncementById error', err)
    throw err
  }
}

export async function createAnnouncement(payload) {
  try {
    const res = await fetch(`${API_URL}/announcements`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload),
      credentials: 'include'
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const errorMessage = errorData.message || errorData.error || `Server error: ${res.status} ${res.statusText}`
      throw new Error(errorMessage)
    }
    
    const data = await res.json()
    return data
  } catch (err) {
    console.error('[announcementsApi] createAnnouncement error', err)
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Please make sure the backend server is running on port 4000.')
    }
    throw err
  }
}

export async function updateAnnouncement(id, updates) {
  try {
    const res = await fetch(`${API_URL}/announcements/${id}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(updates),
      credentials: 'include'
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const errorMessage = errorData.message || errorData.error || `Server error: ${res.status} ${res.statusText}`
      throw new Error(errorMessage)
    }
    
    const data = await res.json()
    return data
  } catch (err) {
    console.error('[announcementsApi] updateAnnouncement error', err)
    throw err
  }
}

export async function deleteAnnouncement(id) {
  try {
    const res = await fetch(`${API_URL}/announcements/${id}`, { 
      method: 'DELETE',
      credentials: 'include'
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const errorMessage = errorData.message || errorData.error || `Server error: ${res.status} ${res.statusText}`
      throw new Error(errorMessage)
    }
    
    const data = await res.json()
    return data
  } catch (err) {
    console.error('[announcementsApi] deleteAnnouncement error', err)
    throw err
  }
}
