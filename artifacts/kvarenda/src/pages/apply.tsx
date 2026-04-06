import { useParams, useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CalendarIcon, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGetListing, useCreateApplication } from "@workspace/api-client-react";
import { useRole } from "@/lib/role-context";
import { useToast } from "@/hooks/use-toast";
import { cn, formatUzs, trText } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getGetApplicationsQueryKey } from "@workspace/api-client-react";
import { useI18n, useT } from "@/lib/i18n";

const formSchema = z.object({
  moveInDate: z.string().min(1),
  durationMonths: z.string().min(1),
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
  const { t, lang } = useI18n();
  const { tr } = useT();

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
      toast({ title: tr(t.apply.submitted), description: tr(t.apply.submittedDesc) });
      setLocation("/my/applications");
    } catch (e) {
      toast({ title: tr(t.common.error), description: tr(t.apply.error), variant: "destructive" });
    }
  };

  if (role !== "tenant") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">{tr(t.apply.switchTenant)}</p>
      </div>
    );
  }

  const tenantPrice = listing ? Math.round(listing.priceUzs * 1.05) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href={`/listings/${listingId}`}>
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            {tr(t.apply.backToListing)}
          </Button>
        </Link>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {listing && (
            <div className="bg-muted/50 p-5 border-b border-border">
              <p className="text-sm text-muted-foreground mb-1">{tr(t.apply.applyingFor)}</p>
              <h2 className="font-semibold text-foreground">{trText(listing.title, lang)}</h2>
              <p className="text-sm text-muted-foreground">{listing.district}, {listing.address}</p>
              <p className="text-primary font-bold mt-2">{formatUzs(tenantPrice)}{tr(t.common.perMonth)}</p>
            </div>
          )}

          <div className="p-6">
            <h1 className="text-xl font-bold mb-6">{tr(t.apply.submitTitle)}</h1>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="moveInDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{tr(t.apply.moveIn)}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="input-move-in-date"
                            >
                              {field.value ? format(new Date(field.value), "PPP") : tr(t.apply.selectDate)}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(format(date, "yyyy-MM-dd"));
                              }
                            }}
                            disabled={(date) => date < new Date()}
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="durationMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr(t.apply.duration)}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-duration">
                            <SelectValue placeholder={tr(t.apply.selectDuration)} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="3">{tr(t.apply.months3)}</SelectItem>
                          <SelectItem value="6">{tr(t.apply.months6)}</SelectItem>
                          <SelectItem value="12">{tr(t.apply.months12)}</SelectItem>
                          <SelectItem value="24">{tr(t.apply.months24)}</SelectItem>
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
                      <FormLabel>{tr(t.apply.purpose)}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-purpose">
                            <SelectValue placeholder={tr(t.apply.selectPurpose)} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Family residence">{tr(t.apply.purposeFamily)}</SelectItem>
                          <SelectItem value="Single occupancy">{tr(t.apply.purposeSingle)}</SelectItem>
                          <SelectItem value="Work relocation">{tr(t.apply.purposeWork)}</SelectItem>
                          <SelectItem value="Student housing">{tr(t.apply.purposeStudent)}</SelectItem>
                          <SelectItem value="Temporary accommodation">{tr(t.apply.purposeTemp)}</SelectItem>
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
                      <FormLabel>{tr(t.apply.message)}</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder={tr(t.apply.messagePlaceholder)}
                          {...field}
                          data-testid="textarea-message"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
                  {tr(t.apply.agreement)}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base"
                  disabled={createApplication.isPending}
                  data-testid="button-submit-application"
                >
                  {createApplication.isPending ? tr(t.apply.submitting) : tr(t.apply.submit)}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
