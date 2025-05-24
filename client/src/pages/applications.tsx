import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertApplicationSchema, insertApplicationNoteSchema } from "@shared/schema";
import type { Application, InsertApplication, ApplicationNote, InsertApplicationNote } from "@shared/schema";
import { z } from "zod";
import { Plus, Edit, Trash2, ExternalLink, Building, Calendar, FileText, MessageSquare, X, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const applicationFormSchema = insertApplicationSchema.extend({
  appliedOn: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

interface ApplicationNotesProps {
  applicationId: number;
  notes: ApplicationNote[] | undefined;
  notesLoading: boolean;
  notesError: any;
  createNoteMutation: any;
  deleteNoteMutation: any;
  newNote: string;
  setNewNote: (note: string) => void;
}

function ApplicationNotes({ 
  applicationId, 
  notes,
  notesLoading,
  notesError,
  createNoteMutation, 
  deleteNoteMutation, 
  newNote, 
  setNewNote 
}: ApplicationNotesProps) {
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-lg">Application Notes</h3>
      </div>
      
      {/* Add Note Form */}
      <div className="flex gap-2">
        <Textarea
          placeholder="Add a note about this application..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="flex-1 min-h-[80px]"
        />
        <Button 
          onClick={handleAddNote}
          disabled={!newNote.trim() || createNoteMutation.isPending}
          className="self-end"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Notes List */}
      {notesLoading ? (
        <div className="text-center py-4 text-gray-500">Loading notes...</div>
      ) : notesError ? (
        <div className="text-center py-4 text-red-500">
          Failed to load notes. Please try refreshing the page.
        </div>
      ) : notes && notes.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notes
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .map((note: ApplicationNote) => (
            <div key={note.id} className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex justify-between items-start gap-3">
                <p className="flex-1 whitespace-pre-wrap text-sm">{note.content}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {note.createdAt && (
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(note.createdAt).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No notes yet. Add your first note above.
        </div>
      )}
    </div>
  );
}

export default function Applications() {
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [newNote, setNewNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  // Filter and pagination logic
  const filteredApplications = applications?.filter(app => {
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  // Notes queries and mutations
  const { data: notes, isLoading: notesLoading, error: notesError } = useQuery<ApplicationNote[]>({
    queryKey: [`/api/applications/${selectedApplicationId}/notes`],
    enabled: !!selectedApplicationId,
    retry: 1,
    queryFn: async () => {
      const response = await apiRequest(`/api/applications/${selectedApplicationId}/notes`, "GET");
      return response.json();
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: number; data: InsertApplicationNote }) => 
      apiRequest(`/api/applications/${applicationId}/notes`, "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${selectedApplicationId}/notes`] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${selectedApplicationId}/notes`] });
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

  const handleNotesClick = (applicationId: number) => {
    setSelectedApplicationId(applicationId);
    setNewNote(""); // Clear any existing note input
    setNotesModalOpen(true);
  };

  const handleNotesModalClose = (open: boolean) => {
    setNotesModalOpen(open);
    if (!open) {
      setNewNote(""); // Clear note input when modal closes
      setSelectedApplicationId(null);
    }
  };

  const onSubmit = (data: ApplicationFormData) => {
    const submitData: InsertApplication = {
      jobTitle: data.jobTitle,
      company: data.company,
      shortDescription: data.shortDescription || null,
      fullText: data.fullText || null,
      listingUrl: data.listingUrl || null,
      appliedOn: data.appliedOn || null,
    };

    if (editingApplication) {
      updateMutation.mutate({ id: editingApplication.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Applications</h1>
        <Button onClick={handleNewApplication} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Application
        </Button>
      </div>

      {/* Application Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingApplication ? "Edit Application" : "Add New Application"}
            </DialogTitle>
            <DialogDescription>
              {editingApplication 
                ? "Update the details of your job application." 
                : "Add a new job application to track your progress."
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Senior Software Engineer" {...field} />
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
                      <Input placeholder="Tech Corp Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Brief description of the role" 
                        {...field} 
                        value={field.value || ""}
                      />
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
                        placeholder="Full job description and requirements..." 
                        className="min-h-[100px]" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="listingUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Listing URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://company.com/jobs/123" 
                        {...field} 
                        value={field.value || ""}
                      />
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
                    <FormLabel>Application Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingApplication ? "Update Application" : "Add Application"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Notes Modal */}
      <Dialog open={notesModalOpen} onOpenChange={handleNotesModalClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Application Notes</DialogTitle>
            <DialogDescription>
              {selectedApplicationId && applications && (
                <>
                  Notes for <strong>{applications.find(app => app.id === selectedApplicationId)?.jobTitle}</strong> at{' '}
                  <strong>{applications.find(app => app.id === selectedApplicationId)?.company}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedApplicationId && (
            <ApplicationNotes
              applicationId={selectedApplicationId}
              notes={notes}
              notesLoading={notesLoading}
              notesError={notesError}
              createNoteMutation={createNoteMutation}
              deleteNoteMutation={deleteNoteMutation}
              newNote={newNote}
              setNewNote={setNewNote}
            />
          )}
        </DialogContent>
      </Dialog>

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
        <>
          {/* Filters and Search */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      {application.jobTitle}
                      {application.shortDescription && (
                        <div className="text-sm text-gray-500 mt-1">
                          {application.shortDescription}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{application.company}</TableCell>
                    <TableCell>
                      {application.appliedOn 
                        ? new Date(application.appliedOn).toLocaleDateString()
                        : "Not set"
                      }
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNotesClick(application.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        {application.listingUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a 
                              href={application.listingUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-700"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(application)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(application.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {Math.ceil(filteredApplications.length / itemsPerPage) > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredApplications.length)} of {filteredApplications.length} applications
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-500 px-4 py-2">
                  Page {currentPage} of {Math.ceil(filteredApplications.length / itemsPerPage)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredApplications.length / itemsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(filteredApplications.length / itemsPerPage)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}