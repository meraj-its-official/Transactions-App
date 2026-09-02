export const Balance = ({ value }) => {
    return <div className="flex justify-items-start bg-gray-200 shadow-2xl font-bold rounded-lg p-5 ml-5 mr-5">
        <div className="font-bold text-lg">
            Your balance
        </div>
        <div className="font-semibold ml-4 text-lg">
            {'\u20B9'} {value}
        </div>
    </div>
}