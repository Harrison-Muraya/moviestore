export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-gray-300 text-red-600 shadow-sm focus:ring-red-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-red-600 dark:focus:ring-offset-gray-800 ' +
                className
            }
        />
    );
}
