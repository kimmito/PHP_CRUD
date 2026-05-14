import { Link, NavLink } from 'react-router-dom';
import { BarChart3, Box, Home, List, LogOut, Menu, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, isAdmin, logout } = useAuth();

    const navLinks = [{ name: 'Главная', path: '/', icon: <Home className='w-5 h-5' /> }];

    if (user?.status === 'approved' && (user.role === 'operator' || user.role === 'admin')) {
        navLinks.push({ name: 'Ведомость', path: '/report', icon: <BarChart3 className='w-5 h-5' /> });
    }

    if (isAdmin) {
        navLinks.push(
            { name: 'Отделы', path: '/departments', icon: <Box className='w-5 h-5' /> },
            { name: 'Товары', path: '/products', icon: <List className='w-5 h-5' /> },
            { name: 'Продажи', path: '/sales', icon: <ShoppingCart className='w-5 h-5' /> },
            { name: 'Пользователи', path: '/users', icon: <ShieldCheck className='w-5 h-5' /> },
        );
    }

    const handleLogout = async () => {
        await logout();
        setMenuOpen(false);
    };

    return (
        <>
            <div className='md:hidden bg-blue-700 text-white p-4 flex justify-between items-center'>
                <Link to='/' className='text-xl font-bold'>
                    Trade Manager
                </Link>
                <button onClick={() => setMenuOpen(!menuOpen)}>
                    <Menu className='w-6 h-6' />
                </button>
            </div>

            <nav
                className={`bg-blue-800 text-white w-full md:w-64 space-y-2 py-6 px-4 absolute md:relative z-10 transition-transform md:translate-x-0 min-h-screen ${
                    menuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className='hidden md:block mb-8'>
                    <h1 className='text-2xl font-bold px-2'>Торгово-учетная база</h1>
                    {user && <p className='px-2 mt-2 text-sm text-blue-100'>{user.full_name}</p>}
                </div>
                <ul className='space-y-2'>
                    {navLinks.map((link) => (
                        <li key={link.name}>
                            <NavLink
                                to={link.path}
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 hover:bg-blue-700 px-4 py-3 rounded-lg transition-colors ${
                                        isActive ? 'bg-blue-700' : ''
                                    }`
                                }
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
                {user && (
                    <button
                        onClick={handleLogout}
                        className='mt-6 flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-left hover:bg-blue-700'
                    >
                        <LogOut className='w-5 h-5' />
                        <span>Выйти</span>
                    </button>
                )}
            </nav>
        </>
    );
}
