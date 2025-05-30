import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import apiService from "@/apiService/apiService";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Spinner } from "../ui/Spinner";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";

const steps = ["Basic Info", "Profile Media", "More Details"];

const EditProfileForm = ({ profile, onClose, onProfileUpdated }) => {
  const [step, setStep] = useState(0);
  const [profilePicture, setProfilePicture] = useState(null);
  const [coverPicture, setCoverPicture] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    username: profile?.username || "",
    bio: profile?.profile?.bio || "",
    gender: profile?.profile?.gender || "",
    marital_status: profile?.profile?.marital_status || "",
    country: profile?.profile?.country || "",
    city: profile?.profile?.city || "",
    phone_number: profile?.profile?.phone_number || "",
    date_of_birth: profile?.profile?.date_of_birth || "",
    education: profile?.profile?.education || "",
    work: profile?.profile?.work || "",
    profile_picture: null,
    cover_picture: null,
  });

  const { user } = useUser();
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("user.first_name", form.first_name);
    formData.append("user.last_name", form.last_name);
    formData.append("user.username", form.username);

    formData.append("bio", form.bio);
    formData.append("gender", form.gender);
    formData.append("marital_status", form.marital_status);
    formData.append("country", form.country);
    formData.append("city", form.city);
    formData.append("phone_number", form.phone_number);
    formData.append("date_of_birth", form.date_of_birth);
    formData.append("education", form.education);
    formData.append("work", form.work);

    if (form.profile_picture) {
      formData.append("profile_picture", form.profile_picture);
    }

    if (form.cover_picture) {
      formData.append("cover_picture", form.cover_picture);
    }

    try {
      setLoading(true);
      const token = user?.access || null;
      const res = await apiService.put(
        "/accounts/update_profile/",
        formData,
        token
      );

      if (res?.status_code == 200) {
        onClose();
        toast({ title: "Profile updated successfully", variant: "success" });
        onProfileUpdated(res?.data);
      } else {
        toast({
          title: "Update failed",
          description: res?.data?.user?.username || "Please check your inputs",
          variant: "error",
        });
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Update failed",
        description:
          err?.data?.user?.username || "An unexpected error occurred",
        variant: "error",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    setProfilePicture(profile?.profile?.profile_picture);
    setCoverPicture(profile?.profile?.cover_picture);
  }, [profile]);

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Write something about yourself"
                  className="resize-none h-24"
                />
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                {profilePicture && (
                  <div className="flex items-center space-x-4">
                    <img
                      src={profilePicture}
                      alt="Current Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <p className="text-sm text-gray-500">
                      Current profile picture
                    </p>
                  </div>
                )}
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG or JPEG (MAX. 800x400px)
                      </p>
                    </div>
                    <input
                      type="file"
                      name="profile_picture"
                      onChange={handleChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cover Picture</Label>
                {coverPicture && (
                  <div className="flex items-center space-x-4">
                    <img
                      src={coverPicture}
                      alt="Current Cover"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <p className="text-sm text-gray-500">
                      Current cover picture
                    </p>
                  </div>
                )}
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG or JPEG (MAX. 1920x1080px)
                      </p>
                    </div>
                    <input
                      type="file"
                      name="cover_picture"
                      onChange={handleChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  name="gender"
                  value={form.gender}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="marital_status">Marital Status</Label>
                <Select
                  name="marital_status"
                  value={form.marital_status}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, marital_status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="Enter your country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={form.date_of_birth}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  name="education"
                  value={form.education}
                  onChange={handleChange}
                  placeholder="Enter your education"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="work">Work</Label>
                <Input
                  id="work"
                  name="work"
                  value={form.work}
                  onChange={handleChange}
                  placeholder="Enter your work"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 h-0.5 w-full bg-gray-200 -z-10"></div>
          {steps.map((label, index) => (
            <button
              key={index}
              onClick={() => setStep(index)}
              className="flex flex-col items-center z-10"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  step === index
                    ? "bg-blue-600 text-white"
                    : step > index
                    ? "bg-green-100 text-green-600 border-2 border-green-500"
                    : "bg-gray-100 text-gray-600 border-2 border-gray-300"
                )}
              >
                {step > index ? "✓" : index + 1}
              </div>
              <span
                className={cn(
                  "mt-2 text-sm font-medium",
                  step === index ? "text-blue-600" : "text-gray-500"
                )}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="mt-8">{renderStepContent()}</div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => step > 0 && setStep(step - 1)}
          disabled={step === 0}
        >
          Previous
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {step === steps.length - 1 ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? <Spinner /> : "Save Changes"}
            </Button>
          ) : (
            <Button type="button" onClick={() => setStep(step + 1)}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfileForm;
