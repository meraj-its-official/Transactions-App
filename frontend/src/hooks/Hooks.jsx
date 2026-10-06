import { useEffect, useState } from "react"

export const useDebounce = (value, timeout) => {
    const [debounceValue, setDebounceValue] = useState(value);

    useEffect(() => {
        let timeoutValue = setTimeout(() => {
            setDebounceValue(value);
        }, timeout);

        return () => {
            clearTimeout(timeoutValue);
        }
    }, [value, timeout])

    return debounceValue;
}

