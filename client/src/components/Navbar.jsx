import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Navbar() {
    const { user, logout } = useAuth();
    // Ensure user object has latest status (might need a refresh mechanism or check context)
    const navigate = useNavigate();
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

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
                        {/* USER ONLY LINKS */}
                        {user.role === 'user' && (
                            <>
                                <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                    Dashboard
                                </Link>
                                <Link to="/apply-leave" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                    Apply Leave
                                </Link>
                            </>
                        )}

                        {/* ADMIN ONLY LINKS */}
                        {user.role === 'admin' && (
                            <Link to="/admin" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                Admin Panel
                            </Link>
                        )}
                        <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/20">
                            {user.role === 'user' && user.adminRequestStatus === 'none' && (
                                <button
                                    onClick={async () => {
                                        const reason = window.prompt('Why do you want to become an admin?');
                                        if (reason !== null) { // If not cancelled
                                            try {
                                                await axios.post('users/request-admin', { reason });
                                                alert('Admin access requested successfully');
                                                window.location.reload();
                                            } catch (error) {
                                                alert(error.response?.data?.message || 'Failed to request access');
                                            }
                                        }
                                    }}
                                    className="text-xs font-bold uppercase py-2 px-5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full transition-all hover:opacity-90 active:scale-[0.95]"
                                >
                                    Request Admin
                                </button>
                            )}
                            {user.role === 'user' && user.adminRequestStatus === 'pending' && (
                                <span className="text-xs font-bold uppercase py-2 px-5 bg-yellow-500/20 text-yellow-500 rounded-full border border-yellow-500/50">
                                    Admin Pending
                                </span>
                            )}
                            {user.role === 'user' && user.adminRequestStatus === 'rejected' && (
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-bold uppercase py-2 px-5 bg-red-500/20 text-red-500 rounded-full border border-red-500/50" title="Your request was rejected">
                                        Admin Rejected
                                    </span>
                                    {user.adminRequestDate && (
                                        <span className="text-[10px] text-gray-500 mt-1">
                                            Next apply: {new Date(new Date(user.adminRequestDate).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            )}

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
        </nav>
    );
}

export default Navbar;