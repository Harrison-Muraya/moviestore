import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Dashboard() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
    }, [isDark]);
    return (
        <section className="min-h-screen bg-[#fefcff] text-black dark:bg-gray-900 dark:text-white transition-colors duration-500">
            <div className="grid md:grid-cols-3">
                <p
                    className="hidden md:block text-indigo-600 text-2xl md:text-4xl mt-6 ml-28 font-semibold tracking-wider">
                    ALPHA <span className="text-red-600">.</span>
                </p>

                <div className="mt-6 ms flex max-w-md gap-x-4">
                    <label htmlFor="search" className="sr-only">Search</label>
                    <input
                        id="search" name="search" type="text" className="min-w-0 flex-auto rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                        placeholder="Search for movies, shows, or actors..."
                    />
                    <button
                        type="submit"
                        className="flex-none rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    >
                        Search
                    </button>
                </div>

                <label className="flex items-center mt-6 gap-3 cursor-pointer justify-end md:mr-20">
                    <span>{isDark ? '🌙 Dark' : '🌞 Light'}</span>
                    <div
                        onClick={() => setIsDark(!isDark)}
                        className={`w-12 h-6 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full p-1 duration-300 ${isDark ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        <div className="w-5 h-5 bg-white rounded-full shadow-md"></div>
                    </div>
                </label>
            </div>

            <div className="relative grid grid-cols-12 gap-x-2 mt-2 md:p-4 min-h-screen">
                {/* Left Sidebar */}
                <div className="hidden md:block md:col-span-3 rounded-md p-4 bg-gray-100 dark:bg-black">
                    <div className="text-xl font-semibold">
                        <p>Genres</p>
                    </div>
                </div>

                {/* Video Content Area */}
                <div className="relative col-span-12 md:col-span-9 rounded-xl h-1/2 md:h-[80vh] overflow-hidden">
                    <video
                        autoPlay loop muted playsInline
                        className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
                    >
                        <source src="/trailers/STRANGER_THINGS_Season_5_Trailer__2025.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Optional overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-25"></div>

                    {/* Centered Content */}
                    <div className="relative z-10 flex h-full items-center justify-center text-white">
                        <div className="text-center">
                            <h1 className="text-5xl font-bold">Welcome to Alpha</h1>
                            <p className="mt-4 text-xl">Enjoy unlimited streaming content</p>
                        </div>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-xl font-semibold">
                Welcome to dark mode testing!
            </p>
        </section>
    );
}
