import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
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
import { Plus, Edit, Trash2, ExternalLink, Building, Calendar, FileText, MessageSquare, X, Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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
            <div key={note.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start gap-3">
                <p className="flex-1 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">{note.content}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {note.createdAt && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
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
  const [sortField, setSortField] = useState<keyof Application>("appliedOn");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  // Filter, sort and pagination logic
  const filteredAndSortedApplications = applications?.filter(app => {
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    // Handle null values
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return sortDirection === "asc" ? 1 : -1;
    if (bValue === null) return sortDirection === "asc" ? -1 : 1;
    
    // Handle date sorting
    if (sortField === "appliedOn" || sortField === "createdAt" || sortField === "updatedAt") {
      const dateA = new Date(aValue as string);
      const dateB = new Date(bValue as string);
      return sortDirection === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    }
    
    // Handle string sorting
    const stringA = String(aValue).toLowerCase();
    const stringB = String(bValue).toLowerCase();
    
    if (stringA < stringB) return sortDirection === "asc" ? -1 : 1;
    if (stringA > stringB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  }) || [];

  // Pagination calculations
  const totalItems = filteredAndSortedApplications.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedApplications = filteredAndSortedApplications.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle column sorting
  const handleSort = (field: keyof Application) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Notes queries and mutations
  const { data: notes, isLoading: notesLoading, error: notesError } = useQuery<ApplicationNote[]>({
    queryKey: [`/api/applications/${selectedApplicationId}/notes`],
    enabled: !!selectedApplicationId,
    retry: 1,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/applications/${selectedApplicationId}/notes`);
      return response.json();
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: number; data: InsertApplicationNote }) => 
      apiRequest("POST", `/api/applications/${applicationId}/notes`, data),
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
    mutationFn: (noteId: number) => apiRequest("DELETE", `/api/notes/${noteId}`),
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
    mutationFn: (data: InsertApplication) => apiRequest("POST", "/api/applications", data),
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
      apiRequest("PUT", `/api/applications/${id}`, data),
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
    mutationFn: (id: number) => apiRequest("DELETE", `/api/applications/${id}`),
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
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden lg:ml-0 pt-16 lg:pt-0">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Loading applications...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-0 pt-16 lg:pt-0">
        <div className="container mx-auto px-4 py-8 flex-1 overflow-y-auto">
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
                  onChange={(e) => handleSearchChange(e.target.value)}
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
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none min-w-[200px]"
                    onClick={() => handleSort("jobTitle")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap">Job Title</span>
                      {sortField === "jobTitle" ? (
                        sortDirection === "asc" ? <ArrowUp className="h-4 w-4 flex-shrink-0" /> : <ArrowDown className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none min-w-[150px]"
                    onClick={() => handleSort("company")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap">Company</span>
                      {sortField === "company" ? (
                        sortDirection === "asc" ? <ArrowUp className="h-4 w-4 flex-shrink-0" /> : <ArrowDown className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none min-w-[120px]"
                    onClick={() => handleSort("appliedOn")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap">Applied</span>
                      {sortField === "appliedOn" ? (
                        sortDirection === "asc" ? <ArrowUp className="h-4 w-4 flex-shrink-0" /> : <ArrowDown className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[80px]">Status</TableHead>
                  <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium max-w-[200px]">
                      <div className="truncate">{application.jobTitle}</div>
                      {application.shortDescription && (
                        <div className="text-sm text-gray-500 mt-1 truncate">
                          {application.shortDescription}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      <div className="truncate">{application.company}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
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
          {Math.ceil(filteredAndSortedApplications.length / itemsPerPage) > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedApplications.length)} of {filteredAndSortedApplications.length} applications
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
                  Page {currentPage} of {Math.ceil(filteredAndSortedApplications.length / itemsPerPage)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredAndSortedApplications.length / itemsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(filteredAndSortedApplications.length / itemsPerPage)}
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
      </main>
    </div>
  );
}