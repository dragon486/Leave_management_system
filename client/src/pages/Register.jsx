import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        department: '',
        role: 'user'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="bg-[#0f0f0f] p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/5">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                        <p className="text-gray-400">Join the Leave Management System</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm mb-6 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-1.5 ml-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-sans"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-1.5 ml-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-sans"
                                placeholder="john@company.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-1.5 ml-1">Department</label>
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-sans"
                                placeholder="Engineering"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-1.5 ml-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-sans"
                                placeholder="••••••••"
                                required
                                minLength="6"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-1.5 ml-1">Account Type</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-sans"
                            >
                                <option value="user">Employee</option>
                                <option value="admin">Manager / Admin</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-all transform active:scale-[0.98] mt-4 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 mt-8 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-white hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
