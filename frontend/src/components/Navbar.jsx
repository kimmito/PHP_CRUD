import { Link } from 'react-router-dom';
import { List, Box, ShoppingCart, BarChart3, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Отделы', path: '/', icon: <Box className='w-5 h-5' /> },
        { name: 'Товары', path: '/products', icon: <List className='w-5 h-5' /> },
        { name: 'Продажи', path: '/sales', icon: <ShoppingCart className='w-5 h-5' /> },
        { name: 'Отчет по выручке', path: '/report', icon: <BarChart3 className='w-5 h-5' /> },
    ];

    return (
        <>
            <div className='md:hidden bg-blue-700 text-white p-4 flex justify-between items-center'>
                <h1 className='text-xl font-bold'>Trade Manager</h1>
                <button onClick={() => setMenuOpen(!menuOpen)}>
                    <Menu className='w-6 h-6' />
                </button>
            </div>

            <nav
                className='bg-blue-800 text-white w-full md:w-64 space-y-2 py-6 px-4 absolute md:relative z-10 transition-transform md:translate-x-0  min-h-screen'
            >
                <div className='hidden md:block mb-8'>
                    <h1 className='text-2xl font-bold px-2'>Торгово-учетная база</h1>
                </div>
                <ul className='space-y-2'>
                    {navLinks.map((link) => (
                        <li key={link.name}>
                            <Link
                                to={link.path}
                                onClick={() => setMenuOpen(false)}
                                className='flex items-center space-x-3 hover:bg-blue-700 px-4 py-3 rounded-lg transition-colors'
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
}
