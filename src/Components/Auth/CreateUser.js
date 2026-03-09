import { ArrowLeft, Plus, Trash2, Verified } from "lucide-react";
import { Button } from "../../ui/buttons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/Card";
import { InputOtp } from "primereact/inputotp";
import { useCallback, useEffect, useState } from "react";
import { Label } from "@radix-ui/react-label";
import { InputText } from "primereact/inputtext";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserById,
  createUser,
  resendOTP,
  sendOTP,
  updateUser,
  verifyOTP,
} from "./authAPI";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import show from "../../assets/show.png";
import hide from "../../assets/hide.png";
import { State, City } from "country-state-city";
import { Editor } from "primereact/editor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { fetchPlans } from "../SubscriptionPlan/subscriptionAPI";
import { fetchCategory } from "../CategoryManagement/categoriesAPI";
import BASEURL from "../../BaseUrl";

export default function CreateUser() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { userById, loadingFetch, errorFetch } = useSelector(
    (state) => state.users,
  );
  const { categories, subCategories } = useSelector((s) => s.category);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const fetchUserDetails = useCallback(() => {
    if (userId) dispatch(fetchUserById(userId));
  }, [dispatch, userId]);

  // 👇 useEffect will only run once and call the fetch function
  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const [showPassword, setShowPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    mobile: "",
    whatsappMobile: "",
    website: "",
    username: "",
    password: "",
    address: "",
    state: "",
    city: "",
    serviceState: [],
    about: "",
    emailVerified: false,
    subscription: null,
    profileLogo: null, // File
    bannerImage: null, // File
    category: [],
    subCategories: [],
  });
  const [catalogues, setCatalogues] = useState([]); // [{ pdf: File/URL, banner: File/URL }]
  const { plans } = useSelector((state) => state.plan);
  const [otp, setOTP] = useState("");
  const [states, setStates] = useState([]);
  const [serviceArea, setServiceArea] = useState([]);
  const [cities, setCities] = useState([]);
  const [location, navigate] = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [workingSchedule, setWorkingSchedule] = useState({
    days: [], // ["Monday", "Tuesday", "Friday"]
    from: "09:00",
    to: "18:30",
  });

  useEffect(() => {
    dispatch(fetchCategory());
  }, [dispatch]);

  const fetchSubCategoriesForCategories = useCallback(
    async (categoryIds) => {
      const mergedSubCategories = [];

      for (const catId of categoryIds) {
        try {
          const response = await fetch(
            `${BASEURL}/api/get-subCategories/${catId}`,
          );
          const data = await response.json();
          if (Array.isArray(data)) {
            data.forEach((sc) => {
              const catName =
                categories.find((c) => c._id === catId)?.name || "";
              mergedSubCategories.push({
                label: `${sc.name} (${catName})`,
                value: sc._id,
              });
            });
          }
        } catch (error) {
          console.error("Failed to fetch sub-category:", error);
        }
      }

      return mergedSubCategories;
    },
    [categories], // ✅ depends only on categories array
  );

  const handleCategorySelect = async (categoryIds) => {
    setFormData((prev) => ({ ...prev, category: categoryIds }));
    const mergedSubCategories =
      await fetchSubCategoriesForCategories(categoryIds);
    setAvailableSubCategories(mergedSubCategories);
  };

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  useEffect(() => {
    if (location === "/create-user") {
      setFormData({
        name: "",
        contactPerson: "",
        email: "",
        mobile: "",
        whatsappMobile: "",
        website: "",
        username: "",
        password: "",
        address: "",
        state: "", // store ISO code for dropdown selection
        city: "",
        serviceState: [],
        about: "",
        emailVerified: false,
        subscription: null,
        profileLogo: null, // File
        bannerImage: null, // File
        category: [],
        subCategories: [],
      });
    } else if (location.startsWith("/edit-user") && userById.name) {
      const stateObj = State.getStatesOfCountry("IN").find(
        (s) => s.name === userById.state,
      );
      const stateCode = stateObj ? stateObj.isoCode : "";
      // Populate cities for the selected state
      const citiesList = stateCode
        ? City.getCitiesOfState("IN", stateCode).map((c) => ({
            label: c.name,
            value: c.name,
          }))
        : [];
      setCities(citiesList);
      setFormData({
        name: userById.name || "",
        contactPerson: userById.contactPerson || "",
        email: userById.email || "",
        mobile: userById.mobile || "",
        whatsappMobile: userById.whatsappMobile || "",
        website: userById.website || "",
        username: userById.username || "",
        password: "",
        address: userById.address || "",
        state: stateCode, // store ISO code for dropdown selection
        city: userById.city || "",
        serviceState: userById.serviceState || [],
        about: userById.about || "",
        emailVerified: userById.emailVerified || false,
        subscription: userById.subscription?._id || null,
        profileLogo: userById.profileLogo || null, // File
        bannerImage: userById.bannerImage || null, // File
        category: userById.category || [],
        subCategories: userById.subCategories || [],
      });
      setWorkingSchedule(
        userById.workingSchedule || {
          days: [],
          from: "09:00",
          to: "18:30",
        },
      );
      setCatalogues(
        (userById.catalogues || []).map((c) => ({
          pdf: c.pdf || null,
          banner: c.banner || null,
        })),
      );
    }
  }, [location, userById]);

  useEffect(() => {
    if (userById.name && userById.category?.length) {
      (async () => {
        const subCats = await fetchSubCategoriesForCategories(
          userById.category,
        );
        setAvailableSubCategories(subCats);
        // Also prefill selected subCategories if any
        setFormData((prev) => ({
          ...prev,
          subCategories: userById.subCategories || [],
        }));
      })();
    }
  }, [userById, categories, fetchSubCategoriesForCategories]);

  const handleOnChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "email" && { emailVerified: false }),
    }));
  };

  const toggleDay = (day) => {
    setWorkingSchedule((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleTimeChange = (field, value) => {
    setWorkingSchedule((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    // Load Indian states on mount
    const indianStates = State.getStatesOfCountry("IN").map((s) => ({
      label: s.name,
      value: s.name,
    }));
    setStates(
      State.getStatesOfCountry("IN").map((s) => ({
        label: s.name,
        value: s.isoCode, // for main State dropdown only
      })),
    );
    setServiceArea([
      { label: "Pan India", value: "Pan India" }, // ✅ extra option
      ...indianStates,
    ]);
  }, []);

  const handleStateChange = (e) => {
    const selectedStateCode = e.value;
    setFormData((prev) => ({ ...prev, state: selectedStateCode, city: null }));
    const citiesList = City.getCitiesOfState("IN", selectedStateCode).map(
      (c) => ({
        label: c.name,
        value: c.name,
      }),
    );
    setCities(citiesList);
  };

  const handleCityChange = (e) => {
    setFormData((prev) => ({ ...prev, city: e.value }));
  };

  const handleServiceStateChange = (e) => {
    if (e.value.includes("Pan India")) {
      setFormData((prev) => ({
        ...prev,
        serviceState: ["Pan India"], // override everything
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        serviceState: e.value, // multiple state names
      }));
    }
  };

  const customInput = ({ events, props }) => (
    <input {...events} {...props} type="text" className="custom-otp-input" />
  );

  const handleShowPassword = () => {
    if (showPassword) {
      setShowPassword(false);
    } else {
      setShowPassword(true);
    }
  };

  const subscriptionOptions = plans.map((plan) => ({
    label: `${plan.name} (₹${plan.amount})`,
    value: plan._id,
  }));

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
      setIsSaving(true);
      try {
        const actionResult = await dispatch(verifyOTP({ email, otp }));
        if (verifyOTP.fulfilled.match(actionResult)) {
          toast.success("OTP verified!");
          setFormData((prev) => ({
            ...prev,
            emailVerified: true,
          }));
          setDialogOpen(false);
          return;
        }
        toast.error(actionResult.payload || "Something went wrong");
      } catch (error) {
        toast.error("An error occurred while sending OTP.");
      } finally {
        setIsSaving(false); // ✅ STOP LOADER
      }
    },
    [dispatch],
  );

  const handleAction = (email) => {
    setDialogOpen(true);
    handleSendOTP(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.emailVerified) {
      toast.info("Please verify your email Id");
      return;
    }
    for (let i = 0; i < catalogues.length; i++) {
      if (!catalogues[i].pdf || !catalogues[i].banner) {
        toast.error(`Catalogue ${i + 1} must have both PDF and Banner`);
        return;
      }
    }
    const selectedState = State.getStatesOfCountry("IN").find(
      (s) => s.isoCode === formData.state,
    );
    const finalFormData = {
      ...formData,
      state: selectedState ? selectedState.name : formData.state,
      workingSchedule,
    };
    setIsSaving(true);

    const formDataToSend = new FormData();
    const existingCatalogues = catalogues
      .filter((c) => typeof c.pdf === "string" && typeof c.banner === "string")
      .map((c) => ({
        pdf: c.pdf,
        banner: c.banner,
      }));

    formDataToSend.append(
      "existingCatalogues",
      JSON.stringify(existingCatalogues),
    );

    catalogues.forEach((item) => {
      if (item.pdf instanceof File) {
        formDataToSend.append("cataloguePdf", item.pdf);
      }
      if (item.banner instanceof File) {
        formDataToSend.append("catalogueBanner", item.banner);
      }
    });

    // FILES — IMPORTANT
    if (formData.profileLogo) {
      formDataToSend.append("profileLogo", formData.profileLogo);
    }

    if (formData.bannerImage) {
      formDataToSend.append("bannerImage", formData.bannerImage);
    }
    // Append other fields
    Object.entries(finalFormData).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      if (key === "profileLogo" || key === "bannerImage") return;

      if (Array.isArray(value) || typeof value === "object") {
        formDataToSend.append(key, JSON.stringify(value)); // ✅ includes subCategories
      } else {
        formDataToSend.append(key, value);
      }
    });

    if (userById.name) {
      formDataToSend.delete("password");
      dispatch(
        updateUser({
          id: userById._id,
          formData: formDataToSend,
        }),
      )
        .then((action) => {
          if (action.error) {
            toast.error(action.error.message || "An error occurred");
          } else {
            toast.success("User updated successfully");
            navigate("/user-management");
          }
        })
        .catch(() => toast.error("An error occurred"))
        .finally(() => setIsSaving(false));
    } else {
      try {
        const actionResult = await dispatch(createUser(formDataToSend));
        if (createUser.rejected.match(actionResult)) {
          toast.error(actionResult.payload || "Something went wrong");
        } else {
          toast.success("User created successfully!");
          setFormData({
            name: "",
            contactPerson: "",
            email: "",
            mobile: "",
            whatsappMobile: "",
            website: "",
            username: "",
            password: "",
            address: "",
            state: "",
            city: "",
            serviceState: [],
            about: "",
            emailVerified: false,
            subscription: null,
            profileLogo: null, // File
            bannerImage: null, // File
            catalogues: [],
          });
          navigate("/user-management");
        }
      } catch (error) {
        console.error("Error creating user:", error);
        toast.error("An error occurred while creating the user.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const editorHeader = (
    <span className="ql-formats">
      <select className="ql-header">
        <option value="1"></option>
        <option value="2"></option>
        <option selected></option>
      </select>
      <button className="ql-bold"></button>
      <button className="ql-italic"></button>
      <button className="ql-underline"></button>
      <button className="ql-list" value="ordered"></button>
      <button className="ql-list" value="bullet"></button>
      <button className="ql-link"></button>
      {/* ❌ no image button */}
    </span>
  );

  if (userId && loadingFetch) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-gray-600 text-lg">Loading user details...</span>
      </div>
    );
  }

  if (userId && errorFetch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-red-600 font-medium">Failed to load user details</p>
        <p className="text-sm text-gray-500">{errorFetch}</p>
        <Button onClick={() => fetchUserDetails()}>Retry</Button>
      </div>
    );
  }

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
            {userById.name
              ? `Edit Profile ${userById.name}`
              : "Create New User"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {userById.name
              ? "Edit a User to your system"
              : "Add a new User to your system under you"}
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            {userById.name
              ? "Edit the details you want to edit"
              : "Enter the details for the new user"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="w-full flex flex-col gap-1 px-3">
                <Label>Profile Logo (1:1)</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleOnChange("profileLogo", e.target.files[0])
                  }
                />
                <p className="text-xs text-gray-500">
                  Recommended size: <b>512 x 512</b>
                </p>
                {typeof formData.profileLogo === "string" && (
                  <img
                    src={`${formData.profileLogo}`}
                    alt="Profile Logo"
                    className="w-28 h-28 object-cover rounded-full border"
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                  />
                )}
              </div>
              <div className="flex flex-col lg:flex-row gap-3 w-full">
                <div className="w-full flex flex-col gap-1">
                  <Label htmlFor="name" className="px-3">
                    Name <span className="text-red-600">*</span>
                  </Label>
                  <InputText
                    type="text"
                    placeholder="Enter name"
                    value={formData.name}
                    required
                    name="name"
                    id="name"
                    onChange={(e) => handleOnChange("name", e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none shadow-none bg-input"
                  />
                </div>
                <div className="w-full flex flex-col gap-1">
                  <Label htmlFor="contactPerson" className="px-3">
                    Contact Person Name <span className="text-red-600">*</span>
                  </Label>
                  <InputText
                    type="text"
                    placeholder="Enter Contact Person"
                    value={formData.contactPerson}
                    required
                    name="contactPerson"
                    id="contactPerson"
                    onChange={(e) =>
                      handleOnChange("contactPerson", e.target.value)
                    }
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none shadow-none bg-input"
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-3 w-full">
                <div className="w-full flex flex-col gap-1">
                  <Label htmlFor="email" className="px-3">
                    Email <span className="text-red-600">*</span>
                  </Label>
                  <div className="flex gap-2 items-center w-full">
                    <InputText
                      type="email"
                      placeholder="Enter Email"
                      value={formData.email}
                      required
                      name="email"
                      id="email"
                      onChange={(e) => handleOnChange("email", e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none shadow-none bg-input"
                    />
                    <Button
                      variant={formData.emailVerified ? "green" : "default"}
                      disabled={formData.emailVerified}
                      onClick={() => handleAction(formData.email)}
                    >
                      {formData.emailVerified ? `Verified` : "Verify"}
                      {formData.emailVerified ? <Verified /> : <></>}
                    </Button>
                  </div>
                </div>
                <div className="w-full flex flex-col gap-1">
                  <Label className="px-3">
                    Mobile Number <span className="text-red-600">*</span>
                  </Label>
                  <InputText
                    required
                    type="tel"
                    value={formData.mobile}
                    minLength={10}
                    maxLength={10}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, ""); // Remove all non-digits
                      handleOnChange("mobile", digitsOnly);
                    }}
                    placeholder="Enter Mobile Number"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none shadow-none bg-input"
                  />
                </div>
                <div className="w-full flex flex-col gap-1">
                  <Label className="px-3">
                    Whatsapp Mobile Number{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <InputText
                    required
                    type="tel"
                    value={formData.whatsappMobile}
                    minLength={10}
                    maxLength={10}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, ""); // Remove all non-digits
                      handleOnChange("whatsappMobile", digitsOnly);
                    }}
                    placeholder="Enter Whatsapp Mobile Number"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none shadow-none bg-input"
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-3 w-full">
                <div className="w-full flex flex-col gap-1">
                  <Label htmlFor="website" className="px-3">
                    website <span className="text-red-600">*</span>
                  </Label>
                  <InputText
                    type="text"
                    placeholder="Enter Website Link"
                    name="website"
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleOnChange("website", e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none shadow-none bg-input"
                  />
                </div>
                <div className="w-full flex flex-col gap-1">
                  <Label htmlFor="username" className="px-3">
                    Username <span className="text-red-600">*</span>
                  </Label>
                  <InputText
                    type="text"
                    placeholder="Enter Username"
                    required
                    name="username"
                    id="username"
                    disabled={user?.parentId}
                    value={formData.username}
                    onChange={(e) => handleOnChange("username", e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none shadow-none bg-input"
                  />
                </div>
                <div className="w-full flex flex-col gap-1">
                  <Label className="px-3">Subscription Plan</Label>
                  <Dropdown
                    placeholder="Select Subscription Plan"
                    options={subscriptionOptions}
                    value={formData.subscription}
                    onChange={(e) => handleOnChange("subscription", e.value)}
                    disabled={user?.parentId}
                    checkmark
                    className="w-full px-1 text-sm border border-gray-300 rounded-md bg-input shadow-none"
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-3 w-full">
                <div className="w-full flex flex-col gap-1">
                  <Label htmlFor={"Category"} className="px-3">
                    Category
                  </Label>

                  <MultiSelect
                    placeholder="Select Categories"
                    options={categories.map((sc) => ({
                      label: sc.name,
                      value: sc._id,
                    }))}
                    value={formData.category}
                    onChange={(e) => handleCategorySelect(e.value)}
                    checkmark
                    showSelectAll
                    selectAllLabel="Select All"
                    maxSelectedLabels={3}
                    className="w-full px-1 text-sm border border-gray-300 rounded-md bg-input shadow-none"
                  />
                </div>
                <div className="w-full flex flex-col gap-1">
                  <Label htmlFor={subCategories} className="px-3">
                    Sub-Categories
                  </Label>
                  <MultiSelect
                    placeholder="Select Sub-Categories"
                    options={availableSubCategories}
                    value={formData.subCategories}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        subCategories: e.value,
                      }))
                    }
                    checkmark
                    showSelectAll
                    maxSelectedLabels={3}
                    selectAllLabel="Select All"
                    className="w-full px-1 text-sm border border-gray-300 rounded-md bg-input shadow-none"
                  />
                </div>
              </div>
              {!userById.name && (
                <div className="flex flex-col gap-1">
                  <Label htmlFor="password" className="px-3">
                    Password <span className="text-red-600">*</span>
                  </Label>
                  <div className="w-full flex px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none bg-input">
                    <InputText
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter New Password"
                      value={formData.password}
                      onChange={(e) =>
                        handleOnChange("password", e.target.value)
                      }
                      required
                      name="password"
                      id="password"
                      className="w-full focus:outline-none shadow-none bg-input"
                    />
                    <img
                      src={showPassword ? show : hide}
                      alt="admin"
                      onClick={handleShowPassword}
                      title="icon"
                      className="h-[16px] w-[16px]"
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-col lg:flex-row gap-3 w-full">
                <div className="w-full flex flex-col gap-1">
                  <Label htmlFor="address" className="px-3">
                    Address
                  </Label>
                  <InputText
                    type="text"
                    placeholder="Enter Address"
                    value={formData.address}
                    name="address"
                    id="address"
                    onChange={(e) => handleOnChange("address", e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none shadow-none bg-input"
                  />
                </div>
                <div className="w-full flex flex-col gap-1">
                  <Label className="px-3">State</Label>
                  <Dropdown
                    placeholder="Select State"
                    options={states}
                    checkmark
                    filter
                    onChange={handleStateChange}
                    value={formData.state}
                    className="w-full px-1 text-sm border border-gray-300 rounded-md focus:outline-none shadow-none bg-input"
                  />
                </div>
                <div className="w-full flex flex-col gap-1">
                  <Label className="px-3">City</Label>
                  <Dropdown
                    placeholder="Select City"
                    value={formData.city}
                    options={cities}
                    checkmark
                    filter
                    onChange={handleCityChange}
                    className="w-full px-1 text-sm border border-gray-300 rounded-md focus:outline-none shadow-none bg-input"
                  />
                </div>
              </div>
              <div className="w-full flex flex-col gap-3">
                <Label className="px-3">Working Schedule</Label>
                {/* Working Days */}
                <div className="flex flex-wrap gap-2 px-3">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1 text-sm rounded-md border 
                        ${
                          workingSchedule.days.includes(day)
                            ? "bg-primary text-white border-primary"
                            : "bg-white border-gray-300"
                        }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
                {/* Time Range */}
                <div className="flex items-center gap-3 px-3">
                  <InputText
                    type="time"
                    value={workingSchedule.from}
                    onChange={(e) => handleTimeChange("from", e.target.value)}
                    className="w-32 px-2 py-1.5 border border-gray-300 rounded-md"
                  />
                  <span className="text-sm">to</span>
                  <InputText
                    type="time"
                    value={workingSchedule.to}
                    onChange={(e) => handleTimeChange("to", e.target.value)}
                    className="w-32 px-2 py-1.5 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="w-full flex flex-col gap-1">
                <Label className="px-3">
                  Service States <span className="text-red-600">*</span>
                </Label>
                <MultiSelect
                  placeholder="Select Service State"
                  required
                  options={serviceArea}
                  value={formData.serviceState}
                  onChange={handleServiceStateChange}
                  filter
                  checkmark
                  className="w-full px-1 text-sm border border-gray-300 rounded-md focus:outline-none shadow-none bg-input"
                />
              </div>
              <div className="w-full px-3 flex flex-col gap-1">
                <Label>Banner Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleOnChange("bannerImage", e.target.files[0])
                  }
                />
                <p className="text-xs text-gray-500">
                  Recommended size: <b>1920 x 485</b>
                </p>
                {typeof formData.bannerImage === "string" && (
                  <a
                    href={`${formData.bannerImage}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary text-xs underline"
                  >
                    View Banner Image
                  </a>
                )}
              </div>
              <div className="w-full px-3 flex items-start justify-center flex-col gap-3">
                <Label>Catalogues</Label>
                {catalogues.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    {/* PDF Upload */}
                    <div className="flex flex-col">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setCatalogues((prev) =>
                            prev.map((c, i) =>
                              i === idx ? { ...c, pdf: file } : c,
                            ),
                          );
                        }}
                      />
                      <span className="text-xs text-gray-500">Upload PDF</span>
                    </div>
                    {typeof item.pdf === "string" && (
                      <a
                        href={`${item.pdf}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary text-xs underline"
                      >
                        View PDF
                      </a>
                    )}
                    {/* Banner Upload */}
                    <div className="flex flex-col">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setCatalogues((prev) =>
                            prev.map((c, i) =>
                              i === idx ? { ...c, banner: file } : c,
                            ),
                          );
                        }}
                      />
                      <span className="text-xs text-gray-500">
                        Upload Banner (Recommended size: <b>430 x 500</b>)
                      </span>
                    </div>
                    {typeof item.banner === "string" && (
                      <a
                        href={`${item.banner}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary text-xs underline"
                      >
                        View Image
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setCatalogues((prev) =>
                          prev.filter((_, i) => i !== idx),
                        )
                      }
                      className="text-red-500"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                ))}
                <Button
                  onClick={() =>
                    setCatalogues((prev) => [
                      ...prev,
                      { pdf: null, banner: null },
                    ])
                  }
                >
                  <Plus />
                  Add Catalogue
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="w-full flex flex-col gap-1">
                <Label className="px-3">About Brand</Label>
                <Editor
                  value={formData.about}
                  onTextChange={(e) => handleOnChange("about", e.htmlValue)}
                  headerTemplate={editorHeader}
                  className="w-full focus:outline-none shadow-none bg-input"
                  style={{ height: "320px" }}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-end border-t pt-6">
            <Link href="/user-management">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <div className="w-fit flex flex-col lg:flex-row gap-5 items-center">
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? userById.name
                    ? "Updating..."
                    : "Creating..."
                  : userById.name
                    ? "Update User"
                    : "Create User"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[90%] lg:max-w-[40%]">
          <DialogHeader>
            <DialogTitle>Verfiy {formData?.email}</DialogTitle>
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
                onClick={() => handleReSendOTP(formData.email)}
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
                onClick={() => handleVerifyOTP(formData.email, otp)}
                variant="green"
                disabled={isSaving}
              >
                {isSaving ? "Verifying" : "Verify"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
