import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { auth, signInWithGoogle } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, UserPlus, ArrowRight, Chrome, RefreshCw } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isForgotPassword) {
        await sendPasswordResetEmail(auth, email);
        setMessage({ type: 'success', text: 'Password reset link sent to your email! Please check your inbox.' });
        setIsForgotPassword(false);
        return;
      }

      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage({ type: 'success', text: 'Account created successfully! Welcome to Sora Sushi.' });
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let errorMsg = error.message;
      const code = error.code || '';
      
      if (code === 'auth/email-already-in-use' || errorMsg.includes('email-already-in-use')) {
        errorMsg = "This email is already in use. Please try signing in instead.";
        // Suggest switching to sign in if they were trying to sign up
        if (isSignUp) {
          setMessage({ 
            type: 'error', 
            text: "An account already exists with this email. Would you like to sign in instead?" 
          });
          return;
        }
      } else if (code === 'auth/invalid-credential' || errorMsg.includes('invalid-credential')) {
        errorMsg = "Invalid email or password. Please check your credentials.";
      } else if (code === 'auth/weak-password' || errorMsg.includes('weak-password')) {
        errorMsg = "Password is too weak. It should be at least 6 characters.";
      } else if (code === 'auth/user-not-found' || errorMsg.includes('user-not-found')) {
        errorMsg = "No account found with this email. Would you like to create one?";
      } else if (code === 'auth/wrong-password' || errorMsg.includes('wrong-password')) {
        errorMsg = "Incorrect password. Please try again.";
      } else if (code === 'auth/operation-not-allowed') {
        errorMsg = "Email/Password login is not enabled. Please use Google Login.";
      } else if (code === 'auth/too-many-requests') {
        errorMsg = "Too many failed attempts. Please try again later or reset your password.";
      }
      
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || "Failed to sign in with Google" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-zinc-900/50 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif mb-4">
            {isForgotPassword ? 'Reset' : isSignUp ? 'Create' : 'Client'} <span className="text-emerald-500 italic">{isForgotPassword ? 'Password' : isSignUp ? 'Account' : 'Login'}</span>
          </h1>
          <p className="text-gray-400">
            {isForgotPassword ? 'Enter your email to receive a password reset link.' : isSignUp ? 'Join Sora Sushi for a seamless dining experience.' : 'Access your reservations and preferences.'}
          </p>
        </div>

        {!isForgotPassword && (
          <>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-4 mb-6 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              <Chrome size={20} />
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-500 text-xs uppercase tracking-widest px-2">or use email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-sans"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {!isForgotPassword && (
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setMessage(null);
                  }}
                  className="text-[10px] uppercase font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-sans"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {message && (
            <div className={`p-4 rounded-2xl text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-500 text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                {isForgotPassword ? <RefreshCw size={20} /> : isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
                <span>{isForgotPassword ? 'Reset Password' : isSignUp ? 'Sign Up' : 'Sign In'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setIsForgotPassword(false);
              setMessage(null);
            }}
            className="text-gray-400 hover:text-emerald-500 transition-colors text-sm flex items-center justify-center gap-2 mx-auto"
          >
            <span>{isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}</span>
            <ArrowRight size={14} />
          </button>

          {isForgotPassword && (
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setMessage(null);
              }}
              className="text-gray-500 hover:text-white transition-colors text-xs"
            >
              Back to Login
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

