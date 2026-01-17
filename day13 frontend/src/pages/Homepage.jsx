/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authslice';

// Theme Management Helper
const useTheme = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};

// Helper function to safely get the difficulty badge color
const getDifficultyBadgeColor = (difficulty) => {
  const diff = difficulty ? String(difficulty).toLowerCase() : '';
  switch (diff) {
    case 'easy': return 'badge-success text-success';
    case 'medium': return 'badge-warning text-warning';
    case 'hard': return 'badge-error text-error';
    default: return 'badge-neutral';
  }
};

const Navbar = ({ user, handleLogout, theme, toggleTheme }) => {
  return (
    <div className={`navbar sticky top-0 z-50 px-4 lg:px-12 py-3 border-b border-base-content/5 transition-all duration-300 ${!user ? 'bg-base-100/80 backdrop-blur-md supports-[backdrop-filter]:bg-base-100/60' : 'bg-base-100'}`}>
      <div className="flex-1">
        <NavLink to="/" className="text-xl md:text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2 group">
          <span className="text-primary font-black text-2xl group-hover:rotate-12 transition-transform">/</span>
          <span className="text-base-content relative">
            CodeHuntX
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </span>
        </NavLink>
      </div>
      <div className="flex-none gap-2 md:gap-4 flex items-center">
        {/* Theme Toggle */}
        <label className="swap swap-rotate btn btn-ghost btn-circle btn-sm hover:bg-base-content/10">
          <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
          {/* sun icon */}
          <svg className="swap-on fill-current w-5 h-5 text-warning" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" /></svg>
          {/* moon icon */}
          <svg className="swap-off fill-current w-5 h-5 text-base-content" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" /></svg>
        </label>

        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar online placeholder">
              <div className="bg-neutral-focus text-neutral-content rounded-full w-9 ring-1 ring-base-content/10">
                <span className="text-sm font-bold uppercase">{user?.firstName?.[0]}</span>
              </div>
            </div>
            <ul className="mt-4 p-2 shadow-lg border border-base-content/10 menu menu-sm dropdown-content bg-base-100 rounded-box w-56 z-50">
              <div className="px-4 py-3 border-b border-base-content/10 mb-2">
                <p className="font-bold text-base">{user?.firstName}</p>
                <p className="text-xs text-base-content/60 truncate">{user?.email}</p>
              </div>
              {user?.role === 'admin' && <li><NavLink to="/admin" className="py-2">Admin Panel</NavLink></li>}
              <li><button onClick={handleLogout} className="text-error font-medium hover:bg-error/10 py-2 mt-1">Logout</button></li>
            </ul>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-ghost btn-sm font-medium hover:bg-base-content/5">Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm rounded-full px-5 font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 border-none">Sign up</Link>
          </div>
        )}
      </div>
    </div>
  );
};

const LandingPage = () => {
  return (
    <div className="flex flex-col w-full font-sans">
      {/* Hero Section - Clean & Simplistic */}
      <div className="min-h-[75vh] flex flex-col justify-center items-center px-6 relative bg-base-100 overflow-hidden pt-20">

        {/* Subtle refined grid */}
        <div className="absolute inset-x-0 top-0 h-full w-full opacity-[0.02] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
        </div>

        <div className="max-w-4xl w-full mx-auto text-center space-y-8 z-10 animate-fade-in relative">
          {/* Decorative blur behind text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none opacity-50"></div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-base-content leading-none mb-2">
            Master code. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Build future.</span>
          </h1>

          <p className="text-xl text-base-content/60 max-w-xl mx-auto font-medium leading-relaxed">
            The minimalist platform for serious developers.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
            <Link to="/signup" className="btn btn-primary btn-lg rounded-full px-12 h-14 min-h-[3.5rem] text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 border-none">
              Start Coding
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg rounded-full px-12 h-14 min-h-[3.5rem] text-lg font-medium border border-base-content/10 hover:bg-base-content/5 transition-all duration-300">
              Problem List
            </Link>
          </div>
        </div>
      </div>

      {/* Code Demo Section - Tighter integration */}
      <div className="w-full pb-24 px-6 -mt-10 relative z-20">
        <div className="max-w-5xl mx-auto">
          <div className="w-full rounded-xl shadow-2xl border border-base-content/10 overflow-hidden bg-[#1e1e1e] ring-1 ring-white/10">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#252526] border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
              <div className="ml-4 text-xs text-gray-400 font-mono opacity-60">two_sum.py</div>
            </div>
            <div className="p-6 md:p-8 overflow-x-auto bg-[#1e1e1e]">
              <pre className="font-mono text-sm md:text-base leading-relaxed text-gray-300">
                <code><span className="text-[#c586c0]">class</span> <span className="text-[#4ec9b0]">Solution</span>:
                  <span className="text-[#c586c0]">def</span> <span className="text-[#dcdcaa]">twoSum</span>(self, nums: List[<span className="text-[#4ec9b0]">int</span>], target: <span className="text-[#4ec9b0]">int</span>) -&gt; List[<span className="text-[#4ec9b0]">int</span>]:
                  seen = { }
                  <span className="text-[#c586c0]">for</span> i, num <span className="text-[#c586c0]">in</span> <span className="text-[#dcdcaa]">enumerate</span>(nums):
                  complement = target - num
                  <span className="text-[#c586c0]">if</span> complement <span className="text-[#c586c0]">in</span> seen:
                  <span className="text-[#c586c0]">return</span> [seen[complement], i]
                  seen[num] = i
                  <span className="text-[#c586c0]">return</span> []</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Features Minimal Grid - Retained for structure but simplified */}
      <div className="py-20 px-6 bg-base-100 border-t border-base-content/5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Curated Lists", desc: "Top interview questions.", icon: "🎯" },
            { title: "Analytics", desc: "Visualize your growth.", icon: "📊" },
            { title: "Community", desc: "Learn from the best.", icon: "⚡" }
          ].map((f, i) => (
            <div key={i} className="group p-6 rounded-2xl border border-base-content/5 hover:border-base-content/20 transition-all hover:bg-base-200/20 text-center md:text-left">
              <div className="text-3xl mb-4 bg-base-200/50 w-12 h-12 rounded-xl flex items-center justify-center inline-flex md:flex group-hover:scale-105 transition-transform">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2 text-base-content">{f.title}</h3>
              <p className="text-base-content/60 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-base-content/5 bg-base-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-base opacity-80">
            CodeHuntX
          </div>
          <div className="text-xs text-base-content/40 font-medium">
            © {new Date().getFullYear()} CodeHuntX
          </div>
        </div>
      </footer>
    </div>
  );
}

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all'
  });

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
    window.location.reload();
  };

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.Difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    let problemIsSolved = solvedProblems.some(sp => sp._id === problem._id);
    const statusMatch = filters.status === 'all' ||
      (filters.status === 'solved' && problemIsSolved);
    return difficultyMatch && tagMatch && statusMatch;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-base-100 text-base-content font-sans transition-colors duration-300">
        <Navbar user={user} theme={theme} toggleTheme={toggleTheme} />
        <LandingPage />
      </div>
    );
  }

  // Dashboard View for Logged In User
  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans transition-colors duration-300">
      <Navbar user={user} handleLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />

      <div className="container mx-auto p-4 max-w-6xl mt-8">
        {/* Simplified Dashboard Welcome */}
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-2xl font-semibold">Hello, {user?.firstName}</h1>
          <p className="text-base-content/60">Let's solve some problems.</p>
        </div>

        {/* Dashboard Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main Column: Problem List */}
          <div className="flex-1">
            {/* Filter Toolbar - Clean Horizontal Scroll */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <button
                className={`btn btn-sm rounded-full ${filters.difficulty === 'all' ? 'btn-neutral' : 'btn-ghost'}`}
                onClick={() => setFilters({ ...filters, difficulty: 'all' })}
              >All</button>
              <button
                className={`btn btn-sm rounded-full ${filters.difficulty === 'easy' ? 'btn-success btn-outline' : 'btn-ghost'}`}
                onClick={() => setFilters({ ...filters, difficulty: 'easy' })}
              >Easy</button>
              <button
                className={`btn btn-sm rounded-full ${filters.difficulty === 'medium' ? 'btn-warning btn-outline' : 'btn-ghost'}`}
                onClick={() => setFilters({ ...filters, difficulty: 'medium' })}
              >Medium</button>
              <button
                className={`btn btn-sm rounded-full ${filters.difficulty === 'hard' ? 'btn-error btn-outline' : 'btn-ghost'}`}
                onClick={() => setFilters({ ...filters, difficulty: 'hard' })}
              >Hard</button>

              <div className="w-px h-6 bg-base-content/10 mx-2"></div>

              <select
                className="select select-sm select-ghost w-auto max-w-xs focus:bg-base-200"
                value={filters.tag}
                onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
              >
                <option value="all">Topics</option>
                <option value="array">Array</option>
                <option value="linkedList">Linked List</option>
                <option value="graph">Graph</option>
                <option value="dp">DP</option>
              </select>

              <select
                className="select select-sm select-ghost w-auto max-w-xs focus:bg-base-200"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">Any Status</option>
                <option value="solved">Solved</option>
              </select>
            </div>

            {/* Minimal List */}
            <div className="flex flex-col gap-2">
              {filteredProblems.map(problem => {
                const isSolved = solvedProblems.some(sp => sp._id === problem._id);
                return (
                  <div key={problem._id} className="group flex items-center justify-between p-4 bg-base-100 border border-base-content/5 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSolved ? 'bg-success/10 text-success' : 'bg-base-200 text-base-content/30'}`}>
                        {isSolved ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-current"></div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <NavLink to={`/problem/${problem._id}`} className="font-medium truncate hover:text-primary transition-colors">
                          {problem.title}
                        </NavLink>
                        <div className="flex items-center gap-2 text-xs text-base-content/50 mt-0.5">
                          <span className="capitalize">{problem.tags}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded bg-opacity-10 ${getDifficultyBadgeColor(problem.Difficulty).replace('badge-', 'bg-')}`}>
                        {problem.Difficulty}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <NavLink to={`/problem/${problem._id}`} className="btn btn-xs btn-ghost btn-circle">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </NavLink>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {filteredProblems.length === 0 && (
              <div className="py-20 text-center text-base-content/40">
                <div className="text-4xl mb-2">🔍</div>
                <p>No problems found</p>
              </div>
            )}
          </div>

          {/* Sidebar Stats */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="card bg-base-100 border border-base-content/5 p-6 h-fit">
              <h3 className="font-bold text-lg mb-4">Progress</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="radial-progress text-primary" style={{ "--value": Math.min((solvedProblems.length / Math.max(problems.length, 1)) * 100, 100), "--size": "4rem" }} role="progressbar">
                  {Math.round((solvedProblems.length / Math.max(problems.length, 1)) * 100)}%
                </div>
                <div>
                  <div className="text-2xl font-bold">{solvedProblems.length} <span className="text-sm font-normal text-base-content/50">/ {problems.length}</span></div>
                  <div className="text-xs text-base-content/50 uppercase tracking-wide">Problems Solved</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Homepage;