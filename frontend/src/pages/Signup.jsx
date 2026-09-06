import { Heading } from '../components/Heading'
import { SubHeading } from '../components/SubHeading'
import { InputBox } from '../components/InputBox'
import { Button } from '../components/Button'
import { ButtomWarning } from '../components/BottomWarning'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from "react-hot-toast"; // Toast import kiya
import axios from "axios";
import { AppbarHeading } from '../components/Appbar'

export const Signup = () => {
    const [formData, setFormData] = useState({
        username: "",
        firstname: "",
        lastname: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({})
    const navigate = useNavigate();

    // Input change handle karne ke liye (red border hatane ke liye jab user type kare)
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        console.log("Current Errors State:", errors);
        e.preventDefault();
        setErrors({}); // Puraane errors clear karo

        try {
            // Backend ko request bhejo
            const response = await axios.post("http://localhost:3000/api/v1/user/signup", { ...formData })

            // ✅ Agar signup success ho gaya toh mast Pop-up dikhao
            toast.success(response.data.message || "Account Created Successfully!")
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('firstname', response.data.firstname)
            navigate('/dashboard')

        } catch (error) {
            // ❌ Agar backend se Zod validation ka error aaya (status 411)
            if (error.response && error.response.status === 411) {
                setErrors(error.response.data.errors || {}); // Input box red karne ke liye state update
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
                <div className='relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 overflow-hidden shadow-xl/30 ...'>
                    <div className="flex justify-center">
                        <div>
                            <div className="flex justify-center"><Heading label={"Sign Up"} /></div>
                            <div><SubHeading label={"Enter your information to create an account"} /></div>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                        <div className="grid grid-cols-2 gap-3">
                            <InputBox filled={handleChange} type='text' value={formData.firstname} name='firstname' placeholder='Jhon' label={'Firstname'} errors={errors} />
                            <InputBox filled={handleChange} type='text' value={formData.lastname} name='lastname' placeholder='David' label={'Lastname'} errors={errors} />
                        </div>
                        <InputBox filled={handleChange} type='text' value={formData.username} name='username' placeholder='username' label={'Username'} errors={errors} />
                        <InputBox filled={handleChange} type='text' value={formData.email} name='email' placeholder='abcd@gmail.com' label={'E-mail'} errors={errors} />
                        <InputBox filled={handleChange} type='password' value={formData.password} name='password' placeholder='Abc@123' label={'Password'} errors={errors} />
                        <div className='pt-4'>
                            <Button label={"Sign up"} />
                        </div>
                    </form>
                    <ButtomWarning label={'Already have an account?'} buttonText={'Signin'} to={'/'} />
                </div>
            </div>
        </div>
    </div >
}
