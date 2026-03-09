import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  login,
  resendOTP,
  sendOTP,
  verifyOTP,
  handleForgotPassword,
} from "./authAPI";
import logo from "../../assets/logo.png";
import show from "../../assets/show.png";
import hide from "../../assets/hide.png";
import { InputText } from "primereact/inputtext";
import { toast } from "react-toastify";
import { CircleAlert, CircleCheckBig, MoveLeft, Verified } from "lucide-react";
import { Button } from "../../ui/buttons";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Label } from "@radix-ui/react-label";
import { InputOtp } from "primereact/inputotp";

export default function Login() {
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerfied] = useState(false);
  const [password, setPassword] = useState("");
  const [otp, setOTP] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = () => {
    dispatch(login({ email, password })).then((action) => {
      if (login.fulfilled.match(action)) {
        const user = action.payload.user;

        toast.success(`Welcome ${user.name}`);
        console.log(action.payload);

        setTimeout(() => {
          navigate("/product-management");
        }, 3000);
      } else {
        toast.error(action.payload || "Login failed");
      }
    });
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAction = (email) => {
    if (!email || !isValidEmail(email)) {
      // show error toast / alert
      toast.error("Please enter a valid email address");
      return;
    }

    setDialogOpen(true);
    handleSendOTP(email);
  };

  const handleSendOTP = useCallback(
    async (email) => {
      try {
        const actionResult = await dispatch(sendOTP({ email }));
        if (sendOTP.fulfilled.match(actionResult)) {
          toast.success("OTP sent!");
          return;
        }
        toast.error(actionResult.payload || "Something went wrong");
      } catch (error) {
        toast.error("An error occurred while sending OTP.");
      }
    },
    [dispatch],
  );

  const handleReSendOTP = useCallback(
    async (email) => {
      try {
        const actionResult = await dispatch(resendOTP({ email }));
        if (resendOTP.fulfilled.match(actionResult)) {
          toast.success("OTP re-sent!");
          return;
        }
        toast.error(actionResult.payload || "Something went wrong");
      } catch (error) {
        toast.error("An error occurred while sending OTP.");
      }
    },
    [dispatch],
  );

  const handleVerifyOTP = useCallback(
    async (email, otp) => {
      try {
        const actionResult = await dispatch(verifyOTP({ email, otp }));
        if (verifyOTP.fulfilled.match(actionResult)) {
          toast.success("OTP verified!");
          setEmailVerfied(true);
          setDialogOpen(false);
          return;
        }
        toast.error(actionResult.payload || "Something went wrong");
      } catch (error) {
        toast.error("An error occurred while sending OTP.");
      }
    },
    [dispatch],
  );

  const handleResetPassword = useCallback(
    async (newPassword, confirmNewPassword) => {
      try {
        if (!emailVerified) {
          toast.info("Please verify email first");
          return;
        }
        if (!newPassword || !confirmNewPassword) {
          toast.info("Please enter new Password");
          return;
        }
        if (newPassword !== confirmNewPassword) {
          toast.info("Password should be same");
          return;
        }
        const actionResult = await dispatch(
          handleForgotPassword({ email, newPassword, otp }),
        );
        if (handleForgotPassword.fulfilled.match(actionResult)) {
          toast.success("Password reset successfully!");
          setEmailVerfied(false);
          setForgotPassword(false);
          setNewPassword("");
          setOTP("");
          setConfirmNewPassword("");
          return;
        }
        toast.error(actionResult.payload || "Failed to reset Password");
      } catch (error) {
        toast.error("An error occurred while resetting password");
      }
    },
    [dispatch, email, emailVerified, otp],
  );

  const customInput = ({ events, props }) => (
    <input {...events} {...props} type="text" className="custom-otp-input" />
  );

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="w-full px-3 h-full flex flex-col gap-4 items-center justify-center"
      >
        <img src={logo} alt="logo" className="w-96 h-fit" />
        <h3 className="text-xl font-bold">
          {forgotPassword ? "Reset Password" : "Login"}
        </h3>
        <div className="w-full max-w-[400px] flex gap-2 items-center just-fy-center">
          <InputText
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type={forgotPassword ? "email" : "text"}
            required
            disabled={emailVerified}
            placeholder={
              forgotPassword ? "Enter Email Id" : "Email ID or username"
            }
            className="px-4 w-full py-2 border-2 border-black rounded-sm shadow-none"
          />
          {forgotPassword && (
            <Button
              variant={emailVerified ? "green" : "default"}
              disabled={emailVerified}
              onClick={() => handleAction(email)}
            >
              {emailVerified ? `Verified` : "Verify"}
              {emailVerified ? <Verified /> : <></>}
            </Button>
          )}
        </div>
        <div className="w-full max-w-[400px] flex flex-col gap-2">
          {!forgotPassword && (
            <div className="px-2 border-2 border-black rounded-sm flex items-center">
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
          )}
          {!forgotPassword && (
            <p
              onClick={() => setForgotPassword(true)}
              className="text-blue-700 font-medium underline text-start"
            >
              Forgot Password?
            </p>
          )}
        </div>
        {emailVerified && (
          <div className="w-full max-w-[400px] flex flex-col gap-2">
            <div className="px-2 border-2 border-black rounded-sm flex items-center">
              <InputText
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                required
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full px-2 py-2 bg-transparent border-none shadow-none"
              />
              <img
                src={showNewPassword ? show : hide}
                alt="toggle password"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="h-[30px] w-[30px] cursor-pointer"
              />
            </div>
            <div className="px-2 border-2 border-black rounded-sm flex items-center">
              <InputText
                type={showConfirmNewPassword ? "text" : "password"}
                value={confirmNewPassword}
                required
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="w-full px-2 py-2 bg-transparent border-none shadow-none"
              />
              <img
                src={showConfirmNewPassword ? show : hide}
                alt="toggle password"
                onClick={() =>
                  setShowConfirmNewPassword(!showConfirmNewPassword)
                }
                className="h-[30px] w-[30px] cursor-pointer"
              />
            </div>
            <div>
              {newPassword &&
                confirmNewPassword &&
                (newPassword === confirmNewPassword ? (
                  <span className="text-green-600 flex items-center gap-2">
                    <CircleCheckBig className="w-4 h-4" />
                    Password Matched
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-2">
                    <CircleAlert className="w-4 h-4" />
                    Password Not matched
                  </span>
                ))}
            </div>
          </div>
        )}
        {!forgotPassword && <Button type="submit">Log In</Button>}
        {forgotPassword && (
          <div className="flex gap-2 justify-center items-center">
            <Button
              variant="ghost"
              onClick={() => {
                setEmailVerfied(false);
                setForgotPassword(false);
                setNewPassword("");
                setOTP("");
                setConfirmNewPassword("");
              }}
            >
              <MoveLeft />
              Back
            </Button>
            <Button
              onClick={() =>
                handleResetPassword(newPassword, confirmNewPassword)
              }
            >
              Reset
            </Button>
          </div>
        )}
      </form>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[90%] lg:max-w-[40%]">
          <DialogHeader>
            <DialogTitle>Verfiy {email}</DialogTitle>
            <div className="flex flex-col items-center gap-1 justify-center">
              <Label>
                Enter OTP <span className="text-red-600">*</span>
              </Label>
              <style scoped>
                {`
            .custom-otp-input {
              width: 30px;
              font-size: 20px;
              border: 0 none;
              appearance: none;
              text-align: center;
              transition: all 0.2s;
              background: transparent;
              border-radius: 2px;
              border: 1px solid var(--surface-500);
            }
            .custom-otp-input:focus {
              outline: none;
              border-color: var(--primary-color);
            }
          `}
              </style>
              <InputOtp
                value={otp}
                onChange={(e) => setOTP(e.value)}
                length={6}
                integerOnly
                style={{ gap: 2 }}
                inputTemplate={customInput}
              />
              <button
                onClick={() => handleReSendOTP(email)}
                className="text-primary underline-offset-4 hover:underline text-sm"
              >
                Resend OTP
              </button>
            </div>
          </DialogHeader>
          <DialogFooter>
            <div className="w-full lg:w-fit flex flex-wrap justify-center lg:items-center gap-2">
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  setOTP("");
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleVerifyOTP(email, otp)}
                variant="green"
              >
                Verify
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
