import { Link } from "@remix-run/react";
import { useState } from "react";

export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  
  const openLoginModal = () => {
    setShowLoginModal(true);
    setShowSignupModal(false);
  };
  
  const openSignupModal = () => {
    setShowSignupModal(true);
    setShowLoginModal(false);
  };
  
  const closeModals = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
  };

  return (
    <>
      <nav className="fixed h-screen w-64 bg-black text-white p-6 flex flex-col overflow-y-auto">
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold mb-8 text-white">[Insert Logo]</h1>
          
          <button
            className="w-full bg-olive hover:bg-olive-light text-white font-bold py-2 px-4 rounded transition-colors mb-6"
            onClick={openLoginModal}
          >
            Login
          </button>
          
          <div className="space-y-4">
            <Link to="/sports" className="block hover:text-olive-light transition-colors">
              Home
            </Link>
            <Link to="/favorites" className="block hover:text-olive-light transition-colors">
              Followed Events
            </Link>
          </div>
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
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="loginEmail"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-olive focus:border-olive"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-olive focus:border-olive"
                  placeholder="Enter your password"
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-olive hover:bg-olive-light text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Login
                </button>
              </div>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={openSignupModal}
                  className="text-olive hover:text-olive-light font-medium"
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
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-olive focus:border-olive"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-olive focus:border-olive"
                  placeholder="Create a password"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-olive focus:border-olive"
                  placeholder="Confirm your password"
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-olive hover:bg-olive-light text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={openLoginModal}
                  className="text-olive hover:text-olive-light font-medium"
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