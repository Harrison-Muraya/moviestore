import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import React from "react";
import { usePage, Head, Link, useForm } from '@inertiajs/react';


export default function Register() {
    const { levels } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        level: '',
    });

    const submit = (e) => {
        e.preventDefault();

        console.log(levels);

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

  return (
    <form onSubmit={submit}>
        <div className="flex h-screen">
            <div className="w-1/2 flex justify-center items-center bg-white">
                <div className="p-8 shadow-lg rounded-xl w-96">
                <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>             
                
                <div className="mb-4">
                    <label className="block font-bold text-gray-700">Name</label>
                    <input type="name" name="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Enter your name" className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <InputError message={errors.email} className="mt-2"/>
                </div>

                <div className="mb-4">
                    <label className="block font-bold text-gray-700">Email</label>
                    <input type="email" name="email" value={data.email} onChange={(e) => setData('email', e.target.value)}  placeholder="Enter your email" className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <InputError message={errors.email} className="mt-2"/>
                </div>

                <div className="mb-4">
                    <label className="block font-bold text-gray-700">Select Role</label>
                    <select
                        value={data.level}
                        onChange={(e) => setData('level', e.target.value)}
                        className="w-full p-2 border rounded-lg"
                    >
                        <option value="">Select a role</option>
                        {Object.entries(levels).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.level} className="mt-2" />
                </div>
                
                <div className="mb-4">
                    <label className="block font-bold text-gray-700">Password</label>
                    <input type="password" name="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Enter your Password" className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <InputError message={errors.password} className="mt-2"/>
                </div>

                <div className="mb-6">
                    <label className="block font-bold text-gray-700">Confirm Password</label>
                    <input type="password" name="password_confirmation" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} placeholder="Confirm your password" className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <InputError message={errors.password_confirmation} className="mt-2"/>
                </div>

                <PrimaryButton className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition" disabled={processing}>
                    Sign Up       
                </PrimaryButton>
                
                <Link
                    href={route('login')}
                    className="text-center mt-4 text-gray-600">
                         Already have an account? <span className="text-blue-500 cursor-pointer">Log In</span>
                </Link>
                </div>
            </div>
        
        
        <div className="w-1/2 relative">
            <img
            src="images\IMG-20250331-WA0001.jpg"
            alt="dairy milking"
            className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-green-900 opacity-40"></div>
        </div>
        </div>
    </form>
  );
};

