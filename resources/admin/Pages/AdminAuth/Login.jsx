import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import adminLoginBg from '@/../../public/images/adminlogin.png';
import { Head, Link, useForm } from '@inertiajs/react';
import React from "react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('admin.access'), {
            onFinish: () => reset('password'),
        });
    };
    return (

        <div className="flex items-center justify-center h-screen  relative" style={{ backgroundImage: `url(${adminLoginBg})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center', }}>
            {/* <div className="flex items-center justify-center h-screen bg-[url('/images/adminlogin.png')] bg-cover bg-center bg-no-repeat">  */}
            <div className="absolute inset-0 bg-black opacity-40"></div>
            <div className="relative z-10">

                <form onSubmit={submit}>
                    <div className="flex items-center justify-center">

                        <div className="flex justify-center items-center bg-white rounded-md">
                            <div className="p-8 shadow-lg rounded-xl w-96">
                                <h2 className="text-2xl font-bold text-center mb-6">Admin Log In</h2>

                                <div className="mb-4">
                                    <label className="block font-bold text-gray-700">Username</label>
                                    <input type="text" name="username" value={data.username} onChange={(e) => setData('username', e.target.value)} placeholder="Enter your username" className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                                    <InputError message={errors.username} className="mt-2" />
                                </div>

                                <div className="mb-4">
                                    <label className="block font-bold text-gray-700">Password</label>
                                    <input type="password" name="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Enter your Password" className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>
                                <PrimaryButton className="w-full bg-green-600 text-white justify-center font-bold py-2 rounded-lg hover:bg-green-700 transition" disabled={processing}>
                                    Log In
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

