import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Users, Info, Lock, Unlock, Edit, Trash2, Settings2, Clock } from "lucide-react"; // Added Clock
import { RaceOrganiser } from "@/types/raceTypes";

interface RaceCardProps {
  id: string;
  name: string;
  status: "upcoming" | "ongoing" | "finished";
  startDate: Date; 
  endDate: Date;   
  participantCount: number;
  organizer: RaceOrganiser;
  isPrivate: boolean;
  onClick: () => void;
  isOrganizedByCurrentUser?: boolean;
  onEditRaceClick?: (raceId: string) => void;
  onManageParticipantsClick?: (raceId: string) => void;
  onDeleteRaceClick?: (raceId: string) => void;
}

const RaceCard: React.FC<RaceCardProps> = ({
  id,
  name,
  status,
  startDate,
  endDate,
  participantCount,
  organizer,
  isPrivate,
  onClick,
  isOrganizedByCurrentUser,
  onEditRaceClick,
  onDeleteRaceClick,
}) => {
  const getStatusBadgeColor = () => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500 hover:bg-blue-600";
      case "ongoing":
        return "bg-green-500 hover:bg-green-600";
      case "finished":
        return "bg-gray-500 hover:bg-gray-600";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };
  const handleActionClick = (e: React.MouseEvent, action?: () => void) => {
    e.stopPropagation();
    action?.();
  };

 
  const formatDateTime = (date: Date) => {
    try {
        return format(date, "h:mm a, d MMM yyyy");
    } catch (e) {
        console.error("Error formatting date for RaceCard:", date, e);
        return "Invalid Date";
    }
  };


  return (
    <Card
      className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
    >
      <div onClick={onClick} className="cursor-pointer flex-grow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-semibold text-primary leading-tight">
              {name}
            </CardTitle>
            <div className="flex flex-col items-end space-y-1">
              <Badge className={`${getStatusBadgeColor()} text-white text-xs px-2 py-0.5`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              {isPrivate ? (
                <Badge variant="outline" className="border-orange-400 text-orange-500 text-xs px-2 py-0.5">
                  <Lock className="h-3 w-3 mr-1" /> Private
                </Badge>
              ) : (
                <Badge variant="outline" className="border-green-400 text-green-500 text-xs px-2 py-0.5">
                  <Unlock className="h-3 w-3 mr-1" /> Public
                </Badge>
              )}
            </div>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Organized by: {organizer?.userStravaFirstName || organizer?.displayName || `User ${organizer?.stravaId}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-2 text-sm">
          <div>
            <div className="flex items-center text-muted-foreground">
                 <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                <span className="font-medium">Starts: </span>
                <span className="ml-1">{formatDateTime(startDate)}</span>
            </div>
             <div className="flex items-center text-muted-foreground mt-1">
                 <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                <span className="font-medium">Ends: </span>
                 <span className="ml-1">{formatDateTime(endDate)}</span>
            </div>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">Participants: </span>
            <span className="ml-1 font-semibold">{participantCount}</span>
          </div>
          <div className="flex items-center mt-1">
              <Info className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">Race ID: </span>
              <span className="ml-1 font-semibold text-indigo-600">{id}</span>
          </div>
        </CardContent>
      </div>
      <CardFooter className="pt-3 pb-4 text-xs text-muted-foreground border-t">
        {isOrganizedByCurrentUser ? (
          <div className="flex flex-wrap gap-2 w-full justify-start">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => handleActionClick(e, () => onEditRaceClick?.(id))}
              disabled={status === 'finished'}
              title="Edit Race Details"
            >
              <Edit className="h-4 w-4 md:mr-1" /> <span className="hidden md:inline">Edit Race</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => handleActionClick(e, () => onDeleteRaceClick?.(id))}
              title="Delete Race"
            >
              <Trash2 className="h-4 w-4 md:mr-1" /> <span className="hidden md:inline">Delete</span>
            </Button>
          </div>
        ) : (
          <div onClick={onClick} className="cursor-pointer w-full">
             Click to view details
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
export default RaceCard;