import axios from "axios";
import { useEffect, useState } from "react";

export const Balance = () => {
    const [balance, setBalance] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:3000/api/v1/account/balance", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setBalance(response.data.balance);
            } catch (error) {
                // console.error("Failed to load balance", error);
                console.log("Status:", error.response?.status);
                console.log("Error Data:", error.response?.data);
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
    }, []);

    return <div className="flex justify-items-start bg-gray-200 shadow-2xl font-bold rounded-lg p-5 ml-5 mr-5">
        <div className="font-bold text-lg">
            Your balance
        </div>
        <div className="font-semibold ml-4 text-lg">
            {loading ? "Loading..." : `\u20B9 ${Number(balance).toLocaleString("en-IN")}`}
        </div>
    </div>
}