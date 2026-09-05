import { Heading } from '../components/Heading'
import { SubHeading } from '../components/SubHeading'
import { InputBox } from '../components/InputBox'
import { Button } from '../components/Button'
import { ButtomWarning } from '../components/BottomWarning'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from "axios";
import toast from "react-hot-toast"; // Toast import kiya
import { AppbarHeading } from '../components/Appbar'

export const Signin = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [errors, setErrors] = useState({})
    const navigate = useNavigate()

    // Input change handle karne ke liye (red border hatane ke liye jab user type kare)
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({}); // Puraane errors clear karo

        try {
            // Backend ko request bhejo
            const response = await axios.post("http://localhost:3000/api/v1/user/signin", formData)

            // ✅ Agar signup success ho gaya toh mast Pop-up dikhao
            toast.success(response.data.message || "User Signin Successfully!")
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('firstname', response.data.firstname);
            navigate('/dashboard')

        } catch (error) {
            // ❌ Agar backend se Zod validation ka error aaya (status 411)
            if (error.response && error.response.status === 411) {
                setErrors(error.response?.data?.errors || {}); // Input box red karne ke liye state update
                toast.error(<p className="text-xs text-red-500 mt-1 font-medium pl-1"> {"Please fill the details correctly!"} </p>); // Error wala Pop-up
            } else {
                toast.error(<p className="text-xs text-red-500 mt-1 font-medium pl-1"> {"Something went wrong on the server!"} </p>);
            }
        }
    };


    return <div className='h-screen flex justify-center'>
        <div className='bg-blue-600 w-full'>
            <AppbarHeading />
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <div className='flex justify-center'>
                <div className='flex flex-col justify-center'>
                    <div className='relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 overflow-hidden shadow-xl/30 ...'>
                        <div className="flex justify-center">
                            <div>
                                <div className="flex justify-center"><Heading label={"Sign In"} /></div>
                                <div><SubHeading label={"Enter your information to signin into your account"} /></div>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                            <InputBox filled={handleChange} type='text' value={formData.username} name='username' placeholder='username or email' label={'Username / Email'} errors={errors} />
                            <InputBox filled={handleChange} type='password' value={formData.password} name='password' placeholder='Abc@123' label={'Password'} errors={errors} />
                            <Link className='pointer underline pl-1 cursor-pointer text-gray-700 flex justify-end' to={'/forget'}>
                                Forget Password?
                            </Link>
                            <div className='pt-4'>
                                <Button label={"Sign in"} />
                            </div>
                        </form>
                        <ButtomWarning label={`Don't have an account?`} buttonText={'Signup'} to={'/signup'} />
                    </div>
                </div>
            </div>
        </div>
    </div >
}