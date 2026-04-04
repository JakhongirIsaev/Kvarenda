import { useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetListing, useCreateListing, useUpdateListing } from "@workspace/api-client-react";
import { useRole } from "@/lib/role-context";
import { useToast } from "@/hooks/use-toast";

const DISTRICTS = ["Yunusobod", "Mirzo Ulugbek", "Chilonzor", "Shaykhontohur", "Yakkasaroy", "Uchtepa", "Olmazor", "Sergeli"];
const AMENITIES = ["WiFi", "Air conditioning", "Washing machine", "Parking", "Elevator", "Security", "Balcony", "Furniture", "Kitchen appliances", "TV"];

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  district: z.string().min(1, "District is required"),
  priceUzs: z.string().min(1, "Price is required"),
  rooms: z.string().min(1, "Rooms is required"),
  area: z.string().optional(),
  floor: z.string().optional(),
  totalFloors: z.string().optional(),
  deposit: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  rules: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function OwnerListingForm() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id && id !== "new";
  const [, setLocation] = useLocation();
  const { userId, role } = useRole();
  const { toast } = useToast();

  const { data: existing } = useGetListing(Number(id), {
    query: { enabled: isEditing, queryKey: ["getListing", Number(id), "edit"] }
  });

  const createListing = useCreateListing();
  const updateListing = useUpdateListing();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      address: "",
      district: "",
      priceUzs: "",
      rooms: "1",
      area: "",
      floor: "",
      totalFloors: "",
      deposit: "",
      amenities: [],
      rules: "",
    },
  });

  useEffect(() => {
    if (existing && isEditing) {
      form.reset({
        title: existing.title,
        description: existing.description ?? "",
        address: existing.address,
        district: existing.district,
        priceUzs: String(existing.priceUzs),
        rooms: String(existing.rooms),
        area: existing.area ? String(existing.area) : "",
        floor: existing.floor ? String(existing.floor) : "",
        totalFloors: existing.totalFloors ? String(existing.totalFloors) : "",
        deposit: existing.deposit ? String(existing.deposit) : "",
        amenities: existing.amenities ?? [],
        rules: existing.rules ?? "",
      });
    }
  }, [existing, isEditing]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ownerId: userId,
      title: values.title,
      description: values.description,
      address: values.address,
      district: values.district,
      priceUzs: parseInt(values.priceUzs),
      rooms: parseInt(values.rooms),
      area: values.area ? parseFloat(values.area) : undefined,
      floor: values.floor ? parseInt(values.floor) : undefined,
      totalFloors: values.totalFloors ? parseInt(values.totalFloors) : undefined,
      deposit: values.deposit ? parseInt(values.deposit) : undefined,
      plan: "basic" as const,
      amenities: values.amenities,
      rules: values.rules,
    };

    try {
      if (isEditing) {
        await updateListing.mutateAsync({ id: Number(id), data: payload });
        toast({ title: "Listing updated!" });
      } else {
        await createListing.mutateAsync({ data: payload });
        toast({ title: "Listing created!" });
      }
      setLocation("/owner");
    } catch (e) {
      toast({ title: "Error", description: "Failed to save listing.", variant: "destructive" });
    }
  };

  if (role !== "owner") {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Switch to Owner role to manage listings.
      </div>
    );
  }

  const selectedAmenities = form.watch("amenities") ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/owner">
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Button>
        </Link>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h1 className="text-xl font-bold mb-6">{isEditing ? "Edit Listing" : "Add New Listing"}</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Modern 2-room apartment in Yunusobod" {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-district">
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DISTRICTS.map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Street address" {...field} data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priceUzs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly price (so'm)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 3000000" {...field} data-testid="input-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rooms</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-rooms">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area (m²)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 65" {...field} data-testid="input-area" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="3" {...field} data-testid="input-floor" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalFloors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total floors</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="9" {...field} data-testid="input-total-floors" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="deposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security deposit (so'm, optional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 6000000" {...field} data-testid="input-deposit" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="Describe your apartment..." {...field} data-testid="textarea-description" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div>
                <p className="text-sm font-medium mb-3">Amenities</p>
                <div className="grid grid-cols-2 gap-2">
                  {AMENITIES.map(amenity => (
                    <div key={amenity} className="flex items-center gap-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={(checked) => {
                          const curr = form.getValues("amenities") ?? [];
                          form.setValue(
                            "amenities",
                            checked ? [...curr, amenity] : curr.filter(a => a !== amenity)
                          );
                        }}
                        data-testid={`checkbox-amenity-${amenity}`}
                      />
                      <label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">{amenity}</label>
                    </div>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="rules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>House rules (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="No smoking, no pets..." {...field} data-testid="textarea-rules" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <Link href="/owner">
                  <Button type="button" variant="outline" className="flex-1">Cancel</Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createListing.isPending || updateListing.isPending}
                  data-testid="button-save-listing"
                >
                  {createListing.isPending || updateListing.isPending ? "Saving..." : isEditing ? "Save changes" : "Create listing"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
