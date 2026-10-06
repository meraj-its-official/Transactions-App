import { useEffect, useState } from "react"
import { Button } from "./Button"
import axios from "axios";
import { HeadingUser } from "./Heading";
import { useDebounce } from "../hooks/Hooks";
import { SendMoney } from "../pages/SendMoney";
import { useSearchParams } from "react-router-dom";

export const Users = () => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("");
    const debouncedFilter = useDebounce(filter, 500);

    // 1. SearchParams aur uska setter lein
    const [searchParams, setSearchParams] = useSearchParams();

    // 2. Agar URL me 'id' param maujood hai, toh modal open maana jayega
    const isModalOpen = Boolean(searchParams.get("id"));

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/v1/user/bulk?filter=${debouncedFilter}`);
                setUsers(response.data.user);
            } catch (err) {
                console.error("Error fetching users:", err);
            }
        })();
    }, [debouncedFilter]);

    // Button click par bina navigate kiye query params set karein
    const handleOpenModal = (user) => {
        setSearchParams({
            id: user._id,
            name: user.firstname
        });
    };

    // Modal band karte waqt URL ke params clear kar dein
    const handleCloseModal = () => {
        setSearchParams({});
    };

    return (
        <>
            <div className="flex flex-col gap-3">
                <div>
                    <HeadingUser label={"Users"} />
                </div>
                <div className="my-2">
                    <input onChange={(e) => { setFilter(e.target.value) }} type="text" placeholder="Search users..." className="w-full px-2 py-1 border rounded border-slate-200"></input>
                </div>
                <div className="flex flex-col gap-2">
                    {users.slice(0, 5).map((user) => (<User key={user._id} user={user} onSendMoney={() => handleOpenModal(user)} />))}
                </div>
            </div>
            {/* Modal Popup Component */}
            <SendMoney
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </>
    );
}

function User({ user, onSendMoney }) {
    return <div className="flex justify-between">
        <div className="flex">
            <div className="rounded-full h-12 w-12 bg-slate-300 flex justify-center mt-1 mr-2">
                <div className="flex flex-col justify-center h-full text-xl">
                    {user.firstname[0]}
                </div>
            </div>
            <div className="flex flex-col justify-center h-ful">
                <div>
                    {user.firstname} {user.lastname}
                </div>
            </div>
        </div>

        <div className="flex flex-col justify-center h-ful">
            <Button onPress={onSendMoney} label={"Send Money"} />
        </div>
    </div>
}