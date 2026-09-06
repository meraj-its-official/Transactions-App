import { useState, useRef, useEffect } from "react";
import { UpdatePasswordModal } from "./UpdatePasswordModal";
import { Link, useNavigate } from 'react-router-dom'
import { ButtomWarning } from '../components/BottomWarning'
import { ButtonIn, ButtonOut } from "../components/Button";

export const ProfileMenu = ({ userInitial = { userFirstletter } }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOpenModal = () => {
        setIsOpen(false); // Dropdown band karein
        setIsModalOpen(true); // Popup modal open karein
    };

    const handleSignout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("firstname");
        setIsOpen(false);
        navigate('/');
    };

    return (
        <>
            <div className="relative inline-block text-left" ref={dropdownRef}>
                {/* Profile Avatar Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-10 h-10 rounded-full bg-blue-600 cursor-pointer text-white font-semibold flex items-center justify-center hover:bg-blue-700 shadow-md transition"
                >
                    {userInitial.toUpperCase()}
                </button>

                {/* Dropdown Card */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl shadow-xl bg-white border border-gray-100 divide-y divide-gray-100 z-40">
                        <div className="px-4 py-3">
                            <p className="flex w-full justify-center text-xs text-gray-400">Signed in</p>
                        </div>
                        <div className="px-4 py-3">
                            <p className="text-sm font-semibold cursor-pointer text-gray-800 truncate">My Account</p>
                        </div>

                        <div className="py-1">
                            <ButtonIn onPress={handleOpenModal} label={"Update Password"} />
                        </div>

                        <div className="py-1">
                            <ButtonOut onPress={handleSignout} label={"Sign Out"} />
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Popup Component */}
            <UpdatePasswordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}