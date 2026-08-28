import { useEffect } from "react"

function useDebounce(value, timeout) {
    const [debounceValue, setDebounceValue] = useState(value);

    useEffect(() => {
        let timeoutValue = setTimeout(() => {
            setDebounceValue(value);
        }, timeout);

        return () => {
            clearTimeout(timeoutValue);
        }
    }, [value])

    return debounceValue;
}

export default useDebounce