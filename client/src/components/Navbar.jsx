
function Navbar() {
    return(
        <nav className="w-full bg-black text-white px-6 py-4 flex justify-between border-b border-white/20 bg-black backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]">
        <h1 className="text-xl font-bold">Leave System</h1>
        <button className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 bg-gradient-to-tr from-gray-900 to-gray-800 text-white shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-white-900/20 active:opacity-[0.85] rounded-full">Login</button>
        </nav>
        
    )
}

export default Navbar;