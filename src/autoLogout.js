import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "./Components/Auth/authAPI";
import { persistor } from "./store";

export const useAutoLogout = () => {
  const dispatch = useDispatch();
  const { tokenExpiryTime } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!tokenExpiryTime) return;

    const now = Date.now();
    const timeout = tokenExpiryTime - now;

    if (timeout <= 0) {
      dispatch(logoutUser()).then(() => {
        persistor.purge(); // clear persisted auth
      });
    } else {
      const timer = setTimeout(() => {
        dispatch(logoutUser()).then(() => {
          persistor.purge(); // clear persisted auth
        });
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [tokenExpiryTime, dispatch]);
};
