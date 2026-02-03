import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "./authAPI";
import show from "../../assets/show.png";
import hide from "../../assets/hide.png";
import { toast } from "react-toastify";
import { Button } from "../../ui/buttons";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/Card";
import { Label } from "@radix-ui/react-label";
import { InputText } from "primereact/inputtext";

export default function ChangePassword() {
  const dispatch = useDispatch();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const emailId = user.email;

  const handleShowNewPassword = () => {
    if (showNewPassword) {
      setShowNewPassword(false);
    } else {
      setShowNewPassword(true);
    }
  };

  const handleShowOldPassword = () => {
    if (showOldPassword) {
      setShowOldPassword(false);
    } else {
      setShowOldPassword(true);
    }
  };

  const handleOldPassword = (e) => {
    setOldPassword(e.target.value);
  };
  const handleNewPassword = (e) => {
    setNewPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailId || !oldPassword || !newPassword) {
      toast.error("Please fill all fields");
      return;
    }
    dispatch(changePassword({ email: emailId, oldPassword, newPassword }))
      .then((action) => {
        if (changePassword.fulfilled.match(action)) {
          toast.success("Password changed successfully!");
          setOldPassword("");
          setNewPassword("");
        } else {
          toast.error(action.payload);
        }
      })
      .catch((action) => {
        toast.error(action.payload);
      });
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          onClick={() => window.history.back()}
          variant="ghost"
          size="sm"
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Change your Password
          </h1>
          <p className="mt-1 text-sm text-gray-500">Change your password</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>
            Enter the details to change your password
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="flex flex-col gap-1 w-full">
              <Label htmlFor="oldPassword" className="px-3">
                Old Password
              </Label>
              <div className="w-full flex px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-input">
                <InputText
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Enter Old Password"
                  value={oldPassword}
                  required
                  name="oldPassword"
                  id="oldPassword"
                  onChange={handleOldPassword}
                  className="w-full focus:outline-none shadow-none bg-input"
                />
                <img
                  src={showOldPassword ? show : hide}
                  alt="admin"
                  onClick={handleShowOldPassword}
                  title="icon"
                  className="h-[16px] w-[16px]"
                />
              </div>
              <Label htmlFor="newPassword" className="px-3 mt-3">
                New Password
              </Label>
              <div className="w-full flex px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-input">
                <InputText
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={handleNewPassword}
                  required
                  name="newPassword"
                  id="newPassword"
                  className="w-full focus:outline-none shadow-none bg-input"
                />
                <img
                  src={showNewPassword ? show : hide}
                  alt="admin"
                  onClick={handleShowNewPassword}
                  title="icon"
                  className="h-[16px] w-[16px]"
                />
              </div>
            </div>
          </CardContent>
          {/* submit button */}
          <CardFooter className="flex justify-between border-t pt-6">
            <Link href="/user-management">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit">Change Password</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
