import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import React from "react";

export default function Login({ status, canResetPassword }) {
        const { data, setData, post, processing, errors, reset } = useForm({
            email: '',
            password: '',
            remember: false,
        });

        const submit = (e) => {
            e.preventDefault();

            post(route('login'), {
                onFinish: () => reset('password'),
            });
        };
    return (
    <form onSubmit={submit}>
        <div className="flex h-screen">
        
        <div className="w-1/2 flex justify-center items-center bg-white">
            <div className="p-8 shadow-lg rounded-xl w-96">
                <h2 className="text-2xl font-bold text-center mb-6">Log In</h2>
                
                <div className="mb-4">
                    <label className="block font-bold text-gray-700">Email</label>
                    <input type="email" name="email" value={data.email} onChange={(e) => setData('email', e.target.value)}  placeholder="Enter your email" className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <InputError message={errors.email} className="mt-2"/>
                </div>
                
                <div className="mb-4">
                    <label className="block font-bold text-gray-700">Password</label>
                    <input type="password" name="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Enter your Password" className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <InputError message={errors.password} className="mt-2"/>
                </div>

                <PrimaryButton className="w-full bg-green-600 text-white text-center font-bold py-2 rounded-lg hover:bg-green-700 transition" disabled={processing}>
                    Log In     
                </PrimaryButton>
                <div className="my-2">
                    <Link
                        href={route('password.request')}
                        className="text-center text-blue-500 cursor-pointer">
                        Forgot password 
                    </Link>
                </div>
                <Link
                    href={route('register')}
                    className="text-center mt-4 text-gray-600">
                        Don't have an account? <span className="text-blue-500 cursor-pointer">Sign Up</span>
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

