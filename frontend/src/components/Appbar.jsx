export const Appbar = () => {
    return <div className='bg-blue-600 w-full py-4 pb-6 rounded-none shadow-xl/30 ...'>
        <div className='grid grid-cols-3  flex: items-center w-full pr-4 pl-4'>
            <div className="text-white font-extrabold text-3xl ">
                Paytm
            </div>
            <div className='flex justify-end flex: items-center col-span-1 col-end-4 gap-x-2 mt-1 mr-2'>
                <div className="text-white font-bold justify-center text-xl">
                    Hello
                </div>
                {/* <div className='rounded-full h-13 w-12 bg-slate-200'></div> */}
                <div className="rounded-full h-12 w-12 bg-slate-400 flex justify-center mt-1 mr-2">
                    <div className="text-white font-bold flex flex-col justify-center h-full text-xl">
                        M
                    </div>
                </div>
            </div>
        </div>
    </div>
}