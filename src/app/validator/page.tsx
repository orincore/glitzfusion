'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Scan, CheckCircle, XCircle, AlertCircle, Users, Calendar, Clock, Mail, LogOut, Zap } from 'lucide-react';

interface ValidationResult {
  success: boolean;
  message: string;
  validation?: {
    bookingCode: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    memberCount: number;
    members: Array<{
      name: string;
      email: string;
      phone: string;
    }>;
    validatedAt: string;
    validatedBy: string;
  };
  error?: string;
  bookingInfo?: any;
  usageInfo?: any;
}

export default function ValidatorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('admin_token', data.token);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('Network error. Please try again.');
    }
  };

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCode.trim()) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/validator/validate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingCode: bookingCode.trim().toUpperCase() }),
      });

      const data = await response.json();
      setValidationResult(data);
      
      if (data.success) {
        setBookingCode(''); // Clear the input on success
      }
    } catch (error) {
      setValidationResult({
        success: false,
        message: 'Network error occurred',
        error: 'Unable to validate code. Please check your connection.'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setValidationResult(null);
    setBookingCode('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
        </div>
        
        {/* Loading spinner with neon glow */}
        <div className="relative z-10 flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-transparent border-t-green-400 shadow-[0_0_30px_rgba(0,255,0,0.5)]"></div>
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-transparent border-b-green-400 shadow-[0_0_30px_rgba(0,255,0,0.5)] absolute top-0 left-0 animate-reverse"></div>
          </div>
          <div className="text-green-400 font-mono text-lg animate-pulse">
            <span className="inline-block animate-bounce">I</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '0.1s'}}>N</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '0.2s'}}>I</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '0.3s'}}>T</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '0.4s'}}>I</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '0.5s'}}>A</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '0.6s'}}>L</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '0.7s'}}>I</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '0.8s'}}>Z</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '0.9s'}}>I</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '1.0s'}}>N</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '1.1s'}}>G</span>
            <span className="ml-2 text-green-300">...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-green-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-md w-full relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-black border-2 border-green-400 rounded-full mb-4 shadow-[0_0_30px_rgba(0,255,0,0.3)]">
              <Shield className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-green-400 font-mono mb-2 tracking-wider">
              VALIDATOR
            </h1>
            <p className="text-green-300/70 text-sm font-mono">
              SECURE ACCESS REQUIRED
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-black/80 backdrop-blur-sm rounded-2xl border border-green-400/30 p-8 shadow-[0_0_50px_rgba(0,255,0,0.1)]">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-green-400 mb-3 font-mono tracking-wide">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  id="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-black/50 border border-green-400/50 rounded-lg text-green-100 placeholder-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300 font-mono shadow-[inset_0_0_10px_rgba(0,255,0,0.1)]"
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-green-400 mb-3 font-mono tracking-wide">
                  PASSWORD
                </label>
                <input
                  type="password"
                  id="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-black/50 border border-green-400/50 rounded-lg text-green-100 placeholder-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300 font-mono shadow-[inset_0_0_10px_rgba(0,255,0,0.1)]"
                  placeholder="••••••••"
                  required
                />
              </div>

              {loginError && (
                <div className="bg-red-500/10 border border-red-400/50 rounded-lg p-4 shadow-[0_0_20px_rgba(255,0,0,0.1)]">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <p className="text-sm text-red-300 font-mono">{loginError}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-green-400 hover:bg-green-300 text-black font-bold py-4 px-6 rounded-lg transition-all duration-300 font-mono tracking-wider text-lg shadow-[0_0_30px_rgba(0,255,0,0.3)] hover:shadow-[0_0_40px_rgba(0,255,0,0.5)] transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="flex items-center justify-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>ACCESS SYSTEM</span>
                </span>
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-green-400/50 text-xs font-mono">
              GLITZFUSION SECURITY PROTOCOL v2.0
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-black border-2 border-green-400 rounded-full mb-4 sm:mb-6 shadow-[0_0_30px_rgba(0,255,0,0.3)]">
              <Scan className="w-8 h-8 sm:w-10 sm:h-10 text-green-400 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-400 font-mono mb-2 tracking-wider">
              CODE VALIDATOR
            </h1>
            <p className="text-green-300/70 text-sm sm:text-base font-mono">
              SECURE EVENT ACCESS VERIFICATION
            </p>
            
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-red-500/20 border border-red-400/50 rounded-lg text-red-300 hover:bg-red-500/30 transition-all duration-300 font-mono text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>LOGOUT</span>
            </button>
          </div>

          {/* Validation Form */}
          <div className="bg-black/80 backdrop-blur-sm rounded-2xl border border-green-400/30 p-6 sm:p-8 mb-6 sm:mb-8 shadow-[0_0_50px_rgba(0,255,0,0.1)]">
            <form onSubmit={handleValidateCode} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-green-400 mb-3 font-mono tracking-wide">
                  BOOKING CODE
                </label>
                <input
                  type="text"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE (e.g., ABC123)"
                  className="w-full px-4 py-4 bg-black/50 border border-green-400/50 rounded-lg text-green-100 placeholder-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300 font-mono text-lg sm:text-xl tracking-wider shadow-[inset_0_0_10px_rgba(0,255,0,0.1)] uppercase"
                  disabled={isValidating}
                  maxLength={10}
                />
              </div>
              <div className="sm:flex-shrink-0 sm:self-end">
                <button
                  type="submit"
                  disabled={isValidating || !bookingCode.trim()}
                  className="w-full sm:w-auto bg-green-400 hover:bg-green-300 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold px-6 sm:px-8 py-4 rounded-lg transition-all duration-300 font-mono tracking-wider text-lg shadow-[0_0_30px_rgba(0,255,0,0.3)] hover:shadow-[0_0_40px_rgba(0,255,0,0.5)] transform hover:scale-[1.02] active:scale-[0.98] disabled:shadow-none disabled:transform-none"
                >
                  {isValidating ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/20 border-t-black"></div>
                      <span>SCANNING...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>VALIDATE</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div className="bg-black/80 backdrop-blur-sm rounded-2xl border border-green-400/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,255,0,0.1)]">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  {validationResult.success ? (
                    <div className="flex items-center justify-center w-12 h-12 bg-green-400/20 border-2 border-green-400 rounded-full shadow-[0_0_20px_rgba(0,255,0,0.3)]">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-12 h-12 bg-red-400/20 border-2 border-red-400 rounded-full shadow-[0_0_20px_rgba(255,0,0,0.3)]">
                      <XCircle className="h-6 w-6 text-red-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-green-400 font-mono tracking-wide">
                      {validationResult.success ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                    </h3>
                    <p className="text-green-300/70 text-sm font-mono">
                      {validationResult.success ? 'CODE VALIDATION SUCCESSFUL' : 'VALIDATION FAILED'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4 mb-6">
                <p className="text-green-100 font-mono text-sm sm:text-base">{validationResult.message}</p>
              </div>

              {validationResult.success && validationResult.validation && (
                <div className="space-y-6">
                  {/* Event Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-black/50 border border-green-400/30 rounded-lg p-4 shadow-[inset_0_0_10px_rgba(0,255,0,0.1)]">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-5 w-5 text-green-400" />
                        <span className="text-green-400 font-mono text-xs tracking-wide">EVENT</span>
                      </div>
                      <p className="text-green-100 font-medium text-sm sm:text-base break-words">{validationResult.validation.eventTitle}</p>
                    </div>
                    
                    <div className="bg-black/50 border border-green-400/30 rounded-lg p-4 shadow-[inset_0_0_10px_rgba(0,255,0,0.1)]">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="h-5 w-5 text-green-400" />
                        <span className="text-green-400 font-mono text-xs tracking-wide">SCHEDULE</span>
                      </div>
                      <p className="text-green-100 font-medium text-sm">
                        {new Date(validationResult.validation.eventDate).toLocaleDateString()}
                      </p>
                      <p className="text-green-300/70 text-xs font-mono">{validationResult.validation.eventTime}</p>
                    </div>
                    
                    <div className="bg-black/50 border border-green-400/30 rounded-lg p-4 shadow-[inset_0_0_10px_rgba(0,255,0,0.1)]">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="h-5 w-5 text-green-400" />
                        <span className="text-green-400 font-mono text-xs tracking-wide">ATTENDEES</span>
                      </div>
                      <p className="text-green-100 font-medium text-lg">{validationResult.validation.memberCount}</p>
                      <p className="text-green-300/70 text-xs font-mono">REGISTERED</p>
                    </div>
                    
                    <div className="bg-black/50 border border-green-400/30 rounded-lg p-4 shadow-[inset_0_0_10px_rgba(0,255,0,0.1)]">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-5 w-5 text-green-400" />
                        <span className="text-green-400 font-mono text-xs tracking-wide">CODE</span>
                      </div>
                      <p className="text-green-100 font-bold font-mono text-lg tracking-wider">{validationResult.validation.bookingCode}</p>
                      <p className="text-green-300/70 text-xs font-mono">VERIFIED</p>
                    </div>
                  </div>

                  {/* Attendee Details */}
                  <div className="border-t border-green-400/30 pt-6">
                    <h4 className="text-green-400 font-mono font-bold mb-4 flex items-center gap-2 text-lg">
                      <Mail className="h-5 w-5" />
                      ATTENDEE MANIFEST
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {validationResult.validation.members.map((member, index) => (
                        <div key={index} className="bg-black/50 border border-green-400/20 rounded-lg p-4 shadow-[inset_0_0_10px_rgba(0,255,0,0.05)]">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-green-400/20 border border-green-400 rounded-full flex items-center justify-center">
                              <span className="text-green-400 font-mono text-sm font-bold">{index + 1}</span>
                            </div>
                            <p className="text-green-100 font-medium text-base">{member.name}</p>
                          </div>
                          <div className="ml-11 space-y-1">
                            <p className="text-green-300/70 text-sm font-mono">{member.email}</p>
                            <p className="text-green-300/70 text-sm font-mono">{member.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Success Message */}
                  <div className="text-center bg-green-400/10 border border-green-400/30 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-2 text-green-300">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-mono text-sm tracking-wide">WELCOME NOTIFICATIONS DISPATCHED</span>
                    </div>
                  </div>
                </div>
              )}

              {!validationResult.success && (validationResult.bookingInfo || validationResult.usageInfo) && (
                <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 sm:p-6">
                  {validationResult.bookingInfo && (
                    <div className="mb-4">
                      <h4 className="text-red-400 font-mono font-bold mb-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        BOOKING DATA
                      </h4>
                      <div className="space-y-2 ml-7">
                        <p className="text-red-300 font-mono text-sm">
                          <span className="text-red-400">EVENT:</span> {validationResult.bookingInfo.eventTitle}
                        </p>
                        <p className="text-red-300 font-mono text-sm">
                          <span className="text-red-400">STATUS:</span> {validationResult.bookingInfo.paymentStatus}
                        </p>
                        <p className="text-red-300 font-mono text-sm">
                          <span className="text-red-400">CREATED:</span> {new Date(validationResult.bookingInfo.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {validationResult.usageInfo && (
                    <div>
                      <h4 className="text-red-400 font-mono font-bold mb-3 flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        PREVIOUS USAGE
                      </h4>
                      <div className="space-y-2 ml-7">
                        <p className="text-red-300 font-mono text-sm">
                          <span className="text-red-400">EVENT:</span> {validationResult.usageInfo.eventTitle}
                        </p>
                        <p className="text-red-300 font-mono text-sm">
                          <span className="text-red-400">VALIDATED:</span> {new Date(validationResult.usageInfo.validatedAt).toLocaleString()}
                        </p>
                        <p className="text-red-300 font-mono text-sm">
                          <span className="text-red-400">VALIDATOR:</span> {validationResult.usageInfo.validatedBy}
                        </p>
                        <p className="text-red-300 font-mono text-sm">
                          <span className="text-red-400">MEMBER:</span> {validationResult.usageInfo.memberName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
