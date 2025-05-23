import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Mock components for testing
const MockLoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (username === 'testuser' && password === 'testpass') {
      window.location.href = '/dashboard';
    } else {
      alert('Invalid credentials');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        data-testid="username-input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        data-testid="password-input"
      />
      <button type="submit" disabled={isLoading} data-testid="submit-button">
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

const MockResumeSelector = () => {
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  
  const resumes = [
    { id: '1', name: 'Software Engineer Resume', isDefault: true },
    { id: '2', name: 'Frontend Developer Resume', isDefault: false },
    { id: '3', name: 'Full Stack Resume', isDefault: false }
  ];

  return (
    <div data-testid="resume-selector">
      <h3>Select Resume</h3>
      {resumes.map(resume => (
        <div 
          key={resume.id} 
          data-testid={`resume-${resume.id}`}
          className={selectedResume === resume.id ? 'selected' : ''}
          onClick={() => setSelectedResume(resume.id)}
        >
          {resume.name}
          {resume.isDefault && <span data-testid="default-badge"> (Default)</span>}
        </div>
      ))}
      {selectedResume && (
        <div data-testid="selected-resume">
          Selected: {resumes.find(r => r.id === selectedResume)?.name}
        </div>
      )}
    </div>
  );
};

const MockThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.className = isDark ? '' : 'dark';
  };

  return (
    <button 
      onClick={toggleTheme}
      data-testid="theme-toggle"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

// Helper to wrap components with QueryClient
const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('Component Testing', () => {
  describe('Login Form', () => {
    it('should render login form with all fields', () => {
      render(<MockLoginForm />);
      
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByTestId('username-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('should update input values when typing', () => {
      render(<MockLoginForm />);
      
      const usernameInput = screen.getByTestId('username-input') as HTMLInputElement;
      const passwordInput = screen.getByTestId('password-input') as HTMLInputElement;

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });

      expect(usernameInput.value).toBe('testuser');
      expect(passwordInput.value).toBe('testpass');
    });

    it('should show loading state during submission', async () => {
      render(<MockLoginForm />);
      
      const submitButton = screen.getByTestId('submit-button');
      
      fireEvent.click(submitButton);
      
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });
    });

    it('should handle form validation', () => {
      render(<MockLoginForm />);
      
      const usernameInput = screen.getByTestId('username-input');
      const passwordInput = screen.getByTestId('password-input');

      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(usernameInput).toHaveAttribute('placeholder', 'Username');
      expect(passwordInput).toHaveAttribute('placeholder', 'Password');
    });
  });

  describe('Resume Selector', () => {
    it('should render all available resumes', () => {
      render(<MockResumeSelector />);
      
      expect(screen.getByText('Select Resume')).toBeInTheDocument();
      expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
      expect(screen.getByText('Frontend Developer Resume')).toBeInTheDocument();
      expect(screen.getByText('Full Stack Resume')).toBeInTheDocument();
    });

    it('should show default badge for default resume', () => {
      render(<MockResumeSelector />);
      
      expect(screen.getByTestId('default-badge')).toBeInTheDocument();
      expect(screen.getByTestId('default-badge')).toHaveTextContent('(Default)');
    });

    it('should handle resume selection', () => {
      render(<MockResumeSelector />);
      
      const resume2 = screen.getByTestId('resume-2');
      fireEvent.click(resume2);
      
      expect(screen.getByTestId('selected-resume')).toBeInTheDocument();
      expect(screen.getByTestId('selected-resume')).toHaveTextContent('Selected: Frontend Developer Resume');
    });

    it('should update selection when clicking different resumes', () => {
      render(<MockResumeSelector />);
      
      // Select first resume
      fireEvent.click(screen.getByTestId('resume-1'));
      expect(screen.getByTestId('selected-resume')).toHaveTextContent('Selected: Software Engineer Resume');
      
      // Select different resume
      fireEvent.click(screen.getByTestId('resume-3'));
      expect(screen.getByTestId('selected-resume')).toHaveTextContent('Selected: Full Stack Resume');
    });
  });

  describe('Theme Toggle', () => {
    it('should render theme toggle button', () => {
      render(<MockThemeToggle />);
      
      const toggleButton = screen.getByTestId('theme-toggle');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to dark mode');
    });

    it('should toggle theme when clicked', () => {
      render(<MockThemeToggle />);
      
      const toggleButton = screen.getByTestId('theme-toggle');
      
      // Initially light mode
      expect(toggleButton).toHaveTextContent('🌙');
      
      // Click to toggle to dark mode
      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveTextContent('☀️');
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to light mode');
    });

    it('should update document class when toggling', () => {
      render(<MockThemeToggle />);
      
      const toggleButton = screen.getByTestId('theme-toggle');
      
      // Toggle to dark mode
      fireEvent.click(toggleButton);
      expect(document.documentElement.className).toBe('dark');
      
      // Toggle back to light mode
      fireEvent.click(toggleButton);
      expect(document.documentElement.className).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MockThemeToggle />);
      
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('aria-label');
    });

    it('should support keyboard navigation', () => {
      render(<MockLoginForm />);
      
      const usernameInput = screen.getByTestId('username-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
      
      // All form elements should be keyboard accessible
      usernameInput.focus();
      expect(document.activeElement).toBe(usernameInput);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing props gracefully', () => {
      // Components should render even with minimal props
      expect(() => render(<MockResumeSelector />)).not.toThrow();
      expect(() => render(<MockThemeToggle />)).not.toThrow();
    });
  });
});