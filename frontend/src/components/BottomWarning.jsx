// parent props -> ({-, -, -})
import { Link } from "react-router-dom"
export const ButtomWarning = ({ label, buttonText, to }) => {
    return <div className='py-2 text-sm flex justify-center' >
        <div className="text-gray-700">
            {label}
        </div>
        <Link className='pointer underline pl-1 cursor-pointer' to={to}>
            {buttonText}
        </Link>
    </div>
}
