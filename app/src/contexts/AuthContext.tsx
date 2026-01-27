import * as React from 'react'

interface AuthContextType {
  authDisabled: boolean
}

export const AuthContext = React.createContext<AuthContextType>({
  authDisabled: false,
})

export function useAuth() {
  return React.useContext(AuthContext)
}
