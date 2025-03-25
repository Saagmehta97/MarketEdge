import { Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { API_CONFIG } from "../routes/utils/loaders";
export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  
  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Error and loading states
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);
  
  const openLoginModal = () => {
    setLoginError("");
    setShowLoginModal(true);
    setShowSignupModal(false);
  };
  
  const openSignupModal = () => {
    setSignupError("");
    setShowSignupModal(true);
    setShowLoginModal(false);
  };
  
  const closeModals = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
    setLoginError("");
    setSignupError("");
    setSuccessMessage("");
    // Reset form fields
    setLoginEmail("");
    setLoginPassword("");
    setSignupEmail("");
    setSignupPassword("");
    setConfirmPassword("");
  };

  const handleLogout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('access_token');
      
      // Clear cookies
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Update state
      setIsLoggedIn(false);
      
      // Optional: Call logout endpoint on the server if you need to invalidate tokens server-side
      try {
        await fetch(`${API_CONFIG.baseUrl}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
      } catch (error) {
        // Silent fail on server logout - user is already logged out client-side
        console.log("Server logout failed, but user was logged out client-side");
      }
      
      // Show success message
      setSuccessMessage("Logged out successfully! Refreshing...");
      
      // Force page refresh after a brief delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);
    
    // Basic validation
    if (!loginEmail || !loginPassword) {
      setLoginError("Please fill in all fields");
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsLoggedIn(true);
        setSuccessMessage("Login successful! Redirecting...");
        
        // Store authentication data
        localStorage.setItem('access_token', data.access_token);
        document.cookie = `access_token=${data.access_token}; path=/`;
        
        // Force page refresh after a brief delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setLoginError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      setLoginError("An error occurred during login. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignupError("");
    setIsLoading(true);
    
    // Basic validation
    if (!signupEmail || !signupPassword || !confirmPassword) {
      setSignupError("Please fill in all fields");
      setIsLoading(false);
      return;
    }
    
    if (signupPassword !== confirmPassword) {
      setSignupError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    
    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage("Account created successfully! Refreshing...");
        
        // Store authentication data
        localStorage.setItem('access_token', data.access_token);
        document.cookie = `access_token=${data.access_token}; path=/`;
        
        // Set login state
        setIsLoggedIn(true);
        
        // Force page refresh after a brief delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setSignupError(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      setSignupError("An error occurred during registration. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <nav className="fixed h-screen w-64 bg-black text-white p-6 flex flex-col overflow-y-auto">
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold mb-8 text-white">MarketEdge</h1>
          
          {isLoggedIn ? (
            <>
              <button
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors mb-6"
                onClick={handleLogout}
              >
                Logout
              </button>
              
              <div className="space-y-4">
                <Link to="/sports" className="block hover:text-olive-light transition-colors">
                  Home
                </Link>
                <Link to="/favorites" className="block hover:text-olive-light transition-colors">
                  Followed Events
                </Link>
              </div>
            </>
          ) : (
            <button
              className="w-full bg-olive hover:bg-olive-light text-white font-bold py-2 px-4 rounded transition-colors mb-6"
              onClick={openLoginModal}
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Login</h2>
              <button 
                onClick={closeModals} 
                className="text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {successMessage && (
              <div className="mb-4 p-2 bg-green-100 text-green-800 rounded-md text-center">
                {successMessage}
              </div>
            )}
            
            {loginError && (
              <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-center">
                {loginError}
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="loginEmail"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-olive focus:border-olive"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-olive focus:border-olive"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-olive hover:bg-olive-light text-white font-bold py-2 px-4 rounded transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={openSignupModal}
                  className="text-olive hover:text-olive-light font-medium"
                  disabled={isLoading}
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Sign Up</h2>
              <button 
                onClick={closeModals} 
                className="text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {successMessage && (
              <div className="mb-4 p-2 bg-green-100 text-green-800 rounded-md text-center">
                {successMessage}
              </div>
            )}
            
            {signupError && (
              <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-center">
                {signupError}
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handleSignup}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-olive focus:border-olive"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-olive focus:border-olive"
                  placeholder="Create a password"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-olive focus:border-olive"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-olive hover:bg-olive-light text-white font-bold py-2 px-4 rounded transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </button>
              </div>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={openLoginModal}
                  className="text-olive hover:text-olive-light font-medium"
                  disabled={isLoading}
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 