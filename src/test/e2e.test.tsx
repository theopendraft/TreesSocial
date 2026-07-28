import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

// Mock fetch for API calls
global.fetch = vi.fn()

const mockFetch = vi.mocked(fetch)

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('End-to-End Authentication Flow', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
  })

  it('completes full signup flow', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: '1', email: 'test@example.com', username: 'testuser' },
        token: 'mock-token'
      })
    } as Response)

    renderWithRouter(<App />)
    
    // Open auth modal
    const loginButton = screen.getByText('Login')
    fireEvent.click(loginButton)
    
    // Switch to signup
    fireEvent.click(screen.getByText('Sign up'))
    
    // Fill signup form
    fireEvent.change(screen.getByPlaceholderText('Full Name'), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    })
    
    // Submit signup
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', expect.any(Object))
    })
  })

  it('completes demo login flow', async () => {
    renderWithRouter(<App />)
    
    // Open auth modal
    const loginButton = screen.getByText('Login')
    fireEvent.click(loginButton)
    
    // Click demo login
    fireEvent.click(screen.getByText('Demo Login'))
    
    await waitFor(() => {
      expect(screen.getByText('Feed')).toBeInTheDocument()
    })
  })

  it('handles login validation errors', async () => {
    renderWithRouter(<App />)
    
    // Open auth modal
    const loginButton = screen.getByText('Login')
    fireEvent.click(loginButton)
    
    // Try to submit empty form
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })
})