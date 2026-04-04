import { useParams, useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetListing, useCreateApplication } from "@workspace/api-client-react";
import { useRole } from "@/lib/role-context";
import { useToast } from "@/hooks/use-toast";
import { formatUzs } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getGetApplicationsQueryKey } from "@workspace/api-client-react";

const formSchema = z.object({
  moveInDate: z.string().min(1, "Move-in date is required"),
  durationMonths: z.string().min(1, "Duration is required"),
  purpose: z.string().optional(),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function Apply() {
  const { listingId } = useParams<{ listingId: string }>();
  const [, setLocation] = useLocation();
  const { userId, role } = useRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: listing, isLoading } = useGetListing(Number(listingId), {
    query: { enabled: !!listingId, queryKey: ["getListing", Number(listingId)] }
  });

  const createApplication = useCreateApplication();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moveInDate: "",
      durationMonths: "12",
      purpose: "",
      message: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createApplication.mutateAsync({
        data: {
          listingId: Number(listingId),
          tenantId: userId,
          moveInDate: values.moveInDate,
          durationMonths: parseInt(values.durationMonths),
          purpose: values.purpose,
          message: values.message,
        }
      });
      await queryClient.invalidateQueries({ queryKey: getGetApplicationsQueryKey() });
      toast({ title: "Application submitted!", description: "The owner will review your application." });
      setLocation("/my/applications");
    } catch (e) {
      toast({ title: "Error", description: "Failed to submit application.", variant: "destructive" });
    }
  };

  if (role !== "tenant") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Switch to Tenant role to apply for apartments.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href={`/listings/${listingId}`}>
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to listing
          </Button>
        </Link>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {listing && (
            <div className="bg-muted/50 p-5 border-b border-border">
              <p className="text-sm text-muted-foreground mb-1">Applying for</p>
              <h2 className="font-semibold text-foreground">{listing.title}</h2>
              <p className="text-sm text-muted-foreground">{listing.district}, {listing.address}</p>
              <p className="text-primary font-bold mt-2">{formatUzs(listing.priceUzs)}/mo + 5% service fee</p>
            </div>
          )}

          <div className="p-6">
            <h1 className="text-xl font-bold mb-6">Submit your application</h1>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="moveInDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Move-in date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-move-in-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="durationMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rental duration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-duration">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="3">3 months</SelectItem>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose of rental</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-purpose">
                            <SelectValue placeholder="Select purpose" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Family residence">Family residence</SelectItem>
                          <SelectItem value="Single occupancy">Single occupancy</SelectItem>
                          <SelectItem value="Work relocation">Work relocation</SelectItem>
                          <SelectItem value="Student housing">Student housing</SelectItem>
                          <SelectItem value="Temporary accommodation">Temporary accommodation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message to owner (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Introduce yourself and tell the owner about your situation..."
                          {...field}
                          data-testid="textarea-message"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
                  By submitting this application, you agree that Kvarenda may share your profile information with the owner for review purposes. A 5% monthly service fee applies upon activation.
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base"
                  disabled={createApplication.isPending}
                  data-testid="button-submit-application"
                >
                  {createApplication.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
