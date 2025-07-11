import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO, setHours, setMinutes } from "date-fns";
import {
  Calendar as CalendarIcon,
  Plus,
  X,
  Loader2,
  AlertTriangle,
  Users,
  Clock, // Added Clock icon
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select


const generateTimeOptions = () => {
  const options = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 15) { 
      const hour = i.toString().padStart(2, "0");
      const minute = j.toString().padStart(2, "0");
      options.push(`${hour}:${minute}`);
    }
  }
  return options;
};
const timeOptions = generateTimeOptions();

const formObjectSchema = z.object({
    raceName: z.string().min(3, {
      message: "Race name must be at least 3 characters.",
    }),
    description: z.string().optional(),
    startDate: z.date({
      required_error: "Start date is required.",
    }),
    startTime: z.string({ 
      required_error: "Start time is required.",
    }),
    endDate: z.date({
        required_error: "End date is required.",
    }),
    endTime: z.string({
      required_error: "End time is required.",
    }),
    segments: z.array(z.string()).min(1, {
      message: "At least one segment is required.",
    }),
    password: z.string().min(4, { message: "Password is required and must be at least 4 characters." }),
    hideLeaderboardUntilFinish: z.boolean().default(false),
    useSexCategories: z.boolean().default(false),
  });

const formSchema = formObjectSchema.superRefine((data, ctx) => {
    const [startHour, startMinute] = data.startTime.split(":").map(Number);
    const startDateTime = setMinutes(setHours(data.startDate, startHour), startMinute);

    const [endHour, endMinute] = data.endTime.split(":").map(Number);
    const endDateTime = setMinutes(setHours(data.endDate, endHour), endMinute);

    if (endDateTime <= startDateTime) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End date and time must be after start date and time.",
            path: ["endDate"], 
        });
         ctx.addIssue({ 
            code: z.ZodIssueCode.custom,
            message: "End date and time must be after start date and time.",
            path: ["endTime"],
        });
    }
});


type FormValues = z.infer<typeof formSchema>;

export default function CreateRaceForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [segmentInput, setSegmentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      raceName: "",
      description: "",
      startDate: new Date(),
      startTime: "09:00",
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      endTime: "17:00",   
      segments: [],
      password: "",
      hideLeaderboardUntilFinish: false,
      useSexCategories: false,
    },
  });

  const segmentsWatch = form.watch("segments");

  const handleAddSegment = () => {
    if (!segmentInput.trim()) return;
    const segmentPattern = /^(https:\/\/www\.strava\.com\/segments\/\d+|\d+)$/;
    if (!segmentPattern.test(segmentInput)) {
      form.setError("segments", {
        type: "manual",
        message: "Please enter a valid Strava segment URL or ID",
      });
      return;
    }
    let segmentId = segmentInput;
    if (segmentInput.includes("strava.com/segments/")) {
      segmentId = segmentInput.split("/").pop() || "";
    }
    if (segmentsWatch.includes(segmentId)) {
      form.setError("segments", {
        type: "manual",
        message: "This segment has already been added",
      });
      return;
    }
    form.setValue("segments", [...segmentsWatch, segmentId]);
    form.clearErrors("segments");
    setSegmentInput("");
   };
  const handleRemoveSegment = (index: number) => {
    const updatedSegments = [...segmentsWatch];
    updatedSegments.splice(index, 1);
    form.setValue("segments", updatedSegments);
  };

  const handleSubmitFunc = async (values: FormValues) => {
    setIsLoading(true);
    setApiError(null);

    const segmentIdsAsNumbers = values.segments
        .map(Number)
        .filter(id => !isNaN(id) && id > 0);

    if (segmentIdsAsNumbers.length !== values.segments.length) {
         toast({ variant: "destructive", title: "Invalid Segments", description: "One or more segment IDs are invalid." });
        setIsLoading(false);
        return;
    }
    const [startHour, startMinute] = values.startTime.split(":").map(Number);
    const startDateTime = setMinutes(setHours(values.startDate, startHour), startMinute);

    const [endHour, endMinute] = values.endTime.split(":").map(Number);
    const endDateTime = setMinutes(setHours(values.endDate, endHour), endMinute);

    const payload = {
      raceName: values.raceName,
      description: values.description,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      segmentIds: segmentIdsAsNumbers,
      password: values.password,
      hideLeaderboardUntilFinish: values.hideLeaderboardUntilFinish,
      useSexCategories: values.useSexCategories,
    };
    console.log("Submitting payload:", payload);

    try {
      const response = await fetch("/api/races", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
         credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch (e) {
            errorMsg = response.statusText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      toast({
        title: "Race Created!",
        description: `"${values.raceName}" has been successfully created.`,
      });
      navigate("/");

    } catch (error: any) {
      console.error("Failed to create race:", error);
      setApiError(error.message || "An unexpected error occurred. Please try again.");
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message || "There was a problem creating the race.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-background p-6 rounded-xl shadow-sm">
       <div className="mb-6">
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to Dashboard
        </Button>
      </div>
      <h2 className="text-2xl font-bold mb-6 text-center">Create New Race</h2>

      {apiError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitFunc)} className="space-y-6">
            <FormField
            control={form.control}
            name="raceName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Race Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Weekend Segment Smasher"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Race Description (Optional)</FormLabel>
                <FormControl>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe your race, rules, and any special instructions"
                    {...field}
                     value={field.value ?? ""}
                  />
                </FormControl>
                 <FormMessage />
              </FormItem>
            )}
          />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal justify-start", // Added justify-start
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Time</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <Clock className="mr-2 h-4 w-4 opacity-50" />
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeOptions.map(time => (
                        <SelectItem key={`start-${time}`} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                           className={cn(
                            "w-full pl-3 text-left font-normal justify-start", // Added justify-start
                            !field.value && "text-muted-foreground",
                          )}
                        >
                           <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                            const startDate = form.getValues("startDate");
                            return startDate ? date < startDate : false; // Prevent selecting end date before start date
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Time</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <Clock className="mr-2 h-4 w-4 opacity-50" />
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeOptions.map(time => (
                        <SelectItem key={`end-${time}`} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
           <FormField
            control={form.control}
            name="segments"
            render={() => (
              <FormItem>
                <FormLabel>Strava Segments</FormLabel>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Paste Strava segment URL or ID"
                    value={segmentInput}
                    onChange={(e) => setSegmentInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddSegment} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <FormDescription>
                  Add one or more Strava segments for this race. When you view a segment on Strava with your browser, the ID is in the URL.
                </FormDescription>
                <FormMessage />
                 {segmentsWatch.length > 0 && (
                  <div className="mt-4">
                    <Card><CardContent className="p-4">
                        <h4 className="text-sm font-medium mb-2">Added Segments:</h4>
                        <ul className="space-y-2">
                          {segmentsWatch.map((segment, index) => (
                            <li key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                              <div className="flex items-center overflow-hidden">
                                <Badge variant="secondary" className="mr-2 flex-shrink-0">{index + 1}</Badge>
                                <span className="text-sm truncate">{segment}</span>
                              </div>
                              <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSegment(index)} className="flex-shrink-0"><X className="h-4 w-4" /></Button>
                            </li>))}
                        </ul>
                    </CardContent></Card>
                  </div>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Race Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Set a password (min 4 characters)"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  Participants will need this password to join. It is stored in plain text and you are sharing it with participants so be sure not to use anything important like your myspace password.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hideLeaderboardUntilFinish"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Hide Leaderboard Until Finish</FormLabel>
                  <FormDescription>
                    If enabled, participant times on the leaderboard will be hidden from other participants until the race ends.
                    As the organizer, you will always see all results. Participants will always see their own times.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Hide leaderboard until finish"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="useSexCategories"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                 <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Sex Categories</FormLabel>
                    <FormDescription>
                        If enabled, separate leaderboards for Male and Female participants will be shown.
                        Participant sex is based on their Strava profile.
                    </FormDescription>
                 </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Enable sex categories"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
              ) : (
                "Create Race"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}