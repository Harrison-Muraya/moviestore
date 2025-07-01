import { Head, Link } from '@inertiajs/react';
import AlphaLogo from '@/Components/AlphaLogo';
import TextInput from '@/Components/TextInput';
import Footer from '@/Components/Footer';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const handleImageError = () => {
        document
            .getElementById('screenshot-container')
            ?.classList.add('!hidden');
        document.getElementById('docs-card')?.classList.add('!row-span-1');
        document
            .getElementById('docs-card-content')
            ?.classList.add('!flex-row');
        document.getElementById('background')?.classList.add('!hidden');
    };

    return (
        <>
            <Head title="Alpha - Welcome" />
            <div className="h-screen bg-[url('/images/wp4286137-stuff-wallpapers.jpg')] bg-cover bg-center bg-no-repeat relative">
                <div className="absolute inset-0 bg-black opacity-30"></div>

                <div className="relative z-10 h-full flex flex-col justify-between">
                    {/* Navbar */}
                    <div className="flex justify-between items-center p-6 md:py-6 md:px-48">
                        <AlphaLogo/>
                        {/* <p
                            className="text-red-600 text-2xl md:text-4xl font-semibold tracking-wider">
                            ALPHA <span className="text-red-600">.</span>
                        </p> */}
                        <Link href={route('login')} className="text-white bg-red-500 rounded-full px-4 py-[2px] p md:px-6 md:py-2 font-semibold">
                            Sign In
                        </Link>
                    </div>

                    {/* Centered Content */}
                    <div className="flex flex-col items-center justify-center text-white flex-1 text-center md:text-left px-6">
                        <div>
                            <p className="text-2xl md:text-5xl font-bold capitalize">Alpha got you covered,</p>
                            <p className="text-2xl md:text-5xl font-bold capitalize mt-2">enjoy series and shows...</p>
                            <p className="my-4 text-lg">
                                Ready to watch? Enter your email to create or restart your membership.
                            </p>
                            <div className="mt-6 flex max-w-md gap-x-4">
                                <label htmlFor="email-address" className="sr-only">Email address</label>
                                <TextInput id="email-address" name="email" type="email" autoComplete="email" required className="min-w-0 flex-auto rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-red-500 sm:text-sm/6" placeholder="Enter your email" />
                                <button type="submit" className="flex-none rounded-md bg-red-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-red-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500">Get Started</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <Footer/> */}
            </div>
        </>
    );

}
