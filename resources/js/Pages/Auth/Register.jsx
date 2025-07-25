import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Register() {

    const { props } = usePage('');
    const email = props.email || ''; // Get the email passed from the controller
    const message = props.message || ''; // Get the message passed from the controller
    const alertType = props.alertType || 'info'; // Get the alert type passed from the controller
    // console.log('email passed is: ', email) // This will log the email passed from the controller;
    // console.log('message passed is: ', message) // This will log the message passed from the controller;
    // console.log('alertType passed is: ', alertType) // This will log the alert type passed from the controller;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: email,
        password: '',
        password_confirmation: '',
    });

    const alertStyles = {
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-600',
        info: 'bg-blue-100 text-blue-800 border-blue-600',
        danger: 'bg-red-100 text-red-800 border-red-600',
        success: 'bg-green-100 text-green-800 border-green-600',
    };
    const alertClass = alertStyles[alertType] || alertStyles.info;

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Register" />

            <div className="relative h-screen bg-[url('/images/wp4286137-stuff-wallpapers.jpg')] bg-cover bg-center bg-no-repeat">
                <div className="absolute inset-0 bg-black opacity-5 z-10"></div>

                <div className="absolute top-9 md:inset-0 w-full flex items-center justify-center z-20">
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
                                    className="bg-red-500 text-white text-base md:text-2xl font-semibold tracking-wider rounded-full px-4 py-[2px] md:px-6 md:py-2">
                                    ALPHA
                                </p>

                                {message && (
                                    <div className={`my-2 p-3 rounded border-2 text-sm ${alertClass}`}>
                                        {message}
                                    </div>
                                )}
                                <p className="text-white text-2xl md:text-2xl  tracking-wider my-4">
                                    Welcome Back
                                </p>
                                <InputError message={errors.email} className="mt-2" />
                                <Link href={route('login')} className="text-white text-sm  mb-2 hover:text-gray-300">
                                    Already have an account? Login
                                </Link>
                            </div>

                            <form onSubmit={submit}>
                                <div>
                                    <InputLabel htmlFor="name" value="Name" />

                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        autoComplete="name"
                                        isFocused={true}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />

                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="email" value="Email" />

                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />

                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="password" value="Password" />

                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />

                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <InputLabel
                                        htmlFor="password_confirmation"
                                        value="Confirm Password"
                                    />

                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        onChange={(e) =>
                                            setData('password_confirmation', e.target.value)
                                        }
                                        required
                                    />

                                    <InputError
                                        message={errors.password_confirmation}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="mt-4 flex items-center justify-end">
                                    <PrimaryButton className="ms-4" disabled={processing}>
                                        Register
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
