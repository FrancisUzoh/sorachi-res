
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Calendar, Menu as MenuIcon, X, AlertCircle, Moon, Sun } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { useAtmosphere } from '../lib/atmosphere-context.tsx';

interface NavLink {
  name: string;
  path: string;
  isExternal?: boolean;
}

const Navbar = ({ user }: { user: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [wpLinks, setWpLinks] = useState<NavLink[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchWpMenu = async () => {
      const query = `
        query GetMenu {
          menuItems(first: 20) {
            nodes {
              id
              label
              url
              path
            }
          }
        }
      `;

      try {
        const response = await fetch('/api/wordpress-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`WordPress Proxy Error: status ${response.status}, text: ${errorText}`);
          return;
        }

        const json = await response.json();
          if (json.data?.menuItems?.nodes) {
            const links = json.data.menuItems.nodes.map((node: any) => {
              let path = node.path || node.url || '';
              
              // Remove domain if it's a full URL
              if (path.startsWith('http')) {
                try {
                  const url = new URL(path);
                  path = url.pathname + url.search + url.hash;
                } catch (e) {
                  // Fallback if URL is invalid
                }
              }

              // Ensure it starts with / and remove trailing /
              if (!path.startsWith('/')) path = '/' + path;
              if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);

              return {
                name: node.label,
                path: path,
                isExternal: node.url && !node.url.includes(window.location.hostname) && !node.url.startsWith('/') && !node.url.startsWith('#')
              };
            });
            
            // Filter out links that might be duplicates or empty
            const uniqueLinks = links.filter((link: NavLink, index: number, self: NavLink[]) => 
              link.name && self.findIndex(t => t.name === link.name) === index
            );

            if (uniqueLinks.length > 0) {
              setWpLinks(uniqueLinks);
            }
          }
      } catch (err) {
        console.error('Failed to fetch WordPress menu:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWpMenu();
  }, []);

  const defaultLinks = [
    { name: 'Menu', path: '/menu' },
    { name: 'Blog', path: '/blog' },
    { name: 'Premium', path: '/premium' },
    { name: 'About', path: '/about' },
    { name: 'Our Space', path: '/space' },
    { name: 'Hours', path: '/hours' },
  ];

  // Use WordPress links if available, otherwise fallback to defaults
  const baseLinks = wpLinks.length > 0 ? wpLinks : defaultLinks;

  const navLinks = [
    ...baseLinks,
    ...(user?.email === 'francasayo@gmail.com' ? [{ name: 'Admin', path: '/admin' }] : []),
    { name: user ? 'Dashboard' : 'Login', path: user ? '/dashboard' : '/login' },
  ];

  const { mood, toggleMood } = useAtmosphere();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 py-4 md:px-8 md:py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-3">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-emerald-500 fill-current drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" xmlns="http://www.w3.org/2000/svg">
              <path d="M23,12c0,0-4.5-5-11-5c-2.5,0-5,1.5-7,4c-1.5,2-2,5-2,5s3-1,5-1c2,0,4,1,6,1C20,16,23,12,23,12z M15,10c0.6,0,1,0.4,1,1s-0.4,1-1,1s-1-0.4-1-1S14.4,10,15,10z"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-serif tracking-[0.25em] uppercase text-white leading-none">Sora</span>
            <span className="text-[7px] font-sans tracking-[0.6em] uppercase text-emerald-500/80 font-bold mt-1.5">Contemporary Omakase</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            link.isExternal ? (
              <a
                key={link.path}
                href={link.path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-300 hover:text-emerald-400 transition-colors"
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-emerald-400 ${
                  location.pathname === link.path ? 'text-emerald-500' : 'text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            )
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={toggleMood}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 hover:bg-white/5 transition-all"
            title="Toggle Atmosphere"
          >
            {mood === 'zen' ? <Moon size={18} /> : <Sun size={18} className="text-yellow-400" />}
          </button>
          <NotificationCenter user={user} />
          <button className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
            <Phone size={16} />
            <span>Call</span>
          </button>
          <Link to="/reservation" className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black rounded-xl text-sm font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
            <Calendar size={16} />
            <span>Book a Table</span>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-4 right-4 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col gap-6 md:hidden shadow-2xl z-50"
          >
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-emerald-500 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23,12c0,0-4.5-5-11-5c-2.5,0-5,1.5-7,4c-1.5,2-2,5-2,5s3-1,5-1c2,0,4,1,6,1C20,16,23,12,23,12z M15,10c0.6,0,1,0.4,1,1s-0.4,1-1,1s-1-0.4-1-1S14.4,10,15,10z"/>
                  </svg>
                </div>
                <span className="text-xl font-serif tracking-[0.2em] uppercase">Sora</span>
              </div>
              <button 
                onClick={toggleMood}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10"
              >
                {mood === 'zen' ? <Moon size={18} /> : <Sun size={18} className="text-yellow-400" />}
              </button>
            </div>
            {navLinks.map((link) => (
              link.isExternal ? (
                <a
                  key={link.path}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="text-2xl font-serif"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-2xl font-serif"
                >
                  {link.name}
                </Link>
              )
            ))}
            <hr className="border-white/10" />
            <div className="flex flex-col gap-3">
              <button className="flex items-center justify-center gap-2 w-full py-4 border border-white/20 rounded-2xl text-lg">
                <Phone /> Call
              </button>
              <Link
                to="/reservation"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 text-black rounded-2xl text-lg font-bold"
              >
                <Calendar /> Book a Table
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
