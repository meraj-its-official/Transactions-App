// parent props -> ({-, -, -})
export const InputBox = ({ label, placeholder, filled, type, value, name, errors = {} }) => {
    const errorMessage = errors[name];
    return <div>
        <div className='text-sm font-medium text-left py-2'>
            {label}
        </div>
        <input onChange={filled} type={type} value={value} name={name} placeholder={placeholder} className={`w-full px-3 py-2 border rounded transition-all outline-none ${errorMessage
            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50"
            : "border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
            }`} />
        {errorMessage && (
            <p className="mt-1 text-xs text-red-500 text-left">
                {errorMessage[0]}
            </p>
        )}
    </div>
}