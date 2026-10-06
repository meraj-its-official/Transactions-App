import { Link } from "react-router"

// parent props -> ({-, -})
export const Button = ({ label, onPress }) => {
    return <button onClick={onPress} type="submit" className='w-full text-white bg-blue-600
     hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-gray-300 cursor-pointer font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2'> {label} </button>
}

export const ButtonU = ({ label }) => {
    return <button type="submit" className="px-4 py-2 text-xs cursor-pointer font-medium text-white bg-blue-600 hover:bg-blue-800 disabled:opacity-50 rounded-lg shadow-sm transition 
    flex items-center gap-1.5"> {label} </button>
}

export const ButtonC = ({ label, onPress }) => {
    return <button onClick={onPress} type="button" className="px-4 py-2 text-xs font-medium cursor-pointer  text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"> {label} </button>
}

export const ButtonX = ({ label, onPress }) => {
    return <button onClick={onPress} type="button" className="text-gray-400 cursor-pointer  hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"> {label} </button>
}

export const ButtonIn = ({ label, onPress }) => {
    return <button onClick={onPress} type="button" className="flex w-full items-center cursor-pointer  px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
        <svg className="mr-3 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg> {label} </button>
}

export const ButtonOut = ({ label, onPress }) => {
    return <button onClick={onPress} type="button" className="flex w-full items-center cursor-pointer  px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
        <svg className="mr-3 h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg> {label} </button>
}

export const ButtonSend = ({ label }) => {
    return <button type="submit" className="w-full px-5 py-2.5 me-2 mb-2 text-sm cursor-pointer font-medium text-white bg-blue-600 hover:bg-green-600 disabled:opacity-50 rounded-lg shadow-sm transition 
    flex justify-center gap-1.5"> {label} </button>
}
export const ButtonNew = ({ label, to }) => {
    return <Link to={to}>  <button type="button" className=" w-full px-5 py-2.5 me-2 mb-2 text-sm font-medium cursor-pointer  text-white bg-gray-700 hover:bg-gray-900 rounded-lg transition" >
        {label}
    </button> </Link>
}
