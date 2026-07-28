import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AuthModal } from '../components/AuthModal'

// Mock the context
const mockSetUser = vi.fn()
const mockSetIsAuthenticated = vi.fn()

vi.mock('../contexts/AppContext', () => ({
  useAppContext: () => ({
    setUser: mockSetUser,
    setIsAuthenticated: mockSetIsAuthenticated,
  })
}))

describe('AuthModal', () => {
  it('renders login form by default', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} />)
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('switches to signup form when clicking signup link', async () => {
    render(<AuthModal isOpen={true} onClose={() => {}} />)
    
    fireEvent.click(screen.getByText('Sign up'))
    
    await waitFor(() => {
      expect(screen.getByText('Create Account')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {
    render(<AuthModal isOpen={true} onClose={() => {}} />)
    
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('handles demo login', async () => {
    render(<AuthModal isOpen={true} onClose={() => {}} />)
    
    fireEvent.click(screen.getByText('Demo Login'))
    
    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalled()
      expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true)
    })
  })
})