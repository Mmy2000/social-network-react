import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import apiService from "@/apiService/apiService";
import { Loader } from "lucide-react";
import Stepper from "@/components/ui/stepper";

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  open,
  onClose,
}) => {
  const { toast } = useToast();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    start_time: "",
    end_time: "",
    is_public: "true",
    image: null as File | null,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      start_time: "",
      end_time: "",
      is_public: "true",
      image: null,
    });
    setStep(1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const createEventMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiService.postNewPost("/events/", data, user?.access);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Success",
        description: "Event created successfully",
        variant: "success",
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create event",
        variant: "error",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "error",
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("start_time", formData.start_time);
    formDataToSend.append("end_time", formData.end_time);
    formDataToSend.append("is_public", formData.is_public);

    if (formData.image instanceof File) {
      formDataToSend.append("image", formData.image);
    }

    createEventMutation.mutate(formDataToSend);
  };

  const steps = [
    {
      label: "Basic Info",
      description: "Event details",
    },
    {
      label: "Schedule",
      description: "Date and time",
    },
    {
      label: "Settings",
      description: "Privacy and image",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            <Stepper steps={steps} currentStep={step} />
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter Event Title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="What's your event about?"
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="Event location"
                />
              </div>
            </>
          )}

          {/* Step 2: Schedule */}
          {step === 2 && (
            <div className="flex flex-col gap-4 md:flex-row md:gap-2">
              <div className="space-y-2 w-full">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      start_time: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      end_time: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          )}

          {/* Step 3: Privacy & Image */}
          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="privacy">Privacy</Label>
                <Select
                  value={formData.is_public}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, is_public: value }))
                  }
                >
                  <SelectTrigger className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                    <SelectValue placeholder="Select privacy setting" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                    <SelectItem value="true">Public</SelectItem>
                    <SelectItem value="false">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Cover Image</Label>
                <Input
                  id="image"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
              disabled={step === 1}
              className="dark:bg-gray-800 dark:text-gray-300"
            >
              Back
            </Button>

            {step < totalSteps ? (
              <Button
                type="button"
                onClick={() =>
                  setStep((prev) => Math.min(prev + 1, totalSteps))
                }
                className="bg-facebook text-white hover:bg-facebook-dark"
              >
                Next
              </Button>
            ) : (
              <form onSubmit={handleSubmit}>
                <Button
                  type="submit"
                  disabled={createEventMutation.isPending}
                  className="min-w-[100px] bg-facebook text-white hover:bg-facebook-dark"
                >
                  {createEventMutation.isPending ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventModal;
