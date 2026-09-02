import { useEffect, useState } from "react";
import { ProfileMenu } from "../pages/ProfileMenu";
export const Appbar = () => {
    const [userFirstletter, setUserfirstLetter] = useState("");
    const [userFirstname, setUserfirstName] = useState("");

    useEffect(() => {
        // LocalStorage se firstname fetch karein
        const storedName = localStorage.getItem("firstname");
        if (storedName && storedName.length > 0) {
            setUserfirstLetter(storedName[0].toUpperCase());
        }
    }, []);

    useEffect(() => {
        // LocalStorage se firstname fetch karein
        const storedName = localStorage.getItem("firstname");
        if (storedName && storedName.length > 0) {
            setUserfirstName(storedName);
        }
    }, []);

    return <div className='bg-blue-600 w-full py-4 pb-6 rounded-none shadow-xl/30 ...'>
        <div className='grid grid-cols-3  flex: items-center w-full pr-4 pl-4'>
            <div className="text-white font-extrabold text-3xl ">
                Paytm
            </div>
            <div className='flex justify-end flex: items-center col-span-1 col-end-4 gap-x-2 mt-1 mr-2'>
                <div className="text-white font-bold justify-center text-xl">
                    <p className="font-medium justify-items-center ">Hello</p>
                    <p className="text-3xl">{userFirstname}</p>
                </div>
                <div className="rounded-full h-12 w-12 bg-slate-400 flex justify-center mt-1 mr-2">
                    <div className="text-white font-bold flex flex-col justify-center h-full text-xl">
                        <ProfileMenu userInitial={userFirstletter} />
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export const AppbarHeading = () => {
    return <div className='w-full py-4 pb-6 rounded-none '>
        <div className='flex justify-start w-full ml-5 mr-5 pr-4 pl-4'>
            <div className="text-white font-extrabold text-3xl ">
                Paytm
            </div>
        </div>
    </div>
}