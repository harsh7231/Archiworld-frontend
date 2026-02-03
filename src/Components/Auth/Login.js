import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "./authAPI";
import logo from "../../assets/logo.png";
import show from "../../assets/show.png";
import hide from "../../assets/hide.png";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = () => {
    dispatch(login({ email, password })).then((action) => {
      if (login.fulfilled.match(action)) {
        const user = action.payload.user;

        toast.success(`Welcome ${user.name}`);
        console.log(action.payload);

        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      } else {
        toast.error(action.payload || "Login failed");
      }
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="w-full px-3 h-full flex flex-col gap-4 items-center justify-center"
    >
      <img src={logo} alt="logo" className="w-96 h-fit" />
      <h3 className="text-xl font-bold">Login</h3>
      <InputText
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="text"
        required
        placeholder="Email ID or username"
        className="px-4 py-2 w-full max-w-[400px] border-2 border-black rounded-sm shadow-none"
      />
      <div className="px-2 w-full max-w-[400px] border-2 border-black rounded-sm flex items-center">
        <InputText
          type={showPassword ? "text" : "password"}
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-2 py-2 bg-transparent border-none shadow-none"
        />
        <img
          src={showPassword ? show : hide}
          alt="toggle password"
          onClick={() => setShowPassword(!showPassword)}
          className="h-[30px] w-[30px] cursor-pointer"
        />
      </div>
      <Button
        type="submit"
        label="Log In"
        className="px-4 py-2 text-white bg-blue-800 border rounded-lg"
      />
    </form>
  );
}
