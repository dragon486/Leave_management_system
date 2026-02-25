import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ApplyLeave = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        leaveType: 'sick',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [leaveStats, setLeaveStats] = useState({
        sick: { used: 0, total: 10 },
        casual: { used: 0, total: 12 },
        vacation: { used: 0, total: 15 }
    });

    const formatDays = (days) => {
        const d = parseFloat(days);
        if (isNaN(d)) return 0;
        // Round to whole numbers (integers)
        return Math.round(d);
    };

    useEffect(() => {
        const fetchLeaveStats = async () => {
            try {
                const [leavesRes, profileRes] = await Promise.all([
                    axios.get('leaves/my-leaves'),
                    axios.get('auth/profile')
                ]);

                const dbLeftBalance = profileRes.data.leaveBalance || { sick: 10, casual: 12, vacation: 15 };
                const leaves = leavesRes.data.leaves;

                const rawStats = {
                    sick: { approvedUsed: 0, pendingUsed: 0 },
                    casual: { approvedUsed: 0, pendingUsed: 0 },
                    vacation: { approvedUsed: 0, pendingUsed: 0 }
                };

                leaves.forEach(l => {
                    const type = l.leaveType.toLowerCase();
                    if (rawStats[type]) {
                        if (l.status === 'approved') {
                            rawStats[type].approvedUsed += l.totalDays;
                        } else if (l.status === 'pending') {
                            rawStats[type].pendingUsed += l.totalDays;
                        }
                    }
                });

                const finalStats = {};
                Object.keys(rawStats).forEach(type => {
                    // Total limit inferred from DB's remaining balance + what was already deducted (approved)
                    const totalLimit = dbLeftBalance[type] + rawStats[type].approvedUsed;
                    // Total used is approved + pending leaves
                    let totalUsed = rawStats[type].approvedUsed + rawStats[type].pendingUsed;
                    // Exact left balance accounting for pending
                    let left = totalLimit - totalUsed;

                    // Cap logic to prevent unprofessional negative numbers if an Admin forced an approval
                    if (left < 0) {
                        left = 0;
                        totalUsed = totalLimit; // Cap used at the limit visually so TOTAL = USED + LEFT holds
                    }

                    finalStats[type] = {
                        total: totalLimit,
                        used: totalUsed,
                        left: left
                    };
                });

                setLeaveStats(finalStats);
            } catch (err) {
                console.error('Error fetching leave stats:', err);
            }
        };
        fetchLeaveStats();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('leaves/apply', formData);
            alert('Leave application submitted successfully');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to apply for leave');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black p-8 text-white">
            <div className="max-w-2xl mx-auto bg-[#0f0f0f] p-8 rounded-2xl border border-white/5">
                <h2 className="text-3xl font-bold mb-6">Apply for Leave</h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Leave Type</label>
                        <div className="grid grid-cols-3 gap-4">
                            {['sick', 'casual', 'vacation'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, leaveType: type })}
                                    className={`py-3 px-4 rounded-xl border capitalize transition-all ${formData.leaveType === type
                                        ? 'bg-white text-black border-white font-bold'
                                        : 'bg-[#1a1a1a] text-gray-400 border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-2">Start Date & Time</label>
                            <input
                                type="datetime-local"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-2">End Date & Time</label>
                            <input
                                type="datetime-local"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {Object.entries(leaveStats).map(([type, data]) => (
                            <div key={type} className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center text-center">
                                <p className="text-gray-400 text-[10px] font-black uppercase mb-2 border-b border-white/10 pb-1 w-full">{type}</p>
                                <div className="flex justify-between w-full mb-1">
                                    <span className="text-[10px] text-gray-500 font-bold">TOTAL</span>
                                    <span className="text-[10px] text-white font-bold">{formatDays(data.total)}</span>
                                </div>
                                <div className="flex justify-between w-full mb-1">
                                    <span className="text-[10px] text-gray-500 font-bold">USED</span>
                                    <span className="text-[10px] text-amber-500 font-bold">{formatDays(data.used)}</span>
                                </div>
                                <div className="flex justify-between w-full pt-2 border-t border-white/5 mt-1">
                                    <span className="text-[10px] text-gray-400 font-bold">LEFT</span>
                                    <span className={`text-[10px] font-black ${data.left <= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {formatDays(data.left)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Reason</label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            rows="4"
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                            placeholder="Please provide a reason for your leave..."
                            required
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ApplyLeave;