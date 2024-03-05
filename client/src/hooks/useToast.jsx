import { useRef } from 'react';
import { toast } from 'react-toastify';

const toastSettings = {
    position: "bottom-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
};

export default function useToast() {
    const toastId = useRef(null);

    const showToast = (message, type = "default") => {
        // If a toast is already shown, don't show a new one
        if (toastId.current !== null && toast.isActive(toastId.current)) {
            return;
        }

        switch (type) {
            case "success":
                toastId.current = toast.success(message, toastSettings);
                break;
            case "info":
                toastId.current = toast.info(message, toastSettings);
                break;
            case "warning":
                toastId.current = toast.warn(message, toastSettings);
                break;
            case "error":
                toastId.current = toast.error(message, toastSettings);
                break;
            default:
                toastId.current = toast(message, toastSettings);
        }
    };

    return showToast;
}
