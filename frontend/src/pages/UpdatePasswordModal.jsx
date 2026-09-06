import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { InputBoxU } from "../components/InputBox";
import { ButtonC, ButtonU, ButtonX } from "../components/Button";
import { Heading } from "../components/Heading";
import { useNavigate } from 'react-router-dom'

export const UpdatePasswordModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        username: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });


    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            const updatedErrors = { ...errors };
            delete updatedErrors[e.target.name];
            setErrors(updatedErrors);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (formData.newPassword !== formData.confirmPassword) {
            setErrors({ confirmPassword: ["New Password and Confirm Password must match"] });
            toast.error("New password and confirm password do not match");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                "http://localhost:3000/api/v1/user/update-password",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
            }

            toast.success(response.data.message || "Password updated successfully");
            setTimeout(() => {
                onClose();
                navigate('/');
                localStorage.removeItem("token");
                localStorage.removeItem("firstname");
            }, 1500);
        } catch (err) {
            const status = err.response?.status;
            const data = err.response?.data;

            // 1. Zod Validation Errors (411)
            if (status === 411 && data?.errors) {
                setErrors(data.errors);
                toast.error(<p className="text-xs text-red-500 mt-1 font-medium pl-1"> {"Please fill the details correctly!"} </p>);
            }
            // 2. Logic Errors (400 - Wrong Old Password or Same Password)
            else if (status === 400 && data?.message) {
                if (data.message.toLowerCase().includes("old password")) {
                    setErrors({ oldPassword: [data.message] });
                } else if (data.message.toLowerCase().includes("different")) {
                    setErrors({ newPassword: [data.message] });
                }
                toast.error(<p className="text-xs text-red-500 mt-1 font-medium pl-1"> {data.message} </p>);
            }
            // 3. Fallback generic errors
            else {
                toast.error(data?.message || <p className="text-xs text-red-500 mt-1 font-medium pl-1"> {"Failed to update password"} </p>);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <div>
                        <Heading label={"Update Password"} />
                        <div className="text-xs text-gray-500 mt-0.5">Ensure your account uses a secure password.</div>
                    </div>
                    <ButtonX onPress={onClose} label={"✕"} />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <InputBoxU
                            filled={handleChange}
                            type="text"
                            value={formData.firstname}
                            name="firstname"
                            placeholder="John"
                            label="First Name"
                            errors={errors}
                        />
                        <InputBoxU
                            filled={handleChange}
                            type="text"
                            value={formData.lastname}
                            name="lastname"
                            placeholder="Doe"
                            label="Last Name"
                            errors={errors}
                        />
                    </div>

                    <InputBoxU
                        filled={handleChange}
                        type="text"
                        value={formData.username}
                        name="username"
                        placeholder="username or email"
                        label="Username / Email"
                        errors={errors}
                    />

                    <InputBoxU
                        filled={handleChange}
                        type="text"
                        value={formData.oldPassword}
                        name="oldPassword"
                        placeholder="Abc123@"
                        label="Old Password"
                        errors={errors}
                    />

                    <InputBoxU
                        filled={handleChange}
                        type="password"
                        value={formData.newPassword}
                        name="newPassword"
                        placeholder="••••••••"
                        label="New Password"
                        errors={errors}
                    />

                    <InputBoxU
                        filled={handleChange}
                        type="password"
                        value={formData.confirmPassword}
                        name="confirmPassword"
                        placeholder="••••••••"
                        label="Confirm New Password"
                        errors={errors}
                    />

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                        <ButtonC onPress={onClose} label={"Cancel"} />
                        <ButtonU disabled={loading} label={loading ? "Updating..." : "Save Password"} />
                    </div>
                </form>
            </div>
        </div>
    );
};