import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

export default function App() {
    return (
        <div className='min-h-screen bg-gray-50 flex flex-col md:flex-row'>
            <Navbar />
            <main className='flex-1 p-4 md:p-8 bg-gray-50 min-h-screen overflow-auto'>
                <Outlet />
            </main>
        </div>
    );
}
