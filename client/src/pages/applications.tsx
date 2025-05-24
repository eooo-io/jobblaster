import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertApplicationSchema, insertApplicationNoteSchema } from "@shared/schema";
import type { Application, InsertApplication, ApplicationNote, InsertApplicationNote } from "@shared/schema";
import { z } from "zod";
import { Plus, Edit, Trash2, ExternalLink, Building, Calendar, FileText, MessageSquare, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const applicationFormSchema = insertApplicationSchema.extend({
  appliedOn: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

interface ApplicationNotesProps {
  applicationId: number;
  useNotesQuery: (applicationId: number) => any;
  createNoteMutation: any;
  deleteNoteMutation: any;
  newNote: string;
  setNewNote: (note: string) => void;
}

function ApplicationNotes({ 
  applicationId, 
  useNotesQuery, 
  createNoteMutation, 
  deleteNoteMutation, 
  newNote, 
  setNewNote 
}: ApplicationNotesProps) {
  const { data: notes, isLoading: notesLoading } = useNotesQuery(applicationId);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    createNoteMutation.mutate({
      applicationId,
      data: {
        content: newNote.trim(),
        noteType: "general"
      }
    });
  };

  const handleDeleteNote = (noteId: number) => {
    deleteNoteMutation.mutate(noteId);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4 text-blue-600" />
        <h4 className="font-medium text-sm">Notes</h4>
      </div>
      
      {/* Add Note Form */}
      <div className="flex gap-2">
        <Textarea
          placeholder="Add a note about this application..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="flex-1 min-h-[60px] text-sm"
        />
        <Button 
          onClick={handleAddNote}
          disabled={!newNote.trim() || createNoteMutation.isPending}
          size="sm"
          className="self-end"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Notes List */}
      {notesLoading ? (
        <div className="text-sm text-gray-500">Loading notes...</div>
      ) : notes && notes.length > 0 ? (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {notes.map((note: ApplicationNote) => (
            <div key={note.id} className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex justify-between items-start gap-2">
                <p className="flex-1 whitespace-pre-wrap">{note.content}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              {note.createdAt && (
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(note.createdAt).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 text-center py-2">
          No notes yet. Add your first note above.
        </div>
      )}
    </div>
  );
}

export default function Applications() {
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<number | null>(null);
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState("general");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  // Notes queries and mutations
  const useNotesQuery = (applicationId: number) => {
    return useQuery<ApplicationNote[]>({
      queryKey: ["/api/applications", applicationId, "notes"],
      enabled: expandedNotes === applicationId,
    });
  };

  const createNoteMutation = useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: number; data: InsertApplicationNote }) => 
      apiRequest(`/api/applications/${applicationId}/notes`, "POST", data),
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", applicationId, "notes"] });
      setNewNote("");
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: number) => apiRequest(`/api/notes/${noteId}`, "DELETE"),
    onSuccess: (_, noteId) => {
      // Invalidate notes for all applications to be safe
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Success", 
        description: "Note deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertApplication) => apiRequest("/api/applications", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Application created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create application",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsertApplication }) => 
      apiRequest(`/api/applications/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setIsDialogOpen(false);
      setEditingApplication(null);
      toast({
        title: "Success",
        description: "Application updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update application",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/applications/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Success",
        description: "Application deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      jobTitle: "",
      company: "",
      shortDescription: "",
      fullText: "",
      listingUrl: "",
      appliedOn: "",
    },
  });

  const onSubmit = (data: ApplicationFormData) => {
    const submitData: InsertApplication = {
      ...data,
      appliedOn: data.appliedOn ? new Date(data.appliedOn).toISOString().split('T')[0] : null,
    };

    if (editingApplication) {
      updateMutation.mutate({ id: editingApplication.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (application: Application) => {
    setEditingApplication(application);
    form.reset({
      jobTitle: application.jobTitle,
      company: application.company,
      shortDescription: application.shortDescription || "",
      fullText: application.fullText || "",
      listingUrl: application.listingUrl || "",
      appliedOn: application.appliedOn || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this application?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewApplication = () => {
    setEditingApplication(null);
    form.reset({
      jobTitle: "",
      company: "",
      shortDescription: "",
      fullText: "",
      listingUrl: "",
      appliedOn: "",
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Job Applications</h1>
          <p className="text-gray-600 mt-2">Track your job applications and their status</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewApplication} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Application
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingApplication ? "Edit Application" : "New Application"}
              </DialogTitle>
              <DialogDescription>
                {editingApplication ? "Update your job application details" : "Add a new job application to track"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Software Developer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Corp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief summary of the role" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Job Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Complete job description and requirements"
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="listingUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Listing URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://company.com/jobs/123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="appliedOn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Applied Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingApplication ? "Update" : "Create"} Application
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {!applications || applications.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>No Applications Yet</CardTitle>
            <CardDescription>
              Start tracking your job applications by adding your first one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleNewApplication} className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" />
              Add Your First Application
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{application.jobTitle}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Building className="h-3 w-3" />
                      {application.company}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setExpandedNotes(expandedNotes === application.id ? null : application.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <MessageSquare className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(application)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(application.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {application.shortDescription && (
                  <p className="text-sm text-gray-600 mb-3">{application.shortDescription}</p>
                )}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {application.appliedOn 
                      ? new Date(application.appliedOn).toLocaleDateString()
                      : "Date not set"
                    }
                  </div>
                  {application.listingUrl && (
                    <a 
                      href={application.listingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Listing
                    </a>
                  )}
                </div>
                
                {/* Notes Section */}
                {expandedNotes === application.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <ApplicationNotes 
                      applicationId={application.id}
                      useNotesQuery={useNotesQuery}
                      createNoteMutation={createNoteMutation}
                      deleteNoteMutation={deleteNoteMutation}
                      newNote={newNote}
                      setNewNote={setNewNote}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}