import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Navbar() {
    const { user, logout } = useAuth();
    // Ensure user object has latest status (might need a refresh mechanism or check context)
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="w-full bg-black/80 text-white px-8 py-4 flex justify-between items-center border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
            <Link to="/" className="text-xl font-bold tracking-tight hover:text-gray-300 transition-colors">
                Leave System
            </Link>

            <div className="flex items-center gap-6">
                {user ? (
                    <>
                        <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                            Dashboard
                        </Link>
                        {user.role === 'admin' && (
                            <Link to="/admin" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                Admin Panel
                            </Link>
                        )}
                        {user.role === 'user' && (
                            <Link to="/apply-leave" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                Apply Leave
                            </Link>
                        )}

                        <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/20">
                            <div className="text-right">
                                <div className="text-sm font-semibold text-white">{user.name}</div>
                                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{user.role}</div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="text-xs font-bold uppercase py-2 px-5 bg-white text-black hover:bg-gray-200 rounded-full transition-all active:scale-[0.95]"
                            >
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <Link
                        to="/login"
                        className="text-xs font-bold uppercase py-2 px-6 bg-white text-black hover:bg-gray-200 rounded-full transition-all"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </nav >
    );
}

export default Navbar;