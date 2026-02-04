function ApplyLeave() {
    return(
        <div>
            <h2>Apply for Leave</h2>

            <input type="text" placeholder="your name" className="w-full border p-2 mb-3"/>
            <input type="number" placeholder="Number of days" className="w-full border p-2 mb-3"/>
            <textarea placeholder="Reason" className="w-full border p-2 mb-3"/>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
        </div>
    )
}
export default ApplyLeave;