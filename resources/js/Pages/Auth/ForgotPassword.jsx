import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot Password" />
            <div className="relative h-screen bg-[url('/images/wp4286137-stuff-wallpapers.jpg')] bg-cover bg-center bg-no-repeat">
                <div className="absolute inset-0 bg-black opacity-5 z-10"></div>

                <div className="absolute top-28 md:inset-0 flex items-center justify-center z-20">
                    <div className="relative bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 p-6 border-[2px] border-gray-400 rounded-lg w-full mx-4 md:mx-0 md:w-1/2 md:max-w-md z-40 overflow-hidden">
                        <div className="absolute inset-0  bg-white bg-opacity-30 z-30 backdrop-blur-sm"></div>
                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}
                        <div className="relative z-40  dark:text-white">

                            <div className="flex flex-col justify-between items-center ">
                                <p
                                    className="bg-indigo-600 text-white text-base md:text-2xl font-semibold tracking-wider rounded-full px-4 py-[2px] md:px-6 md:py-2">
                                    ALPHA
                                </p>
                            </div>

                            <div className="text-white text-sm my-4">
                                Forgot your password? No problem. Just let us know your email
                                address and we will email you a password reset link that will
                                allow you to choose a new one.
                            </div>

                            {status && (
                                <div className="mb-4 text-sm font-medium text-green-600 dark:text-green-400">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit}>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                />

                                <InputError message={errors.email} className="mt-2" />

                                <div className="mt-4 flex items-center justify-end">
                                    <PrimaryButton className="ms-4" disabled={processing}>
                                        Email Password Reset Link
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
