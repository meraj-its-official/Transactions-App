// parent props -> ({label})
export const Heading = ({ label }) => {
    return <div className='font-bold text-4xl pt-6 text-gray-900'>
        {label}
    </div>
}
export const HeadingUser = ({ label }) => {
    return <div className='font-bold text-4xl pt-3 text-gray-900'>
        {label}
    </div>
}