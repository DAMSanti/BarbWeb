import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'

interface PrivateRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAppStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default PrivateRoute
