import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, AlertTriangle, Plus, X } from 'lucide-react';
import { Race } from '@/types/raceTypes';
import { parseISO, format as formatDateFn } from 'date-fns'; 
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";


const raceFormSchema = z.object({
  raceName: z.string().min(3, 'Race name must be at least 3 characters long').max(100),
  raceInfo: z.string().max(500, 'Race info cannot exceed 500 characters').optional(),
  startDateTime: z.string().refine((val) => val === '' || !isNaN(Date.parse(val)), { message: "Invalid start date/time" }),
  endDateTime: z.string().refine((val) => val === '' || !isNaN(Date.parse(val)), { message: "Invalid end date/time" }),
  segments: z.array(z.string()).min(1, {
    message: "At least one segment is required.",
  }),
  password: z.string().optional(),
  hideLeaderboardUntilFinish: z.boolean().default(false),
  useSexCategories: z.boolean().default(false),
}).refine(data => {
    if (data.startDateTime && data.endDateTime) { 
        return new Date(data.endDateTime) > new Date(data.startDateTime);
    }
    return true; 
}, {
  message: "End date and time must be after start date and time.",
  path: ["endDateTime"], 
});

type RaceFormData = z.infer<typeof raceFormSchema>;

const EditRacePage: React.FC = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [race, setRace] = useState<Race | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [segmentInput, setSegmentInput] = useState("");


  const form = useForm<RaceFormData>({
    resolver: zodResolver(raceFormSchema),
    defaultValues: {
      raceName: '',
      raceInfo: '',
      startDateTime: '',
      endDateTime: '',
      segments: [],
      password: '',
      hideLeaderboardUntilFinish: false,
      useSexCategories: false,
    },
  });

  const { control, handleSubmit, watch, setValue, formState: { errors }, setError: setFormError, clearErrors } = form;
  const currentSegments = watch('segments');

  const fetchRaceDetails = useCallback(async () => {
     if (!raceId) {
      setError("Race ID is missing.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/races/${raceId}`, {
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
         if (response.status === 401 || response.status === 403) {
          toast({ variant: "destructive", title: "Unauthorized", description: "You are not authorized to edit this race or your session expired." });
          navigate("/my-races");
        } else if (response.status === 404) {
          toast({ variant: "destructive", title: "Not Found", description: "Race not found." });
          navigate("/my-races");
        }
        throw new Error(`Failed to fetch race details: ${response.statusText}`);
      }
      const data: Race = await response.json();
      setRace(data);
      setValue('raceName', data.raceName);
      setValue('raceInfo', data.raceInfo || '');
      setValue('startDateTime', formatDateFn(parseISO(data.startDate), "yyyy-MM-dd'T'HH:mm"));
      setValue('endDateTime', formatDateFn(parseISO(data.endDate), "yyyy-MM-dd'T'HH:mm"));
      setValue('segments', data.segmentIds.map(String));
      setValue('hideLeaderboardUntilFinish', data.hideLeaderboardUntilFinish);
      setValue('useSexCategories', data.useSexCategories || false);
      setValue('password', '');
    } catch (err: any) {
        setError(err.message);
        console.error("Error fetching race details:", err);
    } finally {
        setIsLoading(false);
    }
  }, [raceId, navigate, setValue, toast]);

  useEffect(() => {
    fetchRaceDetails();
  }, [fetchRaceDetails]);

  const handleAddSegment = () => {
     if (!segmentInput.trim()) return;
    const segmentPattern = /^(https:\/\/www\.strava\.com\/segments\/\d+|\d+)$/;
    if (!segmentPattern.test(segmentInput)) {
      setFormError("segments", {
        type: "manual",
        message: "Please enter a valid Strava segment URL or ID",
      });
      return;
    }
    let segmentIdToAdd = segmentInput;
    if (segmentInput.includes("strava.com/segments/")) {
      segmentIdToAdd = segmentInput.split("/").pop() || "";
    }
    if (currentSegments.includes(segmentIdToAdd)) {
      setFormError("segments", {
        type: "manual",
        message: "This segment has already been added",
      });
      return;
    }
    setValue("segments", [...currentSegments, segmentIdToAdd]);
    clearErrors("segments");
    setSegmentInput("");
  };
  const handleRemoveSegment = (index: number) => {
     const updatedSegments = [...currentSegments];
    updatedSegments.splice(index, 1);
    setValue("segments", updatedSegments);
  };

  const onSubmit = async (data: RaceFormData) => {
    setIsSubmitting(true);
    setError(null);

    const segmentIdsAsNumbers = data.segments
      .map(Number)
      .filter(id => !isNaN(id) && id > 0);

    if (segmentIdsAsNumbers.length !== data.segments.length) {
      toast({variant: "destructive", title: "Invalid Segments", description: "One or more segment IDs are invalid."});
      setIsSubmitting(false);
      return;
    }

    const raceUpdatePayload: any = {
      raceName: data.raceName,
      description: data.raceInfo,
      startDate: new Date(data.startDateTime).toISOString(),
      endDate: new Date(data.endDateTime).toISOString(),
      segmentIds: segmentIdsAsNumbers,
      isPrivate: true,
      hideLeaderboardUntilFinish: data.hideLeaderboardUntilFinish,
      useSexCategories: data.useSexCategories,
    };

    if (data.password && data.password.length > 0) {
        if (data.password.length < 4) {
             toast({
                variant: "destructive",
                title: "Password Too Short",
                description: "If changing the password, it must be at least 4 characters.",
            });
            setIsSubmitting(false);
            return;
        }
      raceUpdatePayload.password = data.password;
    }
     try {
      const response = await fetch(`/api/races/${raceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(raceUpdatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to update race. Status: ${response.statusText}` }));
        if (response.status === 401 || response.status === 403) {
          toast({ variant: "destructive", title: "Unauthorized", description: errorData.message || "You are not authorized to perform this action or your session expired." });
        } else {
          toast({ variant: "destructive", title: "Update Failed", description: errorData.message || "Could not update the race." });
        }
        throw new Error(errorData.message || `Failed to update race`);
      }

      toast({ title: 'Race Updated!', description: 'The race details have been successfully updated.' });
      navigate(`/race/${raceId}`);
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating race:', err);
      if (!err.message.startsWith("Failed to update race")) {
        toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred."});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

   if (isLoading) { return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading race details...</p>
      </div>
    ); }
  if (error && !race) { return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Race</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => navigate('/my-races')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Races
        </Button>
      </div>
    ); }
  if (!race) { return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Race data not available.</p>
        <Button onClick={() => navigate('/my-races')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Races
        </Button>
      </div>
    ); }


  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
         <CardHeader>
          <Button variant="outline" size="sm" className="mb-4 w-fit" onClick={() => navigate(`/race/${raceId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Race
          </Button>
          <CardTitle className="text-2xl font-bold">Edit Race: {race?.raceName}</CardTitle>
          <CardDescription>Update the details for your race. All races are private.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
                <FormField control={control} name="raceName" render={({ field }) => ( <FormItem><FormLabel>Race Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={control} name="raceInfo" render={({ field }) => ( <FormItem><FormLabel>Race Information (Optional)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={control} name="startDateTime" render={({ field }) => ( <FormItem><FormLabel>Start Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={control} name="endDateTime" render={({ field }) => ( <FormItem><FormLabel>End Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <FormField control={control} name="segments" render={() => ( <FormItem> <FormLabel>Strava Segments</FormLabel> <div className="flex items-center space-x-2"> <Input value={segmentInput} onChange={(e) => setSegmentInput(e.target.value)} className="flex-1" placeholder="Segment URL or ID"/> <Button type="button" onClick={handleAddSegment} size="icon"><Plus className="h-4 w-4" /></Button> </div> <FormDescription>Add one or more Strava segments.</FormDescription> <FormMessage /> {currentSegments.length > 0 && ( <div className="mt-4"><Card><CardContent className="p-4"><h4 className="text-sm font-medium mb-2">Added Segments:</h4><ul className="space-y-2"> {currentSegments.map((segment, index) => ( <li key={index} className="flex items-center justify-between bg-muted p-2 rounded-md"> <div className="flex items-center overflow-hidden"><Badge variant="secondary" className="mr-2 flex-shrink-0">{index + 1}</Badge><span className="text-sm truncate">{segment}</span></div> <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSegment(index)} className="flex-shrink-0"><X className="h-4 w-4" /></Button> </li> ))} </ul></CardContent></Card></div> )} </FormItem> )} />
              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Change Password (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Leave blank to keep current password"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      If you want to change the race password, enter a new one (min 4 characters).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="hideLeaderboardUntilFinish"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Hide Leaderboard Until Finish</FormLabel>
                      <FormDescription>
                        If enabled, participant times will be hidden from others until the race ends.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="useSexCategories"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Sex-Based Leaderboards</FormLabel>
                      <FormDescription>
                        Shows separate leaderboards for Male and Female participants.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {error && <p className="text-sm text-destructive text-center pt-2">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting || isLoading} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Race
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default EditRacePage;