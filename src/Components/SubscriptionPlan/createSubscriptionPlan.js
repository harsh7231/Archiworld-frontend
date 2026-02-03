import { ArrowLeft } from "lucide-react";
import { Button } from "../../ui/buttons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/Card";
import { useEffect, useMemo, useState } from "react";
import { Label } from "@radix-ui/react-label";
import { InputText } from "primereact/inputtext";
import { Link, useLocation } from "wouter";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import {
  createSubscriptionPlan,
  updateSubscriptionPlan,
} from "./subscriptionAPI";

export default function CreateSubscriptionPlan() {
  const parsedPlanToEdit = useMemo(() => {
    const stored = localStorage.getItem("subscriptionPlanToEdit");
    return stored ? JSON.parse(stored) : null;
  }, []);

  const [location, navigate] = useLocation();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    priority: "",
  });

  useEffect(() => {
    if (location === "/create-subscription") {
      localStorage.removeItem("subscriptionPlanToEdit");
      setFormData({ name: "", amount: "", priority: "" });
    }

    if (location === "/edit-subscription" && parsedPlanToEdit) {
      setFormData({
        name: parsedPlanToEdit.name || "",
        amount: parsedPlanToEdit.amount || "",
        priority: parsedPlanToEdit.priority || "",
      });
    }
  }, [location, parsedPlanToEdit]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.amount || !formData.priority) {
      toast.error("All fields are required");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      amount: Number(formData.amount),
      priority: Number(formData.priority),
    };

    try {
      if (parsedPlanToEdit) {
        const result = await dispatch(
          updateSubscriptionPlan({
            id: parsedPlanToEdit._id,
            formData: payload,
          })
        );

        if (!updateSubscriptionPlan.fulfilled.match(result)) {
          toast.error(result.payload);
          return;
        }

        toast.success("Subscription plan updated");
      } else {
        const result = await dispatch(createSubscriptionPlan(payload));

        if (!createSubscriptionPlan.fulfilled.match(result)) {
          toast.error(result.payload);
          return;
        }

        toast.success("Subscription plan created");
      }

      navigate("/subscription-management");
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div>
      {/* Header */}
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
            {parsedPlanToEdit ? "Edit Subscription Plan" : "Create Subscription Plan"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage plan priority for product listing
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
          <CardDescription>
            {parsedPlanToEdit
              ? "Update subscription plan details"
              : "Create a new subscription plan"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Plan Name */}
              <div className="flex flex-col gap-1">
                <Label className="px-3">
                  Plan Name <span className="text-red-600">*</span>
                </Label>
                <InputText
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Bronze / Gold / Diamond"
                  className="w-full px-3 py-1.5 border rounded-md bg-input"
                  required
                />
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1">
                <Label className="px-3">
                  Subscription Amount (₹) <span className="text-red-600">*</span>
                </Label>
                <InputText
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="4999"
                  className="w-full px-3 py-1.5 border rounded-md bg-input"
                  required
                />
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-1">
                <Label className="px-3">
                  Listing Priority <span className="text-red-600">*</span>
                </Label>
                <InputText
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                  placeholder="Priority 1 = better listing"
                  className="w-full px-3 py-1.5 border rounded-md bg-input"
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-6">
            <Link href="/subscription-management">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>

            <Button type="submit">
              {parsedPlanToEdit ? "Update Plan" : "Create Plan"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
