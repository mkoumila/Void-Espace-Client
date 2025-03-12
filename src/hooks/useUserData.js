import { useState, useEffect, useRef } from 'react'

/**
 * Custom hook to fetch and manage user data
 * @param {Object} user - The authenticated user object
 * @param {Function} refreshSession - Function to refresh the auth session
 * @returns {Object} User data and loading state
 */
export function useUserData(user, refreshSession) {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeoutReached, setTimeoutReached] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const fetchAttempted = useRef(false)

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true)
    }, 5000) // 5 second timeout
    
    return () => clearTimeout(timer)
  }, [])

  // Get username from email
  const getUsernameFromEmail = (email) => {
    return email ? email.split('@')[0] : 'user'
  }

  // Fetch user data when user object becomes available
  useEffect(() => {
    // Only try to fetch data if we have a user and haven't already attempted
    if (user && !userData && !fetchAttempted.current) {
      fetchAttempted.current = true
      setLoading(true)
      
      const fetchUserData = async () => {
        try {
          const supabaseClient = (await import('../api/supabaseClient')).default
          const { data, error } = await supabaseClient
            .from('users')
            .select('first_name, last_name, email, company, avatar_url')
            .eq('id', user.id)
            .single()
            
          if (error) {
            // Even on error, try to get user data from the users table
            const { data: usersData } = await supabaseClient
              .from('users')
              .select('first_name, last_name')
              .eq('email', user.email)
              .single()
            
            if (usersData && (usersData.first_name || usersData.last_name)) {
              setUserData({
                name: [usersData.first_name, usersData.last_name].filter(Boolean).join(' '),
                email: user.email,
                company: user.user_metadata?.company || '',
                avatar_url: user.user_metadata?.avatar_url || null
              })
            } else {
              // Fall back to email username
              setUserData({
                name: getUsernameFromEmail(user.email),
                email: user.email,
                company: user.user_metadata?.company || '',
                avatar_url: user.user_metadata?.avatar_url || null
              })
            }
          } else if (data) {
            const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ')
            setUserData({
              name: fullName || getUsernameFromEmail(user.email),
              email: data.email || user.email,
              company: data.company || '',
              avatar_url: data.avatar_url || null
            })
          }
        } catch (err) {
          // Fall back to email username
          setUserData({
            name: getUsernameFromEmail(user.email),
            email: user.email,
            company: user.user_metadata?.company || '',
            avatar_url: user.user_metadata?.avatar_url || null
          })
        } finally {
          setLoading(false)
        }
      }
      
      fetchUserData()
    } else if (!user) {
      // Clear user data if we don't have a user anymore
      setUserData(null)
      fetchAttempted.current = false
      setLoading(false)
    }
  }, [user, userData])
  
  // Handle manual session refresh
  const handleRefreshSession = async () => {
    if (refreshing) return
    
    setRefreshing(true)
    try {
      await refreshSession()
      // Reset the fetch attempted flag to try getting user data again
      fetchAttempted.current = false
      setUserData(null)
      setLoading(true)
    } catch (error) {
      // Silent error handling
    } finally {
      setRefreshing(false)
    }
  }
  
  return {
    userData,
    loading,
    timeoutReached,
    refreshing,
    handleRefreshSession
  }
} 