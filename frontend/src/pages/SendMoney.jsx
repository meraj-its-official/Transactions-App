import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ButtonC, ButtonSend, ButtonX } from "../components/Button";
import { Heading } from "../components/Heading";
import { InputBoxSend } from "../components/InputBox";
import { useSearchParams } from "react-router";

export const SendMoney = ({ isOpen, onClose, }) => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const name = searchParams.get("name");
    const [amount, setAmount] = useState({
        amount: "",
    })
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    // Input change handle karne ke liye (red border hatane ke liye jab user type kare)
    const handleChange = (e) => {
        setAmount({ ...amount, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post("http://localhost:3000/api/v1/account/transfer", {
                to: id,
                amount: Number(amount)
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
            );

            toast.success(response.data.message || "Payment Successfully");
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            const status = err.response?.status;
            const data = err.response?.data;

            // 1. Zod Validation Errors (411)
            if (status === 411 && data?.errors) {
                setErrors(data.errors || {});
                toast.error("Please fill the amount!");
            }
            // 2. Fallback generic errors
            else {
                toast.error(data?.message || "Payment Failed ! Please try again.");
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
                    <div >
                        <Heading label={"Send Money"} />
                        <div className="text-xs text-gray-500 mt-0.5">Safe Transafer Save Money.</div>
                    </div>
                    <ButtonX onPress={onClose} label={"✕"} />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                            <span class="text-2xl text-white">{name[0].toUpperCase()}</span>
                        </div>
                        <h3 class="text-2xl font-semibold">{name} </h3>
                    </div>
                    <InputBoxSend
                        filled={handleChange}
                        name="amount"
                        type="text"
                        id="amount"
                        placeholder="Enater Amount"
                        label={`Amount ( \u20B9 )`}
                        errors={errors}
                    />

                    {/* Action Buttons */}
                    <div className="flex justify-center w-full gap-2.5 pt-3 border-t border-gray-100">
                        <ButtonSend disabled={loading} label={loading ? "Updating..." : "Pay"} />
                    </div>
                </form>
            </div>
        </div>
    );

}

