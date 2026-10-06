import { Appbar } from "../components/Appbar"
import { Balance } from "../components/Balance"
import { Users } from "../components/User"

export const Dashboard = () => {
    return <div className='h-screen flex justify-center'>
        <div className='bg-slate-300 w-full'>
            <Appbar />
            <br></br>
            <br></br>
            <br></br>
            <div className='bg-slate-300 w-sm'>
                <Balance />
            </div>
            <br></br>
            <div className="max-w-full bg-gray-200 shadow-2xl font-bold rounded-lg pl-5 pr-5 pb-4 ml-5 mr-5">
                <Users />
            </div>
        </div>
    </div>
}
