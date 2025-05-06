import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import apiService from "@/apiService/apiService";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";

const steps = ["Basic Info", "Profile Media", "More Details"];

const EditProfileForm = ({ profile, onClose, onProfileUpdated }) => {
  const [step, setStep] = useState(0);
  const [profilePicture, setProfilePicture] = useState(null);
  const [coverPicture, setCoverPicture] = useState(null);

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
          description: res?.message || "Please check your inputs",
          variant: "error",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Update failed",
        description: err.message || "An unexpected error occurred",
        variant: "error",
      });
    }
  };

  useEffect(() => {
    setProfilePicture(profile?.profile?.profile_picture);
    setCoverPicture(profile?.profile?.cover_picture);
  }, [profile]);

  return (
    <div className="w-full mx-auto bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-4">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Edit Profile
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Update your personal information
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 h-0.5 w-full bg-gray-200 dark:bg-gray-700 -z-10"></div>
            {steps.map((label, index) => (
              <div key={index} className="flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                    ${
                      step === index
                        ? "bg-primary text-white border-2 border-primary"
                        : step > index
                        ? "bg-green-100 text-green-600 border-2 border-green-500"
                        : "bg-gray-100 text-gray-600 border-2 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                    }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${
                    step === index
                      ? "text-primary dark:text-primary-light"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Media */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b pb-2">
                Profile Media
              </h3>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Profile Picture
                    </label>
                    {profilePicture && (
                      <div className="flex items-center space-x-4">
                        <img
                          src={profilePicture}
                          alt="Current Profile"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        />
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Current profile picture
                        </div>
                      </div>
                    )}
                    <div className="mt-2">
                      <label className="flex flex-col items-center px-4 py-3 bg-white dark:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <span className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                          {form.profile_picture
                            ? form.profile_picture.name
                            : "Click to upload new profile picture"}
                        </span>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Cover Picture
                    </label>
                    {coverPicture && (
                      <div className="space-y-2">
                        <img
                          src={coverPicture}
                          alt="Current Cover"
                          className="w-full h-40 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                        />
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Current cover picture
                        </div>
                      </div>
                    )}
                    <div className="mt-2">
                      <label className="flex flex-col items-center px-4 py-3 bg-white dark:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <span className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                          {form.cover_picture
                            ? form.cover_picture.name
                            : "Click to upload new cover picture"}
                        </span>
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
            </div>
          )}

          {/* Step 3: More Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b pb-2">
                Additional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Marital Status
                  </label>
                  <select
                    name="marital_status"
                    value={form.marital_status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={form.phone_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Education
                  </label>
                  <input
                    type="text"
                    name="education"
                    value={form.education}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Work
                  </label>
                  <input
                    type="text"
                    name="work"
                    value={form.work}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          {step > 0 ? (
            <Button
              variant="outline"
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-2"
            >
              Back
            </Button>
          ) : (
            <div></div> // Empty div to maintain space
          )}

          {step < steps.length - 1 ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2"
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-primary hover:bg-primary-dark"
            >
              Save Changes
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfileForm;
