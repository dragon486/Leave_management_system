import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [leaves, setLeaves] = useState([]);
    const [adminRequests, setAdminRequests] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [leavesRes, statsRes, requestsRes] = await Promise.all([
                axios.get('leaves/all?limit=50'),
                axios.get('leaves/statistics'),
                axios.get('users/admin-requests')
            ]);
            setLeaves(leavesRes.data.leaves);
            setStats(statsRes.data);
            setAdminRequests(requestsRes.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        let adminComment = '';
        if (status === 'rejected') {
            adminComment = window.prompt('Please enter a reason for rejection:');
            if (adminComment === null) return; // Cancelled prompt
        }

        setProcessingId(id);
        try {
            await axios.put(`leaves/${id}/status`, { status, adminComment });
            // Update local state
            setLeaves(leaves.map(l => l._id === id ? { ...l, status, adminComment } : l));
            // Refresh stats
            const statsRes = await axios.get('leaves/statistics');
            setStats(statsRes.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Action failed');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRequestAction = async (userId, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this admin request?`)) return;

        setProcessingId(userId);
        try {
            await axios.put(`users/${userId}/handle-admin-request`, { status });
            // Remove from list
            setAdminRequests(adminRequests.filter(u => u._id !== userId));
            alert(`Request ${status}`);
        } catch (error) {
            alert(error.response?.data?.message || 'Action failed');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredLeaves = leaves.filter(l => filter === 'all' ? true : l.status === filter);

    if (loading && !leaves.length) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Admin Approval Panel</h1>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-[#0f0f0f] border border-white/5 p-6 rounded-2xl">
                        <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Requests</p>
                        <h3 className="text-3xl font-bold">{stats.totalLeaves}</h3>
                    </div>
                    <div className="bg-[#0f0f0f] border border-white/5 p-6 rounded-2xl">
                        <p className="text-amber-500/80 text-xs font-bold uppercase mb-1">Pending</p>
                        <h3 className="text-3xl font-bold text-amber-500">{stats.pendingLeaves}</h3>
                    </div>
                    <div className="bg-[#0f0f0f] border border-white/5 p-6 rounded-2xl">
                        <p className="text-green-500/80 text-xs font-bold uppercase mb-1">Approved</p>
                        <h3 className="text-3xl font-bold text-green-500">{stats.approvedLeaves}</h3>
                    </div>
                    <div className="bg-[#0f0f0f] border border-white/5 p-6 rounded-2xl">
                        <p className="text-red-500/80 text-xs font-bold uppercase mb-1">Rejected</p>
                        <h3 className="text-3xl font-bold text-red-500">{stats.rejectedLeaves}</h3>
                    </div>
                </div>
            )}

            {/* Admin Access Requests */}
            {adminRequests.length > 0 && (
                <div className="mb-12 bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                        Pending Admin Access Requests
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {adminRequests.map(user => (
                            <div key={user._id} className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                                <div>
                                    <p className="font-bold text-lg">{user.name}</p>
                                    <p className="text-gray-400 text-sm">{user.email}</p>
                                    <p className="text-gray-500 text-xs mt-1">{user.department}</p>
                                    {user.adminRequestReason && (
                                        <div className="mt-2 text-sm italic text-gray-300 bg-white/5 p-2 rounded">
                                            "{user.adminRequestReason}"
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => handleRequestAction(user._id, 'approved')}
                                        disabled={processingId === user._id}
                                        className="flex-1 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-bold text-xs uppercase"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleRequestAction(user._id, 'rejected')}
                                        disabled={processingId === user._id}
                                        className="flex-1 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-bold text-xs uppercase"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-4 mb-8">
                {['pending', 'approved', 'rejected', 'all'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2 rounded-full text-sm font-bold uppercase transition-all ${filter === f ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-white/5'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Leave Table */}
            <div className="bg-[#0f0f0f] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="p-4 text-xs font-bold uppercase text-gray-400">Employee</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-400">Leave Type</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-400">Duration</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-400">Reason</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-400">Status</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-400 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeaves.map(leave => (
                            <tr key={leave._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                <td className="p-4">
                                    <p className="font-bold">{leave.userId?.name || 'Unknown'}</p>
                                    <p className="text-xs text-gray-500">{leave.userId?.department}</p>
                                </td>
                                <td className="p-4">
                                    <span className="text-xs font-bold uppercase px-3 py-1 bg-white/10 rounded-full">{leave.leaveType}</span>
                                </td>
                                <td className="p-4 text-sm">
                                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                    <p className="text-xs text-gray-500">{leave.totalDays} Days</p>
                                </td>
                                <td className="p-4 max-w-xs truncate text-sm text-gray-300">
                                    {leave.reason}
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded w-fit ${leave.status === 'pending' ? 'bg-amber-500/20 text-amber-500' :
                                            leave.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                                                'bg-red-500/20 text-red-500'
                                            }`}>
                                            {leave.status}
                                        </span>
                                        {leave.adminComment && (
                                            <p className="text-[10px] text-gray-400 italic max-w-[150px] truncate" title={leave.adminComment}>
                                                Reason: {leave.adminComment}
                                            </p>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    {leave.status === 'pending' ? (
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => handleAction(leave._id, 'approved')}
                                                disabled={processingId === leave._id}
                                                className="p-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-all active:scale-95 disabled:opacity-50"
                                                title="Approve"
                                            >
                                                <CheckIcon />
                                            </button>
                                            <button
                                                onClick={() => handleAction(leave._id, 'rejected')}
                                                disabled={processingId === leave._id}
                                                className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-all active:scale-95 disabled:opacity-50"
                                                title="Reject"
                                            >
                                                <XIcon />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-600 italic">Actioned</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!filteredLeaves.length && (
                    <div className="p-20 text-center text-gray-500">
                        No {filter} leave requests found.
                    </div>
                )}
            </div>
        </div>
    );
};

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

export default AdminDashboard;
