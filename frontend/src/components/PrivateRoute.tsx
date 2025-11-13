import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'

interface PrivateRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isAuthInitialized, user } = useAppStore()

  // While auth is being verified, show nothing (prevents flash of unprotected content)
  if (!isAuthInitialized) {
    return null
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default PrivateRoute
