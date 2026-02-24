import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const useAuth = () => useContext(AuthContext);

export { useAuth };

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Set axios default base URL (Self-healing logic for production)
    let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // If the URL exists but doesn't have /api, add it automatically
    if (apiUrl && !apiUrl.toLowerCase().includes('/api')) {
        apiUrl = apiUrl.endsWith('/') ? `${apiUrl}api/` : `${apiUrl}/api/`;
    } else {
        // Ensure it ends with a slash so relative paths like 'auth/login' work
        apiUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
    }

    axios.defaults.baseURL = apiUrl;
    console.log("System Status: API connected to", apiUrl);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUserProfile = async () => {
        try {
            const { data } = await axios.get('auth/profile');
            setUser(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data } = await axios.post('auth/login', { email, password });
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data);
        return data;
    };

    const register = async (userData) => {
        const { data } = await axios.post('auth/register', userData);
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, loading, token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
