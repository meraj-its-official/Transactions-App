// // parent props -> ({-, -, -})
// export const InputBox = ({ label, placeholder, filled, type, value, name, errors = {} }) => {
//     const errorMessage = errors[name];
//     return <div>
//         <div className='text-sm font-medium text-left py-2'>
//             {label}
//         </div>
//         <input onChange={filled} type={type} value={value} name={name} placeholder={placeholder} className={`w-full px-3 py-2 border rounded transition-all outline-none ${errorMessage
//             ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50"
//             : "border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
//             }`} />
//         {errorMessage && (
//             <p className="mt-1 text-xs text-red-500 text-left">
//                 {errorMessage[0]}
//             </p>
//         )}
//     </div>
// }

// 1. Sign In / Sign Up ke liye InputBox
export const InputBox = ({ label, placeholder, filled, type, value, name, errors = {} }) => {
    const errorMessage = errors && errors[name];
    const displayError = Array.isArray(errorMessage) ? errorMessage[0] : errorMessage;

    return (
        <div>
            <div className="text-sm font-medium text-left py-2">
                {label}
            </div>
            <input
                onChange={filled}
                type={type}
                value={value}
                name={name}
                placeholder={placeholder}
                className={`w-full px-3 py-2 border rounded transition-all outline-none ${displayError
                        ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 bg-white focus:border-black focus:ring-1 focus:ring-black"
                    }`}
            />
            {displayError && (
                <p className="mt-1 text-xs text-red-500 text-left">
                    {displayError}
                </p>
            )}
        </div>
    );
};

// 2. Update Password Modal ke liye InputBoxU
export const InputBoxU = ({
    label,
    placeholder,
    filled,
    type = "text",
    value,
    name,
    errors = {},
}) => {
    const fieldError = errors && errors[name];
    const errorMessage = Array.isArray(fieldError) ? fieldError[0] : fieldError;

    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                onChange={filled}
                type={type}
                value={value}
                name={name}
                placeholder={placeholder}
                className={`w-full px-3 py-2 text-sm rounded-lg text-gray-900 outline-none transition-all border ${errorMessage
                        ? "border-red-500 bg-red-50 focus:ring-1 focus:ring-red-500"
                        : "border-gray-300 bg-white focus:border-black focus:ring-1 focus:ring-black"
                    }`}
            />
            {errorMessage && (
                <p className="mt-1 text-xs text-red-500 font-medium text-left">
                    {errorMessage}
                </p>
            )}
        </div>
    );
};