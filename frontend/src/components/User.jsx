import { useEffect, useState } from "react"
import { Button } from "./Button"
import axios from "axios";
import { HeadingUser } from "./Heading";

export const Users = () => {
    // Replace with backend call
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/v1/user/bulk?filter=" + filter);
                setUsers(response.data.user);
            } catch (err) {
                console.error("Error fetching users:", err);
            }
        })();
    }, [filter]);

    return <div className="flex flex-col gap-3">
        <div>
            <HeadingUser label={"Users"} />
        </div>
        <div className="my-2">
            <input onChange={(e) => { setFilter(e.target.value) }} type="text" placeholder="Search users..." className="w-full px-2 py-1 border rounded border-slate-200"></input>
        </div>
        <div className="flex flex-col gap-2">
            {users.map(user => <User user={user} />)}
        </div>
    </div>
}

function User({ user }) {
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
            <Button label={"Send Money"} />
        </div>
    </div>
}