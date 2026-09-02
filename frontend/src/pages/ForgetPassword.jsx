import { Heading } from '../components/Heading'
import { SubHeading } from '../components/SubHeading'
import { InputBox } from '../components/InputBox'
import { Button } from '../components/Button'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from "react-hot-toast"; // Toast import kiya
import axios from "axios";
import { AppbarHeading } from '../components/Appbar'

export const ForgetPassword = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: ""
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
            const response = await axios.put('http://localhost:3000/api/v1/user/forget-password', { ...formData })

            // ✅ Agar forgetPassword success ho gaya toh mast Pop-up dikhao
            toast.success(response.data.message || "Password Created Successfully!")
            localStorage.setItem('token', response.data.token)
            navigate('/signin')

        } catch (error) {
            // ❌ Agar backend se Zod validation ka error aaya (status 411)
            if (error.response && (error.response.status === 400 || error.response.status === 411)) {
                setErrors(error.response.data.errors || {}); // ✅ State update hogi aur red border aa jayega
                toast.error(error.response.data.message || "Please fill the details correctly!"); // Error wala Pop-up
            } else {
                toast.error(error.response?.data?.message || "Something went wrong on the server!");
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
                <div className='rounded-lg bg-white w-100 text-center p-2 h-max px-4 shadow-xl/30 ...'>
                    <Heading label={"Create New Password"} />
                    <SubHeading label={"Enter your information to create new password"} />
                    <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                        <InputBox filled={handleChange} type='text' value={formData.username} name='username' placeholder='Enter existing username or e-mail' label={'Username'} errors={errors} />
                        <InputBox filled={handleChange} type='text' value={formData.password} name='password' placeholder='New Password' label={'New Password'} errors={errors} />
                        <InputBox filled={handleChange} type='password' value={formData.confirmPassword} name='confirmPassword' placeholder='Confirm Password' label={'Confirm Password'} errors={errors} />
                        <div className='pt-4'>
                            <Button label={"Create New Password"} />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div >
}
